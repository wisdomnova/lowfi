import { inngest } from '@/lib/inngest';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email-service';

/**
 * Execute Scheduled Campaigns
 * Runs every 5 minutes to check for campaigns that need to be sent
 */
export const executeScheduledCampaignsJob = inngest.createFunction(
  {
    id: 'execute-scheduled-campaigns',
    name: 'Execute Scheduled Campaigns',
  },
  { cron: '*/5 * * * *' }, // Every 5 minutes
  async ({ step }) => {
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    // Find all scheduled campaigns that should be sent
    const scheduledCampaigns = await step.run('fetch-scheduled-campaigns', async () => {
      return prisma.campaignSchedule.findMany({
        where: {
          sendTime: {
            gte: now,
            lte: fiveMinutesFromNow,
          },
          campaign: {
            status: 'scheduled',
          },
        },
        include: {
          campaign: {
            include: {
              recipients: true,
            },
          },
        },
      });
    });

    console.log(`Found ${scheduledCampaigns.length} campaigns to execute`);

    // Trigger send for each campaign
    for (const schedule of scheduledCampaigns) {
      await step.run(`trigger-campaign-${schedule.campaignId}`, async () => {
        // Update campaign status
        await prisma.campaign.update({
          where: { id: schedule.campaignId },
          data: { status: 'sending' },
        });

        // Delete the schedule after execution (or keep for history)
        await prisma.campaignSchedule.delete({
          where: { id: schedule.id },
        });

        // Trigger send for each recipient
        for (const recipient of schedule.campaign.recipients) {
          await inngest.send({
            name: 'campaign/send',
            data: {
              campaignId: schedule.campaignId,
              customerId: recipient.customerId,
              userId: schedule.campaign.userId,
            },
          });
        }
      });
    }

    return {
      executed: scheduledCampaigns.length,
      timestamp: now.toISOString(),
    };
  }
);

/**
 * Select A/B Test Winner
 * Checks completed A/B tests and selects winner based on metrics
 */
export const selectABTestWinnerJob = inngest.createFunction(
  {
    id: 'select-ab-test-winner',
    name: 'Select A/B Test Winner',
  },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    const now = new Date();

    // Find A/B tests that have completed their test duration
    const completedTests = await step.run('fetch-completed-tests', async () => {
      return prisma.aBTest.findMany({
        where: {
          status: 'active',
          endedAt: {
            lte: now,
          },
          winner: null, // Not yet evaluated
        },
        include: {
          campaign: true,
        },
      });
    });

    console.log(`Found ${completedTests.length} A/B tests to evaluate`);

    for (const test of completedTests) {
      await step.run(`evaluate-test-${test.id}`, async () => {
        // Calculate winner based on test type
        let winner: 'A' | 'B' = 'A';
        let metrics: any = {};

        if (test.testType === 'subject' || test.testType === 'content') {
          // Get open rates for both variants
          const variantAOpens = await prisma.campaignSendUpdated.count({
            where: {
              campaignId: test.campaignId,
              status: 'opened',
              // Filter by variant A recipients
            },
          });

          const variantBOpens = await prisma.campaignSendUpdated.count({
            where: {
              campaignId: test.campaignId,
              status: 'opened',
              // Filter by variant B recipients
            },
          });

          winner = variantBOpens > variantAOpens ? 'B' : 'A';
          metrics = {
            variantAOpens,
            variantBOpens,
          };
        }

        // Update test with winner
        await prisma.aBTest.update({
          where: { id: test.id },
          data: {
            status: 'completed',
            winner: winner,
          },
        });

        // Send winning variant to remaining recipients
        const remainingRecipients = await prisma.campaignRecipient.findMany({
          where: {
            campaignId: test.campaignId,
            // Filter out test recipients
          },
        });

        for (const recipient of remainingRecipients) {
          await inngest.send({
            name: 'campaign/send',
            data: {
              campaignId: test.campaignId,
              customerId: recipient.customerId,
              userId: test.campaign.userId,
              abTestVariant: winner,
            },
          });
        }
      });
    }

    return {
      evaluated: completedTests.length,
      timestamp: now.toISOString(),
    };
  }
);

/**
 * Execute Automation Triggers
 * Checks for automation rules and executes actions
 */
