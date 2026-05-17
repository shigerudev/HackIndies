import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Role } from '@/lib/role';
import { isValidRole, ROLE_META } from '@/lib/role';

export default async function AppPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string }>;
}) {
  const params = await searchParams;
  const cookieStore = await cookies();

  // If ?as=role is passed, set cookie and redirect to that role's default
  if (params.as && isValidRole(params.as)) {
    cookieStore.set('nomad_role', params.as, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
      sameSite: 'lax',
    });
    redirect(ROLE_META[params.as as Role].defaultRoute);
  }

  // Default: read from cookie
  const raw = cookieStore.get('nomad_role')?.value;
  const role: Role = isValidRole(raw ?? '') ? raw as Role : 'defensor';
  redirect(ROLE_META[role].defaultRoute);
}