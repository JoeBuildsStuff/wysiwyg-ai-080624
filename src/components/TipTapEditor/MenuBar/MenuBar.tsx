"use client";

import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";

import { saveAs } from "file-saver";
import { marked } from "marked";
import TurndownService from "turndown";

import { useCurrentEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import "../TipTapEditor.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BrainCircuit,
  CircleCheckBig,
  Circle,
  CloudDownload,
  Download,
  X,
  FileDigit,
  Type,
  FileImage,
  Save,
  Underline as UnderlineIcon,
  Share,
  Send,
  Lock,
  LockOpen,
  Copy,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

import { createLowlight, all } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import python from "highlight.js/lib/languages/python";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

import { FloatingMenu } from "./FloatingMenu";

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

import {
  Bold,
  CodeXml,
  Italic,
  MessageSquareQuote,
  List,
  Minus,
  Pilcrow,
  RemoveFormatting,
  Strikethrough,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ListOrdered,
  SeparatorHorizontal,
  Code as CodeIcon,
  ListTodo,
  IndentIncrease,
  IndentDecrease,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Baseline,
  Highlighter,
  Link2,
  Link2Off,
  Eraser,
  Sparkle,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { Alert } from "@/components/ui/alert";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getEncoding, encodingForModel } from "js-tiktoken";
const enc = getEncoding("cl100k_base");

import { Tables } from "../../../../database.types";

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

interface MenuBarProps {
  initialDocument: Document;
  initialReferences: FileWithContent[];
}

export const MenuBar: React.FC<MenuBarProps> = ({
  initialDocument,
  initialReferences,
}) => {
  const [addRefContext, setAddRefContext] =
    useState<FileWithContent[]>(initialReferences);

  const supabase = createClient();
  const { toast } = useToast();
  const { editor } = useCurrentEditor();
  const [userPrompt, setUserPrompt] = useState("");

  const [selectedFile, setSelectedFile] = useState<FileWithContent | null>(
    null
  );
  //keep track of the cost from askai from input and output tokens
  //need to keep track of total input and output tokens as an array in cost state
  const [tokensAskAI, setTokensAskAI] = useState<
    { inputTokens: number; outputTokens: number }[]
  >([]);

  // Calculate total cost
  const totalCost = tokensAskAI.reduce((acc, token) => {
    return acc + (token.inputTokens * 3 + token.outputTokens * 15) / 1000000;
  }, 0);

  const [includeFullDocument, setIncludeFullDocument] = useState(true);
  const [includeSelectedReferences, setIncludeSelectedReferences] =
    useState(true);

  const [isLoadingURL, setIsLoadingURL] = useState(false);
  const [isAskAiLoading, setIsAskAiLoading] = useState(false);

  const documentTokens = enc.encode(editor?.getHTML() ?? "").length;
  const selectedReferencesTokens = addRefContext.reduce(
    (total, file) => total + file.tokens,
    0
  );

  const [LLM_Model, setLLM_Model] = useState("llama3.1_70B");

  const [user, setUser] = useState<User | null>(null);

  const [showLoginAlert, setShowLoginAlert] = useState(false);

  //set up saving in supabase
  const [isSaving, setIsSaving] = useState(false);
  const [document, setDocument] = useState<Document>({
    id: initialDocument?.id || "",
    title: initialDocument?.title || "Untitled Document",
    content: editor?.getHTML() || "",
    version: initialDocument?.version || 1,
    updated_at: initialDocument?.updated_at || new Date().toISOString(),
    created_at: initialDocument?.created_at || new Date().toISOString(),
    description: initialDocument?.description || null,
    file_size: initialDocument?.file_size || null,
    is_public: initialDocument?.is_public || false,
    mime_type: initialDocument?.mime_type || "text/html",
    storage_path: initialDocument?.storage_path || "",
    tags: initialDocument?.tags || [],
    user_id: initialDocument?.user_id || "",
  });

  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  // handle the save button click
  const handleSave = useCallback(async () => {
    if (!editor) return;
    
    if (!user) {
      toast({
        title: "Oops",
        description: "No user found. Please sign in to save your document.",
        position: "bottom-right",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const content = editor.getHTML();
      let documentId = document.id;
      let filePath: string;

      if (documentId) {
        // Existing document
        filePath = document.storage_path;
      } else {
        // New document: generate a UUID client-side
        documentId = crypto.randomUUID();
        filePath = `${user.id}/${documentId}.html`;
      }

      // Fetch title, description, and tags from Groq API
      const response = await fetch("/api/groq/filename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to get metadata from Groq API");
      }

      const {
        title,
        description,
        tags,
        model,
        total_time,
        prompt_tokens,
        completion_tokens,
        prompt_time,
        completion_time,
      } = await response.json();

      // Calculate tokens per second
      const inputTokensPerSecond = (prompt_tokens / prompt_time).toFixed(2);
      const outputTokensPerSecond = (
        completion_tokens / completion_time
      ).toFixed(2);

      // Upload content to Supabase Storage
      const { error: storageError } = await supabase.storage
        .from("wysiwyg-documents")
        .upload(filePath, content, {
          contentType: "text/html",
          upsert: true,
        });

      if (storageError) throw storageError;

      let documentData;

      if (document.id) {
        // Update existing document
        const { data, error: documentError } = await supabase
          .from("wysiwyg_documents")
          .update({
            title: title || document.title,
            description: description || document.description,
            tags: tags || document.tags,
            storage_path: filePath,
            version: (document.version ?? 0) + 1,
            mime_type: "text/html",
            file_size: new Blob([content]).size,
          })
          .eq("id", documentId)
          .select()
          .single();

        if (documentError) throw documentError;
        documentData = data;
      } else {
        // Insert new document
        const { data, error: documentError } = await supabase
          .from("wysiwyg_documents")
          .insert({
            id: documentId, // Use the generated UUID
            title: title || document.title,
            description: description || document.description,
            tags: tags || document.tags,
            user_id: user.id,
            storage_path: filePath,
            is_public: false,
            mime_type: "text/html",
            file_size: new Blob([content]).size,
          })
          .select()
          .single();

        if (documentError) throw documentError;
        documentData = data;
      }

      // Save references
      const savedReferences = await saveReferences(addRefContext, documentId);

      setDocument({
        id: documentData.id,
        title: documentData.title,
        content,
        version: documentData.version,
        updated_at: documentData.updated_at,
        created_at: documentData.created_at,
        description: documentData.description,
        file_size: documentData.file_size,
        is_public: documentData.is_public,
        mime_type: documentData.mime_type,
        storage_path: documentData.storage_path,
        user_id: documentData.user_id,
        tags: documentData.tags || [],
      });

      toast({
        title: "Document saved",
        description: `The document has been ${
          document.id ? "updated" : "saved"
        } with ${
          savedReferences.length
        } references. 🚀 Model: ${model}, Response Time: ${total_time.toFixed(
          2
        )}s ⚡\nInput Tokens/s: ${inputTokensPerSecond} ⏱️\nOutput Tokens/s: ${outputTokensPerSecond} ⏱️`,
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "Failed to save document. Please try again.",
        position: "bottom-right",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [editor, user, document, addRefContext]);

  // Function to save references
  const saveReferences = async (
    references: FileWithContent[],
    documentId: string
  ) => {
    const savedRefs: any[] = [];

    for (const ref of references) {
      try {
        // Generate a consistent filename with a timestamp
        const timestamp = Date.now();
        const fileName = `${ref.name.split(".")[0]}-${timestamp}.${ref.name
          .split(".")
          .pop()}`;

        // Generate the file path
        const filePath = `${user?.id}/references/${fileName}`;

        // Upload or update file in Supabase Storage
        const { error: storageError } = await supabase.storage
          .from("wysiwyg-documents")
          .upload(filePath, ref.text!, {
            contentType: ref.mime_type || undefined,
            upsert: true,
          });

        if (storageError) throw storageError;

        // Use the same filePath for database operations
        const { data: existingRef, error: existingRefError } = await supabase
          .from("wysiwyg_references")
          .select()
          .eq("user_id", user?.id ?? "")
          .eq("storage_path", filePath) // Use filePath instead of ref.storage_path
          .single();

        if (existingRefError && existingRefError.code !== "PGRST116") {
          console.error("Error checking existing reference:", existingRefError);
          continue;
        }

        let refData;

        if (existingRef) {
          // Update existing reference
          const { data, error: updateError } = await supabase
            .from("wysiwyg_references")
            .update({
              title: ref.title,
              description: ref.description || null,
              mime_type: ref.mime_type || null,
              file_size: ref.file_size || null,
              storage_path: filePath, // Update storage_path
            })
            .eq("id", existingRef.id)
            .select();

          if (updateError) throw updateError;
          refData = data?.[0];
        } else {
          // Create new reference
          const { data, error: insertError } = await supabase
            .from("wysiwyg_references")
            .insert({
              title: ref.title,
              description: ref.description || null,
              user_id: user?.id || "",
              storage_path: filePath, // Use the new filePath
              mime_type: ref.mime_type || null,
              file_size: ref.file_size || null,
            })
            .select();

          if (insertError) throw insertError;
          refData = data?.[0];
        }

        // Create or update mapping
        const { error: mappingError } = await supabase
          .from("wysiwyg_document_reference_mappings")
          .upsert(
            {
              document_id: documentId,
              reference_id: refData.id,
            },
            {
              onConflict: "document_id,reference_id",
            }
          );

        if (mappingError) throw mappingError;

        savedRefs.push(refData);
      } catch (error) {
        console.error("Error saving reference:", error);
      }
    }

    return savedRefs;
  };


  //handle the share button click
  const handleShare = useCallback(async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "You must be logged in to share documents.",
        position: "bottom-right",
        variant: "destructive",
      });
      return;
    }

    if (!document.id) {
      toast({
        title: "Save Required",
        description: "Please save your document before sharing.",
        position: "bottom-right",
        variant: "destructive",
      });
      return;
    }

    try {
      const newIsPublic = !document.is_public;
      
      const { data, error } = await supabase
        .from('wysiwyg_documents')
        .update({ is_public: newIsPublic })
        .eq('id', document.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setDocument({ ...document, is_public: newIsPublic });
      
      // Generate share URL and open dialog
      if (newIsPublic) {
        const shareLink = `${window.location.origin}/published?documentId=${document.id}`;
        setShareUrl(shareLink);
        setShareDialogOpen(true);
      }
      
      toast({
        title: newIsPublic ? "Document shared" : "Document unshared",
        description: newIsPublic 
          ? "Your document is now publicly accessible." 
          : "Your document is now private.",
        position: "bottom-right",
      });
    } catch (error) {
      console.error('Error updating document:', error);
      toast({
        title: "Error",
        description: "Failed to update sharing settings.",
        position: "bottom-right",
        variant: "destructive",
      });
    }
  }, [user, document, supabase, toast]);

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied",
      description: "Share link copied to clipboard",
      position: "bottom-right",
    });
  };

  const addImage = useCallback(() => {
    if (editor) {
      const url = "";
      const title = "";
      editor
        .chain()
        .focus()
        .setResizableImage({
          src: url,
          title: title,
        })
        .run();
    }
  }, [editor]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(user);
      }
    };

    fetchUser();
  }, []);

  const handleFileClick = (file: FileWithContent) => {
    setSelectedFile(file);
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const fileContent = event.target?.result as string;
        const tokens = enc.encode(fileContent).length;

        // Fetch the title from the groq/filename route
        const response = await fetch("/api/groq/filename", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: fileContent }),
        });
        const data = await response.json();

        setAddRefContext((prevFiles) => [
          ...prevFiles,
          {
            id: crypto.randomUUID(), // Generate a new UUID for the file
            name: file.name,
            title: data.title, // Use the title from the API response
            description: null, // You might want to generate a description
            user_id: user?.id || "", // Make sure to handle the case where user is not defined
            storage_path: `${user?.id}/references/${file.name}`,
            mime_type: file.type,
            file_size: file.size,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            text: fileContent,
            tokens: tokens,
            lastModified: file.lastModified,
          },
        ]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFileDelete = useCallback(
    async (fileToDelete: FileWithContent) => {
      // First, remove the file from the local state
      setAddRefContext((prevFiles) =>
        prevFiles.filter((file) => file.id !== fileToDelete.id)
      );

      if (selectedFile && selectedFile.id === fileToDelete.id) {
        setSelectedFile(null);
      }

      // Then, delete the file from Supabase
      try {
        console.log("Deleting file:", fileToDelete.storage_path);
        // Delete the file from storage
        const { error: storageError } = await supabase.storage
          .from("wysiwyg-documents")
          .remove([fileToDelete.storage_path]);

        if (storageError) {
          console.error("Error deleting file from storage:", storageError);
          throw storageError;
        }

        // Delete the reference from the database
        const { error: dbError } = await supabase
          .from("wysiwyg_references")
          .delete()
          .eq("id", fileToDelete.id);

        if (dbError) {
          console.error("Error deleting reference from database:", dbError);
          throw dbError;
        }

        // Delete the mapping if it exists
        if (document.id) {
          const { error: mappingError } = await supabase
            .from("wysiwyg_document_reference_mappings")
            .delete()
            .eq("document_id", document.id)
            .eq("reference_id", fileToDelete.id);

          if (mappingError) {
            console.error("Error deleting mapping:", mappingError);
            // We don't throw here as it's not critical if the mapping deletion fails
          }
        }

        toast({
          title: "Reference deleted",
          description: "The reference has been successfully deleted.",
          position: "bottom-right",
        });
      } catch (error) {
        console.error("Error deleting reference:", error);
        toast({
          title: "Error",
          description: "Failed to delete reference. Please try again.",
          position: "bottom-right",
          variant: "destructive",
        });
      }
    },
    [selectedFile, document.id, supabase, toast]
  );

  const setLink = useCallback(() => {
    if (!editor) {
      return null;
    }

    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    // update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const getProposedFileName = async (content: string): Promise<string> => {
    try {
      const response = await fetch("/api/groq/filename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to get proposed file name");
      }

      const data = await response.json();
      return data.title || "editor-content.txt";
    } catch (error) {
      console.error("Error getting proposed file name:", error);
      return "editor-content.txt";
    }
  };

  const handleDownloadTxt = async () => {
    const content = editor.getText();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const proposedFileName = await getProposedFileName(content);
    saveAs(blob, proposedFileName);
  };

  const handleDownloadHTML = async () => {
    const content = editor.getHTML();
    const blob = new Blob([content], { type: "text/html;charset=utf-8" });
    const proposedFileName = await getProposedFileName(editor.getText());
    saveAs(blob, proposedFileName);
  };

  const handleDownloadMD = async () => {
    const htmlContent = editor.getHTML();

    // Convert HTML to Markdown using turndown
    const turndownService = new TurndownService();
    const markdown = turndownService.turndown(htmlContent);

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const proposedFileName = await getProposedFileName(editor.getText());
    saveAs(blob, proposedFileName.replace(/\.[^/.]+$/, "") + ".md");
  };

  const handleUrlSubmit = async (url: string) => {
    setIsLoadingURL(true);
    toast({
      title: "Sending URL to JinaAI",
      description: "Please wait...",
      position: "bottom-right",
    });

    // Add a skeleton placeholder
    const skeletonFile: FileWithContent = {
      id: `loading-${Date.now()}`,
      name: `loading-${Date.now()}.md`,
      title: "Loading...",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      lastModified: Date.now(),
      file_size: 0,
      mime_type: "text/markdown",
      user_id: user?.id || "",
      description: "Loading content...",
      storage_path: "",
      text: null,
      tokens: 0,
    };
    setAddRefContext((prevFiles) => [...prevFiles, skeletonFile]);

    try {
      const response = await fetch("/api/jinaai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get reader from response");
      }

      let buffer = "";
      let finalContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") {
              console.log("Stream completed");
              break;
            }

            buffer += data;

            try {
              const parsedData = JSON.parse(buffer);

              if (parsedData.type === "result") {
                const markdownContent = parsedData.message;
                const htmlContent = await marked.parse(markdownContent);
                finalContent += htmlContent; // Append to finalContent instead of overwriting
              }

              buffer = ""; // Clear buffer after successful parse
            } catch (parseError) {
              if (parseError instanceof SyntaxError) {
                console.log("Incomplete JSON, continuing to buffer");
                // Continue buffering as this might be an incomplete JSON object
              } else {
                console.error("Unexpected error parsing JSON:", parseError);
                buffer = ""; // Clear buffer on unexpected errors
              }
            }
          }
        }
      }

      console.log("Final content:", finalContent);

      const responseFileTitle = await fetch("/api/groq/filename", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: finalContent }),
      });
      const titleData = await responseFileTitle.json();
      console.log("titleData", titleData);

      // Generate a consistent filename with a timestamp
      const timestamp = Date.now();
      const fileName = `${new URL(url).hostname}-${timestamp}.md`;

      // Generate the file path
      const filePath = `${user?.id}/references/${fileName}`;

      // Create a new file-like object from the received content
      const newFile: FileWithContent = {
        id: crypto.randomUUID(), // Generate a new UUID for the file
        title: titleData.title,
        description: null, // You might want to generate a description
        user_id: user?.id || "", // Make sure to handle the case where user is not defined
        storage_path: filePath, // Use the consistent file path
        mime_type: "text/markdown",
        file_size: new Blob([finalContent]).size,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Additional fields for FileWithContent
        name: fileName,
        text: finalContent,
        tokens: enc.encode(finalContent).length,
        lastModified: timestamp,
        url: url,
      };

      // Remove the skeleton and add the actual file
      setAddRefContext((prevFiles) => [
        ...prevFiles.filter((file) => file.name !== skeletonFile.name),
        newFile,
      ]);

      toast({
        title: "Content retrieved",
        description: "The content has been added to your references.",
        position: "bottom-right",
      });
    } catch (error) {
      console.error("Error submitting URL:", error);
      // Remove the skeleton on error
      setAddRefContext((prevFiles) =>
        prevFiles.filter((file) => file.name !== skeletonFile.name)
      );
      toast({
        title: "Error",
        description: "Failed to process URL. Please try again.",
        position: "bottom-right",
        variant: "destructive",
      });
    } finally {
      setIsLoadingURL(false);
    }
  };

  const askAi = async () => {
    setIsAskAiLoading(true);

    //toast message for submitting to AI
    toast({
      title: "Submitting to AskAI",
      description: "Please wait...",
      position: "bottom-right",
    });

    // Prepare the request body
    const requestBody: {
      userPrompt: string;
      docContext?: string;
      addRefContext?: FileWithContent[];
    } = {
      userPrompt: userPrompt,
    };

    // Include docContext only if includeFullDocument is true
    if (includeFullDocument) {
      requestBody.docContext = editor.getHTML();
    }

    // Include addRefContext only if includeSelectedReferences is true
    if (includeSelectedReferences) {
      requestBody.addRefContext = addRefContext;
    }

    // Determine the API route based on the selected LLM model
    const apiRoute =
      LLM_Model === "sonnet_3.5" ? "/api/anthropic" : "/api/groq/chat";

    try {
      const response = await fetch(apiRoute, {
        // Use the determined API route
        method: "POST",
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      toast({
        title: "Cost",
        description: `Input Tokens: ${
          (data.usage.inputTokens * 3) / 1000000
        } Output Tokens: ${(data.usage.outputTokens * 15) / 1000000}`,
        position: "bottom-right",
      });

      setTokensAskAI((prevTokens) => [
        ...prevTokens,
        {
          inputTokens: data.usage.inputTokens,
          outputTokens: data.usage.outputTokens,
        },
      ]);

      const markdownContent = data.message;
      let htmlContent;

      // Check if the content is a code block
      if (
        markdownContent.startsWith("```") &&
        markdownContent.endsWith("```")
      ) {
        // It's a code block, so we'll use the syntax highlighter
        const codeContent = markdownContent.slice(3, -3).trim();
        htmlContent = `<pre><code>${codeContent}</code></pre>`;
      } else {
        // It's not a code block, so we'll parse it as regular markdown
        htmlContent = await marked.parse(markdownContent);
      }

      // Get the current cursor position
      const currentPos = editor.state.selection.from;

      // Insert the AI response content
      editor.chain().focus().insertContent(htmlContent).run();

      // Calculate the end position of the inserted content
      const endPos = currentPos + data.message.length;

      // Select the newly inserted content
      editor.commands.setTextSelection({ from: currentPos, to: endPos });
    } catch (error) {
      console.log("Error in askAi:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        position: "bottom-right",
        variant: "destructive",
      });
    } finally {
      setIsAskAiLoading(false);
    }
  };

  return (
    <div className=" sticky top-0 py-2 z-50 bg-background">
      {/* Menu Bar */}
      <div className="flex flex-row w-full justify-between">
        <div className="flex flex-row gap-2 flex-wrap">
          {/* AI Context Menu */}
          <Alert className="flex flex-row p-1 m-0 w-fit ">
            <Sheet>
              <SheetTrigger asChild className="w-fit">
                <Button variant="ghost" className="p-[.35rem] m-0 h-fit w-fit">
                  <BrainCircuit className="w-5 h-5 flex-none" />
                </Button>
              </SheetTrigger>
              <SheetContent className="min-h-[100dvh] flex flex-col">
                <SheetHeader>
                  <SheetTitle>Edit Context</SheetTitle>
                  <SheetDescription>
                    Provide reference content that can be used as context for
                    the LLM.
                  </SheetDescription>
                </SheetHeader>
                <div>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-border p-4 mt-4 text-center rounded-lg"
                  >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                      <p>Drop the files here ...</p>
                    ) : (
                      <div className="flex flex-col">
                        <p>Drag &apos;n&apos; drop files here, </p>
                        <p> or click to select files</p>
                      </div>
                    )}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const url = (e.target as HTMLFormElement).url.value;
                      handleUrlSubmit(url);
                    }}
                    className="flex flex-row gap-2 my-4"
                  >
                    {/* section for users to paste in a web url and click submit to send url to jinaai route.ts for processing */}
                    <Input
                      type="text"
                      name="url"
                      placeholder="Enter a web URL"
                    />
                    <Button type="submit" variant="secondary">
                      <CloudDownload className="w-5 h-5 flex-none" />
                    </Button>
                  </form>
                </div>

                <div className="overflow-y-auto flex-grow">
                  {addRefContext.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="">Files:</h3>
                      {addRefContext.map((file, index) => (
                        <Alert
                          key={index}
                          className="relative flex items-center cursor-pointer hover:bg-secondary/50 justify-between"
                          onClick={() => handleFileClick(file)}
                        >
                          {file.text === null ? (
                            // Skeleton placeholder
                            <div className="flex items-center w-full">
                              <Skeleton className="h-9 w-8 rounded-lg" />
                              <div className="ml-4 space-y-2">
                                <Skeleton className="h-4 w-[200px] rounded-sm" />
                                <Skeleton className="h-4 w-[150px] rounded-sm" />
                                <div className="flex flex-row gap-2">
                                  <Skeleton className="h-2 w-[50px] rounded-none" />
                                  <Skeleton className="h-2 w-[50px] rounded-none" />
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Actual file content
                            <div className="flex flex-row items-center mr-5 w-full">
                              <div className="flex flex-col h-full items-center gap-1">
                                <FileDigit
                                  className="w-8 h-8 flex-none"
                                  strokeWidth={1}
                                />
                                {file.url && (
                                  <Badge variant="outline">
                                    <a
                                      href={file.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      URL
                                    </a>
                                  </Badge>
                                )}
                              </div>
                              <div className="ml-4 flex-grow">
                                <div className="font-medium flex items-center justify-between">
                                  {file.title || file.name}
                                </div>

                                <div className="text-sm text-muted-foreground flex flex-row gap-1">
                                  <span>
                                    {(file.file_size ?? 0 / 1024).toFixed(2)} KB
                                    •
                                  </span>
                                  <span> {file.tokens} tokens</span>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-[.25rem] top-[.25rem] p-1 m-0 h-fit w-fit hover:bg-accent"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFileDelete(file);
                            }}
                          >
                            <X className="w-4 h-4 flex-none text-muted-foreground" />
                          </Button>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>
              </SheetContent>
              <Dialog
                open={!!selectedFile}
                onOpenChange={() => setSelectedFile(null)}
              >
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">{selectedFile?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Size: {(selectedFile?.file_size ?? 0 / 1024).toFixed(2)}{" "}
                      KB • Tokens: {selectedFile?.tokens}
                    </p>
                    <TipTapEditor
                      initialDocumentContent={selectedFile?.text ?? ""}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </Sheet>

            <AlertDialog open={showLoginAlert} onOpenChange={setShowLoginAlert}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Login Required</AlertDialogTitle>
                  <AlertDialogDescription>
                    You need to be logged in to use Sonnet 3.5. Would you like
                    to sign in?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setLLM_Model("llama3.1_70B")}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    onClick={() => {
                      // Implement your login logic here
                      // For example, redirect to login page
                      window.location.href = "/signin";
                    }}
                  >
                    Sign In
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Select LLM Model */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-[.35rem] m-0 h-fit w-fit">
                  {LLM_Model === "llama3.1_70B"
                    ? "Llama 3.1 70B"
                    : "Sonnet 3.5"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-fit" sideOffset={10}>
                <DropdownMenuLabel>LLM Model</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={LLM_Model}
                  defaultValue="llama3.1_70B"
                  onValueChange={(value) => {
                    if (value === "sonnet_3.5" && !user) {
                      setShowLoginAlert(true);
                    } else {
                      setLLM_Model(value);
                    }
                  }}
                >
                  <DropdownMenuRadioItem value="llama3.1_70B">
                    <div className="flex flex-row w-full justify-between gap-2">
                      <span className="flex flex-row ">Llama 3.1 70B</span>
                      {/* <Badge variant="outline" className="border-white/20">
                          Free
                        </Badge> */}
                    </div>
                  </DropdownMenuRadioItem>
                  {user &&
                    new Date(user.created_at) <
                      new Date("2024-08-11T16:52:56.956888Z") && (
                      <DropdownMenuRadioItem value="sonnet_3.5">
                        <div className="flex flex-row w-full justify-between gap-2">
                          <span className="flex flex-row ">Sonnet 3.5</span>
                          <Badge variant="outline" className="border-white/20">
                            Pro
                          </Badge>
                        </div>
                      </DropdownMenuRadioItem>
                    )}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Display total token cost from AskAI */}
            {tokensAskAI.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-[.35rem] m-0 h-fit w-fit"
                    >
                      {LLM_Model === "llama3.1_70B"
                        ? "Free"
                        : `$${totalCost.toFixed(4)}`}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-fit">
                    <div className="text-xs">
                      {tokensAskAI.map((token, index) => (
                        <div key={index} className="flex justify-between gap-2">
                          <span>Request {index + 1}:</span>
                          <span>
                            $
                            {(
                              (token.inputTokens * 3 +
                                token.outputTokens * 15) /
                              1000000
                            ).toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </Alert>

          {/* formatting like paragraph, heading, list, etc. */}
          <Alert className="flex flex-row p-1 m-0 h-fit w-fit gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className="p-[.35rem] m-0 h-fit w-fit"
                >
                  {editor.isActive("taskList") ? (
                    <ListTodo className="w-5 h-5 flex-none" />
                  ) : editor.isActive("orderedList") ? (
                    <ListOrdered className="w-5 h-5 flex-none" />
                  ) : editor.isActive("bulletList") ? (
                    <List className="w-5 h-5 flex-none" />
                  ) : editor.isActive("code") ? (
                    <CodeIcon className="w-5 h-5 flex-none" />
                  ) : editor.isActive("codeBlock") ? (
                    <CodeXml className="w-5 h-5 flex-none" />
                  ) : editor.isActive("blockquote") ? (
                    <MessageSquareQuote className="w-5 h-5 flex-none" />
                  ) : editor.isActive("heading", { level: 3 }) ? (
                    <Heading3 className="w-5 h-5 flex-none" />
                  ) : editor.isActive("heading", { level: 2 }) ? (
                    <Heading2 className="w-5 h-5 flex-none" />
                  ) : editor.isActive("heading", { level: 1 }) ? (
                    <Heading1 className="w-5 h-5 flex-none" />
                  ) : editor.isActive("paragraph") ? (
                    <Type className="w-5 h-5 flex-none" />
                  ) : (
                    <Type className="w-5 h-5 flex-none" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="flex flex-col gap-2 w-fit h-fit p-2 m-0 mt-2 justify-start items-start"
                align="start"
              >
                <ToggleGroup
                  type="single"
                  value={
                    editor.isActive("taskList")
                      ? "taskList"
                      : editor.isActive("orderedList")
                      ? "orderedList"
                      : editor.isActive("bulletList")
                      ? "bulletList"
                      : editor.isActive("code")
                      ? "code"
                      : editor.isActive("codeBlock")
                      ? "codeBlock"
                      : editor.isActive("blockquote")
                      ? "blockquote"
                      : editor.isActive("heading", { level: 3 })
                      ? "heading3"
                      : editor.isActive("heading", { level: 2 })
                      ? "heading2"
                      : editor.isActive("heading", { level: 1 })
                      ? "heading1"
                      : editor.isActive("paragraph")
                      ? "paragraph"
                      : ""
                  }
                  className="flex flex-col gap-1 justify-start items-start "
                >
                  <div className="flex flex-col gap-1 justify-start items-start">
                    <div className="text-sm text-muted-foreground">Text</div>
                    <div className="flex flex-row gap-1 justify-start items-start">
                      <ToggleGroupItem
                        value="paragraph"
                        aria-label="Paragraph"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor.chain().focus().setParagraph().run()
                        }
                      >
                        <Type className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="heading1"
                        aria-label="Heading 1"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 1 })
                            .run()
                        }
                      >
                        <Heading1 className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="heading2"
                        aria-label="Heading 2"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 2 })
                            .run()
                        }
                      >
                        <Heading2 className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="heading3"
                        aria-label="Heading 3"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor
                            .chain()
                            .focus()
                            .toggleHeading({ level: 3 })
                            .run()
                        }
                      >
                        <Heading3 className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                    </div>
                  </div>
                  <Separator className="flex w-full my-2" />
                  <div className="flex flex-col gap-1 justify-start items-start">
                    <div className="text-sm text-muted-foreground">List</div>
                    <div className="flex flex-row gap-1 justify-start items-start">
                      <ToggleGroupItem
                        value="bulletList"
                        aria-label="Bullet List"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor.chain().focus().toggleBulletList().run()
                        }
                      >
                        <List className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="orderedList"
                        aria-label="Ordered List"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor.chain().focus().toggleOrderedList().run()
                        }
                      >
                        <ListOrdered className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="taskList"
                        aria-label="Task List"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor.chain().focus().toggleTaskList().run()
                        }
                      >
                        <ListTodo className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                    </div>
                  </div>
                  <Separator className="flex w-full my-2" />
                  <div className="flex flex-col gap-1 justify-start items-start">
                    <div className="text-sm text-muted-foreground"></div>
                    <div className="flex flex-row gap-1 justify-start items-start">
                      <ToggleGroupItem
                        value="code"
                        aria-label="Code"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor.chain().focus().toggleCode().run()
                        }
                      >
                        <CodeIcon className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="codeBlock"
                        aria-label="Code Block"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor.chain().focus().toggleCodeBlock().run()
                        }
                      >
                        <CodeXml className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="blockquote"
                        aria-label="Blockquote"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={() =>
                          editor.chain().focus().toggleBlockquote().run()
                        }
                      >
                        <MessageSquareQuote className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                    </div>
                  </div>
                  <Separator className="flex w-full my-2" />
                  <div className="flex flex-col gap-1 justify-start items-start">
                    <div className="text-sm text-muted-foreground">Media</div>
                    <div className="flex flex-row gap-1 justify-start items-start">
                      <ToggleGroupItem
                        value="addImage"
                        aria-label="Add Image"
                        className="p-[.35rem] m-0 h-fit w-fit"
                        onClick={addImage}
                      >
                        <FileImage className="w-5 h-5 flex-none" />
                      </ToggleGroupItem>
                    </div>
                  </div>
                  <Separator className="flex w-full my-2" />
                  <div className="flex flex-col gap-1 justify-start items-start">
                    <div className="text-sm text-muted-foreground">
                      Seperator
                    </div>
                    <div className="flex flex-row gap-1 justify-start items-start">
                      <Button
                        variant="ghost"
                        onClick={() =>
                          editor.chain().focus().setHorizontalRule().run()
                        }
                        className="p-[.35rem] m-0 h-fit w-fit"
                      >
                        <Minus className="w-5 h-5 flex-none" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          editor.chain().focus().setHardBreak().run()
                        }
                        className="p-[.35rem] m-0 h-fit w-fit"
                      >
                        <SeparatorHorizontal className="w-5 h-5 flex-none" />
                      </Button>
                    </div>
                  </div>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Alert>

          {/* alignment like left, center, right, etc. */}
          <Alert className="flex flex-row p-1 m-0 h-fit w-fit gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="secondary"
                  className="p-[.35rem] m-0 h-fit w-fit"
                >
                  {editor.isActive({ textAlign: "left" }) ? (
                    <AlignLeft className="w-5 h-5 flex-none" />
                  ) : editor.isActive({ textAlign: "center" }) ? (
                    <AlignCenter className="w-5 h-5 flex-none" />
                  ) : (
                    <AlignRight className="w-5 h-5 flex-none" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit h-fit p-1 m-0 mt-2">
                <ToggleGroup
                  type="single"
                  value={
                    editor.isActive({ textAlign: "left" })
                      ? "left"
                      : editor.isActive({ textAlign: "center" })
                      ? "center"
                      : "right"
                  }
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="left"
                    aria-label="Left Alignment"
                    onClick={() =>
                      editor.chain().focus().setTextAlign("left").run()
                    }
                    className="p-[.35rem] m-0 h-fit w-fit"
                  >
                    <AlignLeft className="w-5 h-5 flex-none" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="center"
                    aria-label="Center Alignment"
                    onClick={() =>
                      editor.chain().focus().setTextAlign("center").run()
                    }
                    className="p-[.35rem] m-0 h-fit w-fit"
                  >
                    <AlignCenter className="w-5 h-5 flex-none" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="right"
                    aria-label="Right Alignment"
                    onClick={() =>
                      editor.chain().focus().setTextAlign("right").run()
                    }
                    className="p-[.35rem] m-0 h-fit w-fit"
                  >
                    <AlignRight className="w-5 h-5 flex-none" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Alert>

          {/* styles like bold, italic, strikethrough, etc. */}
          <Alert className="flex flex-row p-1 m-0 h-fit w-fit gap-1">
            <Toggle
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              pressed={editor.isActive("bold")}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Bold className="w-5 h-5 flex-none" />
            </Toggle>
            <Toggle
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
              pressed={editor.isActive("italic")}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Italic className="w-5 h-5 flex-none" />
            </Toggle>
            <Toggle
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={!editor.can().chain().focus().toggleUnderline().run()}
              pressed={editor.isActive("underline")}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <UnderlineIcon className="w-5 h-5 flex-none" />
            </Toggle>
            <Toggle
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
              pressed={editor.isActive("strike")}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Strikethrough className="w-5 h-5 flex-none" />
            </Toggle>

            <Toggle
              onClick={setLink}
              pressed={editor.isActive("link")}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Link2 className="w-5 h-5 flex-none" />
            </Toggle>
            {/* <Toggle
              onClick={() => editor.chain().focus().unsetLink().run()}
              disabled={!editor.isActive("link")}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Link2Off className="w-5 h-5 flex-none" />
            </Toggle> */}
          </Alert>

          {/* horizontal rule */}
          <Alert className="flex flex-row p-1 m-0 w-fit gap-1 ">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="p-[.35rem] m-0 h-fit w-fit">
                  <Baseline
                    className="w-5 h-5 flex-none"
                    style={{
                      color: editor.getAttributes("textStyle").color,
                    }}
                  ></Baseline>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit h-fit p-1 m-0 mt-2">
                <ToggleGroup
                  type="single"
                  value={editor.getAttributes("textStyle").color}
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="#e11d48"
                    aria-label="toggle rose"
                    onClick={() =>
                      editor.chain().focus().setColor("#e11d48").run()
                    }
                    className="w-full flex items-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#e11d48" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#7c3aed"
                    aria-label="toggle violet"
                    onClick={() =>
                      editor.chain().focus().setColor("#7c3aed").run()
                    }
                    className="w-full flex items-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#7c3aed" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#2563eb"
                    aria-label="toggle blue"
                    onClick={() =>
                      editor.chain().focus().setColor("#2563eb").run()
                    }
                    className="w-full flex items-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#2563eb" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#10b981"
                    aria-label="toggle emerald"
                    onClick={() =>
                      editor.chain().focus().setColor("#10b981").run()
                    }
                    className="w-full flex items-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#f59e0b"
                    aria-label="toggle amber"
                    onClick={() =>
                      editor.chain().focus().setColor("#f59e0b").run()
                    }
                    className="w-full flex items-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#f59e0b" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#737373"
                    aria-label="toggle neutral"
                    onClick={() =>
                      editor.chain().focus().setColor("#737373").run()
                    }
                    className="w-full flex items-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#737373" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#fafafa"
                    aria-label="toggle white"
                    onClick={() =>
                      editor.chain().focus().setColor("#fafafa").run()
                    }
                    className="w-full flex items-center"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#fafafa" }}
                    ></div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
            {/* highlight */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-[.35rem] m-0 h-fit w-fit"
                  style={{
                    color: editor.getAttributes("highlight").color,
                  }}
                >
                  <Highlighter className="w-5 h-5 flex-none" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit h-fit p-1 m-0 mt-2">
                <ToggleGroup
                  type="single"
                  value={editor.getAttributes("highlight").color}
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="#e11d48"
                    aria-label="toggle rose highlight"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: "#e11d48" })
                        .run()
                    }
                    className="w-full flex justify-start"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#e11d48" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#7c3aed"
                    aria-label="toggle violet highlight"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: "#7c3aed" })
                        .run()
                    }
                    className="w-full flex justify-start"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#7c3aed" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#2563eb"
                    aria-label="toggle blue highlight"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: "#2563eb" })
                        .run()
                    }
                    className="w-full flex justify-start"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#2563eb" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#10b981"
                    aria-label="toggle emerald highlight"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: "#10b981" })
                        .run()
                    }
                    className="w-full flex justify-start"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#f59e0b"
                    aria-label="toggle amber highlight"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: "#f59e0b" })
                        .run()
                    }
                    className="w-full flex justify-start"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#f59e0b" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#737373"
                    aria-label="toggle neutral highlight"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .toggleHighlight({ color: "#737373" })
                        .run()
                    }
                    className="w-full flex justify-start"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: "#737373" }}
                    ></div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Alert>

          {/* other like unset all marks, clear nodes, etc. */}
          <Alert className="flex flex-row p-1 m-0 h-fit w-fit gap-1">
            <Button
              variant="ghost"
              onClick={() =>
                editor.chain().focus().unsetAllMarks().clearNodes().run()
              }
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Eraser className="w-5 h-5 flex-none" />
            </Button>
          </Alert>

          {/* undo, redo, etc. */}
          <Alert className="flex flex-row p-1 m-0 h-fit w-fit gap-1">
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Undo2 className="w-5 h-5 flex-none" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Redo2 className="w-5 h-5 flex-none" />
            </Button>
          </Alert>
        </div>

        <div className="flex flex-row gap-2 flex-wrap sm:items-end sm:justify-end">
          {/* Words and Char Counts */}
          <Alert className="hidden sm:flex flex-row p-1 px-2 m-0 h-fit w-fit gap-1">
            <div className="text-xs text-muted-foreground">
              {editor.storage.characterCount.words()} words
              <br />
              {editor.storage.characterCount.characters()} chars
            </div>
          </Alert>

          {/* Download as different formats */}
          <Alert className="flex flex-row p-1 m-0 h-fit w-fit gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="p-[.35rem] m-0 h-fit w-fit">
                  <Download className="w-5 h-5 flex-none"></Download>
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-fit h-fit p-1 m-0 mt-2 flex flex-col gap-1"
                align="end"
              >
                <Button
                  variant="ghost"
                  className="w-full text-left items-start justify-between h-fit px-2 py-1 "
                  onClick={handleDownloadTxt}
                >
                  <p>Plain Text</p>{" "}
                  <Badge variant="outline" className="ml-2">
                    .txt
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-left items-start justify-between h-fit px-2 py-1 "
                  onClick={handleDownloadMD}
                >
                  <p>Markdown</p>{" "}
                  <Badge variant="outline" className="ml-2">
                    .md
                  </Badge>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-left items-start justify-between h-fit px-2 py-1 "
                  onClick={handleDownloadHTML}
                >
                  <p>Web Page</p>{" "}
                  <Badge variant="outline" className="ml-2">
                    .html
                  </Badge>
                </Button>
              </PopoverContent>
            </Popover>
            {/* save button */}
            <Button
              variant="ghost"
              className="p-[.35rem] m-0 h-fit w-fit"
              onClick={handleSave}
            >
              <Save className="w-5 h-5 flex-none" />
            </Button>

            {/* Share button */}
            <>
              <Button
                variant="ghost"
                className="p-[.35rem] m-0 h-fit w-fit"
                onClick={handleShare}
              >
                {document.is_public ? (
                  <LockOpen className="w-5 h-5 flex-none dark:text-green-400 text-green-600" />
                ) : (
                  <Lock className="w-5 h-5 flex-none dark:text-red-400 text-red-600" />
                )}
              </Button>
              
              <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                      Anyone with this link will be able to view this document.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <div className="grid flex-1 gap-2">
                      <Label htmlFor="link" className="sr-only">
                        Link
                      </Label>
                      <Input
                        id="link"
                        value={shareUrl}
                        readOnly
                      />
                    </div>
                    <Button type="button" size="sm" className="px-3" onClick={copyShareLink}>
                      <span className="sr-only">Copy</span>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          </Alert>
        </div>

        {/* floating menu */}
        {editor && <FloatingMenu editor={editor} />}
      </div>
    </div>
  );
};
