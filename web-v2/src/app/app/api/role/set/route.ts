import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { Role } from '@/lib/role';
import { isValidRole, ROLE_META } from '@/lib/role';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  if (!role || !isValidRole(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set('nomad_role', role as Role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
    sameSite: 'lax',
  });

  const defaultRoute = ROLE_META[role as Role].defaultRoute;
  return NextResponse.redirect(new URL(defaultRoute, request.url));
}