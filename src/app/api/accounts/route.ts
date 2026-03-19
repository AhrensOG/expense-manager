import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Account, Currency, Income, Category } from '@/db';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  type: z.enum(['cash', 'bank', 'credit_card', 'savings', 'other']),
  balance: z.number().default(0),
  initialBalance: z.number().optional(),
  currencyId: z.number().int().positive('Invalid currency ID'),
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

    const accounts = await Account.findAll({
      where: { userId: parseInt(token.sub) },
      include: [{ model: Currency, as: 'Currency' }],
      order: [['name', 'ASC']],
    });

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Accounts GET error:', error);
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
    const result = accountSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, type, balance, currencyId } = result.data;

    const currency = await Currency.findByPk(currencyId);
    if (!currency) {
      return NextResponse.json(
        { error: 'INVALID_CURRENCY', message: 'Currency not found' },
        { status: 400 }
      );
    }

    const account = await Account.create({
      name,
      type,
      balance,
      currencyId,
      userId: parseInt(token.sub),
    });

    // Create initial balance income if provided
    if (balance && balance > 0) {
      // Find or create the "Balance initial" category
      let balanceCategory = await Category.findOne({
        where: { name: 'Balance initial', type: 'income', userId: null }
      });

      if (!balanceCategory) {
        balanceCategory = await Category.create({
          name: 'Balance initial',
          type: 'income',
          icon: 'wallet',
          color: '#4A90D9',
          userId: null,
        });
      }

      // Create the income record
      await Income.create({
        amount: balance,
        description: 'Balance initial',
        date: new Date(),
        userId: parseInt(token.sub),
        currencyId,
        categoryId: balanceCategory.id,
        accountId: account.id,
      });
    }

    const accountWithRelations = await Account.findByPk(account.id, {
      include: [{ model: Currency, as: 'Currency' }],
    });

    return NextResponse.json({ account: accountWithRelations }, { status: 201 });
  } catch (error) {
    console.error('Accounts POST error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
