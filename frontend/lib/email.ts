/**
 * Email Service using Resend
 * Handles sending emails for notifications, welcome messages, and alerts
 */

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = process.env.RESEND_FROM_NAME || 'RedLead';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!resend) {
    console.warn('⚠️ Resend API key not configured. Email not sent.');
    return { success: false, error: 'Resend API key not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return { success: false, error: error.message || 'Failed to send email' };
    }

    console.log(`✅ Email sent successfully to ${options.to}:`, data?.id);
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('❌ Email send exception:', error);
    return { success: false, error: error.message || 'Failed to send email' };
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, firstName?: string): Promise<{ success: boolean; error?: string }> {
  const name = firstName || 'there';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RedLead</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to RedLead! 🎉</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We're thrilled to have you join RedLead! You're now part of a community that helps businesses discover and engage with high-quality leads on Reddit.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #667eea;">🚀 Get Started</h2>
            <ol style="padding-left: 20px;">
              <li style="margin-bottom: 10px;">Create your first campaign</li>
              <li style="margin-bottom: 10px;">Configure target subreddits and keywords</li>
              <li style="margin-bottom: 10px;">Run discovery to find leads</li>
              <li style="margin-bottom: 10px;">Engage with leads using AI-powered replies</li>
            </ol>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gusto-sales-cloud.vercel.app'}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            Best regards,<br>
            The RedLead Team
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>You're receiving this email because you signed up for RedLead.</p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Welcome to RedLead! 🎉',
    html,
  });
}

/**
 * Send sign-in notification email
 */
export async function sendSignInEmail(email: string, firstName?: string, ipAddress?: string): Promise<{ success: boolean; error?: string }> {
  const name = firstName || 'there';
  const location = ipAddress ? `from ${ipAddress}` : '';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign-in Notification</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Sign-in Notification</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            We noticed a recent sign-in to your RedLead account ${location}.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #666;">
              <strong>Time:</strong> ${new Date().toLocaleString()}<br>
              ${ipAddress ? `<strong>IP Address:</strong> ${ipAddress}` : ''}
            </p>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            If this wasn't you, please secure your account immediately by changing your password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gusto-sales-cloud.vercel.app'}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Go to Dashboard
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Best regards,<br>
            The RedLead Team
          </p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Sign-in Notification - RedLead',
    html,
  });
}

/**
 * Send lead discovery notification email
 */
export async function sendLeadDiscoveryEmail(
  email: string,
  campaignName: string,
  leadCount: number,
  firstName?: string
): Promise<{ success: boolean; error?: string }> {
  const name = firstName || 'there';
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Leads Discovered</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎯 New Leads Discovered!</h1>
        </div>
        
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name},</p>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            Great news! Your campaign <strong>"${campaignName}"</strong> has discovered <strong>${leadCount} new lead${leadCount !== 1 ? 's' : ''}</strong>!
          </p>
          
          <div style="background: #f0f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #667eea; font-size: 20px;">📊 Discovery Summary</h2>
            <p style="margin: 5px 0;"><strong>Campaign:</strong> ${campaignName}</p>
            <p style="margin: 5px 0;"><strong>Leads Found:</strong> ${leadCount}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
          
          <p style="font-size: 16px; margin-bottom: 20px;">
            These leads are now available in your dashboard. Review them and start engaging!
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://gusto-sales-cloud.vercel.app'}/dashboard" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              View Leads
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Best regards,<br>
            The RedLead Team
          </p>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: `🎯 ${leadCount} New Lead${leadCount !== 1 ? 's' : ''} Found in "${campaignName}"`,
    html,
  });
}

/**
 * Check if email notifications are enabled for a user
 */
export async function isEmailNotificationsEnabled(userId: string): Promise<{ enabled: boolean; email?: string }> {
  try {
    // Try Prisma first
    const { prisma, isPrismaAvailable } = await import('@/lib/prisma');
    if (isPrismaAvailable() && prisma && process.env.DATABASE_URL) {
      const settings = await prisma.emailNotificationSetting.findUnique({
        where: { userId },
      });
      if (settings) {
        return { enabled: settings.enabled, email: settings.email };
      }
    }
    
    // Fallback to in-memory
    const { db } = await import('@/lib/db');
    const settings = db.getEmailSettings(userId);
    if (settings) {
      return { enabled: settings.enabled, email: settings.email };
    }
    
    return { enabled: false };
  } catch (error) {
    console.error('Error checking email notification settings:', error);
    return { enabled: false };
  }
}


