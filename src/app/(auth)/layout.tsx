// app/(application)/layout.tsx

import SiteFooter from "@/components/site-footer";
import { PropsWithChildren } from "react";

export default function ApplicationLayout({ children }: PropsWithChildren) {
  return (
    <div>
      {/* Add your application-specific layout components */}
      {/* <nav>Auth Nav </nav> */}
      {children}
      <footer>
        <SiteFooter />
      </footer>
    </div>
  );
}
