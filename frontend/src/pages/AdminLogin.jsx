import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API, formatApiError } from "@/lib/api";
import { Logo } from "@/components/ett/Logo";

export default function AdminLogin() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@") || !password) { setError("Inserisci email e password valide."); return; }
    setBusy(true);
    try {
      const { data } = await axios.post(`${API}/auth/login`, { email, password });
      sessionStorage.setItem("ett_admin_token", data.token);
      nav("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || err.message);
    } finally { setBusy(false); }
  };

  return (
    <div data-testid="admin-login-page" className="flex min-h-screen items-center justify-center bg-[#080B10] px-5 text-[#F4F7FA]">
      <form onSubmit={submit} noValidate className="w-full max-w-sm">
        <Link to="/" className="mb-10 flex items-center gap-3" aria-label="Torna all'esperienza"><Logo /><span className="font-wide text-sm font-bold tracking-[0.18em]">EARTH THROUGH TIME</span></Link>
        <h1 className="font-display text-4xl font-black uppercase tracking-tight">Area admin</h1>
        <p className="mt-2 text-sm text-[#F4F7FA]/75">Analisi dei dati ed errori in tempo reale.</p>
        <div className="mt-8 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" data-testid="admin-email-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 bg-[#101D30]" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" data-testid="admin-password-input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 bg-[#101D30]" />
          </div>
          {error && <p role="alert" data-testid="admin-login-error" className="text-sm text-[#FF4B45]">{error}</p>}
          <button type="submit" disabled={busy} data-testid="admin-login-submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#F4F7FA] py-3 text-sm font-semibold text-[#080B10] transition-colors hover:bg-[#66D9EF] disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Accedi
          </button>
        </div>
      </form>
    </div>
  );
}
