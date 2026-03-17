import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Recurring, Currency, Category } from '@/db';

const recurringSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  amount: z.number().positive('Amount must be positive').optional(),
  type: z.enum(['expense', 'income']).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']).optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date').optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date').optional().nullable(),
  currencyId: z.number().int().positive('Invalid currency ID').optional(),
  categoryId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
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
    const recurringId = parseInt(id);

    if (isNaN(recurringId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid recurring ID' },
        { status: 400 }
      );
    }

    const recurring = await Recurring.findOne({
      where: { id: recurringId, userId: parseInt(token.sub) },
    });

    if (!recurring) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Recurring not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = recurringSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { currencyId, categoryId } = result.data;

    if (currencyId) {
      const currency = await Currency.findByPk(currencyId);
      if (!currency) {
        return NextResponse.json(
          { error: 'INVALID_CURRENCY', message: 'Currency not found' },
          { status: 400 }
        );
      }
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return NextResponse.json(
          { error: 'INVALID_CATEGORY', message: 'Category not found' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (result.data.name) updateData.name = result.data.name;
    if (result.data.amount) updateData.amount = result.data.amount;
    if (result.data.type) updateData.type = result.data.type;
    if (result.data.frequency) updateData.frequency = result.data.frequency;
    if (result.data.startDate) updateData.startDate = new Date(result.data.startDate);
    if (result.data.endDate !== undefined) updateData.endDate = result.data.endDate ? new Date(result.data.endDate) : null;
    if (result.data.currencyId) updateData.currencyId = result.data.currencyId;
    if (result.data.categoryId !== undefined) updateData.categoryId = result.data.categoryId;
    if (result.data.isActive !== undefined) updateData.isActive = result.data.isActive;

    await recurring.update(updateData);

    const updatedRecurring = await Recurring.findByPk(recurring.id, {
      include: [
        { model: Currency, as: 'Currency' },
        { model: Category, as: 'Category' },
      ],
    });

    return NextResponse.json({ recurring: updatedRecurring });
  } catch (error) {
    console.error('Recurring PUT error:', error);
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
    const recurringId = parseInt(id);

    if (isNaN(recurringId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid recurring ID' },
        { status: 400 }
      );
    }

    const recurring = await Recurring.findOne({
      where: { id: recurringId, userId: parseInt(token.sub) },
    });

    if (!recurring) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Recurring not found' },
        { status: 404 }
      );
    }

    await recurring.destroy();

    return NextResponse.json({ message: 'Recurring deleted' });
  } catch (error) {
    console.error('Recurring DELETE error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
