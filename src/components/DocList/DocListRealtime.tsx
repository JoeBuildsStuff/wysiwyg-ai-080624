"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import DocListItem from "./DocListItem";

import { Tables } from "../../../database.types";
type WysiwygDocument = Tables<"wysiwyg_documents">;

export default function DocListRealtime({
  server_wysiwyg_documents,
}: {
  server_wysiwyg_documents: WysiwygDocument[];
}) {
  const supabase = createClient();
  const [documents, setDocuments] = useState<WysiwygDocument[]>(
    server_wysiwyg_documents
  );

  useEffect(() => {
    const channel = supabase
      .channel("realtime doc list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wysiwyg_documents",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setDocuments((prevDocuments) => [
              ...prevDocuments,
              payload.new as WysiwygDocument,
            ]);
          } else if (payload.eventType === "UPDATE") {
            setDocuments((prevDocuments) =>
              prevDocuments.map((doc) =>
                doc.id === payload.new.id ? { ...doc, ...payload.new } : doc
              )
            );
          } else if (payload.eventType === "DELETE") {
            setDocuments((prevDocuments) =>
              prevDocuments.filter((doc) => doc.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, documents, setDocuments]);

  return (
    <div>
      {documents?.map((doc) => (
        <DocListItem key={doc.id} doc={doc} />
      ))}
    </div>
  );
}
