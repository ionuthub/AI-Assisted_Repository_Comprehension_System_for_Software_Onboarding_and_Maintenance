# Architecture Documentation - AI Code Tutor

## 🏗 System Overview

AI Code Tutor is a modern, enterprise-ready web application designed to help developers understand complex codebases using Artificial Intelligence.

### Core Stack
- **Frontend**: React 18 (TypeScript), Vite
- **Styling**: Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend**: Vercel Edge Functions (Serverless)
- **AI**: Google Gemini 2.0 Flash
- **State Management**: React Hooks, TanStack Query
- **Auth & Database**: Supabase

## 🗺 System Diagram

```mermaid
graph TD
    User((User)) --> WebApp[Vite React Application]
    WebApp --> Layout[Global Layout & Navigation]
    Layout --> LazyPages[Lazy Loaded Pages]
    LazyPages --> AI_Engine[Gemini AI Interface]
    LazyPages --> GitHub_API[GitHub API Interface]
    AI_Engine --> EdgeAPI[/api/explain-code]
    EdgeAPI --> GeminiAPI[Google Gemini API]
    GitHub_API --> Octokit[GitHub REST API]
    WebApp --> Supabase[Supabase Auth & Profiles]
```

## 🛠 Technical Decisions (ADR)

### 1. Route-based Code Splitting (Lazy Loading)
- **Decision**: All pages are lazy-loaded using `React.lazy` and `Suspense`.
- **Rationale**: Reduces the initial bundle size, improving Time to Interactive (TTI) for the landing page.
- **Status**: Implemented.

### 2. Managed Layout Pattern
- **Decision**: Use a global `<Layout />` wrapper in `App.tsx`.
- **Rationale**: Ensures UI consistency, centralizes Session management, and enables smooth page transitions.
- **Status**: Implemented.

### 3. Serverless API Proxy for AI
- **Decision**: Proxied Gemini API calls through Vercel Edge Functions.
- **Rationale**: Prevents API key exposure on the client side and allows for server-side rate limiting.
- **Status**: Implemented.

### 4. Skill-Based Prompt Engineering
- **Decision**: Dynamic system prompts based on `beginner | intermediate | advanced` levels.
- **Rationale**: Tailors the complexity and tone of explanations to the user's specific context.
- **Status**: Implemented.

## 📈 Roadmap & Future Considerations

- **Caching Layer**: Implement Upstash Redis for caching AI responses to reduce API costs.
- **E2E Testing**: Coverage for critical flows (Repo Analysis, Generation).
- **Mobile App**: PWA conversion or Capacitor wrapper.
- **Collaborative Mode**: Real-time shared code explanation sessions.
