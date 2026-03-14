import { NextResponse } from 'next/server';

// This endpoint returns user usage statistics
// In production, this would query from database based on authenticated user

export async function GET() {
  // Return empty stats - no demo data
  // In production: query actual user stats from database
  return NextResponse.json({
    wordsGenerated: 0,
    wordsLimit: 500000,
    imagesGenerated: 0,
    imagesLimit: 100,
    tokensUsed: 0,
    tokensLimit: 10000000,
    conversations: 0,
    acceptanceRate: 0,
  });
}
