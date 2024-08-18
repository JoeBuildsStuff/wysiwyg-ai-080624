import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";
import DocList from "@/components/DocList";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

import { Tables } from "../../../../../database.types";
import { FileWithContent } from "@/components/TipTapEditor/TipTapEditor";
import { Document } from "@/components/TipTapEditor/TipTapEditor";

export default async function Page({ params }: { params: { id: string } }) {
  const supabase = createClient();

  // Fetch the document data based on the ID from the URL
  const { data: document, error: documentError } = await supabase
    .from("wysiwyg_documents")
    .select("*")
    .eq("id", params.id)
    .single();

  if (documentError || !document) {
    console.error("Error fetching document:", documentError);
    notFound();
  }

  console.log("document", document);

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

  // Fetch the references for this document
  const { data: references, error: referencesError } = await supabase
    .from("wysiwyg_document_reference_mappings")
    .select(
      `
      wysiwyg_references (
        id,
        title,
        description,
        storage_path,
        mime_type,
        file_size
      )
    `
    )
    .eq("document_id", params.id);

  if (referencesError) {
    console.error("Error fetching references:", referencesError);
  }

  // Fetch the content of each reference
  const referencesWithContent = await Promise.all(
    references?.map(async (ref) => {
      const { data: refStorage, error: refStorageError } =
        await supabase.storage
          .from("wysiwyg-documents")
          .download(ref.wysiwyg_references?.storage_path || "");

      let refContent = "";
      if (refStorage) {
        refContent = await refStorage.text();
      }

      if (refStorageError) {
        console.error("Error fetching reference content:", refStorageError);
      }

      return {
        ...ref.wysiwyg_references,
        text: refContent,
      };
    }) || []
  );

  return (
    <div className="relative px-4">
      <div className="max-w-4xl mx-auto">
        <div className="absolute top-[11rem] -left-[2.5rem]">
          <DocList />
        </div>
        <TipTapEditor
          initialDocument={documentWithContent}
          initialReferences={referencesWithContent as FileWithContent[]}
        />
      </div>
    </div>
  );
}
