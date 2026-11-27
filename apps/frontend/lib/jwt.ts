import { jwtVerify } from 'jose';

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: string;
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(secret),
  );

  return payload as unknown as AccessTokenPayload;
}
