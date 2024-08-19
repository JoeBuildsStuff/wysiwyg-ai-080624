"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileIcon, Pencil } from "lucide-react";
import EditDocDetails from "./DocListItemEdit";
import { Tables } from "../../../database.types";

type WysiwygDocument = Tables<"wysiwyg_documents">;

export default function DocListItem({ doc }: { doc: WysiwygDocument }) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <EditDocDetails
        doc={doc}
        onCancel={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
      />
    );
  }

  return (
    <Alert key={doc.id} className="mb-4 space-y-3">
      <div className="flex items-start justify-between">
        <Link href={`/workspace/${doc.id}`} className="flex-grow">
          <div className="flex items-center">
            <FileIcon className="w-8 h-8 mr-2" strokeWidth={1} />
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium">{doc.title}</div>
              <p className="text-sm text-muted-foreground">
                {doc.file_size} KB • {doc.mime_type}
              </p>
            </div>
          </div>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="p-1 m-0 w-fit h-fit rounded-lg"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-4 h-4 text-muted-foreground" />
        </Button>
      </div>
      <div className="text-sm text-muted-foreground">{doc.description}</div>
      <div className="flex flex-wrap gap-4 pt-2">
        {doc.tags?.map((tag: string, index: number) => (
          <Badge key={index} variant="secondary" className="relative">
            {tag}
          </Badge>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Updated: {new Date(doc.updated_at ?? "").toLocaleString()}
      </p>
    </Alert>
  );
}
