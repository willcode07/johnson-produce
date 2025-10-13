# Johnson Produce - Fresh Tropical Fruits Ecommerce

A modern, responsive ecommerce website for Johnson Produce, a family business specializing in premium tropical fruits. Built with Next.js, TypeScript, and Tailwind CSS.

🌐 **Live Site**: https://willcode07.github.io/johnson-produce/

![Johnson Produce](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## 🌿 About Johnson Produce

Johnson Produce is a family business dedicated to bringing the finest tropical fruits directly to your door. We specialize in premium quality fruits sourced from our own farms and trusted partners.

### Our Products
- 🥭 **Mango** - Sweet, juicy tropical mangoes from Florida
- 🥑 **Avocado** - Creamy, rich avocados perfect for any dish
- **Ackee** - Jamaica's national fruit, perfect for traditional dishes
- **Jackfruit** - Large, sweet tropical fruit ideal as a meat substitute
- **Papaya** - Sweet, orange-fleshed fruit rich in vitamins
- **Sapodilla** - Sweet, brown fruit with a grainy texture

## ✨ Features

- 🛒 **Product Catalog** - Browse our selection of 6 premium tropical fruits
- 📦 **Box Size Selection** - Choose from Small, Medium, or Large boxes with detailed dimensions
- 🛍️ **Shopping Cart** - Add items, adjust quantities, and manage your order
- 💳 **Zelle Payments** - Simple, secure payment via Zelle with QR code support
- 📊 **Order Management** - Automatic order storage in Notion database
- 🚚 **Shipping Calculator** - Get instant shipping rates on the home page
- 📱 **Responsive Design** - Perfect experience on mobile, tablet, and desktop
- 🎨 **Modern UI** - Soft green and brown theme reflecting natural produce

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Notion account (for order management)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/johnson-produce.git
   cd johnson-produce
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```bash
   # Notion Configuration
   NOTION_API_KEY=your_notion_api_key_here
   NOTION_DATABASE_ID=your_notion_database_id_here
   
   # Zelle Payment (no API keys needed)
   # Customers pay to: johnsonproduce@email.com
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Setup Guide

### Notion Database Setup

1. Create a new Notion workspace
2. Create a database with these properties:
   - **Order ID** (Title)
   - **Customer Name** (Rich Text)
   - **Email** (Email)
   - **Address** (Rich Text)
   - **Items** (Rich Text)
   - **Box Size** (Select: small, medium, large)
   - **Subtotal** (Number)
   - **Box Price** (Number)
   - **Shipping Cost** (Number)
   - **Total** (Number)
   - **Payment Intent ID** (Rich Text)
   - **Status** (Select: pending, confirmed, shipped, delivered, cancelled)
   - **Order Date** (Date)

3. Get your Notion API key from [notion.so/my-integrations](https://www.notion.so/my-integrations)
4. Share your database with the integration
5. Add the API key and database ID to your `.env.local` file

### Zelle Payment Setup

1. Set up Zelle with your business email: `johnsonproduce@email.com`
2. No API integration needed - customers send payments directly via Zelle
3. Manually update order status in Notion when payments are received

## 📁 Project Structure

```
johnson-produce/
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   │   ├── orders/    # Order management
│   │   │   └── stripe/    # Payment processing
│   │   ├── globals.css    # Global styles
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Home page
│   ├── components/        # React components
│   │   ├── Cart.tsx       # Shopping cart
│   │   ├── Header.tsx     # Site header
│   │   ├── Hero.tsx       # Hero section
│   │   ├── ProductCard.tsx # Product display
│   │   ├── ProductCatalog.tsx # Product grid
│   │   ├── ShippingCalculator.tsx # Shipping rates
│   │   └── ZellePayment.tsx # Payment flow
│   └── lib/              # Utilities
│       ├── products.ts   # Product data
│       ├── notion.ts     # Notion integration
│       └── stripe.ts     # Stripe configuration
├── public/               # Static assets
├── SETUP.md             # Detailed setup guide
└── README.md            # This file
```

## 🎨 Design System

### Colors
- **Primary Green**: Soft, natural green tones
- **Accent Brown**: Warm amber/brown for buttons and highlights
- **Text**: Dark grays for excellent readability
- **Background**: Light green for natural feel

### Typography
- **Headings**: Bold, clear hierarchy
- **Body Text**: Medium weight for readability
- **Interactive Elements**: Clear, accessible contrast

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Netlify**: Connect GitHub repository
- **Railway**: Deploy with one click
- **DigitalOcean**: Use App Platform

## 📱 Mobile Experience

The website is fully responsive and optimized for:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large screens (1280px+)

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Tech Stack
- **Framework**: Next.js 15.5.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Notion API
- **Payments**: Zelle integration

## 📞 Support

For questions or support, please contact:
- **Email**: johnsonproduce@email.com
- **Business**: Johnson Produce Family Farm

## 📄 License

This project is proprietary software owned by Johnson Produce. All rights reserved.

---

**Built with ❤️ for fresh, quality tropical fruits** 🌿🥭