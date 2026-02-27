import 'dotenv/config';
import { syncDeodapAvailability } from '../src/lib/deodapAvailabilitySync';
import { sendDeodapAvailabilityReportEmail } from '../src/lib/deodapAvailabilityEmail';

async function run() {
  const deactivateMissing = process.env.DEODAP_DEACTIVATE_MISSING === 'true';
  const sendReportEmail = process.env.DEODAP_SEND_REPORT_EMAIL !== 'false';
  const result = await syncDeodapAvailability({ deactivateMissing });

  console.log('Deodap availability sync finished.');
  console.log(JSON.stringify(result, null, 2));

  if (sendReportEmail) {
    const emailResult = await sendDeodapAvailabilityReportEmail(result);
    if (!emailResult.success) {
      console.error('Failed to send report email:', emailResult.error);
    } else {
      console.log('Report email sent.');
    }
  }
}

run()
  .catch((error) => {
    console.error('Deodap availability sync failed:', error);
    process.exitCode = 1;
  });
