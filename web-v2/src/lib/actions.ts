'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Role } from './role';
import { isValidRole, ROLE_META } from './role';

export async function setRoleAction(role: Role) {
  const cookieStore = await cookies();
  cookieStore.set('nomad_role', role, {
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
    sameSite: 'lax',
  });
  redirect(ROLE_META[role].defaultRoute);
}

export async function setRoleFromQuery(formData: FormData): Promise<void> {
  const raw = formData.get('as');
  if (typeof raw === 'string' && isValidRole(raw)) {
    await setRoleAction(raw);
  }
}