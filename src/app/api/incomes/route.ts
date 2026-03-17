import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Op } from 'sequelize';
import { Income, Category, Currency, Account } from '@/db';

const incomeSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(500).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  currencyId: z.number().int().positive('Invalid currency ID'),
  categoryId: z.number().int().positive().optional(),
  accountId: z.number().int().positive().optional(),
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
    const categoryId = searchParams.get('categoryId');
    const accountId = searchParams.get('accountId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { userId: parseInt(token.sub) };

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

    const incomes = await Income.findAll({
      where,
      include: [
        { model: Category, as: 'Category' },
        { model: Currency, as: 'Currency' },
        { model: Account, as: 'Account' },
      ],
      order: [['date', 'DESC']],
    });

    return NextResponse.json({ incomes });
  } catch (error) {
    console.error('Incomes GET error:', error);
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
    const result = incomeSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { amount, description, date, currencyId, categoryId, accountId } = result.data;

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

    // Validate and get account
    if (accountId) {
      const account = await Account.findOne({ where: { id: accountId, userId: parseInt(token.sub) } });
      if (!account) {
        return NextResponse.json(
          { error: 'INVALID_ACCOUNT', message: 'Account not found' },
          { status: 400 }
        );
      }
      // Update account balance
      await account.increment('balance', { by: amount });
    }

    const income = await Income.create({
      amount,
      description,
      date: new Date(date),
      currencyId,
      categoryId,
      accountId,
      userId: parseInt(token.sub),
    });

    const incomeWithRelations = await Income.findByPk(income.id, {
      include: [
        { model: Category, as: 'Category' },
        { model: Currency, as: 'Currency' },
        { model: Account, as: 'Account' },
      ],
    });

    return NextResponse.json({ income: incomeWithRelations }, { status: 201 });
  } catch (error) {
    console.error('Incomes POST error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
