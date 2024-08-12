import SiteHeader from "@/components/site-header";

import SiteFooter from "@/components/site-footer";
import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";

export default async function Home() {
  return (
    <main className="max-w-7xl mx-auto min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
      <nav>
        <SiteHeader />
      </nav>
      <div className="px-4">
        <div className="max-w-4xl mx-auto">
          <TipTapEditor />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
