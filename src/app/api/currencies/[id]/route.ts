import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Currency } from '@/db';

const currencySchema = z.object({
  code: z.string().length(3, 'Code must be 3 characters').toUpperCase().optional(),
  symbol: z.string().max(5, 'Symbol too long').optional(),
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').optional(),
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
    const currencyId = parseInt(id);

    if (isNaN(currencyId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid currency ID' },
        { status: 400 }
      );
    }

    const currency = await Currency.findByPk(currencyId);

    if (!currency) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Currency not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const result = currencySchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    if (result.data.code && result.data.code !== currency.code) {
      const existing = await Currency.findOne({ where: { code: result.data.code } });
      if (existing) {
        return NextResponse.json(
          { error: 'CURRENCY_EXISTS', message: 'Currency code already exists' },
          { status: 409 }
        );
      }
    }

    await currency.update(result.data);

    return NextResponse.json({ currency });
  } catch (error) {
    console.error('Currencies PUT error:', error);
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
    const currencyId = parseInt(id);

    if (isNaN(currencyId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid currency ID' },
        { status: 400 }
      );
    }

    const currency = await Currency.findByPk(currencyId);

    if (!currency) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Currency not found' },
        { status: 404 }
      );
    }

    await currency.destroy();

    return NextResponse.json({ message: 'Currency deleted' });
  } catch (error) {
    console.error('Currencies DELETE error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
