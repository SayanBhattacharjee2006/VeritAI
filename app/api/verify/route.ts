import { NextRequest, NextResponse } from 'next/server';

// Mock verification function - in production this would call your ML backend
function generateMockVerification(claim: string) {
  const mockResponses = [
    {
      verdict: 'TRUE' as const,
      confidence: Math.random() * 20 + 80,
      reasoning: 'Multiple reliable sources confirm this claim.',
      sources: ['Reuters', 'Associated Press', 'BBC'],
      summary: `"${claim}" has been verified through multiple fact-checking databases.`,
    },
    {
      verdict: 'FALSE' as const,
      confidence: Math.random() * 20 + 80,
      reasoning: 'No credible sources support this claim. Evidence contradicts it.',
      sources: ['Snopes', 'PolitiFact', 'FactCheck.org'],
      summary: `"${claim}" is contradicted by available evidence and expert analysis.`,
    },
    {
      verdict: 'MIXED' as const,
      confidence: Math.random() * 20 + 60,
      reasoning: 'Some elements are true, others lack sufficient evidence.',
      sources: ['Reuters', 'Snopes', 'AP News'],
      summary: `"${claim}" contains both verified and unverified elements.`,
    },
  ];

  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}

export async function POST(request: NextRequest) {
  try {
    const { claim } = await request.json();

    if (!claim || claim.trim().length === 0) {
      return NextResponse.json(
        { error: 'Claim is required' },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result = generateMockVerification(claim);

    return NextResponse.json({
      id: Date.now().toString(),
      claim,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify claim' },
      { status: 500 }
    );
  }
}
