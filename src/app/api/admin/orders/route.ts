import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { OrderData } from '@/lib/notion';

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
      return NextResponse.json({
        orders: [],
        message: 'Notion not configured',
      });
    }

    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [
        {
          property: 'Order Date',
          direction: 'descending',
        },
      ],
    });

    const orders: OrderData[] = response.results.map((page: any) => {
      const props = page.properties;
      const address = props['Address']?.rich_text?.[0]?.text?.content || '';
      const [street, cityStateZip] = address.split(', ');
      const [city, stateZip] = cityStateZip?.split(', ') || ['', ''];
      const [state, zip] = stateZip?.split(' ') || ['', ''];
      
      const items = props['Items']?.rich_text?.[0]?.text?.content || '';
      const itemsArray = items.split(', ').map((item: string) => {
        const match = item.match(/(.+?)\s*\((\d+)\s*lbs\s*@\s*\$\d+\.\d+\/lb\)/);
        if (match) {
          return {
            productId: match[1].toLowerCase().replace(/\s+/g, '-'),
            productName: match[1],
            quantity: parseInt(match[2]),
            pricePerPound: 0, // Would need to extract from string
          };
        }
        return null;
      }).filter(Boolean);

      return {
        orderId: props['Order ID']?.title?.[0]?.text?.content || '',
        customerInfo: {
          email: props['Email']?.email || '',
          firstName: props['Customer Name']?.rich_text?.[0]?.text?.content?.split(' ')[0] || '',
          lastName: props['Customer Name']?.rich_text?.[0]?.text?.content?.split(' ').slice(1).join(' ') || '',
          address: street || '',
          city: city || '',
          state: state || '',
          zip: zip || '',
        },
        items: itemsArray as any,
        boxSize: props['Box Size']?.select?.name || '',
        subtotal: props['Subtotal']?.number || 0,
        boxPrice: props['Box Price']?.number || 0,
        shippingCost: props['Shipping Cost']?.number || 0,
        total: props['Total']?.number || 0,
        paymentIntentId: props['Payment Intent ID']?.rich_text?.[0]?.text?.content || '',
        status: props['Status']?.select?.name || 'pending',
        createdAt: props['Order Date']?.date?.start || new Date().toISOString(),
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders', orders: [] },
      { status: 500 }
    );
  }
}

