import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { writeFile } from 'fs/promises';

const ENV_FILE = path.join(process.cwd(), '.env.local');

async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const content = await fs.readFile(ENV_FILE, 'utf-8');
    const env: Record<string, string> = {};
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return env;
  } catch (error) {
    return {};
  }
}

async function writeEnvFile(env: Record<string, string>): Promise<boolean> {
  try {
    const lines = Object.entries(env)
      .filter(([_, value]) => value !== '')
      .map(([key, value]) => `${key}=${value}`);
    
    await writeFile(ENV_FILE, lines.join('\n') + '\n', 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing env file:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const env = await readEnvFile();
    
    // Return settings (masked for security)
    const settings = {
      adminPassword: env.ADMIN_PASSWORD ? '***' : '',
      notionApiKey: env.NOTION_API_KEY ? '***' : '',
      notionDatabaseId: env.NOTION_DATABASE_ID || '',
      upsApiKey: env.UPS_API_KEY ? '***' : '',
      upsUsername: env.UPS_USERNAME || '',
      upsPassword: env.UPS_PASSWORD ? '***' : '',
      upsAccountNumber: env.UPS_ACCOUNT_NUMBER || '',
    };

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json(
      { error: 'Failed to read settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const settings = await request.json();
    const env = await readEnvFile();

    // Only update if new values are provided
    if (settings.adminPassword && settings.adminPassword !== '***') {
      env.ADMIN_PASSWORD = settings.adminPassword;
    }
    if (settings.notionApiKey && settings.notionApiKey !== '***') {
      env.NOTION_API_KEY = settings.notionApiKey;
    }
    if (settings.notionDatabaseId) {
      env.NOTION_DATABASE_ID = settings.notionDatabaseId;
    }
    if (settings.upsApiKey && settings.upsApiKey !== '***') {
      env.UPS_API_KEY = settings.upsApiKey;
    }
    if (settings.upsUsername) {
      env.UPS_USERNAME = settings.upsUsername;
    }
    if (settings.upsPassword && settings.upsPassword !== '***') {
      env.UPS_PASSWORD = settings.upsPassword;
    }
    if (settings.upsAccountNumber) {
      env.UPS_ACCOUNT_NUMBER = settings.upsAccountNumber;
    }

    const success = await writeEnvFile(env);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    );
  }
}

