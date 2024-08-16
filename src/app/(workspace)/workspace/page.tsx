//this is the page for the workspace for the user id from supabase

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function WorkspacePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/signin");
  }

  return (
    <div>
      <h1>Hello {data.user.email}</h1>
      <p>This is the workspace page - we may build this out later</p>
    </div>
  );
}
