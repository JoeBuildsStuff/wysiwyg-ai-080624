import Link from "next/link";

import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";

const content = `
<h1>Transforming the Way You Write: Your AI Writing Assistant</h1>
<blockquote>
  <h3>
    <strong
      >Our Latest Release: AskAI, Reference Context, and Web Content
      Retrieval</strong
    >
  </h3>
</blockquote>
<p>
  In our initial launch on August 7th, 2024, we introduced a clean, simple
  WYSIWYG editor built on the open-source TipTap framework. Now, we're taking
  another step forward by integrating cutting-edge AI technology to
  revolutionize your writing experience.
</p>
<p>I know, you came for the minimal WYSIWYG Editor and added AI?!</p>
<tiptap-resizable-image-component
  src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExOW8xbHI2YW11MjYydHQ4Nm04c24yN2UwdHJrYnRzcnAyY2YwbXZyZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/8YPPmTLsPnjJsDCwl8/giphy.gif"
  title=""
  width="758"
  height="427"
  alignment="center"
></tiptap-resizable-image-component>
<p>
  Our latest update harnesses the power of Meta's Llama 3.1 70B model, accessed
  through Groq's lightning-fast APIs. Why this particular combination? It's
  simple: we wanted to provide you with the most intelligent, responsive AI
  writing assistant possible.
</p>
<p>Here's what makes our new features stand out:</p>
<ol>
  <li>
    <p>
      <strong>Unparalleled Speed</strong>: Thanks to Groq's incredible inference
      speeds, you'll receive AI-generated responses almost instantly. No more
      waiting 30, 45, or 60 seconds for the LLM to complete its task.
    </p>
  </li>
  <li>
    <p>
      <strong>State-of-the-Art Intelligence</strong>: Llama 3.1 70B is currently
      the best open-source model available, outperforming competitors across
      numerous benchmarks. This isn't just a marginal improvement over
      spell-check; it's a leap into genuine AI-assisted writing.
    </p>
  </li>
  <li>
    <p>
      <strong>Completely Free</strong>: While we appreciate the quality of paid
      models, we wanted to create a solution that serves everyone. By offering
      these powerful AI features at no cost, we're removing barriers and
      democratizing access to advanced writing tools.
    </p>
  </li>
</ol>
<p>
  Get ready to experience a new era of content creation. Whether you're battling
  writer's block, seeking inspiration, or looking to enhance your productivity,
  our AI-powered platform is here to help you transform your ideas into
  polished, professional writing. Read on to discover how we've integrated these
  game-changing features and how you can leverage them in your writing process.
</p>
<p>Enough talking... show us the AI!</p>
<tiptap-resizable-image-component
  src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTRlMGVna296MGtmOXdmcjlyb3V6eWhtaWx6dTd0ODRyb2RtZWk4YiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/aFfK0CJ6OQg5fP84zL/giphy.gif"
  title=""
  width="758"
  height="411"
  alignment="center"
></tiptap-resizable-image-component>
<hr />
<h1>TLDR</h1>
<p>
  Our latest update introduces powerful AI-driven features to transform your
  writing experience:
</p>
<ol>
  <li>
    <p>
      <strong>AskAI</strong>: Harness the intelligence of Meta's Llama 3.1 70B
      model through Groq's ultra-fast APIs.
    </p>
    <ul>
      <li><p>Generate high-quality content instantly</p></li>
      <li><p>Overcome writer's block with AI-powered suggestions</p></li>
      <li><p>Seamlessly integrate AI assistance into your writing flow</p></li>
    </ul>
  </li>
  <li>
    <p>
      <strong>Reference Context</strong>: Enhance AI understanding with custom
      context.
    </p>
    <ul>
      <li>
        <p>Upload reference files for more accurate, tailored AI responses</p>
      </li>
      <li>
        <p>Improve AI performance on specialized or proprietary topics</p>
      </li>
      <li><p>Toggle reference inclusion for flexible AI assistance</p></li>
    </ul>
  </li>
  <li>
    <p>
      <strong>Web Content Retrieval</strong>: Powered by Jina AI technology.
    </p>
    <ul>
      <li>
        <p>Easily fetch and process web content by simply pasting URLs</p>
      </li>
      <li>
        <p>Automatically clean and structure web content for AI processing</p>
      </li>
      <li>
        <p>Enhance research capabilities with intelligent content extraction</p>
      </li>
    </ul>
  </li>
</ol>
<p>Key Benefits:</p>
<ul>
  <li><p>Lightning-fast responses (near-instantaneous)</p></li>
  <li><p>State-of-the-art AI model (Llama 3.1 70B)</p></li>
  <li><p>Completely free access to advanced writing tools</p></li>
</ul>
<p>
  Whether you're a professional writer, a developer documenting code, or anyone
  looking to enhance their writing productivity, our AI-powered platform offers
  the tools you need to bring your ideas to life more efficiently than ever
  before.
</p>
<tiptap-resizable-image-component
  src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWVidjJzcHNkNWNxcDc4c3ZqYTBwMXB5cDV3Y3dua250c3Z4Y2UyZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uRb2p09vY8lEs/giphy.webp"
  title=""
  width="761"
  height="437"
  alignment="center"
></tiptap-resizable-image-component>
<hr />
<h1>AskAI Feature</h1>
<p>
  The AskAI feature is a powerful new addition to the platform that allows users
  to seamlessly integrate artificial intelligence into their writing process. By
  leveraging the advanced capabilities of Meta's Llama 3.1 70B model through
  Groq's lightning-fast APIs, AskAI provides intelligent, context-aware
  assistance to enhance your writing experience.
</p>
<tiptap-resizable-image-component
  src="https://i.postimg.cc/T3fF1W5b/wysiwyg-ai-askai.gif"
  title="How AskAI Works!"
  width="768"
  height="429"
  alignment="center"
></tiptap-resizable-image-component>
<h3>How It Works</h3>
<p>Using AskAI is simple and intuitive:</p>
<ol>
  <li>
    <p>
      Simple create a new line and you'll see a popup to type in your request to
      Llama 3.1 70B
    </p>
  </li>
  <li><p>Type your request or question</p></li>
  <li>
    <p>
      Once you click create your message is sent, and after a brief delay, the
      returned text will be highlighted in the editor.
    </p>
  </li>
  <li><p>Thats it.</p></li>
  <li>
    <p>
      But give it a once over, and edit the content, delete and start over or
      keep going and continue the next section.
    </p>
  </li>
</ol>
<h3>Key Benefits</h3>
<ul>
  <li>
    <p>
      <strong>Generate high-quality content with minimal input</strong>: Whether
      you need a paragraph on a specific topic or ideas for your next section,
      AskAI can quickly produce relevant content to get you started.
    </p>
  </li>
  <li>
    <p>
      <strong>Overcome writer's block</strong>: When you're stuck, AskAI can
      provide suggestions, outlines, or even complete sections to help you move
      forward.
    </p>
  </li>
  <li>
    <p>
      <strong>Seamless integration</strong>: Type freely and then ask the AI to
      continue or expand on your thoughts, maintaining a natural flow in your
      writing process.
    </p>
  </li>
  <li>
    <p>
      <strong>Research assistant and idea generator</strong>: Use AskAI to
      explore new angles, find relevant information, or brainstorm ideas related
      to your topic.
    </p>
  </li>
  <li>
    <p>
      <strong>Flexible planning tool</strong>: Ask AskAI for a 5-step plan on
      any topic to help structure your writing, then fill in the sections as you
      go.
    </p>
  </li>
</ul>
<h3>Pro Tip: Maximizing AskAI's Potential</h3>
<p>
  One effective strategy for using AskAI is to start by asking it to generate an
  outline or plan for your document. For example:
</p>
<ol>
  <li>
    <p>
      Upload any relevant reference files to provide context (see the Reference
      Context feature below)
    </p>
  </li>
  <li>
    <p>
      Ask AskAI: "Give me 5 options for a title to elaborate on the new AI
      features in the code, and then give me 3 intro paragraphs."
    </p>
  </li>
  <li>
    <p>
      Once you have your title and intro, ask AskAI for an outline in bullet
      point form
    </p>
  </li>
  <li><p>Finally, request complete sections based on the bullet points</p></li>
</ol>
<p>
  This approach allows you to quickly generate a structured framework for your
  document, which you can then refine and expand upon with your own expertise
  and creativity.
</p>
<p>
  By integrating AskAI into your writing workflow, you'll find that complex
  writing tasks become more manageable, your productivity increases, and your
  content quality improves. Whether you're a seasoned writer or just getting
  started, AskAI is here to support and enhance your writing process every step
  of the way.
</p>
<h1>Reference Context Sheet</h1>
<p>
  Now, beyond simply typing in a request, we can give the AI additional context
  or rather reference material.
</p>
<p>
  You'll notice in the AskAI popup, there are 2 toggle buttons, to include the
  contents of the document but also reference content. Think of this as
  reference material used to write the content. Whatever you have floating in
  the back of your head is great context for the AI too. This context can be
  other files, or even content on the web. And this is how we can share it with
  the AI to improve the AI's ability to assist.
</p>
<p>
  For instance, lets say we want to re-write our Resume for a Job Posting? Welp,
  lets share our current Resume and Job Posting with the AI before requesting a
  new draft of our resume...
</p>
<tiptap-resizable-image-component
  src="https://i.postimg.cc/zXhCHtYb/2024-08-13-23-11-58.gif"
  title="Additional reference context helps!"
  width="768"
  height="428"
  alignment="center"
></tiptap-resizable-image-component>
<p></p>
<h3>How It Works</h3>
<ol>
  <li>
    <p>
      <strong>Adding Reference Files</strong>: Users can easily add reference
      files to provide context for AskAI. This can be done by:
    </p>
    <ul>
      <li>
        <p>
          First toggle the reference sheet slide out by clicking the AI Circuit
          next to the Model Name
        </p>
      </li>
      <li>
        <p>
          There you will see a space to drag and drop files or click to select
          files from your computer
        </p>
      </li>
      <li>
        <p>
          But we didn't stop there, thanks to the great team at Jina AI you can
          simply past in a url and let Jina AI retrieve the content for you?!
          Yup, that simple.
        </p>
      </li>
      <li>
        <p>
          Each file loaded successfully will appear as its on Reference Context
          Icon
        </p>
      </li>
      <li>
        <p>You can also select the icons to review what each file contains</p>
      </li>
    </ul>
  </li>
</ol>
<h3>Key Benefits</h3>
<ul>
  <li>
    <p>
      <strong>Improved Accuracy</strong>: The more context and guidance you
      provide to the language model, the better its output will align with your
      expectations.
    </p>
  </li>
  <li>
    <p>
      <strong>Versatility</strong>: While you can ask the AI for random
      information, adding specific context (like a Wikipedia article or your own
      content) significantly enhances its ability to provide tailored responses.
    </p>
  </li>
  <li>
    <p>
      <strong>Specialized Knowledge</strong>: When dealing with proprietary or
      niche content, traditional AI models may lack specific knowledge. For
      example, this blog discusses an application launched in August 2024 and
      delves into its code structure. By allowing the AI to access pertinent
      files (such as source code), you ensure it can provide precise and current
      insights about particular features or functionalities.
    </p>
  </li>
</ul>
<h3>Use Cases</h3>
<ol>
  <li>
    <p>
      <strong>Research Assistance</strong>: Drop in academic papers or articles
      to help the AI understand complex topics.
    </p>
  </li>
  <li>
    <p>
      <strong>Content Creation</strong>: Provide source materials or outlines to
      guide the AI in generating cohesive content.
    </p>
  </li>
  <li>
    <p>
      <strong>Code Documentation</strong>: Upload code files to help the AI
      generate accurate documentation or explanations.
    </p>
  </li>
  <li>
    <p>
      <strong>Fact-Checking</strong>: Include authoritative sources to ensure
      the AI's responses are grounded in accurate information.
    </p>
  </li>
</ol>
<h3>Pro Tips</h3>
<ul>
  <li>
    <p>
      <strong>Diverse Sources</strong>: Include a variety of reference materials
      to give the AI a well-rounded understanding of the topic.
    </p>
  </li>
  <li>
    <p>
      <strong>Combine with AskAI</strong>: Use the Reference Context Sheet in
      conjunction with AskAI for the most powerful and accurate results.
    </p>
  </li>
</ul>
<p>
  And there ya go, give it a shot. Do a comparison, with or without the context
  turned on and compare the results. We thinking you'll notice a difference!
</p>
<p>
  By incorporating the Reference Context feature into your writing workflow,
  you'll unlock a new level of collaboration between yourself and the AI. This
  powerful tool allows you to provide the language model with the specific
  guidance and context it needs to deliver accurate, relevant, and high-quality
  responses.
</p>
<tiptap-resizable-image-component
  src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGhodzF4ODdkb2F3NGExOGIwczl6Z255bG54cGMyYXMwbDNzMHlvdSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/cR364IczWXiq4/giphy.webp"
  title="What the WYSIWYG Editor Said to AI?"
  width="760"
  height="413"
  alignment="center"
></tiptap-resizable-image-component>
<h1>Conclusion</h1>
<p>
  As we wrap up our exploration of the latest AI-powered features in our writing
  platform, let's recap the game-changing tools now at your fingertips:
</p>
<ol>
  <li>
    <p>
      <strong>AskAI</strong>: Leveraging the Llama 3.1 70B model through Groq's
      lightning-fast APIs, this feature provides instant, intelligent assistance
      for all your writing needs.
    </p>
  </li>
  <li>
    <p>
      <strong>Reference Context Sheet</strong>: Enhance the AI's understanding
      by providing relevant documents, code, or web content, leading to more
      accurate and tailored responses.
    </p>
  </li>
  <li>
    <p>
      <strong>Jina AI Integration</strong>: Seamlessly retrieve and process web
      content, expanding your research capabilities and enriching your writing
      with up-to-date information.
    </p>
  </li>
</ol>
<p>
  These features represent a significant leap forward in AI-assisted content
  creation. They're designed not just to make writing easier, but to transform
  the entire process of ideation, research, and composition.
</p>
<h3>The Power is in Your Hands</h3>
<p>
  We're excited to see how you'll harness these tools to bring your ideas to
  life. Whether you're a seasoned writer looking to boost productivity, a
  developer documenting complex code, or someone who's always struggled to put
  thoughts into words, our AI-powered platform is here to support you.
</p>
<h3>A New Era of Writing</h3>
<p>
  The barriers to creating high-quality, well-researched content have never been
  lower. With our latest release, we're not just providing tools; we're opening
  doors to new possibilities in content creation.
</p>
<h3>Your Ideas Matter</h3>
<p>
  In today's interconnected world, sharing ideas is more important than ever.
  Your unique perspective, expertise, and creativity deserve to be heard. Our
  platform is designed to help you overcome the challenges of writing and focus
  on what truly matters - your ideas.
</p>
<h3>The Future is Collaborative</h3>
<p>
  As we look to the future, we see a world where human creativity and AI
  capabilities work in harmony. Our platform is just the beginning of this
  exciting journey. We're committed to continually improving and expanding our
  features to meet your evolving needs.
</p>
<h3>Get Started Today</h3>
<p>
  There's never been a better time to start writing, sharing, and creating.
  Whether you're crafting a blog post, developing documentation, or working on
  the next great novel, our AI-powered tools are here to support you every step
  of the way.
</p>
<p>
  Don't let your ideas remain unwritten. Embrace the power of AI-assisted
  writing and let your creativity soar. The world is waiting for your
  contribution - what will you create today?
</p>
<hr />
<blockquote>
  <h1><em>Unsolicited Shoutout to Jina AI - Because I like it!</em></h1>
</blockquote>
<p>
  We wanted to expand on the integration with Jina AI if only to really
  highlight and tip our hat to that team. We have no affiliation with them, but
  I just really like their technology so wanted to give them a special shout out
  here...
</p>
<p>
  One of the most exciting features of our latest release is the integration of
  Jina AI's powerful web content retrieval capabilities. This addition
  significantly enhances our platform's ability to gather and process
  information from the internet, making it an invaluable tool for content
  creators, researchers, and developers alike. To save files to my harddrive and
  then reupload was such a pain, if only we could retrieve the content
  accessible on the web. Enter Jina AI for the win!
</p>
<h3>What is Jina AI?</h3>
<p>
  Jina AI is a cutting-edge AI company that specializes in developing tools for
  neural search and content processing. Their Reader API, which we've integrated
  into our platform, is a game-changer for retrieving web content in a format
  that's optimized for AI processing.
</p>
<h3>How Jina AI Enhances Our Platform</h3>
<ol>
  <li>
    <p>
      <strong>Effortless Web Content Retrieval</strong>: With Jina AI's
      technology, users can now easily fetch content from any web page by simply
      pasting a URL. This eliminates the need for complex web scraping
      techniques, making information gathering a breeze.
    </p>
  </li>
  <li>
    <p>
      <strong>Clean, AI-Ready Output</strong>: The Reader API doesn't just grab
      raw HTML; it intelligently extracts the main content, removing clutter
      like ads, navigation menus, and irrelevant sidebars. This results in
      clean, structured text that's perfect for further AI processing or human
      reading.
    </p>
  </li>
  <li>
    <p>
      <strong>Image Captioning</strong>: One of the standout features is the
      ability to automatically caption images found on web pages. This adds an
      extra layer of context to visual content, making it accessible to
      text-based AI models.
    </p>
  </li>
  <li>
    <p>
      <strong>PDF Support</strong>: The Reader API can even extract content from
      PDF files hosted online, expanding the range of accessible information
      sources.
    </p>
  </li>
  <li>
    <p>
      <strong>Search Capabilities</strong>: Beyond single URL processing, the
      integration allows for web searches, returning the top results in a clean,
      AI-friendly format.
    </p>
  </li>
</ol>
<h3>Why This Matters for Developers and Users</h3>
<p>
  The integration of Jina AI's technology is particularly exciting for solo
  developers and small teams. It democratizes access to advanced web content
  retrieval and processing capabilities that were previously only available to
  larger organizations with significant resources. This levels the playing
  field, allowing innovative applications to be built more easily and quickly.
</p>
<p>
  For end-users, this means access to more powerful, information-rich
  applications. Whether it's a research tool, a content aggregator, or an
  AI-powered writing assistant, the ability to quickly and accurately pull
  relevant information from the web enhances the overall user experience.
</p>
<h3>Looking Forward</h3>
<p>
  By incorporating Jina AI's technology, we're not just adding a feature; we're
  opening up a world of possibilities. This integration sets the stage for more
  advanced AI-driven functionalities in the future, potentially including
  improved content summarization, multi-lingual support, and even more
  sophisticated search and retrieval capabilities.
</p>
<p>
  We can't wait to see the innovative ways in which it will be used to create
  valuable, information-driven applications. We're thrilled to bring this
  powerful tool to our users (which as of this writing is an impressive ONE! -
  including the creator).
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
