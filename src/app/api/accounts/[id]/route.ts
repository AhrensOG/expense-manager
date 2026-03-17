import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Account, Currency } from '@/db';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  type: z.enum(['cash', 'bank', 'credit_card', 'savings', 'other']).optional(),
  balance: z.number().optional(),
  currencyId: z.number().int().positive('Invalid currency ID').optional(),
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
    const accountId = parseInt(id);

    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const account = await Account.findOne({
      where: { id: accountId, userId: parseInt(token.sub) },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Account not found' },
        { status: 404 }
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

    if (result.data.currencyId) {
      const currency = await Currency.findByPk(result.data.currencyId);
      if (!currency) {
        return NextResponse.json(
          { error: 'INVALID_CURRENCY', message: 'Currency not found' },
          { status: 400 }
        );
      }
    }

    await account.update(result.data);

    const updatedAccount = await Account.findByPk(account.id, {
      include: [{ model: Currency, as: 'Currency' }],
    });

    return NextResponse.json({ account: updatedAccount });
  } catch (error) {
    console.error('Accounts PUT error:', error);
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
    const accountId = parseInt(id);

    if (isNaN(accountId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid account ID' },
        { status: 400 }
      );
    }

    const account = await Account.findOne({
      where: { id: accountId, userId: parseInt(token.sub) },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Account not found' },
        { status: 404 }
      );
    }

    await account.destroy();

    return NextResponse.json({ message: 'Account deleted' });
  } catch (error) {
    console.error('Accounts DELETE error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
