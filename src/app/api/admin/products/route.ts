import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';
import fs from 'fs/promises';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'src', 'lib', 'products.ts');

// Helper to read current products from file
async function getProductsFromFile(): Promise<Product[]> {
  try {
    const fileContent = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    // Simple extraction - in production, use a proper parser
    const productsMatch = fileContent.match(/export const products: Product\[\] = (\[[\s\S]*?\]);/);
    if (productsMatch) {
      // This is a simplified approach - in production, you'd want to use a proper parser
      // For now, we'll use the imported products array
      return products;
    }
  } catch (error) {
    console.error('Error reading products file:', error);
  }
  return products;
}

// Helper to write products to file
async function writeProductsToFile(productsList: Product[]): Promise<boolean> {
  try {
    let fileContent = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    
    // Extract the products array section and replace it
    const productsJson = JSON.stringify(productsList, null, 2);
    const newProductsArray = productsList.map(p => {
      const imagesStr = p.images && p.images.length > 0 
        ? `[${p.images.map(img => `'${img}'`).join(', ')}]`
        : `['${p.image}']`;
      return `  {
    id: '${p.id}',
    name: '${p.name.replace(/'/g, "\\'")}',
    description: '${p.description.replace(/'/g, "\\'")}',
    image: '${p.image}',
    images: ${imagesStr},
    primaryImageIndex: ${p.primaryImageIndex || 0},
    pricePerPound: ${p.pricePerPound},
    availability: ${p.availability},
    season: '${p.season}',
    origin: '${p.origin}'
  }`;
    }).join(',\n');

    // Replace the products array
    const regex = /export const products: Product\[\] = \[[\s\S]*?\];/;
    fileContent = fileContent.replace(regex, `export const products: Product[] = [\n${newProductsArray}\n];`);

    await fs.writeFile(PRODUCTS_FILE, fileContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing products file:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const productsList = await getProductsFromFile();
    return NextResponse.json({ products: productsList });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const productData: Partial<Product> = await request.json();
    
    // Validate required fields
    if (!productData.id || !productData.name || productData.pricePerPound === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const productsList = await getProductsFromFile();
    
    // Check if product ID already exists
    if (productsList.some(p => p.id === productData.id)) {
      return NextResponse.json(
        { error: 'Product ID already exists' },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct: Product = {
      id: productData.id,
      name: productData.name,
      description: productData.description || '',
      image: productData.images?.[0] || productData.image || '',
      images: productData.images && productData.images.length > 0 
        ? productData.images 
        : [productData.image || ''],
      primaryImageIndex: productData.primaryImageIndex ?? 0,
      pricePerPound: productData.pricePerPound,
      availability: productData.availability ?? true,
      season: productData.season || '',
      origin: productData.origin || '',
    };

    productsList.push(newProduct);
    const success = await writeProductsToFile(productsList);

    if (success) {
      return NextResponse.json({ product: newProduct });
    } else {
      return NextResponse.json(
        { error: 'Failed to save product' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

