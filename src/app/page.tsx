import SiteHeader from "@/components/site-header";

import SiteFooter from "@/components/site-footer";
import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";
import DocList from "@/components/DocList";

export default async function Home() {
  return (
    <main className="max-w-7xl mx-auto min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
      <nav>
        <SiteHeader />
      </nav>
      <div className="relative px-4">
        <div className=" max-w-4xl mx-auto">
          <div className="absolute top-[11rem] -left-[2.5rem]">
            <DocList />
          </div>
          <TipTapEditor />
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}
