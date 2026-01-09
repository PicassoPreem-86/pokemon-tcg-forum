/**
 * API Route: Get Popular Tags
 * Returns the most frequently used tags
 */

import { NextResponse } from 'next/server';
import { getPopularTags } from '@/lib/db/tag-queries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const tags = await getPopularTags(limit);

    return NextResponse.json({
      success: true,
      tags,
    });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch popular tags',
      },
      { status: 500 }
    );
  }
}
