import React, { useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Check, Copy } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CodeBlockComponent = ({ node, updateAttributes, extension }: any) => {
  const [copied, setCopied] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const selectLanguage = (language: string) => {
    updateAttributes({ language });
  };

  const copyCode = () => {
    const code = node.textContent;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="relative group">
      <pre className="rounded-md">
        <NodeViewContent as="code" className="" />
      </pre>
      <div
        className={`absolute -top-[2.25rem] right-0 flex items-center space-x-2 border border-border rounded-md px-1 bg-background transition-opacity duration-200 ${
          isSelectOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {" "}
        <Select
          value={node.attrs.language || "auto"}
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
