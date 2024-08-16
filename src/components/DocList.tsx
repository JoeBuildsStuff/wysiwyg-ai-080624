import Link from "next/link";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileIcon, SearchIcon, LockIcon, UnlockIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { ChevronsRight } from "lucide-react";
import { Alert } from "./ui/alert";

export default async function DocList() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  //get documents
  const { data: documents, error: documentsError } = await supabase
    .from("wysiwyg_documents")
    .select("*")
    .eq("user_id", data?.user?.id);

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
          {/* <SheetClose className="rounded-full p-2 hover:bg-gray-200">
                <X className="h-4 w-4" />
              </SheetClose> */}
          <SheetDescription className="">
            Select a document to load into the editor
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-220px)] pt-4 items-start justify-start ">
          {documents?.map((doc) => (
            <Link href={`/workspace/${doc.id}`} key={doc.id}>
              <Alert key={doc.id} className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    <FileIcon className="w-8 h-8  mr-2" strokeWidth={1} />
                    <div>
                      <h3 className="font-semibold text-lg">{doc.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {doc.file_size} KB • {doc.file_type}
                      </p>
                    </div>
                  </div>
                  <LockIcon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm mb-2">{doc.description}</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {doc.tags?.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-sm px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Updated: {new Date(doc.updated_at).toLocaleString()}
                </p>
              </Alert>
            </Link>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
