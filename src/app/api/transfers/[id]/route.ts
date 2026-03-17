import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Transfer, Account } from '@/db';

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
