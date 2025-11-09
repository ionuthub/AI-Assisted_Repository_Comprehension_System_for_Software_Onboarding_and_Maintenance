# Lucide Icons Usage Guide

This document outlines all lucide-react icons used throughout the application for consistent visual design.

## Installation

Lucide icons are already installed via `lucide-react` package. Import icons as needed:

```typescript
import { IconName } from "lucide-react";
```

---

## Components Using Lucide Icons

### 1. **ExplanationPanel.tsx**
Location: `/src/components/ExplanationPanel.tsx`

| Icon | Usage | Size | Color |
|------|-------|------|-------|
| `Sparkles` | Header icon for "Explanation" panel | 3.5-4px | `text-primary` |
| `BookOpen` | "Related Concepts" section header | 3.5-4px | `text-primary` |
| `Sparkles` | Hint message icon | 3.5-4px | `text-primary` |

**Code Example:**
```typescript
import { Sparkles, BookOpen } from "lucide-react";

<Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
<BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary" />
```

---

### 2. **CodeViewer.tsx**
Location: `/src/components/CodeViewer.tsx`

| Icon | Usage | Size | Color |
|------|-------|------|-------|
| `Code2` | Header icon for code file name | 3.5-4px | `text-primary` |
| `Code2` | Placeholder icon when no file selected | 48px | `text-muted-foreground/40` |

**Code Example:**
```typescript
import { Code2 } from "lucide-react";

// Header icon
<Code2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary flex-shrink-0" />

// Placeholder icon
<Code2 className="w-12 h-12 text-muted-foreground/40 mb-2" />
```

---

### 3. **FileNavigator.tsx**
Location: `/src/components/FileNavigator.tsx`

| Icon | Usage | Size | Color |
|------|-------|------|-------|
| `FileCode` | "Project Files" header icon | 4px | Default |
| `ChevronRight` | File list item indicator | 3px | Default |
| `FileText` | Language/file type indicator | 3px | Default |

**Code Example:**
```typescript
import { FileCode, ChevronRight, FileText } from "lucide-react";

<FileCode className="w-4 h-4" />
<ChevronRight className="w-3 h-3 flex-shrink-0" />
<FileText className="w-3 h-3" />
```

---

### 4. **ProjectOverview.tsx**
Location: `/src/components/ProjectOverview.tsx`

| Icon | Usage | Size | Color |
|------|-------|------|-------|
| `Lightbulb` | "Project Overview" header icon | 6px | `text-primary` |
| `Code2` | "Technologies" section icon | 4px | `text-primary` |
| `Zap` | "Features" section icon | 4px | `text-primary` |

**Code Example:**
```typescript
import { Lightbulb, Code2, Zap } from "lucide-react";

<Lightbulb className="w-6 h-6 text-primary" />
<Code2 className="w-4 h-4 text-primary" />
<Zap className="w-4 h-4 text-primary" />
```

---

### 5. **SkillSelector.tsx**
Location: `/src/components/SkillSelector.tsx`

| Icon | Usage | Size | Color |
|------|-------|------|-------|
| `GraduationCap` | Beginner skill level icon | 4-5px | Inherited from button |
| `Lightbulb` | Intermediate skill level icon | 4-5px | Inherited from button |
| `Rocket` | Advanced skill level icon | 4-5px | Inherited from button |

**Code Example:**
```typescript
import { GraduationCap, Lightbulb, Rocket } from "lucide-react";

const levels = [
  { id: "beginner", icon: GraduationCap, ... },
  { id: "intermediate", icon: Lightbulb, ... },
  { id: "advanced", icon: Rocket, ... },
];

{levels.map((level) => {
  const Icon = level.icon;
  return <Icon className="w-4 h-4 md:w-5 md:h-5" />;
})}
```

---

### 6. **Index.tsx (Main Page)**
Location: `/src/pages/Index.tsx`

