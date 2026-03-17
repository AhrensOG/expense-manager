import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Transfer, Account, Currency } from '@/db';

const transferSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(500).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  currencyId: z.number().int().positive('Invalid currency ID'),
  fromAccountId: z.number().int().positive('Invalid from account ID'),
  toAccountId: z.number().int().positive('Invalid to account ID'),
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

    const transfers = await Transfer.findAll({
      where: { userId: parseInt(token.sub) },
      include: [
        { model: Currency, as: 'Currency' },
        { model: Account, as: 'fromAccount' },
        { model: Account, as: 'toAccount' },
      ],
      order: [['date', 'DESC']],
    });

    return NextResponse.json({ transfers });
  } catch (error) {
    console.error('Transfers GET error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request });
  if (!token?.sub) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const result = transferSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { amount, description, date, currencyId, fromAccountId, toAccountId } = result.data;

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { error: 'INVALID_TRANSFER', message: 'Cannot transfer to the same account' },
        { status: 400 }
      );
    }

    const currency = await Currency.findByPk(currencyId);
    if (!currency) {
      return NextResponse.json(
        { error: 'INVALID_CURRENCY', message: 'Currency not found' },
        { status: 400 }
      );
    }

    const fromAccount = await Account.findOne({
      where: { id: fromAccountId, userId: parseInt(token.sub) },
    });
    if (!fromAccount) {
      return NextResponse.json(
        { error: 'ACCOUNT_NOT_FOUND', message: 'From account not found' },
        { status: 404 }
      );
    }

    const toAccount = await Account.findOne({
      where: { id: toAccountId, userId: parseInt(token.sub) },
    });
    if (!toAccount) {
      return NextResponse.json(
        { error: 'ACCOUNT_NOT_FOUND', message: 'To account not found' },
        { status: 404 }
      );
    }

    const fromBalance = parseFloat(fromAccount.balance as unknown as string);
    const toBalance = parseFloat(toAccount.balance as unknown as string);
    
    if (fromBalance < amount) {
      return NextResponse.json(
        { error: 'INSUFFICIENT_BALANCE', message: 'Insufficient balance in from account' },
        { status: 400 }
      );
    }

    await fromAccount.update({ balance: fromBalance - amount });
    await toAccount.update({ balance: toBalance + amount });

    const transfer = await Transfer.create({
      amount,
      description,
      date: new Date(date),
      currencyId,
      fromAccountId,
      toAccountId,
      userId: parseInt(token.sub),
    });

    const transferWithRelations = await Transfer.findByPk(transfer.id, {
      include: [
        { model: Currency, as: 'Currency' },
        { model: Account, as: 'fromAccount' },
        { model: Account, as: 'toAccount' },
      ],
    });

    return NextResponse.json({ transfer: transferWithRelations }, { status: 201 });
  } catch (error) {
    console.error('Transfers POST error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
