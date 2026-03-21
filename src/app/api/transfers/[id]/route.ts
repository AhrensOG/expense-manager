import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Transfer, Account, Currency } from '@/db';

const updateTransferSchema = z.object({
  amount: z.number().positive('Amount must be positive').optional(),
  description: z.string().max(500).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  fromAccountId: z.number().int().positive().nullable().optional(),
  toAccountId: z.number().int().positive().nullable().optional(),
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
    const transferId = parseInt(id);

    if (isNaN(transferId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid transfer ID' },
        { status: 400 }
      );
    }

    const transfer = await Transfer.findOne({
      where: { id: transferId, userId: parseInt(token.sub) },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Transfer not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = updateTransferSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { amount, description, date, fromAccountId, toAccountId } = result.data;

    const originalAmount = parseFloat(transfer.amount as unknown as string);
    const newAmount = amount !== undefined ? amount : originalAmount;

    const originalFromAccount = transfer.fromAccountId
      ? await Account.findOne({ where: { id: transfer.fromAccountId, userId: parseInt(token.sub) } })
      : null;
    const originalToAccount = transfer.toAccountId
      ? await Account.findOne({ where: { id: transfer.toAccountId, userId: parseInt(token.sub) } })
      : null;

    const newFromAccountId = fromAccountId !== undefined ? fromAccountId : transfer.fromAccountId;
    const newToAccountId = toAccountId !== undefined ? toAccountId : transfer.toAccountId;

    const newFromAccount = newFromAccountId
      ? await Account.findOne({ where: { id: newFromAccountId, userId: parseInt(token.sub) } })
      : null;
    const newToAccount = newToAccountId
      ? await Account.findOne({ where: { id: newToAccountId, userId: parseInt(token.sub) } })
      : null;

    if (newFromAccountId && newToAccountId && newFromAccountId === newToAccountId) {
      return NextResponse.json(
        { error: 'INVALID_TRANSFER', message: 'Cannot transfer to the same account' },
        { status: 400 }
      );
    }

    if (newFromAccountId && newFromAccountId !== transfer.fromAccountId) {
      if (!newFromAccount) {
        return NextResponse.json(
          { error: 'ACCOUNT_NOT_FOUND', message: 'From account not found' },
          { status: 404 }
        );
      }
    }

    if (newToAccountId && newToAccountId !== transfer.toAccountId) {
      if (!newToAccount) {
        return NextResponse.json(
          { error: 'ACCOUNT_NOT_FOUND', message: 'To account not found' },
          { status: 404 }
        );
      }
    }

    if (newFromAccountId && newFromAccount) {
      const balance = parseFloat(newFromAccount.balance as unknown as string);
      if (balance < newAmount && originalAmount === newAmount) {
        return NextResponse.json(
          { error: 'INSUFFICIENT_BALANCE', message: 'Insufficient balance in from account' },
          { status: 400 }
        );
      }
    }

    if (originalFromAccount) {
      const originalBalance = parseFloat(originalFromAccount.balance as unknown as string);
      await originalFromAccount.update({ balance: originalBalance + originalAmount });
    }

    if (originalToAccount) {
      const originalBalance = parseFloat(originalToAccount.balance as unknown as string);
      await originalToAccount.update({ balance: originalBalance - originalAmount });
    }

    if (newFromAccount && (newFromAccountId !== transfer.fromAccountId || newAmount !== originalAmount)) {
      const newBalance = parseFloat(newFromAccount.balance as unknown as string);
      await newFromAccount.update({ balance: newBalance - newAmount });
    }

    if (newToAccount && (newToAccountId !== transfer.toAccountId || newAmount !== originalAmount)) {
      const newBalance = parseFloat(newToAccount.balance as unknown as string);
      await newToAccount.update({ balance: newBalance + newAmount });
    }

    const updateData: Record<string, unknown> = {};
    if (amount !== undefined) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;
    if (date !== undefined) updateData.date = new Date(date);
    if (fromAccountId !== undefined) {
      updateData.fromAccountId = fromAccountId;
      updateData.fromAccountName = newFromAccount?.name || null;
    }
    if (toAccountId !== undefined) {
      updateData.toAccountId = toAccountId;
      updateData.toAccountName = newToAccount?.name || null;
    }

    await transfer.update(updateData);

    const updatedTransfer = await Transfer.findByPk(transferId, {
      include: [
        { model: Currency, as: 'Currency' },
        { model: Account, as: 'fromAccount' },
        { model: Account, as: 'toAccount' },
      ],
    });

    return NextResponse.json({ transfer: updatedTransfer });
  } catch (error) {
    console.error('Transfers PUT error:', error);
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
    const transferId = parseInt(id);

    if (isNaN(transferId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid transfer ID' },
        { status: 400 }
      );
    }

    const transfer = await Transfer.findOne({
      where: { id: transferId, userId: parseInt(token.sub) },
    });

    if (!transfer) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Transfer not found' },
        { status: 404 }
      );
    }

    const fromAccount = await Account.findOne({
      where: { id: transfer.fromAccountId, userId: parseInt(token.sub) },
    });
    const toAccount = await Account.findOne({
      where: { id: transfer.toAccountId, userId: parseInt(token.sub) },
    });

    if (fromAccount && toAccount) {
      const fromBalance = parseFloat(fromAccount.balance as unknown as string);
      const toBalance = parseFloat(toAccount.balance as unknown as string);
      await fromAccount.update({ balance: fromBalance + transfer.amount });
      await toAccount.update({ balance: toBalance - transfer.amount });
    }

    await transfer.destroy();

    return NextResponse.json({ message: 'Transfer deleted and balances reverted' });
  } catch (error) {
    console.error('Transfers DELETE error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
