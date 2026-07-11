# 🎓 Repository Comprehension System

**Design and Evaluation of an AI-Assisted Repository Comprehension System for Software Onboarding and Maintenance**

This repository contains the software artefact for the Computer Science dissertation. It is designed to assist software developers in onboarding and maintaining JavaScript/TypeScript repositories.

---

## Deployment
Run locally with `npm install && npm run dev`, or see the deployment link in the dissertation report.

---

## 🚀 Key Capabilities

- **Repository Overview**: Detects technologies and frameworks, displaying critical files, components, and functions count.
- **Architecture & Dependency Mapping**: Parses folder structure and import/export relationships to render an interactive dependency graph.
- **Semantic Repository Search**: Fast, client-side TF-IDF vector similarity queries for natural-language search over files and code snippets.
- **Grounded Repository Q&A**: Natural language Q&A grounded in codebase context (RAG) using Gemini 2.0 to explain file roles and design details.

---



---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI, Framer Motion
- **Static Analysis**: Custom AST-like import/export parser, file tokenizer, and folder tree builder.
- **RAG & Search**: Local TF-IDF index matching + Google Gemini 2.0 Flash (Edge Runtime proxy).
- **Backend/Hosting**: Vercel Serverless Functions

---

## 💻 Getting Started

### Prerequisites

- Node.js 18+
- NPM
- Google Gemini API Key (configured in environment variables for Q&A function)

### Installation

```bash
# Clone the repository
git clone https://github.com/ionuthub/AI-Code-Tutor.git

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔒 Security

No API secrets are stored on the client side. All model interactions are proxied through secure Vercel Serverless functions.

---

_Built as a dissertation research project._

## Provenance and AI Disclosure

The initial codebase was substantially developed with an AI agentic coding tool (Google Antigravity), then configured, debugged, tested and adapted by the author for this dissertation. All AI assistance, including subsequent AI-assisted auditing and refactoring, is disclosed in the dissertation's AI Declaration. The evaluation study design and all research data are the author's own work.
