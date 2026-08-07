import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getBackendUrl } from '@/lib/auth-cookie';

async function proxyRequest(request: NextRequest, path: string[]) {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const targetPath = path.join('/');
  const url = new URL(`${getBackendUrl()}/${targetPath}`);
  url.search = request.nextUrl.search;

  const headers = new Headers();
  headers.set('Authorization', `Bearer ${token}`);

  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  const init: RequestInit = {
    method: request.method,
    headers,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(url.toString(), init);
  const responseHeaders = new Headers();

  const disposition = response.headers.get('content-disposition');
  const responseContentType = response.headers.get('content-type');
  if (disposition) responseHeaders.set('content-disposition', disposition);
  if (responseContentType) responseHeaders.set('content-type', responseContentType);

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

type RouteContext = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
