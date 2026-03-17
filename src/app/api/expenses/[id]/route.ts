import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Expense, Category, Currency, Trip, Account } from '@/db';

const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  description: z.string().max(500).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  currencyId: z.number().int().positive('Invalid currency ID').optional(),
  categoryId: z.number().int().positive().optional(),
  accountId: z.number().int().positive().optional(),
  tripId: z.number().int().positive().optional(),
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
    const expenseId = parseInt(id);

    if (isNaN(expenseId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    const expense = await Expense.findOne({
      where: { id: expenseId, userId: parseInt(token.sub) },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Expense not found' },
        { status: 404 }
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

    const { currencyId, categoryId, tripId } = result.data;

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

    if (tripId) {
      const trip = await Trip.findByPk(tripId);
      if (!trip) {
        return NextResponse.json(
          { error: 'INVALID_TRIP', message: 'Trip not found' },
          { status: 400 }
        );
      }
    }

    // Handle balance update if amount or accountId changed
    const { amount: newAmount, accountId: newAccountId } = result.data;
    if (newAmount !== undefined || newAccountId !== undefined) {
      const oldAmount = expense.amount;
      const oldAccountId = expense.accountId;
      
      // Revert old balance (add back the expense amount)
      if (oldAccountId) {
        const oldAccount = await Account.findOne({ where: { id: oldAccountId, userId: parseInt(token.sub) } });
        if (oldAccount) {
          await oldAccount.increment('balance', { by: oldAmount });
        }
      }
      
      // Apply new balance (subtract new expense amount)
      const finalAccountId = newAccountId ?? oldAccountId;
      const finalAmount = newAmount ?? oldAmount;
      if (finalAccountId) {
        const newAccount = await Account.findOne({ where: { id: finalAccountId, userId: parseInt(token.sub) } });
        if (newAccount) {
          await newAccount.decrement('balance', { by: finalAmount });
        }
      }
    }

    await expense.update(result.data);

    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        { model: Category, as: 'Category' },
        { model: Currency, as: 'Currency' },
        { model: Trip, as: 'Trip' },
        { model: Account, as: 'Account' },
      ],
    });

    return NextResponse.json({ expense: updatedExpense });
  } catch (error) {
    console.error('Expenses PUT error:', error);
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
    const expenseId = parseInt(id);

    if (isNaN(expenseId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid expense ID' },
        { status: 400 }
      );
    }

    const expense = await Expense.findOne({
      where: { id: expenseId, userId: parseInt(token.sub) },
    });

    if (!expense) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Expense not found' },
        { status: 404 }
      );
    }

    // Revert the account balance (add back the expense amount)
    if (expense.accountId) {
      const account = await Account.findOne({ where: { id: expense.accountId, userId: parseInt(token.sub) } });
      if (account) {
        await account.increment('balance', { by: expense.amount });
      }
    }

    await expense.destroy();

    return NextResponse.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Expenses DELETE error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
