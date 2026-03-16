// OpenAI client configuration
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

export const openai = new OpenAI({
  apiKey: apiKey,
});

// Helper function to extract text from invoices
export async function extractInvoiceText(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Extract key invoice data (invoice number, date, amount, vendor, items) from this text:\n\n${text}`,
        },
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}

// Helper function to generate follow-up email
export async function generateFollowUpEmail(
  customerName: string,
  invoiceAmount: number,
  daysOverdue: number
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Generate a professional, brief follow-up email for an overdue invoice. 
        Customer: ${customerName}
        Amount: $${invoiceAmount}
        Days overdue: ${daysOverdue}
        
        Keep it short (3-4 sentences), professional, and not aggressive.`,
        },
      ],
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}

// Helper function to categorize support ticket
export async function categorizeTicket(subject: string, body: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      max_tokens: 100,
      messages: [
        {
          role: "user",
          content: `Categorize this support ticket into one category: billing, technical, feature_request, bug, or other.
        Subject: ${subject}
        Body: ${body}
        
        Return only the category name.`,
        },
      ],
    });

    return response.choices[0].message.content || "other";
  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
}
