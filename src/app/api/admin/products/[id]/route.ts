import { NextRequest, NextResponse } from 'next/server';
import { products, Product } from '@/lib/products';
import fs from 'fs/promises';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'src', 'lib', 'products.ts');

async function getProductsFromFile(): Promise<Product[]> {
  return products; // Simplified - use imported products
}

async function writeProductsToFile(productsList: Product[]): Promise<boolean> {
  try {
    let fileContent = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    
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

    const regex = /export const products: Product\[\] = \[[\s\S]*?\];/;
    fileContent = fileContent.replace(regex, `export const products: Product[] = [\n${newProductsArray}\n];`);

    await fs.writeFile(PRODUCTS_FILE, fileContent, 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing products file:', error);
    return false;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = decodeURIComponent(params.id);
    const productData: Partial<Product> = await request.json();

    const productsList = await getProductsFromFile();
    const productIndex = productsList.findIndex(p => p.id === productId);

    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update product
    const updatedProduct: Product = {
      ...productsList[productIndex],
      ...productData,
      id: productId, // Ensure ID doesn't change
      images: productData.images && productData.images.length > 0 
        ? productData.images 
        : productsList[productIndex].images || [productsList[productIndex].image],
    } as Product;

    productsList[productIndex] = updatedProduct;
    const success = await writeProductsToFile(productsList);

    if (success) {
      return NextResponse.json({ product: updatedProduct });
    } else {
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = decodeURIComponent(params.id);

    const productsList = await getProductsFromFile();
    const filteredProducts = productsList.filter(p => p.id !== productId);

    if (filteredProducts.length === productsList.length) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const success = await writeProductsToFile(filteredProducts);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

