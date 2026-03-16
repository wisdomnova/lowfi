import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';

// Import all jobs to register them
import { sendCampaignJob, sendSequenceEmailJob } from '@/lib/jobs/campaign-jobs';
import { 
  executeScheduledCampaignsJob,
  selectABTestWinnerJob,
  executeAutomationTriggersJob,
  sendApprovalRemindersJob,
  checkRecurringCampaignsJob,
} from '@/lib/jobs/phase2-jobs';

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendCampaignJob,
    sendSequenceEmailJob,
    executeScheduledCampaignsJob,
    selectABTestWinnerJob,
    executeAutomationTriggersJob,
    sendApprovalRemindersJob,
    checkRecurringCampaignsJob,
  ],
});
