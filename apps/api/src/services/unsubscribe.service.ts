import axios from 'axios';
import * as cheerio from 'cheerio';
import { GmailService } from './gmail.service';
import prisma from '../config/database';

export interface UnsubscribeResult {
    success: boolean;
    method: string;
    message: string;
    requiresManual: boolean;
}

/**
 * Extract unsubscribe links from email
 */
export function extractUnsubscribeLinks(headers: any, body: string): {
    headerLink?: string;
    bodyLinks: string[];
    method: 'mailto' | 'http_get' | 'http_post' | 'one_click' | 'unknown';
} {
    const result: any = {
        bodyLinks: [],
        method: 'unknown',
    };

    // Check List-Unsubscribe header (RFC 2369)
    const listUnsubscribe = headers['list-unsubscribe'];
    if (listUnsubscribe) {
        // Can be mailto: or http(s):
        const mailtoMatch = listUnsubscribe.match(/mailto:([^>]+)/);
        const httpMatch = listUnsubscribe.match(/https?:\/\/[^>]+/);

        if (httpMatch) {
            result.headerLink = httpMatch[0];
            result.method = 'http_get';
        } else if (mailtoMatch) {
            result.headerLink = `mailto:${mailtoMatch[1]}`;
            result.method = 'mailto';
        }
    }

    // Check for one-click unsubscribe (RFC 8058)
    const listUnsubscribePost = headers['list-unsubscribe-post'];
    if (listUnsubscribePost && result.headerLink) {
        result.method = 'one_click';
    }

    // Extract unsubscribe links from email body
    const $ = cheerio.load(body);

    // Common unsubscribe link patterns
    const patterns = [
        'unsubscribe',
        'opt-out',
        'opt out',
        'remove me',
        'email preferences',
        'manage subscription',
    ];

    $('a').each((_, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().toLowerCase();

        if (href && patterns.some(pattern => text.includes(pattern) || href.toLowerCase().includes(pattern))) {
            if (!result.bodyLinks.includes(href)) {
                result.bodyLinks.push(href);
            }
        }
    });

    return result;
}

/**
 * Attempt to unsubscribe using HTTP request
 */
async function unsubscribeViaHttp(url: string, method: 'GET' | 'POST' = 'GET'): Promise<UnsubscribeResult> {
    try {
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        };

        const response = method === 'POST'
            ? await axios.post(url, {}, { headers, timeout: 10000 })
            : await axios.get(url, { headers, timeout: 10000 });

        // Check if response indicates success
        const successIndicators = [
            'unsubscribed',
            'removed',
            'opt-out successful',
            'successfully unsubscribed',
            'no longer receive',
        ];

        const bodyText = response.data.toString().toLowerCase();
        const isSuccess = successIndicators.some(indicator => bodyText.includes(indicator));

        // Check for CAPTCHA or manual action required
        const requiresManual =
            bodyText.includes('captcha') ||
            bodyText.includes('verify') ||
            bodyText.includes('confirm your request') ||
            response.status === 403;

        return {
            success: isSuccess,
            method: method.toLowerCase() as any,
            message: isSuccess
                ? 'Successfully unsubscribed via HTTP request'
                : requiresManual
                    ? 'Manual action required (CAPTCHA or confirmation)'
                    : 'Unsubscribe request sent, but confirmation unclear',
            requiresManual,
        };
    } catch (error: any) {
        return {
            success: false,
            method: method.toLowerCase() as any,
            message: `Failed to unsubscribe: ${error.message}`,
            requiresManual: true,
        };
    }
}

/**
 * Attempt to unsubscribe using mailto link
 */
async function unsubscribeViaEmail(
    gmailService: GmailService,
    mailtoLink: string
): Promise<UnsubscribeResult> {
    try {
        // Parse mailto link
        const match = mailtoLink.match(/mailto:([^?]+)(\?(.+))?/);
        if (!match) {
            throw new Error('Invalid mailto link');
        }

        const to = match[1];
        const params = new URLSearchParams(match[3] || '');
        const subject = params.get('subject') || 'Unsubscribe';
        const body = params.get('body') || 'Please unsubscribe me from this mailing list.';

        await gmailService.sendEmail(to, subject, body);

        return {
            success: true,
            method: 'mailto',
            message: 'Unsubscribe email sent successfully',
            requiresManual: false,
        };
    } catch (error: any) {
        return {
            success: false,
            method: 'mailto',
            message: `Failed to send unsubscribe email: ${error.message}`,
            requiresManual: true,
        };
    }
}

/**
 * Main unsubscribe function
 */
export async function unsubscribeFromSender(
    userId: string,
    senderEmail: string,
    subscriptionId?: string
): Promise<UnsubscribeResult> {
    try {
        // Find a recent email from this sender to get unsubscribe links
        const email = await prisma.email.findFirst({
            where: {
                userId,
                from: { contains: senderEmail },
                hasUnsubscribe: true,
            },
            orderBy: { receivedAt: 'desc' },
        });

        if (!email) {
            return {
                success: false,
                method: 'unknown',
                message: 'No unsubscribe link found for this sender',
                requiresManual: true,
            };
        }

        // Get Gmail service for sending unsubscribe emails if needed
        const gmailService = await import('./gmail.service').then(m => m.createGmailService(userId));

        // Try unsubscribe link
        if (email.unsubscribeLink) {
            const url = email.unsubscribeLink;

            if (url.startsWith('mailto:')) {
                return await unsubscribeViaEmail(gmailService, url);
            } else if (url.startsWith('http')) {
                // Try one-click first, then GET
                const result = await unsubscribeViaHttp(url, 'POST');
                if (!result.success && !result.requiresManual) {
                    return await unsubscribeViaHttp(url, 'GET');
                }
                return result;
            }
        }

        return {
            success: false,
            method: 'unknown',
            message: 'No valid unsubscribe method found',
            requiresManual: true,
        };
    } catch (error: any) {
        console.error('Unsubscribe error:', error);
        return {
            success: false,
            method: 'unknown',
            message: `Error: ${error.message}`,
            requiresManual: true,
        };
    }
}

/**
 * Record unsubscribe attempt in database
 */
export async function recordUnsubscribeAttempt(
    userId: string,
    senderEmail: string,
    result: UnsubscribeResult,
    subscriptionId?: string,
    unsubscribeUrl?: string
) {
    await prisma.unsubscribeAttempt.create({
        data: {
            userId,
            subscriptionId,
            senderEmail,
            method: result.method,
            unsubscribeUrl,
            status: result.success ? 'success' : result.requiresManual ? 'requires_manual' : 'failed',
            errorMessage: result.success ? null : result.message,
            completedAt: result.success ? new Date() : null,
        },
    });

    // Update subscription status if successful
    if (result.success && subscriptionId) {
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                isUnsubscribed: true,
                unsubscribedAt: new Date(),
            },
        });
    }
}
