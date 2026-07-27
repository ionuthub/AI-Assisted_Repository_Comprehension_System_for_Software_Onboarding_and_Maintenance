import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
    { label: "Analyse", path: "/" },
    { label: "Evaluation", path: "/evaluation" },
];

const Header = () => {
    const location = useLocation();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
                <Link to="/" className="flex items-center gap-2.5">
                    <span className="h-4 w-4 rounded-sm bg-primary" aria-hidden="true" />
                    <span className="text-ui font-semibold text-foreground">Codemap</span>
                </Link>

                <nav aria-label="Main">
                    <ul className="flex items-center gap-6">
                        {NAV_ITEMS.map((item) => {
                            const isCurrent = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        // aria-current carries the state for assistive technology and the
                                        // underline carries it visually: the design system forbids
                                        // signalling an active state by colour alone.
                                        aria-current={isCurrent ? "page" : undefined}
                                        className={`text-ui transition-colors hover:text-foreground ${
                                            isCurrent
                                                ? "text-foreground font-semibold underline underline-offset-8 decoration-primary decoration-2"
                                                : "text-muted-foreground"
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
