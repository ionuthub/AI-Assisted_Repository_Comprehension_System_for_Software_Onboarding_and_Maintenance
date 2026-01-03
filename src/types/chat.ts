
export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
    // Potentially add timestamp or id later for better key management
    id?: string;
    timestamp?: number;
}
