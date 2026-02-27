import { NextRequest, NextResponse } from 'next/server';
import { syncDeodapAvailability } from '@/lib/deodapAvailabilitySync';
import { sendDeodapAvailabilityReportEmail } from '@/lib/deodapAvailabilityEmail';

export const dynamic = 'force-dynamic';

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;

  const authHeader = request.headers.get('authorization') || '';
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const deactivateMissing = request.nextUrl.searchParams.get('deactivateMissing') === '1';
    const result = await syncDeodapAvailability({ deactivateMissing });
    const emailResult = await sendDeodapAvailabilityReportEmail(result);

    return NextResponse.json({
      success: true,
      message: 'Deodap availability sync completed.',
      result,
      email: emailResult.success ? 'sent' : 'failed',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync availability',
      },
      { status: 500 }
    );
  }
}
