import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Income, Category, Currency, Account } from '@/db';

const incomeSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  description: z.string().max(500).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  currencyId: z.number().int().positive('Invalid currency ID').optional(),
  categoryId: z.number().int().positive().optional(),
  accountId: z.number().int().positive().optional(),
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
    const incomeId = parseInt(id);

    if (isNaN(incomeId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid income ID' },
        { status: 400 }
      );
    }

    const income = await Income.findOne({
      where: { id: incomeId, userId: parseInt(token.sub) },
    });

    if (!income) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Income not found' },
        { status: 404 }
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

    // Handle balance update if amount or accountId changed
    const { amount: newAmount, accountId: newAccountId } = result.data;
    if (newAmount !== undefined || newAccountId !== undefined) {
      const oldAmount = income.amount;
      const oldAccountId = income.accountId;
      
      // Revert old balance
      if (oldAccountId) {
        const oldAccount = await Account.findOne({ where: { id: oldAccountId, userId: parseInt(token.sub) } });
        if (oldAccount) {
          await oldAccount.decrement('balance', { by: oldAmount });
        }
      }
      
      // Apply new balance
      const finalAccountId = newAccountId ?? oldAccountId;
      const finalAmount = newAmount ?? oldAmount;
      if (finalAccountId) {
        const newAccount = await Account.findOne({ where: { id: finalAccountId, userId: parseInt(token.sub) } });
        if (newAccount) {
          await newAccount.increment('balance', { by: finalAmount });
        }
      }
    }

    await income.update(result.data);

    const updatedIncome = await Income.findByPk(income.id, {
      include: [
        { model: Category, as: 'Category' },
        { model: Currency, as: 'Currency' },
        { model: Account, as: 'Account' },
      ],
    });

    return NextResponse.json({ income: updatedIncome });
  } catch (error) {
    console.error('Incomes PUT error:', error);
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
    const incomeId = parseInt(id);

    if (isNaN(incomeId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid income ID' },
        { status: 400 }
      );
    }

    const income = await Income.findOne({
      where: { id: incomeId, userId: parseInt(token.sub) },
    });

    if (!income) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Income not found' },
        { status: 404 }
      );
    }

    // Revert the account balance
    if (income.accountId) {
      const account = await Account.findOne({ where: { id: income.accountId, userId: parseInt(token.sub) } });
      if (account) {
        await account.decrement('balance', { by: income.amount });
      }
    }

    await income.destroy();

    return NextResponse.json({ message: 'Income deleted' });
  } catch (error) {
    console.error('Incomes DELETE error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
