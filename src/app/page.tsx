import SiteHeader from "@/components/site-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/site-footer";
import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";

const content = `
<h1>Welcome to my implementation of TipTap Rich Text Editor!</h1>

<p>This is a <strong>powerful</strong> and <em>flexible</em> editor with a wide range of features. Let's explore some of its capabilities:</p>

<h2>Text Formatting</h2>

<p>You can make text <strong>bold</strong>, <em>italic</em>, or <s>strikethrough</s>. You can also use <code>inline code</code> for technical terms.</p>

<h2>Headings</h2>

<h1>This is a Level 1 Heading</h1>
<h2>This is a Level 2 Heading</h2>
<h3>This is a Level 3 Heading</h3>
<h4>This is a Level 4 Heading</h4>
<h5>This is a Level 5 Heading</h5>

<h2>Lists</h2>

<h3>Bullet List</h3>
<ul>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</ul>

<h3>Ordered List</h3>
<ol>
  <li>First step</li>
  <li>Second step</li>
  <li>Third step</li>
</ol>

<h3>Task List</h3>
<ul data-type="taskList">
  <li data-type="taskItem" data-checked="true">Completed task</li>
  <li data-type="taskItem" data-checked="false">Pending task</li>
  <li data-type="taskItem" data-checked="false">Another pending task</li>
</ul>

<h2>Quotes and Code Blocks</h2>

<blockquote>
  <p>This is a blockquote. It's perfect for emphasizing important information or citing sources.</p>
</blockquote>

<pre><code class="language-javascript">function greet(name) {
  console.log(hello Joe!);
}

greet('TipTap User');</code></pre>

<h2>Text Alignment</h2>

<p style="text-align: left">This text is aligned to the left (default).</p>
<p style="text-align: center">This text is centered.</p>
<p style="text-align: right">This text is aligned to the right.</p>

<h2>Colors and Highlighting</h2>

<p><span style="color: #e11d48;">This text is in rose color.</span></p>
<p><span style="color: #7c3aed;">This text is in violet color.</span></p>
<p><mark style="background-color: #10b981;">This text has an emerald highlight.</span></p>
<p><mark style="background-color: #f59e0b;">This text has an amber highlight.</span></p>

<h2>Links</h2>

<p>You can add <a href="https://tiptap.dev/">links to external websites</a> or internal references.</p>

<hr>

<p>Feel free to experiment with these features and discover the full potential of the TipTap editor!</p>

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
  <li data-type="taskItem" data-checked="false">Add floating menu</li>
  <li data-type="taskItem" data-checked="false">Add dark mode and light mode for text color and highlight colors</li>
  <li data-type="taskItem" data-checked="false">Add AI features</li>
  <li data-type="taskItem" data-checked="false">Add option to copy all content as Markdown or HTML</li>
  <li data-type="taskItem" data-checked="false">Add export functionality to PDF, MS Word, or TXT</li>
  <li data-type="taskItem" data-checked="false">Add ability to paste in Markdown or HTML</li>
  <li data-type="taskItem" data-checked="false">Add feature to retrieve AI-generated images</li>
  <li data-type="taskItem" data-checked="false">Experiment with custom components (e.g., a button)</li>
</ul>
`;

export default async function Home() {
  return (
    <main className=" max-w-7xl mx-auto min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
      <nav className="">
        <SiteHeader />
      </nav>
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
        <section className="mb-[5rem]">
          <TipTapEditor initialContent={content} />
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
