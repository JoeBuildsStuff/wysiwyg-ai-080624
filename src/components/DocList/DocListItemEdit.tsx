import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/utils/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert } from "@/components/ui/alert";
import { Tag, TagInput } from "emblor";
import { toast } from "@/components/ui/use-toast";
import { CircleCheckBig, Trash2 } from "lucide-react";

import { Tables } from "../../../database.types";
type WysiwygDocument = Tables<"wysiwyg_documents">;

const FormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(2, {
    message: "Description must be at least 2 characters.",
  }),
  tags: z
    .array(
      z.object({
        id: z.string(),
        text: z.string(),
      })
    )
    .min(1, {
      message: "You must select at least one tag.",
    }),
});

export default function EditDocDetails({
  doc,
  onCancel,
  onSave,
}: // onDelete,
{
  doc: WysiwygDocument;
  onCancel: () => void;
  onSave: () => void;
  // onDelete: () => void;
}) {
  const supabase = createClient();
  const [tags, setTags] = useState<Tag[]>(
    doc.tags?.map((tag) => ({ id: tag, text: tag })) || []
  );
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(-1);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: doc.title,
      description: doc.description ?? "",
      tags: doc.tags?.map((tag) => ({ id: tag, text: tag })) || [],
    },
  });

  const { setValue, handleSubmit, formState } = form;

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const { error } = await supabase
        .from("wysiwyg_documents")
        .update({
          title: data.title,
          description: data.description,
          tags: data.tags.map((tag) => tag.text),
        })
        .eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your changes have been saved.",
      });

      onSave();
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your changes.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("wysiwyg_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document has been deleted.",
      });
      // onDelete();  Should consider handling in the parent component and nagivating to another page if we are
      // currently on the document page we are deleting
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "There was a problem deleting the document.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Alert>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <TagInput
                    {...field}
                    placeholder="Enter tags"
                    tags={tags}
                    className="w-full"
                    setTags={(newTags) => {
                      setTags(newTags);
                      setValue("tags", newTags as [Tag, ...Tag[]]);
                    }}
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                    inlineTags={false}
                    inputFieldPosition={"top"}
                    styleClasses={{
                      tag: {
                        body: "flex items-center gap-2 p-[.5rem] m-0 h-fit w-fit",
                        closeButton:
                          "p-0 m-0 h-fit w-fit text-muted-foreground",
                      },
                      input: "mb-2",
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-between">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="bg-background border border-destructive text-destructive hover:bg-destructive/20 "
                >
                  <Trash2 className="w-5 h-5 flex-none" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your document.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
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
                      <Trash2 className="w-5 h-5 flex-none" />
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                disabled={formState.isSubmitting}
              >
                {formState.isSubmitting ? (
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
                  <CircleCheckBig className="w-5 h-5 flex-none" />
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </Alert>
  );
}
