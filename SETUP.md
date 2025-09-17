# Johnson Produce - Setup Instructions

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Payment Configuration (Zelle)
# No API keys needed - customers pay via Zelle to johnsonproduce@email.com

# Notion Configuration
NOTION_API_KEY=secret_your_notion_api_key_here
NOTION_DATABASE_ID=your_notion_database_id_here

# UPS API Configuration (Optional)
UPS_API_KEY=your_ups_api_key_here
UPS_USERNAME=your_ups_username_here
UPS_PASSWORD=your_ups_password_here
UPS_ACCOUNT_NUMBER=your_ups_account_number_here
```

## Setup Steps

### 1. Zelle Setup
1. Set up Zelle with your business email: johnsonproduce@email.com
2. No API integration needed - customers will send payments directly via Zelle
3. You'll manually confirm payments in your Notion database

### 2. Notion Setup
1. Create a Notion workspace
2. Create a new database with the following properties:
   - Order ID (Title)
   - Customer Name (Rich Text)
   - Email (Email)
   - Address (Rich Text)
   - Items (Rich Text)
   - Box Size (Select: small, medium, large)
   - Subtotal (Number)
   - Box Price (Number)
   - Shipping Cost (Number)
   - Total (Number)
   - Payment Intent ID (Rich Text)
   - Status (Select: pending, confirmed, shipped, delivered, cancelled)
   - Order Date (Date)
3. Get your Notion API key from https://www.notion.so/my-integrations
4. Share your database with the integration
5. Add the API key and database ID to your `.env.local` file

### 3. UPS Setup (Optional)
1. Create a UPS Developer Account
2. Get your API credentials
3. Add them to your `.env.local` file

## Running the Application

```bash
npm install
npm run dev
```

The application will be available at http://localhost:3000

## Features

- ✅ Product catalog with 6 tropical fruits
- ✅ Box size selection (small, medium, large)
- ✅ Shopping cart functionality
- ✅ Zelle payment processing
- ✅ Notion order storage
- ✅ Responsive design
- ✅ Modern UI with soft green and brown theme
