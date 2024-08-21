"use client";

import { EditorProvider } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from "@tiptap/extension-text";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import { ResizableImage } from "./exstension/ResizeImage/resizable-image";
import React, { useState, useEffect, useRef } from "react";

import "./TipTapEditor.css";

import Link from "@tiptap/extension-link";

import Heading from "@tiptap/extension-heading";

import CharacterCount from "@tiptap/extension-character-count";

import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockComponent from "./exstension/CodeBlockComponent";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, all } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";

import { SlashCommand } from "./exstension/SlashCommandList";

// Create a lowlight instance
const lowlight = createLowlight(all);

// Register individual languages
lowlight.register("html", html);
lowlight.register("css", css);
lowlight.register("js", javascript);
lowlight.register("javascript", javascript);
lowlight.register("ts", typescript);
lowlight.register("typescript", typescript);
lowlight.register("python", python);

import { getEncoding, encodingForModel } from "js-tiktoken";
const enc = getEncoding("cl100k_base");

import { MenuBar } from "./MenuBar/MenuBar";

import { Tables } from "../../../database.types";

type WysiwygDocument = Tables<"wysiwyg_documents">;
type WysiwygReference = Tables<"wysiwyg_references">;

// Replace the existing Document interface with this:
export interface Document extends WysiwygDocument {
  content: string; // Add this field as it's not in the database schema
}

// Update the FileWithContent interface
export interface FileWithContent extends WysiwygReference {
  name: string; // Derived from storage_path
  text: string | null; // Content loaded from storage_path
  tokens: number; // Computed field
  lastModified: number; // Computed field
  url?: string; // Computed field
}

const extensions = [
  Placeholder.configure({
    // Use a placeholder:
    placeholder: "Write something or ask the AI to create something...",
    // Use different placeholders depending on the node type:
    // placeholder: ({ node }) => {
    //   if (node.type.name === "heading") {
    //     return "What's the title?";
    //   }

    //   return "Can you add some further context?";
    // },
  }),
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  StarterKit.configure({
    bulletList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
    orderedList: {
      keepMarks: true,
      keepAttributes: false, // TODO : Making this as `false` becase marks are not preserved when I try to preserve attrs, awaiting a bit of help
    },
  }),
  Underline,
  Paragraph,
  Text,
  TaskList,
  TextAlign,
  TaskItem.configure({
    nested: true,
  }),
  Document,
  Paragraph,
  Text,
  CodeBlockLowlight.extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent);
    },
  }).configure({
    lowlight,
    defaultLanguage: null,
  }),
  Heading,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Document,
  Paragraph,
  Text,
  Highlight.configure({ multicolor: true }),
  Link,
  CharacterCount,
  SlashCommand,
  Image,
  ResizableImage,
];

interface TipTapEditorProps {
  initialDocument?: Document;
  initialDocumentContent?: string;
  initialReferences?: FileWithContent[];
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialDocument,
  initialDocumentContent,
  initialReferences = [],
}) => {
  const [editorContent, setEditorContent] = useState(
    initialDocument?.content || initialDocumentContent || ""
  );
  const [addRefContext, setAddRefContext] =
    useState<FileWithContent[]>(initialReferences);
  const isInitialMount = useRef(true);

  const sanitizeContent = (content: string): string => {
    return content
      .replace(/\0/g, "")
      .replace(/\\0/g, "\\\\0")
      .replace(/\\/g, "\\\\");
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      setEditorContent(
        sanitizeContent(
          initialDocument?.content || initialDocumentContent || ""
        )
      );
      setAddRefContext(initialReferences);
    }
  }, [initialDocument, initialDocumentContent, initialReferences]);

  return (
    <div className="prose max-w-none prose-headings:mt-0">
      <EditorProvider
        slotBefore={
          <MenuBar
            initialDocument={
              initialDocument ?? { content: "", ...({} as WysiwygDocument) }
            }
            initialReferences={addRefContext}
          />
        }
        extensions={extensions}
        content={editorContent}
      ></EditorProvider>
    </div>
  );
};
