import Link from "next/link";

import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";

const content = `
<h1>Exciting New Feature: Image Support in Our WYSIWYG Editor!</h1>
<p>
  We're thrilled to announce a powerful new addition to our WYSIWYG editor:
  seamless image integration! This update brings a host of user-friendly
  features to enhance your content creation experience.
</p>
<tiptap-resizable-image-component
  src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTA0d25xbnRiMnh3dGpsNnRxczI2dTZhemwwd2hhMHVjNG84eWVidCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKMgPXCR4NRzYek/giphy.webp"
  title="GIFs in a Document?!  Amazing!"
  width="666"
  height="458"
></tiptap-resizable-image-component>
<h2>Key Features</h2>
<h3>Easy Image Insertion</h3>
<ul>
  <li>
    <p>
      Access the new image block from the block selector and provide a url of
      the image
    </p>
  </li>
  <li><p>Even supports GIFs</p></li>
  <li><p>Or, simply paste images directly from your clipboard</p></li>
</ul>
<h3>Customization Options</h3>
<ul>
  <li><p>Set image URLs, Titles, and optional Links</p></li>
  <li>
    <p>Resize images effortlessly with the drag-and-drop corner handle</p>
  </li>
  <li>
    <p>
      Change your mind, just click the settings to edit your URL, Title or Link!
    </p>
  </li>
</ul>
<h2>How It Works</h2>
<tiptap-resizable-image-component
  src="https://i.postimg.cc/wTGCMr2K/WYSIWYG-AI-Upload-Image.gif"
  title="How I Added This GIF To This Document!"
  width="666"
  height="459"
></tiptap-resizable-image-component>
<ol>
  <li><p>Click the image block in the selector</p></li>
  <li>
    <p>Choose your preferred method of image insertion:</p>
    <ul>
      <li><p>Enter an image URL</p></li>
      <li><p>Paste from clipboard</p></li>
      <li><p>Select from available media</p></li>
    </ul>
  </li>
  <li><p>Add a title and optional link</p></li>
  <li><p>Adjust the size as needed</p></li>
  <li><p>Refine settings using the top-right menu</p></li>
</ol>
<h2>Why You'll Love It</h2>
<p>
  This new feature streamlines the process of adding visual elements to your
  content, making it easier than ever to create engaging and
  professional-looking documents.
</p>
<p>
  We're excited for you to try out this new functionality and see how it
  enhances your workflow. Happy editing!
</p>

`;

export default async function Home() {
  return (
    <div>
      <div className="px-4 pb-10">
        <div className="max-w-4xl mx-auto">
          <TipTapEditor initialContent={content} />
        </div>
      </div>
    </div>
  );
}
