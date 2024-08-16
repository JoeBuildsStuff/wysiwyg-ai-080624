import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";
import DocList from "@/components/DocList";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

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
    notFound(); // This will show a 404 page if the document is not found
  }

  // Now fetch the content from storage using the document's storage_path
  const { data: storage, error: storageError } = await supabase.storage
    .from("wysiwyg-documents")
    .download(document.storage_path);

  let content = "";
  if (storage) {
    content = await storage.text(); // Convert the Blob to text
  }

  if (storageError) {
    console.error("Error fetching document content:", storageError);
    // Handle the error appropriately
  }

  return (
    <div className="relative px-4">
      <div className="max-w-4xl mx-auto">
        <div className="absolute top-[11rem] -left-[2.5rem]">
          <DocList />
        </div>
        <TipTapEditor initialContent={content} />
      </div>
    </div>
  );
}
