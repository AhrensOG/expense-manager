import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Trip, Currency } from '@/db';

const tripSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date'),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date').optional().nullable(),
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

    const trips = await Trip.findAll({
      where: { userId: parseInt(token.sub) },
      include: [{ model: Currency, as: 'Currency' }],
      order: [['startDate', 'DESC']],
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error('Trips GET error:', error);
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
    const result = tripSchema.safeParse(body);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: firstError?.message || 'Validation failed' },
        { status: 400 }
      );
    }

    const { name, startDate, endDate, currencyId } = result.data;

    const trip = await Trip.create({
      name,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      currencyId,
      userId: parseInt(token.sub),
    });

    const tripWithRelations = await Trip.findByPk(trip.id, {
      include: [{ model: Currency, as: 'Currency' }],
    });

    return NextResponse.json({ trip: tripWithRelations }, { status: 201 });
  } catch (error) {
    console.error('Trips POST error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
