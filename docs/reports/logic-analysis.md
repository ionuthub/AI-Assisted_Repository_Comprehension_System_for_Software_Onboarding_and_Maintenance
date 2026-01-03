# Website Logic Analysis

## 🎯 **Overall Purpose**

**Unravel Code AI** is an interactive code explanation tool that helps developers understand code at different skill levels by:
1. Loading code from GitHub repositories OR generating starter projects
2. Displaying code with syntax highlighting
3. Allowing users to click on lines to get AI-powered explanations
4. Adapting explanations based on skill level (beginner, intermediate, advanced)

---

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + TypeScript)             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Index.tsx (Main Component)                           │   │
│  │ - Mode selection (GitHub vs Generate)                │   │
│  │ - Skill level selector                               │   │
│  │ - File navigation                                    │   │
│  │ - Code viewer with line selection                    │   │
│  │ - Explanation panel                                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ github.ts - GitHub API Integration                  │   │
│  │ - Parse GitHub URLs                                 │   │
│  │ - Fetch repository metadata                         │   │
│  │ - Fetch file tree                                   │   │
│  │ - Fetch file contents                               │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ generation.ts - Project Generation                  │   │
│  │ - Generate starter projects from ideas              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Vercel Edge)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ /api/explain-code - AI Explanation Endpoint         │   │
│  │ - Rate limiting (10 req/min per IP)                 │   │
│  │ - Input validation                                  │   │
│  │ - Calls Gemini API                                  │   │
│  │ - Returns AI explanation                            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  • GitHub API - Repository data & file contents             │
│  • Gemini API - AI code explanations                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 **Data Flow**

### **Mode 1: GitHub Repository Analysis**

```
User enters GitHub URL
        ↓
parseGitHubUrl() validates & extracts owner/repo
        ↓
fetchRepositoryProject()
  ├─ Fetch repo metadata (name, description, language)
  ├─ Fetch file tree (up to 50 code files)
  └─ Filter files by extension (.js, .ts, .py, etc.)
        ↓
Display project summary & file list
        ↓
User clicks file
        ↓
fetchFileContent() loads file from GitHub
        ↓
Display code with syntax highlighting
        ↓
User clicks line number
        ↓
fetchAIExplanation() calls /api/explain-code
        ↓
Gemini API generates explanation
        ↓
Display explanation with skill-level adaptation
```

### **Mode 2: Project Generation**

```
User enters project idea
        ↓
generateProject() creates starter files
  ├─ Generates package.json
  ├─ Generates README.md
  ├─ Generates sample code files
  └─ Caches content locally
        ↓
Display generated project
        ↓
User clicks file (content already loaded)
        ↓
Display code
        ↓
User clicks line
        ↓
fetchAIExplanation() (same as GitHub mode)
```

---

## 🔑 **Key Components**

### **1. Index.tsx (Main Component)**

**State Management:**
```typescript
- mode: "github" | "generate"           // Current mode
- skillLevel: "beginner" | "intermediate" | "advanced"
- repoUrl: string                       // GitHub URL input
- projectIdea: string                   // Project idea input
- project: Project | null               // Current project data
- fileCache: Record<string, ProjectFile> // Cached file contents
- selectedFile: string | null           // Currently selected file
- selectedLine: number | null           // Currently selected line
- lineExplanation: string | null        // AI explanation
- isLoading: boolean                    // Loading state
- isFileLoading: boolean                // File loading state
- isExplaining: boolean                 // Explanation loading state
```

**Key Functions:**
- `handleAnalyze()` - Loads GitHub repo or generates project
- `handleLineSelect()` - Fetches AI explanation for selected line
- `handleFileSelect()` - Loads file content from cache or GitHub

### **2. github.ts (GitHub Integration)**

**Key Functions:**

**parseGitHubUrl(url: string)**
- Validates GitHub URL format
- Extracts owner and repository name
- Validates identifiers (alphanumeric, hyphens, underscores)
- Throws error if invalid

**fetchRepositoryProject(repoUrl: string)**
- Calls GitHub API to get repo metadata
- Fetches file tree (recursive)
- Filters files by code extensions
- Limits to 50 files max
- Returns Project object

**fetchFileContent(owner, repo, branch, path)**
- Fetches raw file content from GitHub
- Validates file path (prevents directory traversal)
- Enforces 5MB file size limit
- Implements 10-second timeout
- Infers language from file extension

**Security Features:**
- Input validation on all identifiers
- File path validation (prevents `../` attacks)
- File size limits (5MB max)
- Request timeout (10s)
- Rate limit detection

### **3. Code Pattern Detection**

**detectCodePattern(line: string)**

Identifies code patterns using regex:
- **Assignment**: `const x = ...` → "Creating a box"
- **Function calls**: `func()` → "Asking helper to do something"
- **Conditions**: `if (...)` → "Making a decision"
- **Loops**: `for/while (...)` → "Repeating something"
- **Return**: `return ...` → "Giving back an answer"
- **Array operations**: `.map()/.filter()` → "Doing something to each item"

**buildLineExplanation(content, lineNumber, skillLevel)**

Generates beginner-friendly explanations based on:
1. Detects code pattern
2. Looks up pattern-specific explanation
3. Adapts to skill level
4. Returns formatted explanation

### **4. AI Explanation Flow**

**fetchAIExplanation(code, skillLevel)**

```
Try to call /api/explain-code
  ├─ POST request with code & skillLevel
  ├─ Server-side validation
  ├─ Rate limiting check (10 req/min per IP)
  ├─ Calls Gemini API
  └─ Returns explanation
  
If fails in development:
  └─ Fall back to mock API
```

