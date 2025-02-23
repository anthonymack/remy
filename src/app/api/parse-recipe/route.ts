import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const response = await fetch(process.env.NEXT_PUBLIC_MAKE_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error('Failed to parse recipe');
    }

    const recipe = await response.json();
    return NextResponse.json(recipe);

  } catch (error) {
    console.error('Error parsing recipe:', error);
    return NextResponse.json(
      { error: 'Failed to parse recipe' },
      { status: 500 }
    );
  }
} 