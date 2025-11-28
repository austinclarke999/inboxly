import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export interface EmailAnalysis {
    category: string;
    noiseScore: number;
    importanceScore: number;
    isNewsletter: boolean;
    isPromo: boolean;
    summary: string;
    reasoning: string;
}

/**
 * Analyze a single email using Gemini AI
 */
export async function analyzeEmail(
    subject: string,
    from: string,
    body: string,
    snippet: string
): Promise<EmailAnalysis> {
    try {
        const prompt = `Analyze this email and provide a JSON response with the following fields:
- category: One of [Work, Personal, Newsletter, Promotion, Social, Finance, Travel, Shopping, Other]
- noiseScore: 0-100 (how much clutter/noise this email is, 100 = pure spam)
- importanceScore: 0-100 (how important this email is, 100 = critical)
- isNewsletter: boolean (is this a newsletter/subscription?)
- isPromo: boolean (is this promotional/marketing?)
- summary: A brief 1-sentence summary of the email
- reasoning: Brief explanation of the scores

Email details:
From: ${from}
Subject: ${subject}
Snippet: ${snippet}
Body preview: ${body.substring(0, 500)}

Respond ONLY with valid JSON, no markdown formatting.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response from Gemini');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // Validate and normalize the response
        return {
            category: analysis.category || 'Other',
            noiseScore: Math.min(100, Math.max(0, analysis.noiseScore || 50)),
            importanceScore: Math.min(100, Math.max(0, analysis.importanceScore || 50)),
            isNewsletter: Boolean(analysis.isNewsletter),
            isPromo: Boolean(analysis.isPromo),
            summary: analysis.summary || '',
            reasoning: analysis.reasoning || '',
        };
    } catch (error) {
        console.error('Gemini analysis error:', error);

        // Fallback to basic heuristics if AI fails
        return fallbackAnalysis(subject, from, body);
    }
}

/**
 * Analyze multiple emails in batch (more efficient)
 */
export async function analyzeEmailsBatch(
    emails: Array<{ subject: string; from: string; body: string; snippet: string }>
): Promise<EmailAnalysis[]> {
    try {
        const prompt = `Analyze these ${emails.length} emails and provide a JSON array with analysis for each.
For each email, provide: category, noiseScore (0-100), importanceScore (0-100), isNewsletter (boolean), isPromo (boolean), summary, reasoning.

Categories: Work, Personal, Newsletter, Promotion, Social, Finance, Travel, Shopping, Other

Emails:
${emails.map((e, i) => `
${i + 1}. From: ${e.from}
   Subject: ${e.subject}
   Snippet: ${e.snippet}
`).join('\n')}

Respond with a JSON array ONLY, no markdown.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON array response from Gemini');
        }

        const analyses = JSON.parse(jsonMatch[0]);

        return analyses.map((analysis: any) => ({
            category: analysis.category || 'Other',
            noiseScore: Math.min(100, Math.max(0, analysis.noiseScore || 50)),
            importanceScore: Math.min(100, Math.max(0, analysis.importanceScore || 50)),
            isNewsletter: Boolean(analysis.isNewsletter),
            isPromo: Boolean(analysis.isPromo),
            summary: analysis.summary || '',
            reasoning: analysis.reasoning || '',
        }));
    } catch (error) {
        console.error('Batch analysis error:', error);

        // Fallback to individual analysis
        return Promise.all(
            emails.map(e => analyzeEmail(e.subject, e.from, e.body, e.snippet))
        );
    }
}

/**
 * Fallback analysis using simple heuristics when AI fails
 */
