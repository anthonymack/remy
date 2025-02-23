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

    console.log('Making request to Make webhook:', process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL);

    // Increase timeout to 30 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('Request timed out after 30 seconds');
      controller.abort();
    }, 30000);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      console.log('Received response from Make:', response.status, response.statusText);

      if (!response.ok) {
        console.error('Make webhook error:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Make webhook failed: ${response.statusText}`);
      }

      const recipe = await response.json();
      return NextResponse.json(recipe);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Make webhook request timed out');
        return NextResponse.json(
          { error: 'Make webhook request timed out - the recipe parsing service might be busy or unavailable' },
          { status: 504 }
        );
      }
      throw error;
    }

  } catch (error: unknown) {
    console.error('Error in parse-recipe:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to parse recipe' },
      { status: 500 }
    );
  }
} 