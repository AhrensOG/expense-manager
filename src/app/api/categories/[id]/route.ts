import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Category } from '@/db';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').optional(),
  type: z.enum(['expense', 'income', 'both']).optional(),
  icon: z.string().max(50).optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format').optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await Category.findOne({
      where: { id: categoryId, userId: parseInt(token.sub) },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Category not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = categorySchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    await category.update(result.data);

    return NextResponse.json({ category });
  } catch (error) {
    console.error('Categories PUT error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const categoryId = parseInt(id);

    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await Category.findOne({
      where: { id: categoryId, userId: parseInt(token.sub) },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Category not found' },
        { status: 404 }
      );
    }

    await category.destroy();

    return NextResponse.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Categories DELETE error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
