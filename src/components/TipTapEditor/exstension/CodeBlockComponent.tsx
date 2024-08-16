import React, { useState, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Check, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marked } from "marked";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DOMPurify from "dompurify";

const CodeBlockComponent = ({ node, updateAttributes, extension }: any) => {
  const [copied, setCopied] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [language, setLanguage] = useState(node.attrs.language || "auto");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");

  useEffect(() => {
    try {
      updateAttributes({ language });
    } catch (error) {
      console.error("Error updating code block language:", error);
    }
  }, [language, updateAttributes]);

  const selectLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const copyCode = () => {
    const code = node.textContent;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  useEffect(() => {
    const updatePreviewContent = async () => {
      if (isPreviewMode) {
        if (language === "markdown") {
          const content = await marked(node.textContent);
          setPreviewContent(content);
        } else if (language === "html") {
          const content = DOMPurify.sanitize(node.textContent);
          setPreviewContent(content);
        }
      }
    };

    updatePreviewContent();
  }, [isPreviewMode, language, node.textContent]);

  const renderPreview = () => {
    if (isPreviewMode && previewContent) {
      return (
        <div
          className="prose dark:prose-invert max-w-none my-[1.5rem] py-[.75rem] px-[1rem] bg-foreground/20 rounded-md "
          dangerouslySetInnerHTML={{ __html: previewContent }}
        />
      );
    }
    return null;
  };

  return (
    <NodeViewWrapper className="relative group">
      {isPreviewMode && (language === "markdown" || language === "html") ? (
        renderPreview()
      ) : (
        <pre className="rounded-md">
          <NodeViewContent as="code" />
        </pre>
      )}
      <div
        className={`absolute -top-[2.25rem] right-0 flex items-center space-x-4 border border-border rounded-md px-1 bg-background transition-opacity duration-200 ${
          isSelectOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <Select
          value={language}
          onValueChange={selectLanguage}
          onOpenChange={setIsSelectOpen}
        >
          <SelectTrigger className="w-fit pr-4 bg-background border-none p-1 h-fit">
            <SelectValue placeholder="Language" className="mr-4" />
            <span className="w-2"></span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            {extension.options.lowlight.listLanguages().map((lang: string) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex w-[1px] h-5 bg-border"></div>
        {(language === "markdown" || language === "html") && (
          <Button
            variant="ghost"
            onClick={togglePreview}
            className="h-[1.5rem]"
            title={isPreviewMode ? "Show code" : `Preview ${language}`}
          >
            {isPreviewMode ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
        )}
        <div className="flex w-[1px] h-5 bg-border "></div>
        <Button variant="ghost" onClick={copyCode} className="p-[.35rem] h-fit">
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </NodeViewWrapper>
  );
};

export default CodeBlockComponent;
