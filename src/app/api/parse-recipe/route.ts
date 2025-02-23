import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    console.log('Received URL:', url);

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!process.env.MAKE_WEBHOOK_URL) {
      console.error('Make webhook URL not configured');
      return NextResponse.json(
        { error: 'Recipe parser not configured' },
        { status: 500 }
      );
    }

    try {
      console.log('Starting Make webhook request...');
      
      const response = await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url }),
        signal: AbortSignal.timeout(30000) // 30 seconds timeout
      });

      if (!response.ok) {
        console.error('Make webhook failed:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Make webhook failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Make webhook response:', {
        status: response.status,
        statusText: response.statusText,
        data
      });

      return NextResponse.json(data);

    } catch (error: unknown) {
      console.error('Make webhook error:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return NextResponse.json(
        { error: 'Failed to contact recipe parser' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    console.error('Parse recipe error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse recipe' },
      { status: 500 }
    );
  }
} 