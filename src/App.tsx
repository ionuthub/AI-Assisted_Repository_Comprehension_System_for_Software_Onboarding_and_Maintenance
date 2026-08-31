import { ErrorBoundary } from "./components/ErrorBoundary";
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { Skeleton } from "./components/ui/skeleton";

// Load pages only when they are needed.
const Index = lazy(() => import("./pages/Index"));
const Evaluation = lazy(() => import("./pages/Evaluation"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="container mx-auto px-4 py-20 space-y-8">
    <Skeleton className="h-12 w-3/4 max-w-2xl" />
    <Skeleton className="h-8 w-1/2 max-w-xl" />
    <div className="grid gap-6 md:grid-cols-3">
      <Skeleton className="h-[400px]" />
      <Skeleton className="h-[400px] md:col-span-2" />
    </div>
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Layout>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/evaluation" element={<Evaluation />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
);

export default App;
