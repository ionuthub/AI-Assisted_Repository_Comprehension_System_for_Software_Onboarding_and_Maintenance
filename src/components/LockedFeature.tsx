import { useNavigate } from "react-router-dom";
import { Lock, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface LockedFeatureProps {
    title: string;
    description: string;
}

const LockedFeature = ({ title, description }: LockedFeatureProps) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <Card className="flex flex-col items-center justify-center p-12 text-center space-y-6 h-[400px] bg-muted/30 border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-2">
                <Lock className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{description}</p>
            </div>

            <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="mt-4 gap-2"
            >
                <Github className="w-5 h-5" />
                Sign In with GitHub
            </Button>

            <p className="text-xs text-muted-foreground">
                Free to join. No credit card required.
            </p>
        </Card>
    );
};

export default LockedFeature;
