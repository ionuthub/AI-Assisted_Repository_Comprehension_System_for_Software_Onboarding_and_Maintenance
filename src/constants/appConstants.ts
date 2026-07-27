/**
 * Application Constants
 * Centralized configuration for tab values, skill levels, and other constants
 */

// Tab Mode Constants
export const TAB_MODES = {
  GITHUB: "github",
  GENERATE: "generate",
  UPLOAD: "upload"
} as const;

export type TabMode = typeof TAB_MODES[keyof typeof TAB_MODES];

// Skill Level Constants
export const SKILL_LEVELS = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced"
} as const;

export type SkillLevel = typeof SKILL_LEVELS[keyof typeof SKILL_LEVELS];

/**
 * Retrieval parameters for the grounded question-answering pipeline.
 *
 * These are the experimental parameters of the RAG configuration and must be reported
 * alongside any result produced with them: changing any value changes what evidence the
 * model receives and therefore what it answers. They are fixed here, in one place, so the
 * configuration used for the accuracy gate and for every participant session is the same
 * and can be quoted directly in the methodology.
 *
 * RAG_TOP_K            number of files retrieved as evidence for a question
 * RAG_CONTEXT_CHARS    characters taken from the head of each retrieved file
 * SEARCH_RESULT_LIMIT  results shown in the user-facing repository search
 *
 * RAG_TOP_K x RAG_CONTEXT_CHARS bounds the evidence at 7,500 characters, within the
 * 12,000-character ceiling the API applies to the system context.
 */
export const RETRIEVAL = {
  RAG_TOP_K: 3,
  RAG_CONTEXT_CHARS: 2500,
  SEARCH_RESULT_LIMIT: 10,
} as const;

// Tab Configuration
export const TAB_CONFIG = {
  [TAB_MODES.GITHUB]: {
    label: "GitHub Repo",
    placeholder: "https://github.com/facebook/react",
    loadingText: "Loading repository...",
    buttonText: "Analyze repository"
  },
  [TAB_MODES.GENERATE]: {
    label: "Generate Idea",
    placeholder: "A flashcard app with spaced repetition",
    loadingText: "Drafting project...",
    buttonText: "Generate project"
  },
  [TAB_MODES.UPLOAD]: {
    label: "Upload Folder",
    placeholder: "Select a local project folder",
    loadingText: "Processing folder...",
    buttonText: "Analyze folder"
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NO_CONTENT: "No content yet",
  SELECT_FILE: "Select a file first to load its contents.",
  GENERATION_ERROR: "Could not generate explanation",
  AI_UNAVAILABLE: "Using offline explanation",
  AI_UNAVAILABLE_DESC: "AI service unavailable. Showing pattern-based explanation instead.",
  REPO_LOAD_ERROR: "Failed to load repository.",
  FOLDER_UPLOAD_ERROR: "Failed to upload folder."
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  REPO_LOADED: "Repository loaded",
  PROJECT_GENERATED: "Project generated",
  FOLDER_UPLOADED: "Folder ready"
} as const;

// Keyboard Shortcuts
export const KEYBOARD_SHORTCUTS = {
  SEARCH: {
    key: "k",
    ctrl: true,
    meta: true,
    description: "Search files"
  },
  ESCAPE: {
    key: "Escape",
    description: "Close dialogs"
  }
} as const;

// UI Constants
export const UI_CONSTANTS = {
  MAX_HEIGHT_CODE_VIEWER: "max-h-[600px]",
  ANIMATION_DURATION: 0.5,
  DEBOUNCE_DELAY: 300
} as const;
