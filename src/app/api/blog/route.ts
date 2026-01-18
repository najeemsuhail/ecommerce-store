import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    // Check if user is admin (has token)
    const isAdmin = !!token;

    // Admin sees all blogs, public only sees published
    const where = isAdmin ? {} : { published: true };

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.blog.count({ where });

    return NextResponse.json({
      success: true,
      blogs,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Blog fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    // TODO: Verify admin token
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    
    // Generate slug from title if not provided
    let slug = data.slug || data.title.toLowerCase().replace(/\s+/g, '-');

    // Check if slug already exists
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      // Generate unique slug by appending a timestamp
      const timestamp = Date.now();
      slug = `${slug}-${timestamp}`;
    }

    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        author: data.author,
        published: data.published || false,
      },
    });

    return NextResponse.json({ success: true, blog }, { status: 201 });
  } catch (error) {
    console.error('Blog creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
