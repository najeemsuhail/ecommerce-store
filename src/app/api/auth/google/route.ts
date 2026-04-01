import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken, hashPassword } from '@/lib/auth';
import { isAdminEmail } from '@/lib/adminAuth';
import { verifyGoogleCredential } from '@/lib/googleAuth';
import { sendAdminNewUserEmail, sendWelcomeEmail } from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'Google credential is required' },
        { status: 400 }
      );
    }

    const tokenInfo = await verifyGoogleCredential(credential);
    const email = tokenInfo.email.toLowerCase().trim();
    const name = tokenInfo.name?.trim() || null;

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: tokenInfo.sub },
          { email },
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        emailVerified: true,
        createdAt: true,
        googleId: true,
      },
    });

    if (!user) {
      const generatedPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await hashPassword(generatedPassword);

      user = await prisma.user.create({
        data: {
          email,
          googleId: tokenInfo.sub,
          password: hashedPassword,
          name,
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          emailVerified: true,
          createdAt: true,
          googleId: true,
        },
      });

      const [welcomeEmailResult, adminEmailResult] = await Promise.allSettled([
        sendWelcomeEmail(user),
        sendAdminNewUserEmail(user),
      ]);

      if (welcomeEmailResult.status === 'rejected') {
        console.error('Failed to send Google welcome email:', welcomeEmailResult.reason);
      }

      if (adminEmailResult.status === 'rejected') {
        console.error('Failed to send admin new Google user email:', adminEmailResult.reason);
      }
    } else {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: user.googleId ?? tokenInfo.sub,
          name: user.name || name,
          emailVerified: true,
          verificationToken: null,
          verificationTokenExpiry: null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          address: true,
          emailVerified: true,
          createdAt: true,
          googleId: true,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: isAdminEmail(user.email),
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
      message: 'Google login successful',
      user,
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);

    return NextResponse.json(
      { success: false, error: 'Google login failed. Please try again.' },
      { status: 401 }
    );
  }
}
