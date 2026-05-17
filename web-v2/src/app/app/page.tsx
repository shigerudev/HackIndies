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

  if (params.as && isValidRole(params.as)) {
    redirect(`/app/api/role/set?role=${params.as}`);
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get('nomad_role')?.value;
  const role: Role = isValidRole(raw ?? '') ? raw as Role : 'defensor';
  redirect(ROLE_META[role].defaultRoute);
}