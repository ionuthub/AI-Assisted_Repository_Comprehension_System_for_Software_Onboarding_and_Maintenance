import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ExternalLink, Heart } from "lucide-react";

const Footer = () => {
    return (
        <footer className="border-t border-border bg-secondary/30 mt-auto">
            <div className="container mx-auto px-4 py-12 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                    >
                        <div className="mb-4">
                            <span className="font-bold text-lg">AI Code Tutor</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Unlock the potential of any codebase with instant AI explanations and architectural insights.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                    >
                        <h4 className="font-semibold mb-4 text-foreground">Capabilities</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link to="/?tab=github" className="hover:text-foreground transition-colors flex items-center gap-1">
                                    Repo Analysis
                                </Link>
                            </li>
                            <li>
                                <Link to="/?tab=generate" className="hover:text-foreground transition-colors flex items-center gap-1">
                                    Project Generation
                                </Link>
                            </li>
                        </ul>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                    >
                        <h4 className="font-semibold mb-4 text-foreground">Resources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link to="/faq" className="hover:text-foreground transition-colors">Documentation & FAQ</Link>
                            </li>
                            <li>
                                <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                            </li>
                        </ul>
                    </motion.div>
                </div>

                <motion.div
                    className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    viewport={{ once: true }}
                >
                    <p>© {new Date().getFullYear()} AI Code Tutor. All rights reserved.</p>
                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                        <span>Built for the future of</span>
                        <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                        <span>development</span>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
};

export default Footer;
