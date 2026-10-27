import { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { LogOut, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api";
import { SCENES } from "@/lib/content";
import { Logo } from "@/components/ett/Logo";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const card = "rounded-sm border border-white/10 bg-[#101D30]/60 p-5";
const tip = { contentStyle: { background: "#101D30", border: "1px solid rgba(102,217,239,.3)", color: "#F4F7FA" } };

const Kpi = ({ label, value, id, accent = "#F4F7FA" }) => (
  <div className={card}>
    <p className="font-mono text-[11px] uppercase tracking-widest text-[#F4F7FA]/70">{label}</p>
    <p data-testid={`kpi-${id}`} className="font-display mt-2 text-4xl font-black tabular-nums" style={{ color: accent }}>{value}</p>
  </div>
);

const Split = ({ title, data, id }) => {
  const total = Object.values(data || {}).reduce((a, b) => a + b, 0);
  return (
    <div className={card} data-testid={`split-${id}`}>
      <h3 className="font-mono text-xs uppercase tracking-widest text-[#66D9EF]">{title}</h3>
      {total === 0 ? <p className="mt-4 text-sm text-[#F4F7FA]/70">Nessun dato nel periodo.</p> : (
        <ul className="mt-4 space-y-3">
          {Object.entries(data).map(([k, v]) => (
            <li key={k}>
              <div className="flex justify-between text-sm"><span>{k}</span><span className="font-mono">{v}</span></div>
              <div className="mt-1 h-1 bg-white/10"><div className="h-1 bg-[#FF7138]" style={{ width: `${(v / total) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const nav = useNavigate();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [days, setDays] = useState(14);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const api = adminApi();
      const [s, l] = await Promise.all([api.get(`/admin/stats?days=${days}`), api.get("/admin/logs?limit=50")]);
      setStats(s.data);
      setLogs(Array.isArray(l.data) ? l.data : []);
      setError("");
    } catch (e) {
      if ([401, 403].includes(e.response?.status)) { sessionStorage.removeItem("ett_admin_token"); nav("/admin/login"); return; }
      setError("Impossibile caricare i dati. Riprovo automaticamente.");
    }
  }, [days, nav]);

  useEffect(() => {
    if (!sessionStorage.getItem("ett_admin_token")) { nav("/admin/login"); return undefined; }
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load, nav]);

  const logout = () => { sessionStorage.removeItem("ett_admin_token"); nav("/admin/login"); };
  const clear = async () => {
    try { const { data } = await adminApi().delete("/admin/logs"); toast.success(`${data.deleted} errori eliminati`); load(); }
    catch { toast.error("Eliminazione non riuscita"); }
  };

  const sceneData = (stats?.scenes ?? []).map((s) => ({ name: SCENES.find((x) => x.id === s.scene)?.short ?? s.scene, views: s.views }));

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-[#080B10] text-[#F4F7FA]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-10">
        <Link to="/" className="flex items-center gap-3"><Logo /><span className="font-wide text-sm font-bold tracking-[0.18em]">ADMIN</span></Link>
        <div className="flex items-center gap-2">
          <label htmlFor="range" className="sr-only">Periodo</label>
          <select id="range" data-testid="admin-range-select" value={days} onChange={(e) => setDays(Number(e.target.value))}
            className="h-10 rounded-full border border-white/15 bg-[#101D30] px-4 text-sm">
            <option value={7}>Ultimi 7 giorni</option><option value={14}>Ultimi 14 giorni</option><option value={30}>Ultimi 30 giorni</option>
          </select>
          <button data-testid="admin-refresh-btn" onClick={load} aria-label="Aggiorna" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 hover:border-[#66D9EF]"><RefreshCw className="h-4 w-4" /></button>
          <button data-testid="admin-logout-btn" onClick={logout} className="flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm hover:border-[#FF4B45]"><LogOut className="h-4 w-4" /> Esci</button>
        </div>
      </header>
      <main className="space-y-6 px-5 py-8 sm:px-10">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-4xl font-black uppercase tracking-tight">Analisi</h1>
          <span className="flex items-center gap-2 rounded-full border border-[#66D9EF]/30 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-[#66D9EF]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#66D9EF]" /> Live · 10s
          </span>
        </div>
        {error && <p role="alert" data-testid="admin-error" className="text-sm text-[#FF4B45]">{error}</p>}
        {!stats ? <p data-testid="admin-loading" className="font-mono text-xs uppercase tracking-widest text-[#F4F7FA]/70">Caricamento…</p> : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Kpi id="sessions" label="Sessioni" value={stats.sessions} />
              <Kpi id="events" label="Eventi" value={stats.total_events} accent="#66D9EF" />
              <Kpi id="stories" label="Approfondimenti aperti" value={stats.by_type?.story_open ?? 0} accent="#FF7138" />
              <Kpi id="errors" label="Errori" value={stats.errors} accent="#FF4B45" />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className={card}>
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#66D9EF]">Visualizzazioni per scena</h2>
                <div className="mt-4 h-64" data-testid="chart-scenes">
                  <ResponsiveContainer><BarChart data={sceneData}><XAxis dataKey="name" stroke="#9aa7b6" fontSize={11} /><YAxis stroke="#9aa7b6" fontSize={11} allowDecimals={false} /><Tooltip {...tip} /><Bar dataKey="views" fill="#FF7138" radius={[2, 2, 0, 0]} /></BarChart></ResponsiveContainer>
                </div>
              </div>
              <div className={card}>
                <h2 className="font-mono text-xs uppercase tracking-widest text-[#66D9EF]">Andamento giornaliero</h2>
                <div className="mt-4 h-64" data-testid="chart-daily">
                  {stats.daily?.length ? (
                    <ResponsiveContainer><AreaChart data={stats.daily}><CartesianGrid stroke="rgba(255,255,255,.06)" /><XAxis dataKey="day" stroke="#9aa7b6" fontSize={11} /><YAxis stroke="#9aa7b6" fontSize={11} allowDecimals={false} /><Tooltip {...tip} /><Area dataKey="events" stroke="#66D9EF" fill="#66D9EF33" /><Area dataKey="sessions" stroke="#FF7138" fill="#FF713833" /></AreaChart></ResponsiveContainer>
                  ) : <p className="text-sm text-[#F4F7FA]/70">Nessun dato nel periodo.</p>}
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Split id="mode" title="Modalità di fruizione" data={stats.by_mode} />
              <Split id="device" title="Dispositivi" data={stats.by_device} />
              <Split id="models" title="Modelli più visti" data={Object.fromEntries((stats.models ?? []).map((m) => [m.model, m.views]))} />
            </div>
          </>
        )}
        <section className={card} aria-labelledby="logs-title">
          <div className="flex items-center justify-between gap-4">
            <h2 id="logs-title" className="font-mono text-xs uppercase tracking-widest text-[#FF4B45]">Log errori in tempo reale</h2>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button data-testid="admin-clear-logs-btn" disabled={!logs.length} className="flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-xs hover:border-[#FF4B45] disabled:opacity-40"><Trash2 className="h-3.5 w-3.5" /> Svuota</button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-white/10 bg-[#101D30] text-[#F4F7FA]">
                <AlertDialogHeader><AlertDialogTitle>Eliminare tutti gli errori?</AlertDialogTitle><AlertDialogDescription className="text-[#F4F7FA]/75">L'operazione non può essere annullata.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel className="bg-transparent">Annulla</AlertDialogCancel><AlertDialogAction data-testid="admin-clear-logs-confirm" onClick={clear} className="bg-[#FF4B45] text-[#080B10]">Elimina</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {logs.length === 0 ? <p data-testid="admin-logs-empty" className="mt-4 text-sm text-[#F4F7FA]/70">Nessun errore registrato.</p> : (
            <ul className="mt-4 divide-y divide-white/10" data-testid="admin-logs-list">
              {logs.map((l) => (
                <li key={l.id} className="py-3">
                  <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-wider text-[#F4F7FA]/70">
                    <span className="text-[#FF4B45]">{l.level}</span><span>{new Date(l.created_at).toLocaleString("it-IT")}</span><span className="truncate">{l.url}</span>
                  </div>
                  <p className="mt-1 break-words text-sm">{l.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
