import { useState, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════
   CONFIG — point this at your Express backend
   ═══════════════════════════════════════════════ */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════════ */
const T = {
  bg: "#0B0F1A",
  surface: "#121829",
  surfaceAlt: "#1A2137",
  border: "#252E45",
  borderLight: "#2E3A56",
  text: "#E2E8F0",
  textMuted: "#8892A8",
  textDim: "#5A6478",
  accent: "#3ECFB4",
  accentDim: "rgba(62,207,180,0.12)",
  accentGlow: "rgba(62,207,180,0.25)",
  danger: "#F06B6B",
  dangerDim: "rgba(240,107,107,0.12)",
  warn: "#F0C45A",
  warnDim: "rgba(240,196,90,0.12)",
  blue: "#5B8DEF",
  blueDim: "rgba(91,141,239,0.12)",
  radius: "12px",
  radiusSm: "8px",
  font: "'DM Sans', 'Segoe UI', sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
};

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: ${T.bg};
  color: ${T.text};
  font-family: ${T.font};
  -webkit-font-smoothing: antialiased;
}

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

type Page = "dashboard" | "submit" | "detail";

interface Idea {
  id: string;
  title: string;
  description: string;
  industry?: string;
  target_market?: string;
  created_at: string;
  status: string;
  analysis?: Analysis | null;
}

interface Analysis {
  profitability_score: number;
  risk_level: string;
  risk_factors?: string[];
  verdict: string;
  problem_summary: string;
  customer_persona?: {
    name: string;
    age_range: string;
    occupation: string;
    demographics: string;
    pain_points?: string[];
    goals?: string[];
  };
  market_overview?: {
    summary: string;
    market_size?: string;
    growth_rate?: string;
    trends?: string[];
  };
  competitors?: Competitor[];
  suggested_tech_stack?: {
    frontend?: string[];
    backend?: string[];
    database?: string[];
    infrastructure?: string[];
    ai_ml?: string[];
    rationale?: string;
  };
  profitability_rationale?: string;
  recommendations?: string[];
}

interface Competitor {
  name: string;
  description: string;
  strengths?: string[];
  weaknesses?: string[];
}

async function api(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

function Icon({ d, size = 20, color = "currentColor", ...props }: { d: string; size?: number; color?: string; [key: string]: any }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d={d} />
    </svg>
  );
}

const Icons = {
  rocket: (p: any) => <Icon d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09zM12 15l-3-3M22 2l-7.5 7.5" {...p} />,
  plus: (p: any) => <Icon d="M12 5v14M5 12h14" {...p} />,
  list: (p: any) => <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" {...p} />,
  back: (p: any) => <Icon d="M19 12H5M12 19l-7-7 7-7" {...p} />,
  trash: (p: any) => <Icon d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" {...p} />,
  eye: (p: any) => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...p} />,
  alert: (p: any) => <Icon d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" {...p} />,
  check: (p: any) => <Icon d="M20 6L9 17l-5-5" {...p} />,
  target: (p: any) => <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" {...p} />,
  bar: (p: any) => <Icon d="M18 20V10M12 20V4M6 20v-6" {...p} />,
  users: (p: any) => <Icon d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" {...p} />,
  code: (p: any) => <Icon d="M16 18l6-6-6-6M8 6l-6 6 6 6" {...p} />,
  shield: (p: any) => <Icon d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p} />,
  dollar: (p: any) => <Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" {...p} />,
  star: (p: any) => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" {...p} />,
  refresh: (p: any) => <Icon d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" {...p} />,
  clock: (p: any) => <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM12 6v6l4 2" {...p} />,
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string; icon: (props: any) => JSX.Element }> = {
    completed: { label: "Completed", bg: T.accentDim, color: T.accent, icon: Icons.check },
    analyzing: { label: "Analyzing…", bg: T.blueDim, color: T.blue, icon: Icons.clock },
    pending: { label: "Pending", bg: T.warnDim, color: T.warn, icon: Icons.clock },
    failed: { label: "Failed", bg: T.dangerDim, color: T.danger, icon: Icons.alert },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 12, fontWeight: 600, letterSpacing: 0.3,
    }}>
      <s.icon size={13} color={s.color} />
      {s.label}
    </span>
  );
}

