import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from "@/utils/supabase/server";
import { ChevronsRight } from "lucide-react";

import DocListRealtime from "./DocListRealtime";

export default async function DocList() {
  const supabase = createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();

  //get documents
  const { data: documents, error: documentsError } = await supabase
    .from("wysiwyg_documents")
    .select("*")
    .eq("user_id", userData?.user?.id ?? "");

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full h-8 w-fit m-0 p-0">
          <ChevronsRight className="w-5 h-5 flex-none text-muted-foreground ml-[2rem] mr-[.4rem]" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[400px] sm:w-[540px]">
        <SheetHeader className="">
          <SheetTitle className="">Your Documents</SheetTitle>
          <SheetDescription className="">
            Select a document to load into the editor
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-220px)] pt-4 items-start justify-start ">
          <DocListRealtime server_wysiwyg_documents={documents ?? []} />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
