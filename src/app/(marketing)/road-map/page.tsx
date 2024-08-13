import Link from "next/link";

import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";

const content = `
<h2>Future Improvements Checklist</h2>

<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true">Add word count and character count</li>
    <li data-type="taskItem" data-checked="true">Make the fixed menu sticky</li>
  <li data-type="taskItem" data-checked="true">Add code highlighting</li>
  <li data-type="taskItem" data-checked="true">Add button to copy code snippets from code blocks</li>
  <li data-type="taskItem" data-checked="true">Add toggle for syntax to use in code blocks</li>
  <li data-type="taskItem" data-checked="false">Add image support</li>
  <li data-type="taskItem" data-checked="false">Add table support</li>
  <li data-type="taskItem" data-checked="false">Add bubble menu</li>
  <li data-type="taskItem" data-checked="true">Add floating menu</li>
  <li data-type="taskItem" data-checked="false">Add dark mode and light mode for text color and highlight colors</li>
  <li data-type="taskItem" data-checked="true">Add Ability to Request AI-Generated Text</li>
  <li data-type="taskItem" data-checked="true">Add Ability to Upload Additional References</li>
  <li data-type="taskItem" data-checked="true">Add Ability to Retrieve References from URLs</li>
  <li data-type="taskItem" data-checked="true">Add Ability to Review and Read References</li>
  <li data-type="taskItem" data-checked="false">Add option to copy all content as Markdown or HTML</li>
  <li data-type="taskItem" data-checked="true">Add export functionality to TXT, MD, or HTML</li>
  <li data-type="taskItem" data-checked="false">Add ability to paste in Markdown or HTML</li>
  <li data-type="taskItem" data-checked="false">Add feature to retrieve AI-generated images</li>
  <li data-type="taskItem" data-checked="false">Experiment with custom components (e.g., a button)</li>
  <li data-type="taskItem" data-checked="true">How to get started with the AI components</li>
</ul>
`;

export default async function Home() {
  return (
    <div>
      <section className="w-full py-[5rem]">
        <div className="flex flex-col justify-center space-y-4">
          <div className="mx-3 space-y-2 lg:space-y-3 max-w-md md:max-w-2xl lg:max-w-3xl">
            <h1 className="leading-tight lg::leading-snug font-black text-5xl lg:text-7xl ">
              Welcome to my version of WYSIWYG
            </h1>
            <p className="leading-normal text-xl text-muted-foreground">
              Welp, the plan is to create a WYSIWYG editor that is easy to use
              and has a lot of features... max AI features that is.
            </p>
          </div>
          <div className="flex flex-row items-center space-x-4 pt-4">
            {/* <Button
                asChild
                variant="default"
                className="mx-3 w-40 text-lg h-12 lg:h-14 lg:rounded-lg lg:text-xl"
              >
                <Link href="/create">Get Started</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="mx-3 w-40 text-lg h-12 lg:h-14 lg:rounded-xl lg:text-xl"
              >
                <Link href="/how-to-get-started">Learn More</Link>
              </Button> */}
          </div>
        </div>
      </section>
      <div className="px-4 pb-10">
        <div className="max-w-4xl mx-auto ">
          <TipTapEditor initialContent={content} />
        </div>
      </div>
    </div>
  );
}
