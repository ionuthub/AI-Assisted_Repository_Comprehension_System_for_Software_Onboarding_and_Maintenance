
import { useProjectStore } from "@/store/useProjectStore";
import { ChatMessage } from "@/types/chat";
import { SkillLevel } from "@/constants/appConstants";
import { analyzeProject } from "@/lib/projectAnalyzer";
import { generateW3SchoolsFileExplanation } from "@/lib/w3schoolsExplainer";
import { detectCodeBlock } from "@/lib/blockDetector";
import { searchRepository } from "@/lib/semanticSearch";

export const useCodeExplanation = () => {
    const {
        chatMessages,
        setChatMessages,
        setIsExplaining,
        skillLevel,
        project,
        setSkillLevel,
        resetSelection,
        selectedFile,
        setSelectedLine,
        setSelectedLines,
        searchIndex
    } = useProjectStore();

    const fetchAIExplanationStream = async (
        messages: ChatMessage[],
        skillLevel: SkillLevel,
        systemContext: string,
        onChunk: (text: string) => void
    ): Promise<void> => {
        try {
            const response = await fetch('/api/explain-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages, skillLevel, systemContext, stream: true })
            });

            if (!response.ok) throw new Error('Streaming failed');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) return;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                onChunk(decoder.decode(value));
            }
        } catch (error) {
            console.error("Streaming error:", error);
            onChunk("I'm sorry, I'm having trouble connecting to the AI brain right now.");
        }
    };

    const handleChatSendMessage = async (content: string) => {
        const newUserMsg: ChatMessage = { role: 'user', content };
        const updated: ChatMessage[] = [...chatMessages, newUserMsg, { role: 'model', content: '' }];
        setChatMessages(updated);
        setIsExplaining(true);

        let systemContext = project ? analyzeProject(project).explanation.slice(0, 5).join("\n") : "";

        // Retrieval-Augmented Generation (RAG)
        if (project && searchIndex) {
            const searchResults = searchRepository(content, searchIndex, project.files, 3);
            if (searchResults.length > 0) {
                systemContext += "\n\n[Grounded Repository Context for RAG - Answer using this evidence and cite file paths]";
                searchResults.forEach(res => {
                    const fileObj = project.files.find(f => f.path === res.path);
                    if (fileObj && fileObj.content) {
                        systemContext += `\n\n--- File: ${res.path} (Language: ${fileObj.language || 'unknown'}, Relevance: ${(res.score * 100).toFixed(0)}%) ---\n${fileObj.content.slice(0, 3000)}`;
                    }
                });
            }
        }

        let fullText = "";
        await fetchAIExplanationStream(updated.slice(0, -1), skillLevel, systemContext, (chunk) => {
            fullText += chunk;
            const streamingMsgs: ChatMessage[] = [...updated.slice(0, -1), { role: 'model', content: fullText }];
            setChatMessages(streamingMsgs);
        });
        setIsExplaining(false);
    };

    const handleLineSelect = async (lineNumber: number, currentFileContent: string) => {
        if (!currentFileContent) return;
        const block = detectCodeBlock(currentFileContent, lineNumber);
        const lines = new Set<number>();
        for (let i = block.startLine; i <= block.endLine; i++) lines.add(i);

        setSelectedLine(lineNumber);
        setSelectedLines(lines);
        setIsExplaining(true);

        const snippet = currentFileContent.split(/\r?\n/).slice(block.startLine - 1, block.endLine).join("\n");
        const prompt = `Explain these lines (${block.startLine}-${block.endLine}) in ${selectedFile}:\n\n\`\`\`\n${snippet}\n\`\`\``;

        setChatMessages([{ role: 'user', content: prompt }, { role: 'model', content: '' }]);

        let fullText = "";
        const summary = project ? analyzeProject(project).explanation.slice(0, 5).join("\n") : "";

        await fetchAIExplanationStream([{ role: 'user', content: prompt }], skillLevel, summary, (chunk) => {
            fullText += chunk;
            setChatMessages([{ role: 'user', content: prompt }, { role: 'model', content: fullText }]);
        });
        setIsExplaining(false);
    };

    const handleRefactorRequest = async (selectedLine: number | null, currentFileContent: string | null) => {
        if (!selectedLine || !currentFileContent) return;
        const block = detectCodeBlock(currentFileContent, selectedLine);
        const snippet = currentFileContent.split(/\r?\n/).slice(block.startLine - 1, block.endLine).join("\n");

        const prompt = `Refactor this code block from ${selectedFile} for better quality/performance. Show the refactored code and explain why:\n\n\`\`\`\n${snippet}\n\`\`\``;
        handleChatSendMessage(prompt);
    };

    const handleSkillLevelChange = (nextLevel: SkillLevel, currentFileContent: string | null) => {
        setSkillLevel(nextLevel);
        resetSelection();

        if (selectedFile && currentFileContent) {
            const explanation = generateW3SchoolsFileExplanation(selectedFile, currentFileContent, nextLevel);
            setChatMessages([{ role: 'model', content: explanation }]);
        }
    };

    return {
        handleChatSendMessage,
        handleLineSelect,
        handleRefactorRequest,
        handleSkillLevelChange
    };
};
