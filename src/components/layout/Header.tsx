import type { MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useProjectStore } from "@/store/useProjectStore";

const Header = () => {
    const setProject = useProjectStore((state) => state.setProject);

    const handleStartOver = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setProject(null);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
            <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
                <Link
                    to="/"
                    onClick={handleStartOver}
                    className="focus-ring flex items-center gap-2.5 rounded-sm"
                    aria-label="Codemap, start a new repository analysis"
                >
                    <span className="h-4 w-4 rounded-sm bg-primary" aria-hidden="true" />
                    <span className="text-ui font-semibold text-foreground">Codemap</span>
                </Link>
            </div>
        </header>
    );
};

export default Header;
