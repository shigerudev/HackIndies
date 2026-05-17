import { getRole } from '@/lib/role';
import { RoleProvider } from '@/components/app/RoleProvider';
import { Sidebar } from '@/components/app/Sidebar';
import { Topbar } from '@/components/app/Topbar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Allow overriding role via query param ?as=role (from Audiences CTA)
  // We read via searchParams on the page, but layout re-reads from cookie
  // The page itself handles the ?as= redirect
  const role = await getRole();

  return (
    <RoleProvider initialRole={role}>
      <div className="app-shell">
        <Sidebar role={role} />
        <div className="app-main">
          <Topbar role={role} breadcrumbs={[]} />
          <main>{children}</main>
        </div>
      </div>
    </RoleProvider>
  );
}