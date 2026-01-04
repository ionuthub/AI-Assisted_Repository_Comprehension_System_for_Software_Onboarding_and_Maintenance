import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <SEO
        title="Privacy Policy"
        description="Learn how AI Code Tutor handles your data, ensures security, and protects your privacy while you learn to code."
      />

      <main className="container mx-auto max-w-4xl px-4 py-12 md:px-8 md:py-16">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Data Collection</h2>
            <p>
              AI Code Tutor collects minimal data:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
              <li>Code snippets you submit for analysis (process by AI, optionally saved to history)</li>
              <li>GitHub repository URLs you provide</li>
              <li>Your skill level preference</li>
              <li>Account information (GitHub username, avatar) when you sign in</li>
              <li>Project history and generated projects (stored in our secure database)</li>
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
              <li><strong>Supabase</strong> - Securely stores your account data and project history</li>
              <li><strong>GitHub API</strong> - Fetches public repository data and handles authentication</li>
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
              <li>Confidential business logic</li>
              <li>Payment information</li>
            </ul>
            <p className="mt-4">
              <strong>For Signed-In Users:</strong> We store your project history (generated ideas and analyzed repo links) in our secure database to provide the Dashboard functionality. You can delete individual projects at any time.
            </p>

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
              <li>Access your account data</li>
              <li>Delete your account and all associated data permanently</li>
              <li>Clear your local browser data anytime</li>
              <li>Stop using the service</li>
              <li>Request information about data practices</li>
              <li>Disable analytics</li>
            </ul>
            <p className="mt-4">
              To delete your account, visit <strong>Settings</strong> and click "Delete Account". This will permanently remove all your projects, history, and preferences. This action cannot be undone.
            </p>
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


          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mt-8">
            <p className="text-sm">
              <strong>Last Updated:</strong> January 4, 2026
            </p>
          </div>
        </div>
      </main >
    </div >
  );
};

export default Privacy;