| Icon | Usage | Size | Color |
|------|-------|------|-------|
| `Code2` | Main logo/branding | 5-6px | Default |
| `Sparkles` | "Analyze" button loading state | 4px | Animated spin |
| `Github` | GitHub tab icon | 4px | Default |
| `Wand2` | Generate tab icon | 4px | Default |
| `FileCode` | Upload tab icon | 4px | Default |
| `ExternalLink` | External link indicator | 3px | Default |
| `Heart` | Like/favorite button | 4px | Default |

**Code Example:**
```typescript
import { Code2, Sparkles, Github, Wand2, FileCode, ExternalLink, Heart } from "lucide-react";

<Sparkles className="mr-2 h-4 w-4 animate-spin" />
<Github className="h-4 w-4" />
<Wand2 className="h-4 w-4" />
<FileCode className="h-4 w-4" />
```

---

## Icon Sizing Convention

| Size Class | Pixels | Use Case |
|-----------|--------|----------|
| `w-3 h-3` | 12px | Small indicators, file list items |
| `w-3.5 h-3.5` | 14px | Panel headers, secondary icons |
| `w-4 h-4` | 16px | Standard buttons, section headers |
| `w-5 h-5` | 20px | Large buttons, prominent icons |
| `w-6 h-6` | 24px | Main headers, featured icons |
| `w-12 h-12` | 48px | Placeholder/empty state icons |

---

## Color Convention

| Color Class | Usage |
|------------|-------|
| `text-primary` | Primary action icons, important indicators |
| `text-foreground` | Default text color icons |
| `text-muted-foreground` | Secondary/disabled state icons |
| `text-destructive` | Error/warning icons |
| `text-accent` | Accent color icons |
| `text-muted-foreground/40` | Subtle placeholder icons |

---

## Responsive Sizing Pattern

Most icons use responsive sizing for better mobile/desktop experience:

```typescript
// Pattern: smaller on mobile, larger on desktop
<Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />

// Mobile: 14px (3.5 * 4)
// Desktop (md+): 16px (4 * 4)
```

---

## Animation Usage

### Spinning Animation (Loading States)
```typescript
<Sparkles className="mr-2 h-4 w-4 animate-spin" />
```

Uses Tailwind's built-in `animate-spin` for smooth rotation during loading.

---

## Best Practices

1. **Always import from `lucide-react`**
   ```typescript
   import { IconName } from "lucide-react";
   ```

2. **Use consistent sizing**
   - Headers: `w-4 h-4` or `w-3.5 h-3.5`
   - Buttons: `w-4 h-4`
   - Large sections: `w-6 h-6`

3. **Apply color consistently**
   - Primary actions: `text-primary`
   - Secondary: `text-muted-foreground`
   - Disabled: `text-muted-foreground/40`

4. **Use flex-shrink-0 for inline icons**
   ```typescript
   <Icon className="flex-shrink-0" />
   ```

5. **Responsive sizing for mobile**
   ```typescript
   <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
   ```

6. **Add gap between icon and text**
   ```typescript
   <div className="flex items-center gap-2">
     <Icon className="w-4 h-4" />
     <span>Label</span>
   </div>
   ```

---

## Available Lucide Icons

For a complete list of available icons, visit: https://lucide.dev/

Common icons used in this project:
- `Code2`, `FileCode`, `FileText` – File/code related
- `Sparkles` – Magic/AI features
- `Github` – Version control
- `Wand2` – Generation/creation
- `BookOpen` – Learning/documentation
- `Lightbulb` – Ideas/insights
- `Zap` – Features/power
- `Rocket` – Advanced/speed
- `GraduationCap` – Learning/education
- `ChevronRight` – Navigation
- `ExternalLink` – External links
- `Heart` – Favorites/likes

---

## Troubleshooting

### Icon not displaying
- Ensure import is from `lucide-react`
- Check that icon name is spelled correctly
- Verify icon exists on https://lucide.dev/

### Icon too small/large
- Adjust `w-X h-X` classes
- Use responsive modifiers: `md:w-5 md:h-5`

### Icon color not showing
- Check parent element doesn't override color
- Use explicit color class: `text-primary`
- Verify color variable exists in design system

---

**Last Updated**: November 9, 2025
