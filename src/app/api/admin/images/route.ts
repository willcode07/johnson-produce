import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images');

export async function GET(request: NextRequest) {
  try {
    // Ensure images directory exists
    await fs.mkdir(IMAGES_DIR, { recursive: true });

    // Read all files in the images directory
    const files = await fs.readdir(IMAGES_DIR);
    
    // Filter for image files and get their stats
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|webp|gif)$/i.test(file)
    );

    const images = await Promise.all(
      imageFiles.map(async (filename) => {
        const filePath = path.join(IMAGES_DIR, filename);
        const stats = await fs.stat(filePath);
        
        return {
          filename,
          url: `/images/${filename}`,
          size: stats.size,
          uploadedAt: stats.birthtime.toISOString(),
        };
      })
    );

    // Sort by upload date (newest first)
    images.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Error listing images:', error);
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    );
  }
}

