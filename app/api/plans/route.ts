import { NextResponse } from 'next/server';
import { PLANS } from '@/lib/plans';

export async function GET() {
  try {
    const plans = Object.values(PLANS).map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      yearlyDiscount: plan.yearlyDiscount,
      features: plan.features,
      highlighted: plan.highlighted || false,
    }));

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
