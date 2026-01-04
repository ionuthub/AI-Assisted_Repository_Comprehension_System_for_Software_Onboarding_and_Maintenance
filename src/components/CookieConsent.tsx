import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Cookie } from 'lucide-react';

/**
 * Cookie Consent Banner
 * GDPR-compliant cookie consent management
 */
export const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);
    const CONSENT_KEY = 'cookie-consent';

    useEffect(() => {
        // Check if user has already given consent
        const consent = localStorage.getItem(CONSENT_KEY);
        if (!consent) {
            // Show banner after a short delay
            setTimeout(() => setShowBanner(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        setShowBanner(false);
    };

    const handleDecline = () => {
        localStorage.setItem(CONSENT_KEY, 'declined');
        setShowBanner(false);

        // Disable analytics if declined
        if (window.plausible) {
            // Plausible doesn't use cookies, but we respect user choice
            delete window.plausible;
        }
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
            <Card className="max-w-4xl mx-auto p-6 shadow-lg border-2">
                <div className="flex items-start gap-4">
                    <Cookie className="w-6 h-6 text-primary shrink-0 mt-1" />

                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">Cookie Notice</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. By clicking "Accept," you agree to our website's cookie use as described in our{' '}
                            <a href="/privacy" className="text-primary hover:underline">
                                Privacy Policy
                            </a>.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={handleAccept}
                                className="bg-primary hover:bg-primary/90"
                            >
                                Accept All
                            </Button>
                            <Button
                                onClick={handleDecline}
                                variant="outline"
                            >
                                Decline Non-Essential
                            </Button>
                            <Button
                                onClick={() => setShowBanner(false)}
                                variant="ghost"
                                size="icon"
                                className="ml-auto"
                                aria-label="Close"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default CookieConsent;
