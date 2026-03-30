import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateEmailOtp, hashPassword, hashEmailOtp } from '@/lib/auth';
import { sendAdminNewUserEmail, sendEmailOtpEmail } from '@/lib/emailService';

const otpRequests = new Map<string, { count: number; resetAt: number }>();

function isAllowed(identifier: string): boolean {
  const now = Date.now();
  const entry = otpRequests.get(identifier);

  if (!entry || now > entry.resetAt) {
    otpRequests.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return true;
  }

  if (entry.count >= 5) {
    return false;
  }

  entry.count += 1;
  return true;
}

function cleanupOtpRequests() {
  const now = Date.now();
  for (const [key, value] of otpRequests.entries()) {
    if (now > value.resetAt) {
      otpRequests.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, mode } = await request.json();
    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!['signin', 'signup'].includes(mode)) {
      return NextResponse.json(
        { success: false, error: 'Invalid auth mode' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (mode === 'signup' && !name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Full name is required to create an account' },
        { status: 400 }
      );
    }

    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${normalizedEmail}:${clientIP}`;

    if (!isAllowed(rateLimitKey)) {
      return NextResponse.json(
        { success: false, error: 'Too many OTP requests. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    if (Math.random() < 0.1) {
      cleanupOtpRequests();
    }

    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (mode === 'signin' && !user) {
      return NextResponse.json(
        { success: false, error: 'No account found with this email. Please sign up first.' },
        { status: 404 }
      );
    }

    if (mode === 'signup' && user?.googleId && user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'This email is already registered. Please sign in instead.' },
        { status: 400 }
      );
    }

    let createdNewUser = false;

    if (!user) {
      const generatedPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await hashPassword(generatedPassword);

      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          name: name?.trim() || null,
          phone: phone?.trim() || null,
          emailVerified: false,
        },
      });
      createdNewUser = true;
    } else if (mode === 'signup') {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name?.trim() || user.name,
          phone: phone?.trim() || user.phone,
        },
      });
    }

    const otp = generateEmailOtp();
    const otpHash = hashEmailOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailOtpHash: otpHash,
        emailOtpExpiry: otpExpiry,
      },
    });

    const emailResult = await sendEmailOtpEmail(
      {
        email: user.email,
        name: user.name,
      },
      otp
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    if (createdNewUser) {
      sendAdminNewUserEmail(user).catch((error) =>
        console.error('Failed to send admin new user email:', error)
      );
    }

    return NextResponse.json({
      success: true,
      message: 'A one-time code has been sent to your email address.',
    });
  } catch (error) {
    console.error('Request OTP error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to request OTP' },
      { status: 500 }
    );
  }
}
