import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
    const location = useLocation();

    const navItems = [
        { label: "Analyze", path: "/" },
        { label: "Evaluation", path: "/evaluation" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20 md:px-8">
                <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link to="/" className="flex items-center space-x-2">
                        <span className="text-sm font-bold font-mono tracking-wider uppercase">Repository Comprehension</span>
                    </Link>
                </motion.div>
 
                <nav className="flex items-center gap-2 md:gap-8 font-mono">
                    <div className="flex items-center gap-6 mr-4">
                        {navItems.map((item, idx) => (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: idx * 0.05 }}
                            >
                                <Link
                                    to={item.path}
                                    className={`text-[11px] font-bold tracking-wider uppercase transition-colors hover:text-primary ${location.pathname === item.path ? "text-primary" : "text-muted-foreground"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
