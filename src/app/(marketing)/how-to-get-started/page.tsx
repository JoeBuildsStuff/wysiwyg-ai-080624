import Image from "next/image";
import Link from "next/link";

import introduction from "@/app/(marketing)/how-to-get-started/images/introduction.gif";
import { Alert } from "@/components/ui/alert";

import { metadata } from "@/lib/constants";

export default function Component() {
  const title = metadata.other?.["application-name"] || "Enter App Name";

  return (
    <div className="w-full">
      <header className="py-12 md:py-16 lg:py-20 border-b border-border">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              How to Get Started with {title}
            </h1>
            <p className="text-muted-foreground md:text-xl/relaxed">
              Your comprehensive guide to mastering AI-powered art creation and
              boosting your creativity
            </p>
          </div>
        </div>
      </header>
      <div className="container grid gap-12 px-4 py-12 md:grid-cols-[300px_1fr] md:gap-16 md:py-16 lg:py-20">
        <nav className="hidden md:block sticky top-20 self-start max-h-[calc(100vh-5rem)]  pr-4">
          <h2 className="text-base font-semibold p-4 bg-secondary/80 rounded-lg mb-4">
            IN THIS GUIDE
          </h2>
          <ul className="space-y-4 overflow-y-auto">
            {[
              {
                href: "#introduction",
                text: "Welcome to {title}",
              },
            ].map((item, index) => (
              <li key={index} className="ml-4">
                <Link
                  href={item.href}
                  className="text-sm font-medium hover:underline toc-link"
                >
                  {item.text}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="prose prose-xl max-w-3xl" id="content">
          <section id="introduction" className="scroll-mt-20">
            <h1 className="scroll-mt-20">Introduction: Welcome to {title}</h1>
            <p>Ladies and gentlemen, welcome...</p>
            <figure>
              <Image
                src={introduction}
                alt="{title} application"
                width={500}
                height={500}
                loading="lazy"
                className="rounded-lg shadow-md border border-gray-200 mx-auto"
              />
              <figcaption
                id="caption"
                className="text-center text-muted-foreground"
              >
                Type in a simple description for an image and get started!
              </figcaption>
            </figure>
          </section>
        </div>
      </div>
    </div>
  );
}
