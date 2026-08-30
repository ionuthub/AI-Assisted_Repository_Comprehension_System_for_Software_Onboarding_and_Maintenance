import type { MouseEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { useProjectStore } from "@/store/useProjectStore";

const NAV_ITEMS = [
    { label: "Analyse", path: "/", startsOver: true },
    { label: "Research evaluation", path: "/evaluation", startsOver: false },
];

const Header = () => {
    const location = useLocation();
    const setProject = useProjectStore((state) => state.setProject);

    const handleStartOver = (event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        setProject(null);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                <Link
                    to="/"
                    onClick={handleStartOver}
                    className="focus-ring flex items-center gap-2.5 rounded-sm"
                    aria-label="Codemap, start a new repository analysis"
                >
                    <span className="h-4 w-4 rounded-sm bg-primary" aria-hidden="true" />
                    <span className="text-ui font-semibold text-foreground">Codemap</span>
                </Link>

                <nav aria-label="Main">
                    <ul className="flex items-center gap-5 md:gap-6">
                        {NAV_ITEMS.map((item) => {
                            const isCurrent = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={item.startsOver ? handleStartOver : undefined}
                                        aria-current={isCurrent ? "page" : undefined}
                                        className={`focus-ring rounded-sm text-ui transition-colors hover:text-foreground ${
                                            isCurrent
                                                ? "text-foreground font-semibold underline underline-offset-8 decoration-primary decoration-2"
                                                : item.startsOver
                                                    ? "text-muted-foreground"
                                                    : "text-foreground-dim"
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </div>
        </header>
    );
};

export default Header;
