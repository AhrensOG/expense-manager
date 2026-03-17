import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import { Trip, Currency } from '@/db';

const tripSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid start date').optional(),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid end date').optional().nullable(),
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
    const tripId = parseInt(id);

    if (isNaN(tripId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    const trip = await Trip.findOne({
      where: { id: tripId, userId: parseInt(token.sub) },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Trip not found' },
        { status: 404 }
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

    if (result.data.currencyId) {
      const currency = await Currency.findByPk(result.data.currencyId);
      if (!currency) {
        return NextResponse.json(
          { error: 'INVALID_CURRENCY', message: 'Currency not found' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (result.data.name) updateData.name = result.data.name;
    if (result.data.startDate) updateData.startDate = new Date(result.data.startDate);
    if (result.data.endDate !== undefined) updateData.endDate = result.data.endDate ? new Date(result.data.endDate) : null;
    if (result.data.currencyId) updateData.currencyId = result.data.currencyId;

    await trip.update(updateData);

    const updatedTrip = await Trip.findByPk(trip.id, {
      include: [{ model: Currency, as: 'Currency' }],
    });

    return NextResponse.json({ trip: updatedTrip });
  } catch (error) {
    console.error('Trips PUT error:', error);
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
    const tripId = parseInt(id);

    if (isNaN(tripId)) {
      return NextResponse.json(
        { error: 'VALIDATION_ERROR', message: 'Invalid trip ID' },
        { status: 400 }
      );
    }

    const trip = await Trip.findOne({
      where: { id: tripId, userId: parseInt(token.sub) },
    });

    if (!trip) {
      return NextResponse.json(
        { error: 'NOT_FOUND', message: 'Trip not found' },
        { status: 404 }
      );
    }

    await trip.destroy();

    return NextResponse.json({ message: 'Trip deleted' });
  } catch (error) {
    console.error('Trips DELETE error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