export const executeAutomationTriggersJob = inngest.createFunction(
  {
    id: 'execute-automation-triggers',
    name: 'Execute Automation Triggers',
  },
  { cron: '*/10 * * * *' }, // Every 10 minutes
  async ({ step }) => {
    // Find active automations
    const automations = await step.run('fetch-automations', async () => {
      return prisma.campaignAutomation.findMany({
        where: {
          enabled: true,
        },
        include: {
          campaign: true,
        },
      });
    });

    let executedCount = 0;

    for (const automation of automations) {
      if (!automation.campaignId) continue; // Skip if no campaign
      
      const campaignId = automation.campaignId; // TypeScript narrowing
      
      await step.run(`check-automation-${automation.id}`, async () => {
        // Check trigger conditions
        let shouldTrigger = false;

        switch (automation.trigger) {
          case 'email_opened':
            // Check for recent opens
            const recentOpens = await prisma.campaignSendUpdated.count({
              where: {
                campaignId,
                status: 'opened',
                openedAt: {
                  gte: new Date(Date.now() - 10 * 60 * 1000), // Last 10 minutes
                },
              },
            });
            shouldTrigger = recentOpens > 0;
            break;

          case 'link_clicked':
            // Check for recent clicks
            const recentClicks = await prisma.campaignSendUpdated.count({
              where: {
                campaignId,
                status: 'clicked',
                clickedAt: {
                  gte: new Date(Date.now() - 10 * 60 * 1000),
                },
              },
            });
            shouldTrigger = recentClicks > 0;
            break;

          case 'no_response':
            // Check for sends with no opens after delay
            const delayHours = (automation.triggerData as any).delayHours || 24;
            const unengagedSends = await prisma.campaignSendUpdated.findMany({
              where: {
                campaignId,
                status: 'sent',
                sentAt: {
                  lte: new Date(Date.now() - delayHours * 60 * 60 * 1000),
                },
              },
            });
            shouldTrigger = unengagedSends.length > 0;
            break;
        }

        if (shouldTrigger) {
          // Execute action
          const actionData = automation.actionData as any;
          
          switch (automation.action) {
            case 'send_followup':
            case 'send_campaign':
              if (actionData.campaignId) {
                await inngest.send({
                  name: 'campaign/send',
                  data: {
                    campaignId: actionData.campaignId,
                    customerId: automation.campaign?.userId || '',
                    userId: automation.userId,
                  },
                });
              }
              break;

            case 'add_tag':
              // Add tag to customers
              break;

            case 'send_notification':
              // Send notification to user
              break;
          }

          executedCount++;
        }
      });
    }

    return {
      checked: automations.length,
      executed: executedCount,
      timestamp: new Date().toISOString(),
    };
  }
);

/**
 * Send Approval Reminders
 * Reminds approvers of pending campaign approvals
 */
export const sendApprovalRemindersJob = inngest.createFunction(
  {
    id: 'send-approval-reminders',
    name: 'Send Approval Reminders',
  },
  { cron: '0 9,17 * * *' }, // 9 AM and 5 PM daily
  async ({ step }) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find pending approvals older than 24 hours
    const pendingApprovals = await step.run('fetch-pending-approvals', async () => {
      return prisma.campaignApproval.findMany({
        where: {
          status: 'pending',
          createdAt: {
            lte: oneDayAgo,
          },
        },
        include: {
          campaign: {
            include: {
              user: true, // Include user to get their email
            },
          },
        },
      });
    });

    for (const approval of pendingApprovals) {
      await step.run(`send-reminder-${approval.id}`, async () => {
        // Send to the user who requested approval
        const requestedByUser = approval.campaign.user;
        
        await sendEmail({
          to: requestedByUser.email,
          subject: `Reminder: Campaign "${approval.campaign.name}" is pending approval`,
          body: `
            <p>Hi,</p>
            <p>This is a reminder that your campaign "${approval.campaign.name}" is still waiting for approval.</p>
            <p>Requested by: ${approval.requestedBy}</p>
            <p>Requested on: ${approval.createdAt.toLocaleString()}</p>
            <p>Status: ${approval.status}</p>
            <p>Please follow up with your approver to complete the review.</p>
          `,
          trackingId: approval.campaignId,
        });
      });
    }

    return {
      remindersSent: pendingApprovals.length,
      timestamp: now.toISOString(),
    };
  }
);

/**
 * Check Recurring Campaigns
 * Creates new instances of recurring campaigns
 */
export const checkRecurringCampaignsJob = inngest.createFunction(
  {
    id: 'check-recurring-campaigns',
    name: 'Check Recurring Campaigns',
  },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    const now = new Date();

    // Find recurring schedules that need a new instance
    const recurringSchedules = await step.run('fetch-recurring-schedules', async () => {
      return prisma.campaignSchedule.findMany({
        where: {
          recurring: {
            not: null,
          },
          OR: [
            { recurringEnd: null },
            { recurringEnd: { gte: now } },
          ],
          sendTime: {
            lte: now, // Already sent/executed
          },
        },
        include: {
          campaign: true,
        },
      });
    });

    for (const schedule of recurringSchedules) {
      await step.run(`create-instance-${schedule.id}`, async () => {
        // Calculate next run time based on recurrence
        let nextRunTime = new Date(schedule.sendTime);
        
        switch (schedule.recurring) {
          case 'daily':
            nextRunTime.setDate(nextRunTime.getDate() + 1);
            break;
          case 'weekly':
            nextRunTime.setDate(nextRunTime.getDate() + 7);
            break;
          case 'monthly':
            nextRunTime.setMonth(nextRunTime.getMonth() + 1);
            break;
        }

        // Create new schedule instance
        await prisma.campaignSchedule.create({
          data: {
            campaignId: schedule.campaignId,
            sendTime: nextRunTime,
            timezone: schedule.timezone,
            recurring: schedule.recurring,
            recurringEnd: schedule.recurringEnd,
            optimizeSendTime: schedule.optimizeSendTime,
          },
        });

        // Delete the old schedule
        await prisma.campaignSchedule.delete({
          where: { id: schedule.id },
        });
      });
    }

    return {
      created: recurringSchedules.length,
      timestamp: now.toISOString(),
    };
  }
);
