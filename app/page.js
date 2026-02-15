"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// ALLANIMA UNIVERSE — LIVE NOTION DASHBOARD
// Next.js + Notion API + ISR
// ═══════════════════════════════════════════════════════

// ── Constants ─────────────────────────────────────────
const SIN_MAP = {
  Pride:    { icon: "♛", color: "#a855f7" },
  Wrath:    { icon: "⚔", color: "#ef4444" },
  Lust:     { icon: "♥", color: "#ec4899" },
  Greed:    { icon: "⬡", color: "#f59e0b" },
  Gluttony: { icon: "◉", color: "#84cc16" },
  Envy:     { icon: "⊘", color: "#06b6d4" },
  Sloth:    { icon: "◎", color: "#6366f1" },
};
const TYPE_COLORS = { Ultra:"#ef4444","The One":"#f5c542",Celestial:"#60a5fa","Hybrid Celestial":"#a78bfa",Fallen:"#dc2626",Frequency:"#f97316",Seed:"#eab308","Proto-God":"#f472b6",God:"#a855f7",Mortal:"#9ca3af",Unknown:"#666" };
const STATUS_COLORS = { Sealed:"#666",Sleeping:"#6366f1",Erased:"#dc2626",Fragmented:"#f59e0b",Transformed:"#8b5cf6",Deceased:"#444" };
const ALIGN_COLORS = { Pure:"#60a5fa",Balanced:"#34d399",Corrupted:"#ef4444",Fallen:"#dc2626",Neutral:"#888" };

// ── Stars Background ──────────────────────────────────
function Stars() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    let fr, stars = [];
    const init = () => {
      c.width = c.offsetWidth; c.height = c.offsetHeight;
      stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: Math.random() * 1.1 + 0.2, s: Math.random() * 0.02 + 0.005, o: Math.random(),
      }));
    };
    const draw = (t) => {
      ctx.clearRect(0, 0, c.width, c.height);
      stars.forEach((s) => {
        s.o = 0.3 + 0.7 * Math.abs(Math.sin(t * s.s));
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,190,255,${s.o})`; ctx.fill();
      });
      fr = requestAnimationFrame(draw);
    };
    init(); fr = requestAnimationFrame(draw);
    window.addEventListener("resize", init);
    return () => { cancelAnimationFrame(fr); window.removeEventListener("resize", init); };
  }, []);
  return <canvas ref={ref} className="stars-canvas" />;
}

// ── Reusable Components ───────────────────────────────
function Card({ children, className = "", hover, onClick, style }) {
  return (
    <div
      className={`card ${hover ? "card-hover" : ""} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}

function Tag({ children, color = "#a78bfa" }) {
  return (
    <span
      className="tag"
      style={{ background: `${color}22`, color, border: `1px solid ${color}33` }}
    >
      {children}
    </span>
  );
}

function Title({ children, sub }) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-xl font-bold text-gray-100 tracking-wide">{children}</h2>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative mb-3">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">⌕</span>
      <input
        value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "ค้นหา..."}
        className="w-full py-2 px-3 pl-8 bg-[rgba(15,10,30,0.8)] border border-[rgba(139,92,246,0.12)] rounded-lg text-gray-200 text-xs font-body outline-none focus:border-[rgba(139,92,246,0.3)]"
      />
    </div>
  );
}

