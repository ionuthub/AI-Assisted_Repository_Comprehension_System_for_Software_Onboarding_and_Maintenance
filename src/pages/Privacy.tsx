import { Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

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
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Data Collection</h2>
            <p>
              AI Code Tutor collects minimal data:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Code snippets you submit for analysis (sent to Google Gemini API)</li>
              <li>GitHub repository URLs you provide</li>
              <li>Your skill level preference (stored locally)</li>
              <li>Basic analytics (optional, via Vercel)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Third-Party Services</h2>
            <p>
              Your data may be processed by:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li><strong>Google Gemini API</strong> - Processes code for AI explanations</li>
              <li><strong>GitHub API</strong> - Fetches public repository data</li>
              <li><strong>Vercel</strong> - Hosts the application</li>
            </ul>
            <p className="mt-4">
              Please review their privacy policies:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Google: https://policies.google.com/privacy</li>
              <li>GitHub: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement</li>
              <li>Vercel: https://vercel.com/legal/privacy-policy</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Code Sensitivity Warning</h2>
            <p className="font-semibold text-destructive mb-2">
              ⚠️ Do NOT submit sensitive code to this tool:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>API keys or secrets</li>
              <li>Proprietary code</li>
              <li>Confidential business logic</li>
              <li>Personal or financial data</li>
              <li>Security-critical code</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Storage</h2>
            <p>
              We do not store:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Code snippets you submit</li>
              <li>Your personal information</li>
              <li>Browsing history</li>
              <li>Explanations generated</li>
            </ul>
            <p className="mt-4">
              Data is processed in real-time and not retained on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Local Storage</h2>
            <p>
              The application uses browser local storage to remember:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Your selected skill level</li>
              <li>Theme preference (light/dark mode)</li>
              <li>Session data</li>
            </ul>
            <p className="mt-4">
              You can clear this data anytime through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Cookies</h2>
            <p>
              We use minimal cookies only for:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Session management</li>
              <li>User preferences</li>
              <li>Analytics (if enabled)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Clear your local data anytime</li>
              <li>Stop using the service</li>
              <li>Request information about data practices</li>
              <li>Disable analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Security</h2>
            <p>
              We implement security measures including:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>HTTPS encryption for all data in transit</li>
              <li>No storage of sensitive data</li>
              <li>Regular security updates</li>
              <li>Third-party security reviews</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Changes to Privacy Policy</h2>
            <p>
              We may update this policy at any time. Changes will be posted here with an updated date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">10. Contact</h2>
            <p>
              For privacy concerns, contact us through GitHub: https://github.com/ionuthub/unravel-code-ai
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

export default Privacy;
