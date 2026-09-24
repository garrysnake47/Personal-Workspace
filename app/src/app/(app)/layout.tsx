import { format } from "date-fns";

import { AppShell } from "@/components/shell/app-shell";
import { MuiProvider } from "@/components/ui/mui-provider";
import { requireUser } from "@/lib/session";

/**
 * Authenticated layout. `requireUser()` redirects to /login when there is no
 * session, so everything below this can assume a user.
 *
 * Navigation is the pill across the top (`shell/app-nav.tsx`). There is no
 * sidebar and therefore no collapsed-rail cookie to read any more.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <MuiProvider>
    <AppShell
      user={{ id: user.id, name: user.name, email: user.email }}
      todayLabel={format(new Date(), "EEE, d MMM yyyy")}
    >
      {children}
    </AppShell>
    </MuiProvider>
  );
}
