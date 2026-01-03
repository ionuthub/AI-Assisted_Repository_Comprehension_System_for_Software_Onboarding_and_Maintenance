
export const inferLanguageFromFilename = (fileName: string): string | null => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    if (!extension) {
        return null;
    }

    const map: Record<string, string> = {
        ts: "TypeScript",
        tsx: "TypeScript",
        js: "JavaScript",
        jsx: "JavaScript",
        py: "Python",
        rs: "Rust",
        rb: "Ruby",
        go: "Go",
        java: "Java",
        cs: "C#",
        php: "PHP",
        swift: "Swift",
        kt: "Kotlin",
        m: "Objective-C",
        cpp: "C++",
        c: "C",
        h: "C",
        hs: "Haskell",
        scala: "Scala",
        sql: "SQL",
        md: "Markdown",
        json: "JSON",
        yml: "YAML",
        yaml: "YAML",
        html: "HTML",
        css: "CSS"
    };

    return map[extension] ?? null;
};
