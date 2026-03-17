import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Recurring, Currency, Category } from '@/db';

const recurringSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['expense', 'income']),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date').optional().nullable(),
  currencyId: z.number().int().positive('Invalid currency ID'),
  categoryId: z.number().int().positive().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: Record<string, unknown> = { userId: parseInt(token.sub) };
    if (activeOnly) where.isActive = true;

    const recurring = await Recurring.findAll({
      where,
      include: [
        { model: Currency, as: 'Currency' },
        { model: Category, as: 'Category' },
      ],
      order: [['name', 'ASC']],
    });

    return NextResponse.json({ recurring });
  } catch (error) {
    console.error('Recurring GET error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    if (!token?.sub) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Not authenticated' },
        { status: 401 }
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

    const { name, amount, type, frequency, startDate, endDate, currencyId, categoryId } = result.data;

    const recurring = await Recurring.create({
      name,
      amount,
      type,
      frequency,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      currencyId,
      categoryId,
      userId: parseInt(token.sub),
    });

    const recurringWithRelations = await Recurring.findByPk(recurring.id, {
      include: [
        { model: Currency, as: 'Currency' },
        { model: Category, as: 'Category' },
      ],
    });

    return NextResponse.json({ recurring: recurringWithRelations }, { status: 201 });
  } catch (error) {
    console.error('Recurring POST error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
