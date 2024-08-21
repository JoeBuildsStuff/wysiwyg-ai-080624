"use client";

import React, { useState, useCallback } from "react";
import { FloatingMenu as TiptapFloatingMenu } from "@tiptap/react";
import { Alert } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { CircleCheckBig, Circle, FileDigit, BrainCircuit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getEncoding } from "js-tiktoken";
import { marked } from "marked";

interface FloatingMenuProps {
  editor: any;
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ editor }) => {
  const { toast } = useToast();
  const [userPrompt, setUserPrompt] = useState("");
  const [includeFullDocument, setIncludeFullDocument] = useState(true);
  const [includeSelectedReferences, setIncludeSelectedReferences] =
    useState(true);
  const [isAskAiLoading, setIsAskAiLoading] = useState(false);
  const [tokensAskAI, setTokensAskAI] = useState<
    { inputTokens: number; outputTokens: number }[]
  >([]);

  const enc = getEncoding("cl100k_base");
  const documentTokens = enc.encode(editor.getHTML() ?? "").length;
  const selectedReferencesTokens = 0; // You might need to implement this based on your references logic

  const askAi = useCallback(async () => {
    setIsAskAiLoading(true);

    toast({
      title: "Submitting to AskAI",
      description: "Please wait...",
      position: "bottom-right",
    });

    const requestBody: {
      userPrompt: string;
      docContext?: string;
      addRefContext?: any[]; // Adjust this type as needed
    } = {
      userPrompt: userPrompt,
    };

    if (includeFullDocument) {
      requestBody.docContext = editor.getHTML();
    }

    if (includeSelectedReferences) {
      // Implement this based on your references logic
      requestBody.addRefContext = [];
    }

    try {
      const response = await fetch("/api/groq/chat", {
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

      if (
        markdownContent.startsWith("```") &&
        markdownContent.endsWith("```")
      ) {
        const codeContent = markdownContent.slice(3, -3).trim();
        htmlContent = `<pre><code>${codeContent}</code></pre>`;
      } else {
        htmlContent = await marked.parse(markdownContent);
      }

      const currentPos = editor.state.selection.from;
      editor.chain().focus().insertContent(htmlContent).run();
      const endPos = currentPos + data.message.length;
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
  }, [
    editor,
    userPrompt,
    includeFullDocument,
    includeSelectedReferences,
    toast,
  ]);

  return (
    <TiptapFloatingMenu
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
    </TiptapFloatingMenu>
  );
};
