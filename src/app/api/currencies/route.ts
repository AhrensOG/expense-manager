import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Currency } from '@/db';

const currencySchema = z.object({
  code: z.string().length(3, 'Code must be 3 characters').toUpperCase(),
  symbol: z.string().max(5, 'Symbol too long'),
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
});

export async function GET() {
  try {
    const currencies = await Currency.findAll({
      order: [['code', 'ASC']],
    });

    return NextResponse.json({ currencies });
  } catch (error) {
    console.error('Currencies GET error:', error);
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
    const result = currencySchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { code, symbol, name } = result.data;

    const existing = await Currency.findOne({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: 'CURRENCY_EXISTS', message: 'Currency code already exists' },
        { status: 409 }
      );
    }

    const currency = await Currency.create({ code, symbol, name });

    return NextResponse.json({ currency }, { status: 201 });
  } catch (error) {
    console.error('Currencies POST error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
