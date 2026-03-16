import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { template, variables } = body;

    if (!template) {
      return NextResponse.json(
        { error: 'Template is required' },
        { status: 400 }
      );
    }

    let previewBody = template.body;
    let previewSubject = template.subject;

    // Replace variables in template
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        previewBody = previewBody.replace(regex, String(value || ''));
        previewSubject = previewSubject.replace(regex, String(value || ''));
      });
    }

    // If no variables provided, replace all remaining variables with placeholder
    previewBody = previewBody.replace(/{{[^}]+}}/g, '[Variable]');
    previewSubject = previewSubject.replace(/{{[^}]+}}/g, '[Variable]');

    return NextResponse.json({
      subject: previewSubject,
      body: previewBody,
      variables: template.variables || [],
    });
  } catch (error) {
    console.error('Template preview error:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}