function RiskBadge({ level }: { level: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Low: { bg: T.accentDim, color: T.accent },
    Medium: { bg: T.warnDim, color: T.warn },
    High: { bg: T.dangerDim, color: T.danger },
  };
  const s = map[level] || map.Medium;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 16px", borderRadius: 20,
      background: s.bg, color: s.color,
      fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
    }}>
      <Icons.shield size={15} color={s.color} />
      {level} Risk
    </span>
  );
}

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? T.accent : score >= 40 ? T.warn : T.danger;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.border} strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: size * 0.32, fontWeight: 800, color, fontFamily: T.fontMono }}>{score}</span>
        <span style={{ fontSize: 10, color: T.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>Score</span>
      </div>
    </div>
  );
}

function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: `2px solid ${T.border}`,
      borderTopColor: T.accent,
      borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function EmptyState({ icon: Ic, title, subtitle, action }: { icon: (props: any) => JSX.Element; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "80px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <Ic size={32} color={T.accent} />
      </div>
      <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: T.textMuted, fontSize: 14, maxWidth: 360, lineHeight: 1.6 }}>{subtitle}</p>
      {action && <div style={{ marginTop: 20 }}>{action}</div>}
    </div>
  );
}

function Card({ children, style = {}, hover = false, ...props }: { children: React.ReactNode; style?: React.CSSProperties; hover?: boolean; [key: string]: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => hover && setHovered(true)}
      onMouseLeave={() => hover && setHovered(false)}
      style={{
        background: T.surface,
        border: `1px solid ${hovered ? T.accentGlow : T.border}`,
        borderRadius: T.radius,
        padding: 24,
        transition: "all 0.25s ease",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered ? `0 8px 32px ${T.accentDim}` : "none",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

function Button({ children, variant = "primary", loading = false, style = {}, ...props }: { children: React.ReactNode; variant?: string; loading?: boolean; style?: React.CSSProperties; [key: string]: any }) {
  const styles: Record<string, React.CSSProperties> = {
    primary: {
      background: T.accent, color: T.bg,
      fontWeight: 700, border: "none",
    },
    secondary: {
      background: "transparent", color: T.text,
      border: `1px solid ${T.border}`,
    },
    danger: {
      background: T.dangerDim, color: T.danger,
      border: `1px solid transparent`,
    },
    ghost: {
      background: "transparent", color: T.textMuted,
      border: "none",
    },
  };
  return (
    <button
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "10px 20px", borderRadius: T.radiusSm,
        fontSize: 14, cursor: loading ? "wait" : "pointer",
        transition: "all 0.2s ease",
        opacity: loading ? 0.7 : 1,
        fontFamily: T.font,
        letterSpacing: 0.2,
        ...styles[variant],
        ...style,
      }}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
}

function Input({ label, ...props }: { label?: string; [key: string]: any }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 13, fontWeight: 600,
          color: T.textMuted, marginBottom: 8,
          textTransform: "uppercase", letterSpacing: 0.8,
        }}>{label}</label>
      )}
      <input
        style={{
          width: "100%", padding: "12px 16px",
          background: T.surfaceAlt, border: `1px solid ${T.border}`,
          borderRadius: T.radiusSm, color: T.text,
          fontSize: 15, fontFamily: T.font,
          outline: "none", transition: "border-color 0.2s",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = T.accent)}
        onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
        {...props}
      />
    </div>
  );
}

function TextArea({ label, ...props }: { label?: string; [key: string]: any }) {
  return (
    <div style={{ marginBottom: 20 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 13, fontWeight: 600,
          color: T.textMuted, marginBottom: 8,
          textTransform: "uppercase", letterSpacing: 0.8,
        }}>{label}</label>
      )}
      <textarea
        style={{
          width: "100%", padding: "12px 16px", minHeight: 140,
          background: T.surfaceAlt, border: `1px solid ${T.border}`,
          borderRadius: T.radiusSm, color: T.text,
          fontSize: 15, fontFamily: T.font, lineHeight: 1.6,
          outline: "none", transition: "border-color 0.2s", resize: "vertical",
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = T.accent)}
        onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
        {...props}
      />
    </div>
  );
}

