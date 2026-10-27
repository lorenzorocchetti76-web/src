import { lazy, Suspense } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Experience from "@/pages/Experience";

const TextRoute = lazy(() => import("@/pages/TextRoute"));
const Gallery = lazy(() => import("@/pages/Gallery"));
const AdminLogin = lazy(() => import("@/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

const PageLoading = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#080B10] font-mono text-xs uppercase tracking-[0.3em] text-[#66D9EF]" role="status">Caricamento…</div>
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Experience />} />
          <Route path="/testo" element={<TextRoute />} />
          <Route path="/galleria" element={<Gallery />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<Experience />} />
        </Routes>
      </Suspense>
      <Toaster theme="dark" />
    </BrowserRouter>
  );
}

export default App;
