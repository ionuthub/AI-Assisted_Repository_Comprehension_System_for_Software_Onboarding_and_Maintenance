# 🎓 AI Code Tutor - Enterprise AI Intelligence

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE.md)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![Gemini](https://img.shields.io/badge/Gemini%202.0-8E75B2?style=flat&logo=google-cloud&logoColor=white)](https://deepmind.google/technologies/gemini/)

**AI Code Tutor** is a production-grade educational platform designed to deconstruct complex codebases into human-readable logic. Built for developers of all skill levels, it leverages High-Performance AI to provide context-aware explanations, architecture reviews, and project generation.

---

## 🚀 Key Capabilities

- **Neural Repo Analysis**: Connect any GitHub repository and get a deep structural breakdown.
- **Adaptive Explanations**: Toggle between Beginner, Intermediate, and Advanced insights.
- **AI Project Architect**: Describe an idea and generate a full enterprise-ready starter project.
- **Secure File Navigation**: Explore files with real-time complexity detection and line-by-line reasoning.

---

## 📖 Documentation Hub

We maintain high enterprise documentation standards. Please refer to the specialized docs for deeper technical insights.

### 🏛 Core Standards (Root)
- [**Architecture & ADR**](ARCHITECTURE.md) - System design and technical decision logs.
- [**Product Specifications**](PRODUCT_SPECS.md) - Audience, requirements, and 2026 roadmap.
- [**Security Policy**](SECURITY.md) - Data handling and API security measures.
- [**Contributing Guide**](CONTRIBUTING.md) - Code style and PR requirements.
- [**Changelog**](CHANGELOG.md) - Version history and notable updates.

### 📁 Technical Guides (`/docs/guides`)
- [Deployment Guide](docs/guides/deployment-guide.md)
- [Vercel Deployment](docs/guides/vercel-deployment.md)
- [Icon Usage (Lucide)](docs/guides/icon-usage.md)
- [Optimal Learning Approach](docs/guides/learning-approach.md)

### 📊 Reports & Analysis (`/docs/reports`)
- [Codebase Analysis Summary](docs/reports/codebase-analysis.md)
- [Performance Optimization Report](docs/reports/performance-optimization.md)
- [Flagship Upgrade Report](docs/reports/flagship-upgrade.md)
- [Logic Analysis](docs/reports/logic-analysis.md)

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Shadcn/UI, Framer Motion
- **AI**: Google Gemini 2.0 Flash (Edge Runtime)
- **Backend**: Vercel Edge Functions
- **Database**: Supabase (User Profiles & Auth)
- **i18n**: i18next (English, Romanian)

---

## 💻 Getting Started

### Prerequisites
- Node.js 18+ 
- NPM / Bun
- [Gemini API Key](docs/setup/gemini-api-setup.md)
- [GitHub Access Token](docs/setup/github-token-setup.md)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/ai-code-tutor.git

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🔒 Security
No secrets are stored on the client side. All AI interactions are proxied through secure Vercel Edge functions with server-side rate-limiting. For more details, see [SECURITY.md](SECURITY.md).

## 📄 License
Distributed under the MIT License. See [LICENSE.md](LICENSE.md) for more information.

---
*Built with ❤️ for the global developer community.*
