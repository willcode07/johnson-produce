import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@notionhq/client';
import { OrderData } from '@/lib/notion';

type NotionText = { text?: { content?: string } };
type NotionProperty = {
  title?: NotionText[];
  rich_text?: NotionText[];
  email?: string | null;
  number?: number | null;
  select?: { name?: string | null } | null;
  date?: { start?: string | null } | null;
};

function pageProperties(page: unknown): Record<string, NotionProperty> | null {
  if (!page || typeof page !== 'object' || !('properties' in page)) return null;
  const properties = (page as { properties?: unknown }).properties;
  if (!properties || typeof properties !== 'object') return null;
  return properties as Record<string, NotionProperty>;
}

function isOrderStatus(value: string): value is OrderData['status'] {
  return value === 'pending'
    || value === 'confirmed'
    || value === 'shipped'
    || value === 'delivered'
    || value === 'cancelled';
}

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

    const orders: OrderData[] = response.results.flatMap((page) => {
      const props = pageProperties(page);
      if (!props) return [];
      const address = props['Address']?.rich_text?.[0]?.text?.content || '';
      const [street, cityStateZip] = address.split(', ');
      const [city, stateZip] = cityStateZip?.split(', ') || ['', ''];
      const [state, zip] = stateZip?.split(' ') || ['', ''];

      const items = props['Items']?.rich_text?.[0]?.text?.content || '';
      const itemsArray: OrderData['items'] = [];
      for (const item of items.split(', ')) {
        const match = item.match(/(.+?)\s*\((\d+)\s*lbs\s*@\s*\$\d+\.\d+\/lb\)/);
        if (match) {
          itemsArray.push({
            productId: match[1].toLowerCase().replace(/\s+/g, '-'),
            productName: match[1],
            quantity: parseInt(match[2], 10),
            pricePerPound: 0,
          });
        }
      }

      const statusName = props['Status']?.select?.name || 'pending';
      return [{
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
        items: itemsArray,
        boxSize: props['Box Size']?.select?.name || '',
        subtotal: props['Subtotal']?.number || 0,
        boxPrice: props['Box Price']?.number || 0,
        shippingCost: props['Shipping Cost']?.number || 0,
        total: props['Total']?.number || 0,
        paymentIntentId: props['Payment Intent ID']?.rich_text?.[0]?.text?.content || '',
        status: isOrderStatus(statusName) ? statusName : 'pending',
        createdAt: props['Order Date']?.date?.start || new Date().toISOString(),
      }];
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