---

## 🔒 **Security Measures**

### **Input Validation**
- ✅ GitHub URL format validation
- ✅ Owner/repo name validation (alphanumeric, hyphens, underscores)
- ✅ File path validation (prevents directory traversal)
- ✅ Skill level whitelist (beginner, intermediate, advanced)
- ✅ Code length limit (10,000 characters)

### **API Security**
- ✅ Rate limiting: 10 requests/minute per IP
- ✅ File size limits: 5MB max
- ✅ Request timeout: 10 seconds
- ✅ Server-side API key (never exposed to client)
- ✅ CORS properly configured

### **GitHub API Security**
- ✅ Rate limit detection (403 with remaining=0)
- ✅ 404 handling (repo not found)
- ✅ Error messages don't leak sensitive info

---

## 📈 **User Workflows**

### **Workflow 1: Analyze GitHub Repository**

1. User selects "GitHub" mode
2. User selects skill level (beginner/intermediate/advanced)
3. User enters GitHub URL (e.g., `https://github.com/facebook/react`)
4. Clicks "Analyze Repository"
5. App fetches repo metadata & file tree
6. Displays list of code files
7. User clicks a file
8. App fetches file content from GitHub
9. Displays code with syntax highlighting
10. User clicks a line number
11. App calls AI to explain that line
12. Displays explanation adapted to skill level
13. User can click other lines for more explanations

### **Workflow 2: Generate Starter Project**

1. User selects "Generate" mode
2. User selects skill level
3. User enters project idea (e.g., "Todo app with React")
4. Clicks "Generate Project"
5. App generates starter files locally
6. Displays generated project
7. User clicks a file (content already loaded)
8. Displays generated code
9. User clicks a line
10. App calls AI to explain that line
11. Displays explanation

---

## 🎯 **Skill Level Adaptation**

### **Beginner Level**
- Uses simple analogies (boxes, helpers, decisions)
- Avoids technical jargon
- Explains "why" not just "what"
- Uses everyday language

### **Intermediate Level**
- Uses proper technical terms
- Discusses patterns and best practices
- Mentions common use cases
- Explains "how" things work

### **Advanced Level**
- Discusses architectural implications
- Analyzes performance & trade-offs
- Suggests optimizations
- Considers production concerns

---

## 🚀 **Performance Optimizations**

### **Frontend**
- ✅ Code splitting (vendor, UI, main chunks)
- ✅ Lazy loading of components
- ✅ Memoization of file list
- ✅ File caching to avoid re-fetching

### **Backend**
- ✅ Edge runtime (Vercel serverless)
- ✅ Rate limiting to prevent abuse
- ✅ Request timeout to prevent hanging
- ✅ File size limits to prevent large downloads

### **Caching**
- ✅ Browser cache: 1 year for assets
- ✅ Page cache: 1 hour for HTML
- ✅ File cache: In-memory on frontend

---

## ⚠️ **Error Handling**

### **GitHub Errors**
- Invalid URL format → "Provide a valid GitHub URL"
- Repository not found → "Repository not found"
- Rate limit exceeded → "GitHub API rate limit exceeded"
- File not found → "File not found: {path}"
- File too large → "File exceeds maximum size of 5MB"
- Request timeout → "Request timeout - file took too long to load"

### **API Errors**
- Rate limit (429) → "Too many requests. Please wait a minute"
- API key not configured → "API key not configured"
- Invalid skill level → "Invalid skill level"
- Empty code → "Code cannot be empty"
- Code too long → "Code must be a string with max 10,000 characters"

### **User Errors**
- Empty GitHub URL → "Repository required"
- Empty project idea → "Idea required"
- Empty code line → "This line is empty or just has whitespace"

---

## 📊 **Data Types**

```typescript
// Project structure
interface Project {
  summary: ProjectSummary
  files: ProjectFile[]
}

interface ProjectSummary {
  name: string
  owner?: string
  repo?: string
  description: string | null
  source: "github" | "generated"
  language: string | null
  branch?: string
}

interface ProjectFile {
  path: string
  language?: string | null
  content?: string | null
  rawUrl?: string | null
  size?: number | null
}

// Skill levels
type SkillLevel = "beginner" | "intermediate" | "advanced"

// Code pattern
interface CodePattern {
  type: string
  description: string
}
```

---

## ✅ **Logic Summary**

| Aspect | Implementation | Status |
|--------|----------------|--------|
| **GitHub Integration** | Fetches repos, files, content | ✅ Working |
| **Project Generation** | Creates starter projects | ✅ Working |
| **Code Display** | Syntax highlighting, line numbers | ✅ Working |
| **AI Explanations** | Calls Gemini API via serverless | ✅ Working |
| **Skill Adaptation** | Customizes explanations by level | ✅ Working |
| **Security** | Input validation, rate limiting | ✅ Implemented |
| **Error Handling** | Comprehensive error messages | ✅ Implemented |
| **Performance** | Code splitting, caching | ✅ Optimized |
| **Accessibility** | Keyboard navigation, ARIA labels | ⏳ Partial |

---

## 🎯 **Conclusion**

The website logic is **well-structured, secure, and performant**:
- ✅ Clear separation of concerns
- ✅ Proper error handling
- ✅ Security best practices
- ✅ Performance optimizations
- ✅ Skill-level adaptation
- ✅ Multiple input modes (GitHub + Generate)

**Ready for production!** 🚀
