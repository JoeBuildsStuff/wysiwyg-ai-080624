import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";
import DocList from "@/components/DocList/DocList";

import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

import { Document } from "@/components/TipTapEditor/TipTapEditor";


export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const docIdFromParams = resolvedSearchParams.documentId;

  console.log(docIdFromParams);

  if (typeof docIdFromParams !== 'string') {
    console.error("Invalid or missing documentId in URL params");
    notFound();
  }

  const documentId = docIdFromParams;

  const supabase = createClient();

    // Fetch the document data based on the ID from the URL
  const { data: document, error: documentError } = await supabase
    .from("wysiwyg_documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (documentError || !document) {
    console.error("Error fetching document:", documentError);
    notFound();
  }

    // Fetch the document content
    const { data: storage, error: storageError } = await supabase.storage
    .from("wysiwyg-documents")
    .download(document.storage_path);

  let content = "";
  if (storage) {
    content = await storage.text();
  }

  if (storageError) {
    console.error("Error fetching document content:", storageError);
  }

  // Cast the document to the Document type
  const documentWithContent = document as Document;
  documentWithContent.content = content;

  return (
    <div className="relative px-4">
      <div className="max-w-4xl mx-auto">
        <div className="absolute top-[11rem] -left-[2.5rem]">
          <DocList />
        </div>
        <TipTapEditor
          initialDocument={documentWithContent}
        //   initialReferences={referencesWithContent as FileWithContent[]}
        />
      </div>
    </div>
  );
}