import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, verifyEmailOtp } from '@/lib/auth';
import { isAdminEmail } from '@/lib/adminAuth';
import { sendWelcomeEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, name, phone } = await request.json();
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !otp) {
      return NextResponse.json(
        { success: false, error: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'OTP must be a 6-digit code' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
        emailVerified: true,
        emailOtpHash: true,
        emailOtpExpiry: true,
      },
    });

    if (!user || !user.emailOtpHash || !user.emailOtpExpiry) {
      return NextResponse.json(
        { success: false, error: 'No active OTP found. Please request a new code.' },
        { status: 400 }
      );
    }

    if (new Date() > user.emailOtpExpiry) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailOtpHash: null,
          emailOtpExpiry: null,
        },
      });

      return NextResponse.json(
        { success: false, error: 'This OTP has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    if (!verifyEmailOtp(otp, user.emailOtpHash)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 401 }
      );
    }

    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name?.trim() || user.name,
        phone: phone?.trim() || user.phone,
        emailVerified: true,
        emailOtpHash: null,
        emailOtpExpiry: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        createdAt: true,
        emailVerified: true,
      },
    });

    if (!user.emailVerified) {
      const welcomeEmailResult = await sendWelcomeEmail(verifiedUser);
      if (!welcomeEmailResult.success) {
        console.error('Failed to send welcome email:', welcomeEmailResult.error);
      }
    }

    const token = generateToken({
      userId: verifiedUser.id,
      email: verifiedUser.email,
      isAdmin: isAdminEmail(verifiedUser.email),
    });

    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: verifiedUser,
      token,
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