function fallbackAnalysis(subject: string, from: string, body: string): EmailAnalysis {
    const lowerSubject = subject.toLowerCase();
    const lowerFrom = from.toLowerCase();
    const lowerBody = body.toLowerCase();

    // Detect newsletters
    const isNewsletter =
        lowerBody.includes('unsubscribe') ||
        lowerFrom.includes('newsletter') ||
        lowerFrom.includes('noreply');

    // Detect promos
    const isPromo =
        lowerSubject.includes('sale') ||
        lowerSubject.includes('discount') ||
        lowerSubject.includes('offer') ||
        lowerSubject.includes('%') ||
        lowerSubject.includes('deal');

    // Determine category
    let category = 'Other';
    if (lowerFrom.includes('linkedin') || lowerFrom.includes('github')) category = 'Work';
    else if (lowerFrom.includes('bank') || lowerFrom.includes('paypal') || lowerFrom.includes('stripe')) category = 'Finance';
    else if (lowerFrom.includes('amazon') || lowerFrom.includes('ebay')) category = 'Shopping';
    else if (lowerFrom.includes('airbnb') || lowerFrom.includes('booking')) category = 'Travel';
    else if (lowerFrom.includes('facebook') || lowerFrom.includes('twitter')) category = 'Social';
    else if (isNewsletter) category = 'Newsletter';
    else if (isPromo) category = 'Promotion';

    // Calculate scores
    const noiseScore = isPromo ? 80 : isNewsletter ? 60 : 30;
    const importanceScore = category === 'Finance' ? 80 : category === 'Work' ? 70 : 40;

    return {
        category,
        noiseScore,
        importanceScore,
        isNewsletter,
        isPromo,
        summary: `Email from ${from}`,
        reasoning: 'Fallback heuristic analysis (AI unavailable)',
    };
}

/**
 * Extract subscription billing information from email
 */
export async function extractBillingInfo(emailBody: string): Promise<{
    isBilling: boolean;
    amount?: number;
    currency?: string;
    billingCycle?: string;
    nextBillingDate?: Date;
}> {
    try {
        const prompt = `Analyze this email and extract billing/subscription information.
Respond with JSON containing:
- isBilling: boolean (is this a billing/subscription email?)
- amount: number (if found)
- currency: string (USD, EUR, etc.)
- billingCycle: string (monthly, yearly, etc.)
- nextBillingDate: ISO date string (if mentioned)

Email body:
${emailBody.substring(0, 1000)}

Respond ONLY with valid JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return { isBilling: false };
        }

        const billing = JSON.parse(jsonMatch[0]);

        return {
            isBilling: Boolean(billing.isBilling),
            amount: billing.amount ? parseFloat(billing.amount) : undefined,
            currency: billing.currency || undefined,
            billingCycle: billing.billingCycle || undefined,
            nextBillingDate: billing.nextBillingDate ? new Date(billing.nextBillingDate) : undefined,
        };
    } catch (error) {
        console.error('Billing extraction error:', error);
        return { isBilling: false };
    }
}

/**
 * Categorize an email content (wrapper for compatibility)
 */
export async function categorizeEmail(content: string): Promise<string> {
    const analysis = await analyzeEmail('Unknown Subject', 'Unknown Sender', content, '');
    return analysis.category;
}

/**
 * Summarize an email content (wrapper for compatibility)
 */
export async function summarizeEmail(content: string): Promise<string> {
    const analysis = await analyzeEmail('Unknown Subject', 'Unknown Sender', content, '');
    return analysis.summary;
}

/**
 * Classify a sender based on their email history
 */
export async function classifySender(senderEmail: string, emailHistory: string[]): Promise<{
    category: string;
    isNewsletter: boolean;
    isPromo: boolean;
    reasoning: string;
}> {
    try {
        const prompt = `Analyze this sender based on their email subjects.
Sender: ${senderEmail}
Recent Subjects:
${emailHistory.map(s => `- ${s}`).join('\n')}

Respond with JSON:
- category: [Work, Personal, Newsletter, Promotion, Social, Finance, Travel, Shopping, Other]
- isNewsletter: boolean
- isPromo: boolean
- reasoning: brief explanation

JSON ONLY.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid JSON');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Sender classification error:', error);
        return {
            category: 'Other',
            isNewsletter: false,
            isPromo: false,
            reasoning: 'Analysis failed',
        };
    }
}

/**
 * Generate an unsubscribe email
 */
export async function generateUnsubscribeEmail(senderEmail: string, senderName: string): Promise<{
    subject: string;
    body: string;
}> {
    return {
        subject: 'Unsubscribe Request',
        body: `Hello,\n\nPlease unsubscribe ${senderEmail} from your mailing list.\n\nThank you.`,
    };
}
