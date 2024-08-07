import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'WYSIWYG-AI | AI-Powered Visual Editor',
  description: 'Create beautiful content effortlessly with our AI-powered WYSIWYG editor. Design, write, and publish with ease.',
  keywords: ['WYSIWYG', 'AI', 'visual editor', 'content creation', 'artificial intelligence'],
  authors: [{ name: 'WYSIWYG-AI Team' }],
  openGraph: {
    title: 'WYSIWYG-AI: Revolutionize Your Content Creation',
    description: 'Experience the future of content creation with our AI-powered WYSIWYG editor. Design stunning visuals and write compelling content in minutes.',
    url: 'https://wysiwyg-ai.com',
    siteName: 'WYSIWYG-AI',
    images: [
      {
        url: 'https://wysiwyg-ai.com/opengraph-image.png',
        width: 1200,
        height: 630,
        alt: 'WYSIWYG-AI Editor Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WYSIWYG-AI: AI-Powered Visual Editing Made Simple',
    description: 'Create professional-looking content in minutes with our intuitive, AI-driven WYSIWYG editor.',
    creator: '@wysiwygai',
    images: ['https://wysiwyg-ai.com/opengraph-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    // apple: '/apple-touch-icon.png',
  },
//   verification: {
//     google: 'your-google-site-verification-code',
//     yandex: 'your-yandex-verification-code',
//     bing: 'your-bing-verification-code',
//   },
other: {
    'application-name': 'WYSIWYG-AI'
  }
}