function SectionHeader({ icon: Ic, title, color = T.accent }: { icon: (props: any) => JSX.Element; title: string; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Ic size={18} color={color} />
      </div>
      <h3 style={{
        fontSize: 16, fontWeight: 700, letterSpacing: 0.3,
        fontFamily: "'Playfair Display', serif",
      }}>{title}</h3>
    </div>
  );
}

function TagList({ items, color = T.accent }: { items?: string[]; color?: string }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((t, i) => (
        <span key={i} style={{
          padding: "5px 12px", borderRadius: 6,
          background: `${color}14`, color,
          fontSize: 13, fontWeight: 500,
        }}>{t}</span>
      ))}
    </div>
  );
}

function CompetitorCard({ comp }: { comp: Competitor }) {
  return (
    <div style={{
      background: T.surfaceAlt, borderRadius: T.radiusSm,
      padding: 16, border: `1px solid ${T.border}`,
    }}>
      <h4 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{comp.name}</h4>
      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5, marginBottom: 12 }}>{comp.description}</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 1 }}>Strengths</span>
          {comp.strengths?.map((s, i) => (
            <div key={i} style={{ fontSize: 13, color: T.textMuted, marginTop: 4, display: "flex", gap: 6 }}>
              <span style={{ color: T.accent }}>+</span> {s}
            </div>
          ))}
        </div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.danger, textTransform: "uppercase", letterSpacing: 1 }}>Weaknesses</span>
          {comp.weaknesses?.map((w, i) => (
            <div key={i} style={{ fontSize: 13, color: T.textMuted, marginTop: 4, display: "flex", gap: 6 }}>
              <span style={{ color: T.danger }}>−</span> {w}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubmitPage({ onNavigate }: { onNavigate: (page: Page, id?: string | null) => void }) {
  const [form, setForm] = useState({ title: "", description: "", industry: "", target_market: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError("Title and description are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await api("/ideas", {
        method: "POST",
        body: JSON.stringify(form),
      });
      onNavigate("detail", res.data.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", animation: "fadeUp 0.5s ease" }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: "0 auto 20px",
          background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 12px 40px ${T.accentDim}`,
        }}>
          <Icons.rocket size={30} color={T.bg} />
        </div>
        <h1 style={{
          fontSize: 32, fontWeight: 800,
          fontFamily: "'Playfair Display', serif",
          marginBottom: 10,
          background: `linear-gradient(135deg, ${T.text}, ${T.accent})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Validate Your Idea
        </h1>
        <p style={{ color: T.textMuted, fontSize: 16, lineHeight: 1.6 }}>
          Submit your startup concept and get an AI-powered analysis — market fit, risks, competitors, and more.
        </p>
      </div>

      <Card>
        <Input label="Startup Title" placeholder="e.g. EcoTrack, PetPal, FinBot…"
          value={form.title} maxLength={200}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, title: e.target.value })} />

        <TextArea label="Describe Your Idea" placeholder="What problem does it solve? Who is the target audience? How does it work?"
          value={form.description} maxLength={5000}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm({ ...form, description: e.target.value })} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Input label="Industry (optional)" placeholder="e.g. FinTech, HealthTech"
            value={form.industry}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, industry: e.target.value })} />
          <Input label="Target Market (optional)" placeholder="e.g. Gen Z, SMBs"
            value={form.target_market}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, target_market: e.target.value })} />
        </div>

        {error && (
          <div style={{
            padding: "10px 16px", borderRadius: T.radiusSm,
            background: T.dangerDim, color: T.danger,
            fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
          }}>
            <Icons.alert size={15} color={T.danger} /> {error}
          </div>
        )}

        <Button onClick={handleSubmit} loading={loading}
          style={{ width: "100%", justifyContent: "center", padding: "14px 24px", fontSize: 15 }}>
          {loading ? "Analyzing with AI…" : "Submit & Analyze"}
        </Button>

        {loading && (
          <p style={{ textAlign: "center", color: T.textMuted, fontSize: 13, marginTop: 14 }}>
            This takes 10–20 seconds while the AI generates your full report.
          </p>
        )}
      </Card>
    </div>
  );
}

