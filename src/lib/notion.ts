import { Client } from '@notionhq/client';

if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
  console.warn('Notion API key or database ID not set. Orders will not be saved to Notion.');
}

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export interface OrderData {
  orderId: string;
  customerInfo: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    pricePerPound: number;
  }>;
  boxSize: string;
  subtotal: number;
  boxPrice: number;
  shippingCost: number;
  total: number;
  paymentIntentId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}

export async function saveOrderToNotion(orderData: OrderData): Promise<boolean> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    console.log('Notion not configured, skipping order save:', orderData.orderId);
    return false;
  }

  try {
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        'Order ID': {
          title: [
            {
              text: {
                content: orderData.orderId,
              },
            },
          ],
        },
        'Customer Name': {
          rich_text: [
            {
              text: {
                content: `${orderData.customerInfo.firstName} ${orderData.customerInfo.lastName}`,
              },
            },
          ],
        },
        'Email': {
          email: orderData.customerInfo.email,
        },
        'Address': {
          rich_text: [
            {
              text: {
                content: `${orderData.customerInfo.address}, ${orderData.customerInfo.city}, ${orderData.customerInfo.state} ${orderData.customerInfo.zip}`,
              },
            },
          ],
        },
        'Items': {
          rich_text: [
            {
              text: {
                content: orderData.items.map(item => 
                  `${item.productName} (${item.quantity} lbs @ $${item.pricePerPound}/lb)`
                ).join(', '),
              },
            },
          ],
        },
        'Box Size': {
          select: {
            name: orderData.boxSize,
          },
        },
        'Subtotal': {
          number: orderData.subtotal,
        },
        'Box Price': {
          number: orderData.boxPrice,
        },
        'Shipping Cost': {
          number: orderData.shippingCost,
        },
        'Total': {
          number: orderData.total,
        },
        'Payment Intent ID': {
          rich_text: [
            {
              text: {
                content: orderData.paymentIntentId,
              },
            },
          ],
        },
        'Status': {
          select: {
            name: orderData.status,
          },
        },
        'Order Date': {
          date: {
            start: orderData.createdAt,
          },
        },
      },
    });

    console.log('Order saved to Notion:', response.id);
    return true;
  } catch (error) {
    console.error('Error saving order to Notion:', error);
    return false;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderData['status']): Promise<boolean> {
  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    return false;
  }

  try {
    // First, find the page with the order ID
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: 'Order ID',
        title: {
          equals: orderId,
        },
      },
    });

    if (response.results.length === 0) {
      console.error('Order not found in Notion:', orderId);
      return false;
    }

    const pageId = response.results[0].id;

    // Update the status
    await notion.pages.update({
      page_id: pageId,
      properties: {
        'Status': {
          select: {
            name: status,
          },
        },
      },
    });

    console.log('Order status updated in Notion:', orderId, 'to', status);
    return true;
  } catch (error) {
    console.error('Error updating order status in Notion:', error);
    return false;
  }
}
