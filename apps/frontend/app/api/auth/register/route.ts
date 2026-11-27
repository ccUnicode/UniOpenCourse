import { NextResponse } from 'next/server';
import { forwardBackendRequest } from '@/services/backend.service';

export async function POST(request: Request) {
  const body = await request.json();

  const response = await forwardBackendRequest(`auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
