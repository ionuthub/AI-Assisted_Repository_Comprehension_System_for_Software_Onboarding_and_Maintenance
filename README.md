# 🎓 Repository Comprehension System

**Design and Evaluation of an AI-Assisted Repository Comprehension System for Software Onboarding and Maintenance Tasks**

This repository contains the software artefact for the Computer Science dissertation. It is designed to assist software developers in onboarding and maintaining JavaScript/TypeScript repositories.

---

## Link to the website
https://rig.ai/

---

## 🚀 Key Capabilities

- **Repository Overview**: Detects technologies and frameworks, displaying critical files, components, and functions count.
- **Architecture & Dependency Mapping**: Parses folder structure and import/export relationships to render an interactive dependency graph.
- **Semantic Repository Search**: Fast, client-side TF-IDF vector similarity queries for natural-language search over files and code snippets.
- **Grounded Repository Q&A**: Natural language Q&A grounded in codebase context (RAG) using Gemini 2.0 to explain file roles and design details.

---

## 🏛 Documentation Hub

We maintain documentation standards. Please refer to the specialized docs for technical insights.

### 🏛 Core Standards (Root)

- [**Architecture & ADR**](ARCHITECTURE.md) - System design and technical decision logs.
- [**Product Specifications**](PRODUCT_SPECS.md) - Audience and core requirements.
- [**Security Policy**](SECURITY.md) - Data handling and API security measures.
- [**Contributing Guide**](CONTRIBUTING.md) - Code style and PR requirements.
- [**Changelog**](CHANGELOG.md) - Version history.

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

No API secrets are stored on the client side. All model interactions are proxied through secure Vercel Serverless functions. For more details, see [SECURITY.md](SECURITY.md).

---

_Built as a dissertation research project._
