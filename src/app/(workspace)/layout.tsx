//this is the layout for the workspace

import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="max-w-7xl mx-auto min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
      <nav>
        <SiteHeader />
      </nav>
      <div className="px-2">
        <div className="">{children}</div>
      </div>
      <SiteFooter />
    </main>
  );
}
