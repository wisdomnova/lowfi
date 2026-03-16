import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth-utils';
import { hasFeature } from '@/lib/plan-features';
import crypto from 'crypto';

// Encryption helper for storing sensitive API keys
function encryptKey(key: string, userId: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', userId);
  let encrypted = cipher.update(key, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptKey(encrypted: string, userId: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', userId);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const connections = await prisma.integrationConnection.findMany({
      where: { userId },
    });

    // Return without exposing encrypted keys
    return NextResponse.json(
      connections.map((c) => ({
        id: c.id,
        type: c.type,
        name: c.name,
        enabled: c.enabled,
        createdAt: c.createdAt,
        lastSyncAt: c.lastSyncAt,
      }))
    );
  } catch (error) {
    console.error('Get integrations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch integrations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, apiKey, config } = await req.json();

    // Check plan features
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const plan = subscription?.plan || 'starter';

    if (!hasFeature(plan as any, 'crmIntegrations')) {
      return NextResponse.json(
        { error: 'Integrations are not available on your plan' },
        { status: 403 }
      );
    }

    // Check provider-specific feature gates
    const providerFeatureMap: Record<string, string> = {
      hubspot: 'hubspotIntegration',
      salesforce: 'salesforceIntegration',
      zapier: 'zapierIntegration',
      slack: 'slackIntegration',
    };

    const requiredFeature = providerFeatureMap[provider.toLowerCase()];
    if (
      requiredFeature &&
      !hasFeature(plan as any, requiredFeature as any)
    ) {
      return NextResponse.json(
        { error: `${provider} integration is not available on your plan` },
        { status: 403 }
      );
    }

    // Validate API key by testing connection
    const isValid = await validateIntegration(provider, apiKey);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid API credentials' },
        { status: 400 }
      );
    }

    // Encrypt API key before storing
    const encryptedKey = encryptKey(apiKey, userId);

    const connection = await prisma.integrationConnection.create({
      data: {
        userId,
        type: provider,
        name: provider,
        apiKey: encryptedKey,
        apiSecret: null,
        metadata: config || {},
        enabled: true,
      },
    });

    // Return without exposing encrypted key
    return NextResponse.json(
      {
        id: connection.id,
        type: connection.type,
        name: connection.name,
        enabled: connection.enabled,
        createdAt: connection.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create integration error:', error);
    return NextResponse.json(
      { error: 'Failed to create integration' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integrationId } = await req.json();

    const connection = await prisma.integrationConnection.findUnique({
      where: { id: integrationId },
    });

    if (!connection || connection.userId !== userId) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    await prisma.integrationConnection.delete({
      where: { id: integrationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete integration error:', error);
    return NextResponse.json(
      { error: 'Failed to delete integration' },
      { status: 500 }
    );
  }
}

async function validateIntegration(
  provider: string,
  apiKey: string
): Promise<boolean> {
  try {
    const providerUrl: Record<string, string> = {
      hubspot: 'https://api.hubapi.com/crm/v3/objects/contacts',
      salesforce: 'https://login.salesforce.com/services/oauth2/authorize',
      slack: 'https://slack.com/api/auth.test',
      zapier: 'https://zapier.com/api/v1/users/me',
    };

    const url = providerUrl[provider.toLowerCase()];
    if (!url) {
      return false;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Integration validation error:', error);
    return false;
  }
}
