import React, { useState, useCallback, useEffect, useRef } from "react";
import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { ResizableBox } from "react-resizable";
import "react-resizable/css/styles.css";
import {
  AlignEndVertical,
  AlignStartVertical,
  AlignCenterVertical,
  ArrowDownRight,
  ExternalLink,
  Settings,
} from "lucide-react";
import { ResizeCallbackData } from "react-resizable";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";

export const ResizableImageComponent: React.FC<NodeViewProps> = (props) => {
  const MAX_INITIAL_WIDTH = 600;
  const MAX_INITIAL_HEIGHT = 400;

  const [size, setSize] = useState({
    width: props.node.attrs.width || 200,
    height: props.node.attrs.height || 200,
  });
  const [alignment, setAlignment] = useState(
    props.node.attrs.alignment || "center"
  );

  const handleAlignmentChange = useCallback((value: string) => {
    setAlignment(value);
    updateAttributesRef.current({ alignment: value });
  }, []);

  const [aspect, setAspect] = useState(1);
  const updateAttributesRef = useRef(props.updateAttributes);

  const [isEditing, setIsEditing] = useState(false);
  const [editedSrc, setEditedSrc] = useState(props.node.attrs.src);
  const [editedUrl, setEditedUrl] = useState(props.node.attrs.url || "");
  const [editedTitle, setEditedTitle] = useState(props.node.attrs.title || "");

  const [isNewImage, setIsNewImage] = useState(!props.node.attrs.src);

  const [scale, setScale] = useState(100); // 100 represents 1x scale
  const originalSize = useRef({ width: 0, height: 0 });

  const [responsiveSize, setResponsiveSize] = useState({
    width: size.width,
    height: size.height,
  });

  useEffect(() => {
    const updateResponsiveSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, size.width);
      const scaleFactor = maxWidth / size.width;
      setResponsiveSize({
        width: maxWidth,
        height: Math.round(size.height * scaleFactor),
      });
    };

    updateResponsiveSize();
    window.addEventListener("resize", updateResponsiveSize);
    return () => window.removeEventListener("resize", updateResponsiveSize);
  }, [size]);

  useEffect(() => {
    updateAttributesRef.current = props.updateAttributes;
  }, [props.updateAttributes]);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const aspect = img.width / img.height;
      setAspect(aspect);
      originalSize.current = { width: img.width, height: img.height };

      if (!props.node.attrs.width && !props.node.attrs.height) {
        let newWidth = img.width;
        let newHeight = img.height;

        if (newWidth > MAX_INITIAL_WIDTH || newHeight > MAX_INITIAL_HEIGHT) {
          if (newWidth / MAX_INITIAL_WIDTH > newHeight / MAX_INITIAL_HEIGHT) {
            newWidth = MAX_INITIAL_WIDTH;
            newHeight = Math.round(MAX_INITIAL_WIDTH / aspect);
          } else {
            newHeight = MAX_INITIAL_HEIGHT;
            newWidth = Math.round(MAX_INITIAL_HEIGHT * aspect);
          }
        }

        const newSize = { width: newWidth, height: newHeight };

        setSize(newSize);
        setResponsiveSize(newSize);
        queueMicrotask(() => {
          updateAttributesRef.current(newSize);
        });
      } else {
        const newSize = {
          width: props.node.attrs.width,
          height: props.node.attrs.height,
        };
        setSize(newSize);
        setResponsiveSize(newSize);
      }
    };
    img.src = props.node.attrs.src;
  }, [props.node.attrs.src, props.node.attrs.width, props.node.attrs.height]);

  const handleScaleChange = useCallback((newScale: number[]) => {
    const scaleValue = newScale[0];
    setScale(scaleValue);
    const scaleFactor = 0.5 + scaleValue / 100;
    const newSize = {
      width: Math.round(originalSize.current.width * scaleFactor),
      height: Math.round(originalSize.current.height * scaleFactor),
    };
    setSize(newSize);
    updateAttributesRef.current(newSize);
  }, []);

  const toggleEditMode = useCallback(() => {
    setIsEditing((prev) => !prev);
  }, []);

  const handleSave = useCallback(() => {
    updateAttributesRef.current({
      src: editedSrc,
      url: editedUrl,
      title: editedTitle,
    });
    setIsEditing(false);
    setIsNewImage(false);
  }, [editedSrc, editedUrl, editedTitle]);

  const onResize = useCallback(
    (event: React.SyntheticEvent, { size }: ResizeCallbackData) => {
      const updatedSize = {
        width: Math.round(size.width),
        height: Math.round(size.width / aspect),
      };

      setSize(updatedSize);
      queueMicrotask(() => {
        updateAttributesRef.current(updatedSize);
      });
    },
    [aspect]
  );

  if (isNewImage) {
    return (
      <NodeViewWrapper className="tiptap-resizable-image-component relative group items-center justify-center w-full flex ">
        <div className="w-[20rem] flex flex-col gap-2 bg-background p-2 rounded-lg border border-border">
          <Label className="text-lg">Image Details</Label>
          <Label className="text-xs">Source</Label>
          <Input
            className="mb-2"
            value={editedSrc}
            onChange={(e) => setEditedSrc(e.target.value)}
            placeholder="Image source URL"
          />
          <Label className="text-xs">Title</Label>
          <Input
            className="mb-2"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Image title"
          />
          <Label className="text-xs">Link</Label>
          <Input
            className="mb-2"
            value={editedUrl}
            onChange={(e) => setEditedUrl(e.target.value)}
            placeholder="Link for Title (optional)"
          />
          <Button variant="secondary" onClick={handleSave} className="w-full">
            Save
          </Button>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      className={`relative group w-full flex pt-5 pb-10 justify-${alignment}`}
    >
      <ResizableBox
        width={responsiveSize.width}
        height={responsiveSize.height}
        onResize={onResize}
        onResizeStop={onResize}
        lockAspectRatio={true}
        resizeHandles={["se"]}
        minConstraints={[100, 100]}
        maxConstraints={[1000, 1000]}
        className="transition-all duration-200 ease-in-out group-hover:shadow-lg"
      >
        <div className="relative">
          <img
            src={props.node.attrs.src}
            alt={props.node.attrs.alt}
            title={props.node.attrs.title}
            width={responsiveSize.width}
            height={responsiveSize.height}
            className="w-full h-full object-contain rounded-lg transition-all duration-200 ease-in-out border border-foreground dark:border-2 m-0"
          />

          {/* Edit button */}
          <button
            className="hidden group-hover:flex absolute top-0 right-0 w-8 h-8 bg-black/50 cursor-pointer rounded-tr-lg rounded-bl-md items-center justify-center"
            onClick={toggleEditMode}
          >
            <span className="text-white text-xs">
              <Settings className="w-6 h-6 flex-none" strokeWidth={1} />
            </span>
          </button>
          {!isEditing && props.node.attrs.title && (
            <div className="absolute -bottom-[3rem] text-sm left-1/2 transform -translate-x-1/2 cursor-pointer">
              <div className="flex items-center gap-2 text-nowrap">
                {editedTitle && <p>{editedTitle}</p>}
                {editedUrl && (
                  <Link href={editedUrl} target="_blank">
                    <ExternalLink className="w-4 h-4 flex-none" />
                  </Link>
                )}
              </div>
            </div>
          )}
          {isEditing && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[300px] bg-background p-2 border border-border rounded-lg shadow-lg items-start">
              <Label className="text-xs">Title</Label>
              <Input
                className="mb-2"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Image title"
              />
              <Label className="text-xs">Image source</Label>
              <Input
                className="mb-2"
                value={editedSrc}
                onChange={(e) => setEditedSrc(e.target.value)}
                placeholder="Image source URL"
              />
              <Label className="text-xs">Link</Label>
              <Input
                className="mb-2"
                value={editedUrl}
                onChange={(e) => setEditedUrl(e.target.value)}
                placeholder="Link URL (optional)"
              />

              <Label className="text-xs">Alignment</Label>
              <ToggleGroup
                type="single"
                variant="outline"
                value={alignment}
                onValueChange={(value) => value && handleAlignmentChange(value)}
                className="mb-2 items-start justify-start"
              >
                <ToggleGroupItem value="start" size="sm">
                  <AlignStartVertical className="w-4 h-4 flex-none" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" size="sm">
                  <AlignCenterVertical className="w-4 h-4 flex-none" />
                </ToggleGroupItem>
                <ToggleGroupItem value="end" size="sm">
                  <AlignEndVertical className="w-4 h-4 flex-none" />
                </ToggleGroupItem>
              </ToggleGroup>
              <Label className="text-xs">Size</Label>
              <Slider
                className="mt-4 mb-6"
                min={0}
                max={200}
                step={1}
                value={[scale]}
                onValueChange={handleScaleChange}
              />
              {props.node.attrs.width}
              <Button
                variant="secondary"
                onClick={handleSave}
                className="w-full"
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </ResizableBox>
    </NodeViewWrapper>
  );
};