function FilterChips({ label, options, value, onChange, colors }) {
  return (
    <div className="mb-2.5">
      <div className="text-[9px] text-gray-600 mb-1 uppercase tracking-widest">{label}</div>
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => onChange(null)}
          className="px-2.5 py-0.5 rounded-full border text-[10px] font-body"
          style={{
            borderColor: !value ? "#a78bfa" : "rgba(139,92,246,0.15)",
            background: !value ? "rgba(168,85,247,0.15)" : "transparent",
            color: !value ? "#c4b5fd" : "#555",
          }}
        >
          ทั้งหมด
        </button>
        {options.map((o) => (
          <button
            key={o} onClick={() => onChange(value === o ? null : o)}
            className="px-2.5 py-0.5 rounded-full border text-[10px] font-body"
            style={{
              borderColor: value === o ? (colors?.[o] || "#a78bfa") : "rgba(139,92,246,0.1)",
              background: value === o ? `${colors?.[o] || "#a78bfa"}22` : "transparent",
              color: value === o ? (colors?.[o] || "#c4b5fd") : "#555",
            }}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function NotionLink({ url }) {
  if (!url) return null;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="notion-link">📎 เปิดใน Notion →</a>;
}

function Loader({ label }) {
  const [dots, setDots] = useState("");
  useEffect(() => { const t = setInterval(() => setDots((d) => d.length >= 3 ? "" : d + "."), 400); return () => clearInterval(t); }, []);
  return (
    <div className="text-center py-10">
      <div className="loader-ring mx-auto mb-3" />
      <div className="text-xs text-gray-500">{label || "กำลังเชื่อมต่อ Notion"}{dots}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// PAGES
// ═══════════════════════════════════════════════════════

function PgOverview({ beings, layers, eras }) {
  const stats = [
    { n: beings.length, l: "Beings", icon: "👤", c: "#a78bfa" },
    { n: beings.filter((b) => b.type === "The One").length, l: "The Ones", icon: "⬡", c: "#f5c542" },
    { n: beings.filter((b) => b.sin).length, l: "Great Sins", icon: "🔥", c: "#ef4444" },
    { n: beings.filter((b) => b.type === "Ultra").length, l: "Ultras", icon: "⚠", c: "#dc2626" },
    { n: layers.length, l: "Layers", icon: "🏛", c: "#60a5fa" },
    { n: eras.length, l: "ERAs", icon: "📅", c: "#34d399" },
  ];
  return (
    <div className="animate-fadeSlide">
      <Title sub={`LIVE จาก Notion — ${beings.length} beings · ${layers.length} layers · ${eras.length} ERAs`}>🌌 Overview</Title>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {stats.map((s) => (
          <Card key={s.l} style={{ textAlign: "center", padding: 12 }}>
            <div className="text-lg">{s.icon}</div>
            <div className="font-display text-2xl font-extrabold" style={{ color: s.c }}>{s.n}</div>
            <div className="text-[9px] text-gray-600 tracking-widest">{s.l}</div>
          </Card>
        ))}
      </div>
      <Card className="mb-2.5">
        <div className="text-xs font-semibold text-violet-300 mb-2">Layers</div>
        {layers.map((l) => (
          <div key={l.id} className="flex items-center gap-2 mb-1">
            <div className="w-6 text-[9px] font-bold" style={{ color: l.color }}>L{l.num}</div>
            <div className="text-[10px] text-gray-400 flex-1">{l.name}</div>
            <Tag color={l.color}>{l.type}</Tag>
          </div>
        ))}
      </Card>
      <Card>
        <div className="text-xs font-semibold text-violet-300 mb-2">Timeline</div>
        {eras.map((e) => (
          <div key={e.code} className="flex items-baseline gap-2 mb-1">
            <span className="text-[10px] font-bold min-w-[50px]" style={{ color: e.color }}>{e.code}</span>
            <span className="text-[10px] text-gray-400">{e.name} — {e.en}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function PgBeings({ beings }) {
  const [q, setQ] = useState("");
  const [fType, setFType] = useState(null);
  const [fAlign, setFAlign] = useState(null);
  const [fStatus, setFStatus] = useState(null);
  const [sel, setSel] = useState(null);

  const types = [...new Set(beings.map((b) => b.type).filter(Boolean))];
  const aligns = [...new Set(beings.map((b) => b.align).filter(Boolean))];
  const statuses = [...new Set(beings.map((b) => b.status).filter(Boolean))];

  const filtered = useMemo(() => beings.filter((b) => {
    if (q && !b.name.toLowerCase().includes(q.toLowerCase()) && !b.role.includes(q) && !(b.sin || "").toLowerCase().includes(q.toLowerCase())) return false;
    if (fType && b.type !== fType) return false;
    if (fAlign && b.align !== fAlign) return false;
    if (fStatus && b.status !== fStatus) return false;
    return true;
  }), [beings, q, fType, fAlign, fStatus]);

  const detail = sel !== null ? beings.find((b) => b.id === sel) : null;

  if (detail) return (
    <div className="animate-fadeSlideQuick">
      <button onClick={() => setSel(null)} className="text-violet-400 text-xs mb-2.5 font-body bg-transparent border-none cursor-pointer p-0">← กลับ</button>
      <Card className="mb-2.5">
        <div className="flex items-center gap-2.5 mb-2.5">
          {detail.sin && <span className="text-3xl" style={{ color: SIN_MAP[detail.sin]?.color }}>{SIN_MAP[detail.sin]?.icon}</span>}
          <div>
            <h2 className="font-display text-lg font-bold text-gray-100">{detail.name}</h2>
            <div className="flex gap-1 mt-1 flex-wrap">
              <Tag color={TYPE_COLORS[detail.type] || "#888"}>{detail.type}</Tag>
              <Tag color={ALIGN_COLORS[detail.align] || "#888"}>{detail.align}</Tag>
              {detail.status && <Tag color={STATUS_COLORS[detail.status] || "#888"}>{detail.status}</Tag>}
              {detail.sin && <Tag color={SIN_MAP[detail.sin]?.color}>{detail.sin}</Tag>}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 leading-relaxed mb-2.5">{detail.role}</div>
        <div className="grid grid-cols-2 gap-2">
          <div><div className="text-[9px] text-gray-600 mb-0.5">GENERATION</div><div className="text-xs text-gray-300">{detail.gen || "—"}</div></div>
          <div><div className="text-[9px] text-gray-600 mb-0.5">RACE</div><div className="text-xs text-gray-300">{detail.race || "—"}</div></div>
        </div>
      </Card>
      {detail.form && <Card className="mb-2"><div className="text-[9px] text-gray-600 mb-1">PHYSICAL FORM</div><div className="text-xs text-gray-400 leading-relaxed">{detail.form}</div></Card>}
      {detail.personality && <Card className="mb-2"><div className="text-[9px] text-gray-600 mb-1">PERSONALITY</div><div className="text-xs text-gray-400 leading-relaxed">{detail.personality}</div></Card>}
      {detail.tags?.length > 0 && <Card className="mb-2"><div className="text-[9px] text-gray-600 mb-1.5">TAGS</div><div className="flex gap-1 flex-wrap">{detail.tags.map((t) => <Tag key={t} color="#888">{t}</Tag>)}</div></Card>}
      <NotionLink url={detail.url} />
    </div>
  );

  return (
    <div className="animate-fadeSlide">
      <Title sub={`${filtered.length} จาก ${beings.length} — LIVE จาก Notion`}>👤 Beings & Entities</Title>
      <SearchInput value={q} onChange={setQ} placeholder="ค้นหาชื่อ บทบาท หรือบาป..." />
      <FilterChips label="Type" options={types} value={fType} onChange={setFType} colors={TYPE_COLORS} />
      <FilterChips label="Alignment" options={aligns} value={fAlign} onChange={setFAlign} colors={ALIGN_COLORS} />
      <FilterChips label="Status" options={statuses} value={fStatus} onChange={setFStatus} colors={STATUS_COLORS} />
      <div className="mt-3 flex flex-col gap-1.5">
        {filtered.map((b) => (
          <Card key={b.id} hover onClick={() => setSel(b.id)} style={{ padding: "10px 14px" }}>
            <div className="flex items-center gap-2">
              {b.sin && <span className="text-base" style={{ color: SIN_MAP[b.sin]?.color }}>{SIN_MAP[b.sin]?.icon}</span>}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-100">{b.name}</div>
                <div className="text-[10px] text-gray-600 truncate">{(b.role || "").slice(0, 60)}</div>
              </div>
              <Tag color={TYPE_COLORS[b.type] || "#888"}>{b.type}</Tag>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-600 text-xs py-5">ไม่พบผลลัพธ์</div>}
      </div>
    </div>
  );
}

function PgSins({ beings }) {
  const [sel, setSel] = useState(null);
  const sins = beings.filter((b) => b.sin);
  const detail = sel ? sins.find((b) => b.id === sel) : null;

  if (detail) return (
    <div className="animate-fadeSlideQuick">
      <button onClick={() => setSel(null)} className="text-violet-400 text-xs mb-2.5 font-body bg-transparent border-none cursor-pointer p-0">← กลับ</button>
      <Card style={{ borderTop: `3px solid ${SIN_MAP[detail.sin]?.color}` }} className="mb-2.5">
        <div className="text-center mb-2.5">
          <div className="text-5xl" style={{ color: SIN_MAP[detail.sin]?.color }}>{SIN_MAP[detail.sin]?.icon}</div>
          <h2 className="font-display text-xl mt-1" style={{ color: SIN_MAP[detail.sin]?.color }}>{detail.sin?.toUpperCase()}</h2>
          <div className="text-sm font-semibold text-gray-100">{detail.name}</div>
        </div>
        <div className="text-xs text-gray-400 leading-relaxed mb-3">{detail.role}</div>
        <div className="grid grid-cols-2 gap-2.5">
          <div><div className="text-[9px] text-gray-600 mb-0.5">FORM</div><div className="text-[10px] text-gray-300 leading-relaxed">{detail.form}</div></div>
          <div><div className="text-[9px] text-gray-600 mb-0.5">PERSONALITY</div><div className="text-[10px] text-gray-300 leading-relaxed">{detail.personality}</div></div>
        </div>
      </Card>
      <NotionLink url={detail.url} />
    </div>
  );

  return (
    <div className="animate-fadeSlide">
      <Title sub={`${sins.length} Fallen Celestials — LIVE จาก Notion`}>🔥 7 Great Sins</Title>
      <div className="grid grid-cols-2 gap-2">
        {sins.map((b) => (
          <Card key={b.id} hover onClick={() => setSel(b.id)} style={{ textAlign: "center", padding: "16px 10px", borderBottom: `2px solid ${SIN_MAP[b.sin]?.color}33` }}>
            <div className="text-3xl mb-1" style={{ color: SIN_MAP[b.sin]?.color }}>{SIN_MAP[b.sin]?.icon}</div>
            <div className="text-xs font-bold" style={{ color: SIN_MAP[b.sin]?.color }}>{b.sin}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{b.name.split("(")[0].trim()}</div>
            <div className="text-[9px] text-gray-600 mt-0.5">{(b.name.match(/\((.+)\)/) || [])[1]}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PgLayers({ layers }) {
  const [sel, setSel] = useState(null);
  const layer = sel !== null ? layers.find((l) => l.num === sel) : null;

  return (
    <div className="animate-fadeSlide">
      <Title sub={`${layers.length} Layers — LIVE จาก Notion`}>🏛️ Layers & Realms</Title>
      <div className="flex flex-col gap-1 mb-4">
        {layers.map((l) => (
          <Card key={l.id} hover onClick={() => setSel(sel === l.num ? null : l.num)} style={{ padding: "10px 14px", borderLeft: `3px solid ${l.color}` }}>
            <div className="flex items-center gap-2.5">
              <div className="font-display text-sm font-extrabold min-w-[30px]" style={{ color: l.color }}>L{l.num}</div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-100">{l.name}</div>
                <div className="text-[10px] text-gray-600">{l.title}</div>
              </div>
              <Tag color={l.color}>{l.type}</Tag>
            </div>
          </Card>
        ))}
      </div>
      {layer && (
        <div className="animate-fadeSlideQuick">
          <Card style={{ borderTop: `2px solid ${layer.color}` }}>
            <h3 className="font-display text-base mb-1" style={{ color: layer.color }}>{layer.name} — {layer.thai}</h3>
            <div className="text-xs text-gray-400 leading-relaxed mb-2.5">{layer.fn}</div>
            {layer.locs && <><div className="text-[9px] text-gray-600 mb-0.5">KEY LOCATIONS</div><div className="text-xs text-gray-300 mb-2">{layer.locs}</div></>}
            <NotionLink url={layer.url} />
          </Card>
        </div>
      )}
    </div>
  );
}

function PgTimeline({ eras }) {
  const [sel, setSel] = useState(null);
  return (
    <div className="animate-fadeSlide">
      <Title sub={`${eras.length} ERAs — LIVE จาก Notion`}>📅 Timeline</Title>
      <div className="relative pl-7">
        <div className="absolute left-2.5 top-0 bottom-0 w-0.5" style={{ background: "linear-gradient(to bottom,#666,#a78bfa,#60a5fa,#f59e0b,#34d399)" }} />
        {eras.map((e, i) => (
          <div key={e.code} className="mb-5 relative">
            <div className="absolute -left-[22px] top-1 w-3 h-3 rounded-full border-2 border-[#0a0714]" style={{ background: e.color }} />
            <Card hover onClick={() => setSel(sel === i ? null : i)} style={{ borderLeft: `2px solid ${e.color}22` }}>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-display text-sm font-extrabold" style={{ color: e.color }}>{e.code}</span>
                <span className="text-xs font-semibold text-gray-100">{e.name}</span>
              </div>
              <div className="text-[10px] text-gray-500 mb-0.5">{e.en} · {e.thai}</div>
              <div className="flex gap-1 mb-1.5 flex-wrap">
                <Tag color={e.color}>{e.type}</Tag>
                <Tag color="#666">{e.dur}</Tag>
              </div>
              <div className="text-xs text-gray-400 leading-relaxed">{e.summary}</div>
              {sel === i && (
                <div className="mt-2">
                  <div className="flex gap-1 flex-wrap mb-1.5">{e.tags.map((t) => <Tag key={t} color="#a78bfa">{t}</Tag>)}</div>
                  <NotionLink url={e.url} />
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

function PgSearch({ beings, layers, eras }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    if (!q || q.length < 2) return { beings: [], layers: [], eras: [] };
    const ql = q.toLowerCase();
    return {
      beings: beings.filter((b) => b.name.toLowerCase().includes(ql) || b.role.includes(q) || b.personality?.includes(q) || (b.sin || "").toLowerCase().includes(ql)),
      layers: layers.filter((l) => l.name.toLowerCase().includes(ql) || l.thai.includes(q) || l.fn.includes(q)),
      eras: eras.filter((e) => e.name.toLowerCase().includes(ql) || e.thai.includes(q) || e.summary.includes(q) || e.en.toLowerCase().includes(ql)),
    };
  }, [beings, layers, eras, q]);
  const total = results.beings.length + results.layers.length + results.eras.length;

  return (
    <div className="animate-fadeSlide">
      <Title sub="ค้นหา LIVE ข้ามทุกหมวด">🔍 Search</Title>
      <SearchInput value={q} onChange={setQ} placeholder="พิมพ์ชื่อ คำอธิบาย..." />
      {q.length >= 2 && <div className="text-[10px] text-gray-600 mb-3">พบ {total} ผลลัพธ์</div>}
      {results.beings.length > 0 && (
        <div className="mb-3.5">
          <div className="text-[10px] font-semibold text-violet-400 mb-1.5">👤 Beings ({results.beings.length})</div>
          {results.beings.map((b) => <Card key={b.id} style={{ padding: "8px 12px", marginBottom: 4 }}><div className="text-xs font-semibold text-gray-100">{b.name}</div><div className="text-[10px] text-gray-600">{(b.role || "").slice(0, 80)}</div></Card>)}
        </div>
      )}
      {results.layers.length > 0 && (
        <div className="mb-3.5">
          <div className="text-[10px] font-semibold text-blue-400 mb-1.5">🏛️ Layers ({results.layers.length})</div>
          {results.layers.map((l) => <Card key={l.id} style={{ padding: "8px 12px", marginBottom: 4, borderLeft: `3px solid ${l.color}` }}><div className="text-xs font-semibold text-gray-100">L{l.num} — {l.name}</div></Card>)}
        </div>
      )}
      {results.eras.length > 0 && (
        <div>
          <div className="text-[10px] font-semibold text-emerald-400 mb-1.5">📅 ERAs ({results.eras.length})</div>
          {results.eras.map((e) => <Card key={e.code} style={{ padding: "8px 12px", marginBottom: 4 }}><div className="text-xs font-semibold" style={{ color: e.color }}>{e.code}: {e.name}</div></Card>)}
        </div>
      )}
      {q.length >= 2 && total === 0 && <div className="text-center text-gray-600 py-8 text-xs">ไม่พบผลลัพธ์</div>}
      {q.length < 2 && <div className="text-center text-gray-700 py-8 text-xs">พิมพ์อย่างน้อย 2 ตัวอักษร</div>}
    </div>
  );
}

function PgGraph({ beings }) {
  const [filter, setFilter] = useState(null);
  const [hov, setHov] = useState(null);
  const types = [...new Set(beings.map((b) => b.type).filter(Boolean))];
  const shown = useMemo(() => filter ? beings.filter((b) => b.type === filter) : beings, [beings, filter]);
  const W = 650, H = 480;
  const positions = useMemo(() => {
    const pos = {}, cx = W / 2, cy = H / 2;
    shown.forEach((b, i) => {
      const a = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
      const r = b.type === "Ultra" ? 60 : b.type === "The One" ? 150 : b.type === "Fallen" ? 260 : 210;
      pos[b.id] = { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    });
    return pos;
  }, [shown]);

  return (
    <div className="animate-fadeSlide">
      <Title sub="แผนผัง LIVE จาก Notion">🔗 Relations</Title>
      <FilterChips label="Filter" options={types} value={filter} onChange={setFilter} colors={TYPE_COLORS} />
      <Card style={{ padding: 4, overflow: "auto" }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto min-h-[280px]">
          <defs><radialGradient id="glow"><stop offset="0%" stopColor="rgba(139,92,246,0.12)" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
          <circle cx={W / 2} cy={H / 2} r={240} fill="url(#glow)" />
          {shown.map((b) => {
            const p = positions[b.id]; if (!p) return null;
            const isH = hov === b.id; const col = TYPE_COLORS[b.type] || "#888";
            return (
              <g key={b.id} onMouseEnter={() => setHov(b.id)} onMouseLeave={() => setHov(null)} className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r={isH ? 8 : 5} fill={col} opacity={isH ? 1 : 0.8} stroke={isH ? "#fff" : "none"} strokeWidth={1} />
                {(isH || shown.length < 15) && <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#ccc" fontSize={isH ? 9 : 7} fontFamily="'IBM Plex Sans',sans-serif">{b.name.split("(")[0].trim()}</text>}
                {isH && <text x={p.x} y={p.y + 16} textAnchor="middle" fill="#888" fontSize={7}>{b.type}</text>}
              </g>
            );
          })}
        </svg>
      </Card>
      <div className="flex gap-2.5 flex-wrap mt-2 justify-center">
        {Object.entries(TYPE_COLORS).filter(([t]) => beings.some((b) => b.type === t)).map(([t, c]) => (
          <div key={t} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            <span className="text-[9px] text-gray-600">{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
const NAV = [
  { id: "overview", icon: "🌌", label: "Overview" },
  { id: "search", icon: "🔍", label: "Search" },
  { id: "beings", icon: "👤", label: "Beings" },
  { id: "sins", icon: "🔥", label: "7 Sins" },
  { id: "layers", icon: "🏛", label: "Layers" },
  { id: "timeline", icon: "📅", label: "Timeline" },
  { id: "graph", icon: "🔗", label: "Relations" },
];

export default function Dashboard() {
  const [pg, setPg] = useState("overview");
  const [beings, setBeings] = useState([]);
  const [layers, setLayers] = useState([]);
  const [eras, setERAs] = useState([]);
  const [status, setStatus] = useState("loading");
  const [lastSync, setLastSync] = useState(null);

  const fetchData = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await fetch("/api/notion");
      const data = await res.json();
      if (data.beings?.length) setBeings(data.beings);
      if (data.layers?.length) setLayers(data.layers);
      if (data.eras?.length) setERAs(data.eras);
      setStatus(data.error ? "error" : "live");
      setLastSync(new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hasData = beings.length > 0 || layers.length > 0 || eras.length > 0;
  const pages = {
    overview: <PgOverview beings={beings} layers={layers} eras={eras} />,
    search: <PgSearch beings={beings} layers={layers} eras={eras} />,
    beings: <PgBeings beings={beings} />,
    sins: <PgSins beings={beings} />,
    layers: <PgLayers layers={layers} />,
    timeline: <PgTimeline eras={eras} />,
    graph: <PgGraph beings={beings} />,
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      <Stars />

      {/* Header */}
      <div className="sticky top-0 z-50">
        <div className="px-3.5 pt-2.5 flex items-center justify-between" style={{ background: "rgba(6,4,12,0.95)" }}>
          <div className="flex items-baseline gap-2.5">
            <span className="font-display text-sm font-extrabold text-violet-300 tracking-wider">ALLANIMA</span>
            <span className="text-[8px] text-gray-800 tracking-widest">LIVE</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`status-dot ${status}`} />
            <span className="text-[8px] text-gray-600">
              {status === "live" ? "LIVE" : status === "loading" ? "SYNCING" : "OFFLINE"}
            </span>
            {lastSync && <span className="text-[8px] text-gray-800">{lastSync}</span>}
            <button
              onClick={fetchData}
              title="Refresh from Notion"
              className="bg-transparent border border-[rgba(139,92,246,0.15)] rounded-md text-gray-600 text-[10px] px-2 py-0.5 cursor-pointer font-body ml-0.5 hover:border-[rgba(139,92,246,0.3)] hover:text-violet-400 transition-colors"
            >
              ↻
            </button>
          </div>
        </div>
        <div className="navstrip">
          {NAV.map((n) => (
            <button
              key={n.id}
              className={`navbtn ${pg === n.id ? "active" : ""}`}
              onClick={() => setPg(n.id)}
            >
              <span className="text-sm">{n.icon}</span>{n.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main
        key={pg}
        className="flex-1 px-4 py-5 max-w-[700px] mx-auto w-full relative z-10 animate-fadeSlide"
      >
        {status === "loading" && !hasData ? (
          <Loader label="กำลังดึงข้อมูลจาก Notion" />
        ) : status === "error" && !hasData ? (
          <div className="text-center py-10">
            <div className="text-2xl mb-2">⚠</div>
            <div className="text-sm text-red-500 mb-1">ไม่สามารถเชื่อมต่อ Notion</div>
            <div className="text-xs text-gray-600 mb-3">ตรวจสอบ NOTION_TOKEN และ Database ID</div>
            <button
              onClick={fetchData}
              className="px-5 py-2 rounded-lg border border-violet-500 bg-violet-500/10 text-violet-300 text-xs cursor-pointer font-body hover:bg-violet-500/20 transition-colors"
            >
              ลองใหม่
            </button>
          </div>
        ) : (
          pages[pg]
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 text-center text-[8px] text-gray-900 relative z-10">
        ALLANIMA Universe · Notion Live · {lastSync ? `synced ${lastSync}` : ""}
      </footer>
    </div>
  );
}

