# WYSIWYG-AI

WYSIWYG-AI is an open-source, AI-powered rich text editor built on top of Tiptap. It combines the power of a modern WYSIWYG editor with cutting-edge AI capabilities to enhance the content creation experience.

## Features

- Rich text editing powered by Tiptap
- AI-assisted content generation using Llama 3.1 70B (via Groq) and Claude 3.5 Sonnet
- Image support with resizing capabilities
- Code block highlighting
- Task lists
- Real-time collaboration (TBA)
- Markdown import/export
- Customizable UI with Tailwind CSS and shadcn/ui

## Tech Stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Tiptap editor
- Supabase for authentication and database
- Groq API for Llama 3.1 70B integration
- Anthropic API for Claude 3.5 Sonnet integration

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables (see `.env.example`)
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## AI Integration

WYSIWYG-AI currently supports two AI models:

1. Llama 3.1 70B (via Groq): Used to test the speed and performance of Meta's latest open-source model.
2. Claude 3.5 Sonnet: Implemented for its superior performance and capabilities.

To use the AI features, refer to the "How to Use AI" section in the application.

## Contributing

We welcome contributions to WYSIWYG-AI! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tiptap](https://tiptap.dev/) for the core editor functionality
- [Groq](https://groq.com/) for providing access to Llama 3.1 70B
- [Anthropic](https://www.anthropic.com/) for Claude 3.5 Sonnet
- [Vercel](https://vercel.com/) for hosting and deployment

## Roadmap

For upcoming features and improvements, check out our [Road Map](https://wysiwyg-ai.com/road-map).

## Contact

For questions or feedback, please open an issue on this repository or contact the maintainer at [your-email@example.com].