function DashboardPage({ onNavigate }: { onNavigate: (page: Page, id?: string | null) => void }) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api("/ideas?limit=50");
      setIdeas(res.ideas || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this idea and its report?")) return;
    setDeleting(id);
    try {
      await api(`/ideas/${id}`, { method: "DELETE" });
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (d: string) => {
    const dt = new Date(d);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 80, gap: 16 }}>
        <Spinner size={28} />
        <p style={{ color: T.textMuted, fontSize: 14 }}>Loading your ideas…</p>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState icon={Icons.alert} title="Connection Error"
        subtitle={`Could not reach the API. Make sure your backend is running at ${API_BASE}`}
        action={<Button onClick={load}>Retry</Button>} />
    );
  }

  if (!ideas.length) {
    return (
      <EmptyState icon={Icons.rocket} title="No ideas yet"
        subtitle="Submit your first startup idea to get an AI-powered validation report."
        action={<Button onClick={() => onNavigate("submit")}>
          <Icons.plus size={16} /> Submit an Idea
        </Button>} />
    );
  }

  return (
    <div style={{ animation: "fadeUp 0.4s ease" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>Your Ideas</h2>
          <p style={{ color: T.textMuted, fontSize: 14, marginTop: 4 }}>{ideas.length} idea{ideas.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <Button onClick={() => onNavigate("submit")}>
          <Icons.plus size={16} /> New Idea
        </Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ideas.map((idea, i) => (
          <Card key={idea.id} hover style={{
            cursor: "pointer",
            animationDelay: `${i * 0.05}s`,
            animation: "fadeUp 0.4s ease both",
          }}
            onClick={() => onNavigate("detail", idea.id)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700 }}>{idea.title}</h3>
                  <StatusBadge status={idea.status} />
                </div>
                <p style={{
                  color: T.textMuted, fontSize: 14, lineHeight: 1.5,
                  overflow: "hidden", textOverflow: "ellipsis",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                }}>
                  {idea.description}
                </p>
                <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                  {idea.industry && (
                    <span style={{ fontSize: 12, color: T.textDim }}>
                      {idea.industry}
                    </span>
                  )}
                  <span style={{ fontSize: 12, color: T.textDim }}>
                    {formatDate(idea.created_at)}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 4, marginLeft: 16, flexShrink: 0 }}>
                <Button variant="ghost" style={{ padding: 8 }}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); onNavigate("detail", idea.id); }}>
                  <Icons.eye size={16} color={T.textMuted} />
                </Button>
                <Button variant="ghost" style={{ padding: 8 }}
                  loading={deleting === idea.id}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleDelete(idea.id); }}>
                  <Icons.trash size={16} color={T.danger} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DetailPage({ id, onNavigate }: { id: string | null; onNavigate: (page: Page, id?: string | null) => void }) {
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api(`/ideas/${id}`);
      const idea = res.data;
      if (idea && typeof idea.analysis === "string") {
        try { idea.analysis = JSON.parse(idea.analysis); } catch { idea.analysis = null; }
      }
      setIdea(idea);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const handleRetry = async () => {
    if (!id) return;
    setRetrying(true);
    try {
      const res = await api(`/ideas/${id}/retry`, { method: "POST" });
      const idea = res.data;
      if (idea && typeof idea.analysis === "string") {
        try { idea.analysis = JSON.parse(idea.analysis); } catch { idea.analysis = null; }
      }
      setIdea(idea);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 80, gap: 16 }}>
        <Spinner size={28} />
        <p style={{ color: T.textMuted }}>Loading report…</p>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <EmptyState icon={Icons.alert} title="Not Found"
        subtitle={error || "This idea could not be loaded."}
        action={<Button onClick={() => onNavigate("dashboard")}>
          <Icons.back size={16} /> Back to Dashboard
        </Button>} />
    );
  }

  const a = idea.analysis;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", animation: "fadeUp 0.4s ease" }}>
      <Button variant="ghost" onClick={() => onNavigate("dashboard")}
        style={{ marginBottom: 24, padding: "6px 0" }}>
        <Icons.back size={16} /> Back to Dashboard
      </Button>

      <Card style={{ marginBottom: 24, position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: 0, right: 0, width: 200, height: 200,
          background: `radial-gradient(circle at top right, ${T.accentDim}, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <StatusBadge status={idea.status} />
            <h1 style={{
              fontSize: 28, fontWeight: 800, marginTop: 12,
              fontFamily: "'Playfair Display', serif",
            }}>{idea.title}</h1>
            <p style={{ color: T.textMuted, fontSize: 15, lineHeight: 1.6, marginTop: 8, maxWidth: 600 }}>
              {idea.description}
            </p>
            <div style={{ display: "flex", gap: 20, marginTop: 14 }}>
              {idea.industry && <span style={{ fontSize: 13, color: T.textDim, padding: "4px 10px", background: T.surfaceAlt, borderRadius: 6 }}>{idea.industry}</span>}
              {idea.target_market && <span style={{ fontSize: 13, color: T.textDim, padding: "4px 10px", background: T.surfaceAlt, borderRadius: 6 }}>{idea.target_market}</span>}
            </div>
          </div>
        </div>
      </Card>

      {idea.status === "failed" && (
        <Card style={{ marginBottom: 24, borderColor: T.danger }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Icons.alert size={20} color={T.danger} />
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600 }}>Analysis failed</p>
              <p style={{ fontSize: 13, color: T.textMuted }}>The AI could not complete the report. You can retry below.</p>
            </div>
            <Button onClick={handleRetry} loading={retrying}>
              <Icons.refresh size={16} /> Retry Analysis
            </Button>
          </div>
        </Card>
      )}

      {!a && idea.status !== "failed" && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: T.textMuted }}>
            <Spinner size={18} />
            <span>Analysis is being generated…</span>
          </div>
        </Card>
      )}

      {a && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28 }}>
              <ScoreRing score={a.profitability_score} size={110} />
              <span style={{ fontSize: 12, color: T.textMuted, marginTop: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                Profitability
              </span>
            </Card>
            <Card style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28 }}>
              <RiskBadge level={a.risk_level} />
              <div style={{ marginTop: 16 }}>
                {a.risk_factors?.slice(0, 3).map((r, i) => (
                  <p key={i} style={{ fontSize: 12, color: T.textMuted, marginTop: 6, textAlign: "center", lineHeight: 1.4 }}>
                    • {r}
                  </p>
                ))}
              </div>
            </Card>
            <Card style={{ padding: 28 }}>
              <SectionHeader icon={Icons.star} title="Verdict" />
              <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{a.verdict}</p>
            </Card>
          </div>

          <Card>
            <SectionHeader icon={Icons.target} title="Problem Summary" />
            <p style={{ fontSize: 15, color: T.textMuted, lineHeight: 1.7 }}>{a.problem_summary}</p>
          </Card>

          {a.customer_persona && (
            <Card>
              <SectionHeader icon={Icons.users} title="Customer Persona" color={T.blue} />
              <div style={{
                display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 24px",
                fontSize: 14,
              }}>
                {[
                  ["Name", a.customer_persona.name],
                  ["Age", a.customer_persona.age_range],
                  ["Occupation", a.customer_persona.occupation],
                  ["Demographics", a.customer_persona.demographics],
                ].map(([k, v]) => v && (
                  <>
                    <span key={`${k}-label`} style={{ color: T.textDim, fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.8 }}>{k}</span>
                    <span key={`${k}-value`} style={{ color: T.textMuted }}>{v}</span>
                  </>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.danger, textTransform: "uppercase", letterSpacing: 1 }}>Pain Points</span>
                  {a.customer_persona.pain_points?.map((p, i) => (
                    <p key={i} style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>• {p}</p>
                  ))}
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 1 }}>Goals</span>
                  {a.customer_persona.goals?.map((g, i) => (
                    <p key={i} style={{ fontSize: 13, color: T.textMuted, marginTop: 6 }}>• {g}</p>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {a.market_overview && (
            <Card>
              <SectionHeader icon={Icons.bar} title="Market Overview" color={T.warn} />
              <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7, marginBottom: 16 }}>{a.market_overview.summary}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  ["Market Size", a.market_overview.market_size],
                  ["Growth Rate", a.market_overview.growth_rate],
                ].map(([k, v]) => v && (
                  <div key={k} style={{ padding: 14, background: T.surfaceAlt, borderRadius: T.radiusSm }}>
                    <span style={{ fontSize: 11, color: T.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{k}</span>
                    <p style={{ fontSize: 16, fontWeight: 700, marginTop: 4, fontFamily: T.fontMono }}>{v}</p>
                  </div>
                ))}
              </div>
              {a.market_overview.trends?.length > 0 && (
                <>
                  <span style={{ fontSize: 12, fontWeight: 700, color: T.warn, textTransform: "uppercase", letterSpacing: 1 }}>Key Trends</span>
                  <TagList items={a.market_overview.trends} color={T.warn} />
                </>
              )}
            </Card>
          )}

          {a.competitors?.length > 0 && (
            <Card>
              <SectionHeader icon={Icons.target} title="Competitor Landscape" color={T.danger} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {a.competitors.map((c, i) => <CompetitorCard key={i} comp={c} />)}
              </div>
            </Card>
          )}

          {a.suggested_tech_stack && (
            <Card>
              <SectionHeader icon={Icons.code} title="Suggested Tech Stack" color={T.blue} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
                {[
                  ["Frontend", a.suggested_tech_stack.frontend],
                  ["Backend", a.suggested_tech_stack.backend],
                  ["Database", a.suggested_tech_stack.database],
                  ["Infrastructure", a.suggested_tech_stack.infrastructure],
                  ["AI / ML", a.suggested_tech_stack.ai_ml],
                ].map(([label, items]) => items?.length > 0 && (
                  <div key={label}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
                    <div style={{ marginTop: 8 }}>
                      <TagList items={items} color={T.blue} />
                    </div>
                  </div>
                ))}
              </div>
              {a.suggested_tech_stack.rationale && (
                <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginTop: 8, padding: 12, background: T.surfaceAlt, borderRadius: T.radiusSm }}>
                  {a.suggested_tech_stack.rationale}
                </p>
              )}
            </Card>
          )}

          {a.profitability_rationale && (
            <Card>
              <SectionHeader icon={Icons.dollar} title="Profitability Analysis" />
              <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{a.profitability_rationale}</p>
            </Card>
          )}

          {a.recommendations?.length > 0 && (
            <Card>
              <SectionHeader icon={Icons.check} title="Recommendations" />
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {a.recommendations.map((r, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: 14, background: T.surfaceAlt, borderRadius: T.radiusSm,
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: T.accentDim, display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0, marginTop: 1,
                      fontSize: 12, fontWeight: 700, color: T.accent, fontFamily: T.fontMono,
                    }}>{i + 1}</div>
                    <p style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.6 }}>{r}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [detailId, setDetailId] = useState<string | null>(null);

  const navigate = (target: Page, id: string | null = null) => {
    setPage(target);
    if (id) setDetailId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const id = "__sv-global-css";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 32px",
        background: `${T.bg}e6`,
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
          onClick={() => navigate("dashboard")}> 
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `linear-gradient(135deg, ${T.accent}, ${T.blue})`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Icons.rocket size={17} color={T.bg} />
          </div>
          <span style={{
            fontSize: 17, fontWeight: 800,
            fontFamily: "'Playfair Display', serif",
            letterSpacing: -0.3,
          }}>IdeaValidator</span>
        </div>

        <div style={{ display: "flex", gap: 4 }}>
          <Button variant={page === "dashboard" ? "secondary" : "ghost"}
            onClick={() => navigate("dashboard")}
            style={{ padding: "7px 14px", fontSize: 13 }}>
            <Icons.list size={15} /> Dashboard
          </Button>
          <Button variant={page === "submit" ? "secondary" : "ghost"}
            onClick={() => navigate("submit")}
            style={{ padding: "7px 14px", fontSize: 13 }}>
            <Icons.plus size={15} /> Submit
          </Button>
        </div>
      </nav>

      <main style={{ padding: "40px 32px 80px", maxWidth: 1040, margin: "0 auto" }}>
        {page === "submit" && <SubmitPage onNavigate={navigate} />}
        {page === "dashboard" && <DashboardPage onNavigate={navigate} />}
        {page === "detail" && <DetailPage id={detailId} onNavigate={navigate} />}
      </main>
    </div>
  );
}
