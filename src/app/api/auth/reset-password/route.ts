import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();
    if (!token || !newPassword) {
      return NextResponse.json({ success: false, error: 'Token and new password required' }, { status: 400 });
    }
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiry: { gte: new Date() },
      },
    });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired token' }, { status: 400 });
    }
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiry: null,
      },
    });
    return NextResponse.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ success: false, error: 'Failed to reset password' }, { status: 500 });
  }
}
