import { Code2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "features" | "technical" | "pricing" | "privacy";
}

const faqItems: FAQItem[] = [
  // General
  {
    category: "general",
    question: "What is AI Code Tutor?",
    answer:
      "AI Code Tutor is an educational tool that uses artificial intelligence to explain code and generate starter projects. It's designed to help developers of all skill levels understand code concepts, learn new patterns, and accelerate their learning journey.",
  },
  {
    category: "general",
    question: "Who is AI Code Tutor for?",
    answer:
      "AI Code Tutor is for anyone learning to code - from complete beginners to advanced developers. The explanations adapt to your skill level (Beginner, Intermediate, or Advanced), so you get explanations that match your current knowledge.",
  },
  {
    category: "general",
    question: "Is AI Code Tutor free?",
    answer:
      "Yes! AI Code Tutor is completely free to use. We use the Google Gemini API free tier, which provides generous limits for educational use. There are no hidden fees or premium tiers.",
  },
  {
    category: "general",
    question: "How accurate are the explanations?",
    answer:
      "AI-generated explanations are generally accurate but may contain errors or oversimplifications. Always verify critical information with official documentation, experienced developers, or professional code review services. Never rely solely on AI explanations for production-critical decisions.",
  },

  // Features
  {
    category: "features",
    question: "How do I analyze a GitHub repository?",
    answer:
      "Click 'Analyze Repository' on the home page, enter the GitHub repository URL (e.g., github.com/username/repo-name), and select your skill level. The tool will fetch the repository and let you explore and understand the code with AI-powered explanations.",
  },
  {
    category: "features",
    question: "Can I analyze private repositories?",
    answer:
      "Yes! To analyze private repositories, you need to set up a GitHub Personal Access Token. Follow the setup guide in the app or visit our GitHub repository for detailed instructions. The token is stored locally and never exposed.",
  },
  {
    category: "features",
    question: "How does the project generator work?",
    answer:
      "Describe your project idea, select your skill level, and the AI generates a complete starter project with all necessary files (package.json, tsconfig.json, components, hooks, etc.). You can download the project and run 'npm install && npm run dev' to start developing immediately.",
  },
  {
    category: "features",
    question: "What file types are supported?",
    answer:
      "The tool supports JavaScript, TypeScript, JSX, TSX, Python, Java, C++, C#, Go, Rust, and many other programming languages. It can analyze any text-based code file.",
  },
  {
    category: "features",
    question: "Can I change my skill level?",
    answer:
      "Yes! You can change your skill level anytime using the Skill Selector. When you change it, all explanations (both file-level and line-level) will automatically regenerate to match your new skill level.",
  },

  // Technical
  {
    category: "technical",
    question: "What are the rate limits?",
    answer:
      "AI Code Tutor uses the Google Gemini API free tier with these limits: 15 requests per minute, 1,500 requests per day, and $5 daily cost limit. If you exceed these limits, you'll see a message and can try again after the limit resets.",
  },
  {
    category: "technical",
    question: "What happens to my code?",
    answer:
      "Your code is sent to Google Gemini API for analysis but is NOT stored on our servers. It's processed in real-time and deleted after the explanation is generated. We do not retain, log, or use your code for any other purpose.",
  },
  {
    category: "technical",
    question: "Is my data secure?",
    answer:
      "Yes. All data is transmitted over HTTPS encryption. We don't store code, personal information, or browsing history. Your skill level preference and theme choice are stored locally in your browser and can be cleared anytime.",
  },
  {
    category: "technical",
    question: "What if I encounter an error?",
    answer:
      "If you encounter an error, try refreshing the page or checking your internet connection. If the problem persists, it may be due to rate limits or API issues. You can report bugs on our GitHub repository.",
  },
  {
    category: "technical",
    question: "Does the tool work offline?",
    answer:
      "No, AI Code Tutor requires an internet connection to fetch code from GitHub and send it to the AI API for analysis. The explanations are generated in real-time and cannot be cached for offline use.",
  },

  // Pricing
  {
    category: "pricing",
    question: "Why is it free?",
    answer:
      "We built AI Code Tutor as an educational tool to help developers learn. We use the Google Gemini API free tier, which provides sufficient resources for educational purposes. Our goal is to make learning accessible to everyone.",
  },
  {
    category: "pricing",
    question: "Will there be a paid version?",
    answer:
      "Currently, there are no plans for a paid version. The tool is designed to be free and accessible. If we add premium features in the future, the core functionality will remain free.",
  },
  {
    category: "pricing",
    question: "What if I exceed the daily limit?",
    answer:
      "If you exceed the daily limit, you'll see a message indicating you've reached your limit. The limit resets at midnight UTC. You can continue using the tool the next day. Consider spacing out your requests if you frequently hit the limit.",
  },

  // Privacy
  {
    category: "privacy",
    question: "Do you collect personal information?",
    answer:
      "We collect minimal data: only the code you submit for analysis, GitHub URLs you provide, and your skill level preference. We don't collect names, emails, or personal identifiers unless you voluntarily provide them.",
  },
  {
    category: "privacy",
    question: "Should I submit sensitive code?",
    answer:
      "No. Do NOT submit API keys, secrets, proprietary code, confidential business logic, or security-critical code. While we don't store it, it's sent to the Google Gemini API, and we cannot guarantee third-party security.",
  },
  {
    category: "privacy",
    question: "How do I delete my data?",
    answer:
      "Since we don't store your data, there's nothing to delete on our servers. You can clear your browser's local storage (skill level, theme preference) through your browser settings anytime.",
  },
  {
    category: "privacy",
    question: "Do you use cookies?",
    answer:
      "We use minimal cookies only for session management, user preferences, and optional analytics. You can disable cookies in your browser settings, though some features may not work optimally.",
  },
];

const FAQAccordion = ({ item }: { item: FAQItem }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="border border-border rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      viewport={{ once: true }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors text-left"
      >
        <span className="font-semibold text-foreground">{item.question}</span>
        <ChevronDown
          className={`h-5 w-5 text-primary transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 py-4 border-t border-border bg-secondary/30 text-muted-foreground">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQ = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Questions" },
    { id: "general", label: "General" },
    { id: "features", label: "Features" },
    { id: "technical", label: "Technical" },
    { id: "pricing", label: "Pricing" },
    { id: "privacy", label: "Privacy" },
  ];

  const filteredItems =
    activeCategory === "all"
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Code2 className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">AI Code Tutor</span>
          </button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">
            Find answers to common questions about AI Code Tutor. Can't find what you're looking for?{" "}
            <a
              href="https://github.com/ionuthub/unravel-code-ai/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Open an issue on GitHub
            </a>
            .
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex flex-wrap gap-2"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {filteredItems.map((item, index) => (
            <FAQAccordion key={index} item={item} />
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Check out our GitHub repository or open an issue if you need help.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              onClick={() => navigate("/")}
              variant="default"
            >
              Back to Home
            </Button>
            <a
              href="https://github.com/ionuthub/unravel-code-ai"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                Visit GitHub
              </Button>
            </a>
          </div>
        </motion.div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-8">
          <p className="text-sm">
            <strong>Last Updated:</strong> October 24, 2025
          </p>
        </div>
      </main>
    </div>
  );
};

export default FAQ;
