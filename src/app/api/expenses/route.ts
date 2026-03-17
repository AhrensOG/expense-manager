import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Op } from 'sequelize';
import { Expense, Category, Currency, Trip, Account } from '@/db';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(500).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  currencyId: z.number().int().positive('Invalid currency ID'),
  categoryId: z.number().int().positive().optional(),
  accountId: z.number().int().positive().optional(),
  tripId: z.number().int().positive().optional(),
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
    const tripId = searchParams.get('tripId');
    const categoryId = searchParams.get('categoryId');
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { userId: parseInt(token.sub) };

    if (tripId) where.tripId = parseInt(tripId);
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (accountId) where.accountId = parseInt(accountId);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      let end: Date;
      if (endDate) {
        end = new Date(endDate);
      } else {
        end = new Date(start);
        end.setMonth(end.getMonth() + 1);
      }
      end.setHours(0, 0, 0, 0);
      
      where.date = {
        [Op.gte]: start,
        [Op.lt]: end,
      };
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: Category, as: 'Category' },
        { model: Currency, as: 'Currency' },
        { model: Trip, as: 'Trip' },
        { model: Account, as: 'Account' },
      ],
      order: [['date', 'DESC']],
    });

    return NextResponse.json({ expenses });
  } catch (error) {
    console.error('Expenses GET error:', error);
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
    const result = expenseSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { amount, description, date, currencyId, categoryId, accountId, tripId } = result.data;

    const currency = await Currency.findByPk(currencyId);
    if (!currency) {
      return NextResponse.json(
        { error: 'INVALID_CURRENCY', message: 'Currency not found' },
        { status: 400 }
      );
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

    if (tripId) {
      const trip = await Trip.findByPk(tripId);
      if (!trip) {
        return NextResponse.json(
          { error: 'INVALID_TRIP', message: 'Trip not found' },
          { status: 400 }
        );
      }
    }

    // Validate and get account
    if (accountId) {
      const account = await Account.findOne({ where: { id: accountId, userId: parseInt(token.sub) } });
      if (!account) {
        return NextResponse.json(
          { error: 'INVALID_ACCOUNT', message: 'Account not found' },
          { status: 400 }
        );
      }
      // Update account balance (subtract expense amount)
      await account.decrement('balance', { by: amount });
    }

    const expense = await Expense.create({
      amount,
      description,
      date: new Date(date),
      currencyId,
      categoryId,
      accountId,
      tripId,
      userId: parseInt(token.sub),
    });

    const expenseWithRelations = await Expense.findByPk(expense.id, {
      include: [
        { model: Category, as: 'Category' },
        { model: Currency, as: 'Currency' },
        { model: Trip, as: 'Trip' },
        { model: Account, as: 'Account' },
      ],
    });

    return NextResponse.json({ expense: expenseWithRelations }, { status: 201 });
  } catch (error) {
    console.error('Expenses POST error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
