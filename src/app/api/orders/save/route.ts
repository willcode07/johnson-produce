import { NextRequest, NextResponse } from 'next/server';
import { saveOrderToNotion, OrderData } from '@/lib/notion';

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    if (!orderData.orderId || !orderData.customerInfo || !orderData.items) {
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 400 }
      );
    }

    const success = await saveOrderToNotion(orderData);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Order saved successfully' 
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to save order' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
