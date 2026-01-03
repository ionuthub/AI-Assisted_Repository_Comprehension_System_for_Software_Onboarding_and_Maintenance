import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <SEO
        title="Terms of Service"
        description="Read the terms of service for AI Code Tutor. Understand our educational purpose, accuracy disclaimers, and your responsibilities while using our AI-powered tools."
      />

      <main className="container mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Educational Purpose</h2>
            <p>
              AI Code Tutor is designed for educational purposes only. This tool is intended to help developers learn and understand code concepts. It should not be used as a substitute for professional code review, security audits, or production-level decision making.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Accuracy Disclaimer</h2>
            <p>
              AI Code Tutor provides explanations powered by artificial intelligence. While we strive for accuracy, AI-generated explanations may contain errors, oversimplifications, or inaccuracies. Always verify critical information with:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Official documentation</li>
              <li>Experienced developers</li>
              <li>Professional code review services</li>
              <li>Security specialists (for sensitive code)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. No Warranty</h2>
            <p>
              This tool is provided "as-is" without any warranty of any kind. We do not guarantee that:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Explanations will be accurate or complete</li>
              <li>The service will be uninterrupted or error-free</li>
              <li>The tool is suitable for any particular purpose</li>
              <li>Results will meet your expectations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Limitation of Liability</h2>
            <p>
              We are not responsible for any errors, omissions, or damages resulting from the use of this tool. Users rely on AI Code Tutor at their own risk. This includes but is not limited to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Incorrect code explanations</li>
              <li>Loss of data or productivity</li>
              <li>Security vulnerabilities in analyzed code</li>
              <li>Service interruptions or downtime</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Rate Limits</h2>
            <p>
              This application uses the Google Gemini API free tier, which has rate limits:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>15 requests per minute</li>
              <li>1,500 requests per day</li>
              <li>Service may be interrupted if limits are exceeded</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. User Responsibilities</h2>
            <p>
              By using AI Code Tutor, you agree to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Use the tool only for educational purposes</li>
              <li>Not submit sensitive, proprietary, or confidential code</li>
              <li>Verify all explanations with reliable sources</li>
              <li>Not rely solely on this tool for critical decisions</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.
            </p>
          </section>


          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-8">
            <p className="text-sm">
              <strong>Last Updated:</strong> October 24, 2025
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
