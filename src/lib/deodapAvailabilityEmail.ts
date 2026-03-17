import { Resend } from 'resend';
import type { DeodapAvailabilitySyncResult } from './deodapAvailabilitySync';

const resend = new Resend(process.env.RESEND_API_KEY);
const TRANSACTIONAL_EMAIL =
  process.env.TRANSACTIONAL_EMAIL_FROM || process.env.EMAIL_FROM || 'info@onlyinkani.in';

function getReportRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAILS || TRANSACTIONAL_EMAIL;
  const emails = raw
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean);

  return emails.length > 0 ? emails : [TRANSACTIONAL_EMAIL];
}

function reportHtml(result: DeodapAvailabilitySyncResult): string {
  const generatedAt = new Date().toISOString();
  return `
    <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
      <h2 style="margin-bottom: 8px;">Deodap Availability Sync Report</h2>
      <p style="margin-top: 0; color: #4b5563;">Generated at: ${generatedAt}</p>
      <table style="border-collapse: collapse; width: 100%; max-width: 640px;">
        <tbody>
          ${[
            ['Feeds Processed', result.feedsProcessed],
            ['Products Seen In Feeds', result.productsSeenInFeeds],
            ['Unique External IDs In Feeds', result.uniqueExternalIdsInFeeds],
            ['DB Products Checked', result.dbProductsChecked],
            ['Matched Products', result.matchedProducts],
            ['Activated', result.activated],
            ['Deactivated', result.deactivated],
            ['Unchanged', result.unchanged],
            ['Missing In Feeds', result.missingInFeeds],
          ]
            .map(
              ([label, value]) => `
                <tr>
                  <td style="border: 1px solid #e5e7eb; padding: 8px; font-weight: 600;">${label}</td>
                  <td style="border: 1px solid #e5e7eb; padding: 8px;">${value}</td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

export async function sendDeodapAvailabilityReportEmail(result: DeodapAvailabilitySyncResult) {
  try {
    const to = getReportRecipients();
    const { data, error } = await resend.emails.send({
      from: TRANSACTIONAL_EMAIL,
      to,
      subject: `Deodap Availability Sync Report - ${new Date().toISOString().slice(0, 10)}`,
      html: reportHtml(result),
    });

    if (error) {
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
}
