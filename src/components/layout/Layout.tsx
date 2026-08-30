import React from "react";
import Header from "./Header";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const location = useLocation();
    const reduceMotion = useReducedMotion();

    return (
        <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 flex flex-col">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={location.pathname}
                        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
                        transition={{ duration: reduceMotion ? 0 : 0.2 }}
                        className="flex-1 flex flex-col"
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
