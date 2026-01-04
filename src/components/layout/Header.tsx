import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const Header = () => {
    const [session, setSession] = useState<any>(null);
    const location = useLocation();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const navItems = [
        { label: "Analyze", path: "/" },
        { label: "FAQ", path: "/faq" },
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
                        <span className="text-xl font-bold tracking-tight">AI Code Tutor</span>
                    </Link>
                </motion.div>

                <nav className="flex items-center gap-2 md:gap-8">
                    <div className="hidden md:flex items-center gap-8 mr-4">
                        {navItems.map((item, idx) => (
                            <motion.div
                                key={item.path}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <Link
                                    to={item.path}
                                    className={`text-sm font-medium transition-colors hover:text-foreground ${location.pathname === item.path ? "text-foreground" : "text-muted-foreground"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        {session ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => supabase.auth.signOut()}
                                className="px-4"
                            >
                                Sign Out
                            </Button>
                        ) : (
                            <Button
                                variant="default"
                                size="sm"
                                asChild
                                className="px-4 bg-sky-600 hover:bg-sky-700 text-white"
                            >
                                <Link to="/auth">Sign In</Link>
                            </Button>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
};

export default Header;
