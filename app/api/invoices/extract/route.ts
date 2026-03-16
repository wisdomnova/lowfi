import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-utils';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function POST(req: NextRequest) {
  try {
    const userId = await verifyAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI is not configured' },
        { status: 503 }
      );
    }

    const { base64, mimeType } = await req.json();

    if (!base64 || !mimeType) {
      return NextResponse.json(
        { error: 'base64 and mimeType are required' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Extract the following information from this invoice and return as JSON: 
              { 
                "invoiceNumber": string,
                "vendor": string,
                "amount": number,
                "date": string (YYYY-MM-DD),
                "status": "pending_review"
              }
              If any field is not found, use null. Output ONLY the raw JSON block.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const extractedText = response.choices?.[0]?.message?.content || '{}';

    let invoiceData;
    try {
      const cleanJson = extractedText.replace(/```json|```/g, '').trim();
      invoiceData = JSON.parse(cleanJson);
    } catch {
      invoiceData = {
        invoiceNumber: `INV-${Date.now()}`,
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        vendor: 'Extraction Error',
        status: 'pending_review',
      };
    }

    return NextResponse.json(invoiceData);
  } catch (error) {
    console.error('Error extracting invoice:', error);
    return NextResponse.json(
      { error: 'Failed to extract invoice data' },
      { status: 500 }
    );
  }
}
