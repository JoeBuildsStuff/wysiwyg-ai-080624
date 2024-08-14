"use client";

import { saveAs } from "file-saver";
import { marked } from "marked";
import TurndownService from "turndown";

import { EditorProvider, useCurrentEditor, FloatingMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
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
import React, { useCallback, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Toggle } from "../ui/toggle";
import "./TipTapEditor.css";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "../ui/sheet";
import {
  BrainCircuit,
  File,
  CircleCheckBig,
  Circle,
  CloudDownload,
  Download,
  X,
  ExternalLink,
  FileDigit,
  Type,
  FileImage,
} from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useToast } from "@/components/ui/use-toast";

import Code from "@tiptap/extension-code";

import Link from "@tiptap/extension-link";

import { EditorContent, useEditor } from "@tiptap/react";
import Heading from "@tiptap/extension-heading";

import CharacterCount from "@tiptap/extension-character-count";

import { ReactNodeViewRenderer } from "@tiptap/react";
import CodeBlockComponent from "./CodeBlockComponent";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
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
} from "../ui/dropdown-menu";
import { SlashCommand } from "./SlashCommandList";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

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

import { getEncoding, encodingForModel } from "js-tiktoken";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "../ui/separator";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

const enc = getEncoding("cl100k_base");

interface FileWithContent {
  name: string;
  title: string;
  size: number;
  type: string;
  lastModified: number;
  text: string | null;
  tokens: number;
  url?: string;
}

const MenuBar = () => {
  const supabase = createClient();
  const { toast } = useToast();
  const { editor } = useCurrentEditor();
  const [userPrompt, setUserPrompt] = useState("");
  const [addRefContext, setAddRefContext] = useState<FileWithContent[]>([]);
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
            name: file.name,
            title: data.title, // Use the title from the API response
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            text: fileContent,
            tokens: tokens,
          },
        ]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleFileDelete = useCallback(
    (fileToDelete: FileWithContent) => {
      setAddRefContext((prevFiles) =>
        prevFiles.filter((file) => file.name !== fileToDelete.name)
      );
      if (selectedFile && selectedFile.name === fileToDelete.name) {
        setSelectedFile(null);
      }
    },
    [selectedFile]
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
      name: `loading-${Date.now()}.md`,
      title: "Loading...",
      size: 0,
      type: "text/markdown",
      lastModified: Date.now(),
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
              console.log("Attempting to parse buffer:", buffer);
              const parsedData = JSON.parse(buffer);
              console.log("Successfully parsed data:", parsedData);

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

      // Create a new file-like object from the received content
      const newFile: FileWithContent = {
        name: `${new URL(url).hostname}-${Date.now()}.md`,
        title: titleData.title, // Use the title from the API response
        size: new Blob([finalContent]).size,
        type: "text/markdown",
        lastModified: Date.now(),
        text: finalContent,
        tokens: enc.encode(finalContent).length,
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
      console.error("Error in askAi:", error);
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
                                    {(file.size / 1024).toFixed(2)} KB •
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
                      Size: {(selectedFile?.size ?? 0 / 1024).toFixed(2)} KB •
                      Tokens: {selectedFile?.tokens}
                    </p>
                    <TipTapEditor initialContent={selectedFile?.text ?? ""} />
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

          {/* color and highlight */}
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
                    <div className="text-sm text-muted-foreground">Lists</div>
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
                    <div className="text-sm text-muted-foreground">Blocks</div>
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
          <Alert className="flex flex-row p-1 m-0 h-fit w-fit gap-1">
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <Minus className="w-5 h-5 flex-none" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().setHardBreak().run()}
              className="p-[.35rem] m-0 h-fit w-fit"
            >
              <SeparatorHorizontal className="w-5 h-5 flex-none" />
            </Button>
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

        <div className="flex flex-row gap-2 flex-wrap items-end justify-end">
          {/* Words and Char Counts */}
          <Alert className="flex flex-row p-1 px-2 m-0 h-fit w-fit gap-1">
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
          </Alert>
        </div>

        {/* Floating Menu */}
        {editor && (
          <FloatingMenu
            className="floating-menu ml-[1rem] mt-[10rem] justify-start items-start w-fit"
            tippyOptions={{ duration: 100 }}
            editor={editor}
          >
            <Alert className="relative p-2 flex flex-col gap-2">
              <Textarea
                placeholder="Ask AI"
                className="h-[3rem] w-[300px] sm:w-[500px] pr-[6rem]"
                value={userPrompt}
                disabled={isAskAiLoading}
                onChange={(e) => setUserPrompt(e.target.value)}
              />
              <Button
                variant="outline"
                className="absolute right-[1rem] top-[1rem]"
                onClick={askAi}
                disabled={isAskAiLoading}
              >
                {isAskAiLoading ? (
                  <span
                    className="loader"
                    style={
                      {
                        "--loader-size": "18px",
                        "--loader-color": "#000",
                        "--loader-color-dark": "#fff",
                      } as React.CSSProperties
                    }
                  ></span>
                ) : (
                  "Create"
                )}
              </Button>
              <div className="flex flex-row gap-2">
                <Toggle
                  variant="outline"
                  defaultPressed={true}
                  pressed={includeFullDocument}
                  onPressedChange={setIncludeFullDocument}
                  className={`flex flex-row gap-2 h-fit py-1 ${
                    !includeFullDocument ? "text-muted-foreground" : ""
                  }`}
                >
                  {includeFullDocument ? (
                    <CircleCheckBig className="w-4 h-4 flex-none" />
                  ) : (
                    <Circle className="w-4 h-4 flex-none text-muted-foreground" />
                  )}
                  <div className="flex flex-row text-left items-center">
                    <div className="">
                      <FileDigit className="w-4 h-4 flex-none mr-2" />
                    </div>
                    <div className="">{documentTokens} Tokens</div>
                  </div>
                </Toggle>
                <Toggle
                  variant="outline"
                  defaultPressed={true}
                  pressed={includeSelectedReferences}
                  onPressedChange={setIncludeSelectedReferences}
                  className={`flex flex-row gap-2 h-fit py-1 ${
                    !includeSelectedReferences ? "text-muted-foreground" : ""
                  }`}
                >
                  {includeSelectedReferences ? (
                    <CircleCheckBig className="w-4 h-4 flex-none" />
                  ) : (
                    <Circle className="w-4 h-4 flex-none text-muted-foreground" />
                  )}
                  <div className="flex flex-row text-left items-center">
                    <div className="">
                      <BrainCircuit className="w-4 h-4 flex-none mr-2" />
                    </div>
                    <div className="">{selectedReferencesTokens} tokens</div>
                  </div>
                </Toggle>
              </div>
            </Alert>
          </FloatingMenu>
        )}
      </div>
    </div>
  );
};

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
  initialContent?: string;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({
  initialContent,
}) => {
  const [editorContent, setEditorContent] = useState(initialContent);

  const sanitizeContent = (content: string): string => {
    return content
      .replace(/\0/g, "")
      .replace(/\\0/g, "\\\\0")
      .replace(/\\/g, "\\\\");
  };

  useEffect(() => {
    setEditorContent(sanitizeContent(initialContent || ""));
  }, [initialContent]);

  return (
    <div className="prose max-w-none prose-headings:mt-0">
      <EditorProvider
        slotBefore={<MenuBar />}
        extensions={extensions}
        content={editorContent}
      ></EditorProvider>
    </div>
  );
};
