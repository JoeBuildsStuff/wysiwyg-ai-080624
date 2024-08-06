// app/(workspace)/workspace/projects/layout.tsx

import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { PropsWithChildren } from "react";

export default function ApplicationLayout({ children }: PropsWithChildren) {
  return (
    <main className=" max-w-7xl mx-auto min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
      <nav className="sticky top-0">
        <SiteHeader />
      </nav>
      <div>{children}</div>
      <SiteFooter />
    </main>
  );
}
