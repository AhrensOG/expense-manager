import { z } from 'zod';
import { hash } from 'bcryptjs';
import { NextResponse, NextRequest } from 'next/server';
import { User, Account, Currency } from '@/db';

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: firstError?.message || 'Validation failed',
          details: result.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = result.data;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'USER_EXISTS', message: 'Email already registered' },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const user = await User.create({
      email,
      passwordHash,
      name,
    });

    // Create default accounts for the user
    // First, find CHF currency
    const chfCurrency = await Currency.findOne({ where: { code: 'CHF' } });
    const currencyId = chfCurrency?.id || 1;

    // Create default accounts
    await Account.bulkCreate([
      {
        name: 'Banque',
        type: 'bank',
        balance: 0,
        currencyId,
        userId: user.id,
      },
      {
        name: 'Espèces',
        type: 'cash',
        balance: 0,
        currencyId,
        userId: user.id,
      },
    ]);

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
