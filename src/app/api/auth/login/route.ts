import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Rate limiting map (in production, use Redis)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (!attempts || now > attempts.resetAt) {
    loginAttempts.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 min window
    return true;
  }

  if (attempts.count >= 5) {
    return false;
  }

  attempts.count++;
  return true;
}

function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.resetAt) {
      loginAttempts.delete(key);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe = false } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `${email}:${clientIP}`;
    
    if (!checkRateLimit(rateLimitKey)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Too many login attempts. Please try again in 15 minutes.' 
        },
        { status: 429 }
      );
    }

    // Cleanup old rate limit entries periodically
    if (Math.random() < 0.1) cleanupRateLimits();

    // Find user (normalize email to lowercase)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        phone: true,
        address: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    if (!user) {
      // Use same error message as wrong password (security best practice)
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Please verify your email before logging in. Check your inbox for the verification link.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      );
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    // Set HTTP-only cookie for security
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
      path: '/',
    });

    // Clear rate limit on successful login
    loginAttempts.delete(rateLimitKey);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userWithoutPassword,
      token, // Also return token for client-side storage if needed
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { success: false, error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    );
  }
}