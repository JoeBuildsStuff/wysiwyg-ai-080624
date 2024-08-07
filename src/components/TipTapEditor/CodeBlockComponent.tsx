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
    <NodeViewWrapper className="relative">
      <pre className="rounded-md">
        <NodeViewContent as="code" />
      </pre>
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        <Select
          value={node.attrs.language || "auto"}
          onValueChange={selectLanguage}
        >
          <SelectTrigger className="w-fit pr-4 bg-secondary">
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
        <Button variant="secondary" onClick={copyCode}>
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
