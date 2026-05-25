/**
 * EventPlannerPage.jsx
 * ---------------------
 * Drop this file into:  src/Pages/EventPlannerPage.jsx
 *
 * Then in App.js add:
 *   import EventPlannerPage from "./Pages/EventPlannerPage";
 *   <Route path="/events" element={<EventPlannerPage />} />
 *
 * Add an "Events" button to your bottom nav in DashboardPage (or wherever
 * your global nav lives):
 *   import { Calendar } from "lucide-react";
 *   <button onClick={() => navigate("/events")}><Calendar size={22}/><span>Events</span></button>
 */

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  MapPin,
  PlusSquare,
  User,
  Sparkles,
  Calendar,
  Edit3,
  CheckCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const VIBES = [
  "Outdoor",
  "Indoor",
  "Social",
  "Training",
  "Relaxed",
  "Active",
  "Educational",
  "Playdate",
];
const BUDGETS = ["Free", "Budget $", "Mid $$", "Premium $$$"];
const GROUP_SIZES = ["Solo", "2–5", "6–15", "15+"];
const DURATIONS = ["1 hr", "2–3 hrs", "Half-day", "Full day"];
const ACCESSIBILITY = [
  "Leash required",
  "Off-leash ok",
  "Wheelchair friendly",
  "Bring carrier",
  "All ages",
  "Adults only",
];
const AI_CATS = [
  "Dog Park Meetup",
  "Training Class",
  "Vet Check-In",
  "Grooming Day",
  "Agility Fun",
  "Café Social",
  "Nature Hike",
  "Adoption Event",
  "Photo Session",
  "Birthday Party",
];

const PROMPT_CHIPS = {
  dog: [
    "Outdoor romp for friendly dogs",
    "Puppy socialisation & play",
    "Off-leash adventure in nature",
    "Dog training & bonding session",
    "Birthday bark party for pups",
  ],
  cat: [
    "Indoor cat café meetup",
    "Feline enrichment & play date",
    "Cat agility fun course",
    "Senior kitty care & cuddles",
    "Kitten socialisation class",
  ],
  bird: [
    "Aviary garden picnic",
    "Bird enrichment workshop",
    "Feathered friends photo day",
    "Parrot talk & training tips",
    "Wild bird watching walk",
  ],
  other: [
    "Exotic pets show & tell",
    "Reptile care workshop",
    "Small pets playdate",
    "Hedgehog handling session",
    "Rabbit binkying in the park",
  ],
};

const PET_OPTIONS = [
  { val: "dog", label: "🐕 Dog" },
  { val: "cat", label: "🐱 Cat" },
  { val: "bird", label: "🦜 Bird" },
  { val: "other", label: "🦔 Other" },
];

const SEED_EVENTS = [
  {
    id: "1",
    title: "Pawth Dog Park Meetup",
    petType: "dog",
    date: "2025-05-10",
    time: "10:00 AM",
    location: "Central Bark Dog Park, Vancouver",
    description:
      "Bring your pup for a morning romp! Off-leash play, puppy socials, and dog-owner chit-chat. All breeds welcome.",
    createdBy: "sarah_paws",
    emoji: "🐕",
  },
  {
    id: "2",
    title: "Feline Fine Cat Café Hangout",
    petType: "cat",
    date: "2025-05-14",
    time: "2:00 PM",
    location: "Meow Café, 123 Whisker Lane",
    description:
      "Afternoon tea with cats! Meet other cat owners, swap care tips, and let your feline explore a safe new environment.",
    createdBy: "fluffmaster",
    emoji: "🐱",
  },
  {
    id: "3",
    title: "Bird Watchers & Owners Picnic",
    petType: "bird",
    date: "2025-05-18",
    time: "11:00 AM",
    location: "Aviary Gardens, Stanley Park",
    description:
      "A chill picnic for bird lovers. Expert talks on bird enrichment included!",
    createdBy: "tweetybird99",
    emoji: "🦜",
  },
  {
    id: "4",
    title: "Exotic Pets Show & Tell",
    petType: "other",
    date: "2025-05-22",
    time: "3:00 PM",
    location: "Community Hall, 45 Main St",
    description:
      "Got a hedgehog? A gecko? A ferret? A celebration of all wonderful pets that aren't dogs or cats.",
    createdBy: "exotic_pete",
    emoji: "🦔",
  },
  {
    id: "5",
    title: "Puppy Training Workshop",
    petType: "dog",
    date: "2025-05-25",
    time: "9:00 AM",
    location: "Pawth Training Grounds, Burnaby",
    description:
      "Certified trainer-led session on basic commands, leash manners, and positive reinforcement. Puppies 8wks–1yr.",
    createdBy: "trainer_tom",
    emoji: "🐶",
  },
];

const EMOJI_MAP = { dog: "🐕", cat: "🐱", bird: "🦜", other: "🦔" };
const toggle = (arr, val) =>
  arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];

const EMPTY_WR = {
  title: "",
  petType: "dog",
  date: "",
  time: "",
  location: "",
  description: "",
  vibes: [],
  groupSize: "",
  duration: "",
  accessibility: [],
  budget: "",
};

const EMPTY_AI = {
  petType: "dog",
  dateFrom: "",
  dateTo: "",
  categories: [],
  vibes: [],
  groupSize: "",
  budget: "",
  extra: "",
};

const EMPTY_QC = {
  title: "",
  petType: "dog",
  date: "",
  time: "",
  location: "",
  description: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Coloured pill chip — color: "purple" | "green" | "amber" */
function Chip({ label, active, color = "purple", onClick }) {
  const activeClass = { purple: "ap", green: "ag", amber: "aa" }[color] || "ap";
  return (
    <button
      className={`ep-chip${active ? ` ${activeClass}` : ""}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

/** Section wrapper card */
function Sec({ title, children }) {
  return (
    <div className="ep-sec">
      <div className="ep-sec-title">{title}</div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Shell ── */
  .ep { min-height:100vh; background:#fafaf8; font-family:'Nunito',sans-serif; display:flex; flex-direction:column; }

  /* ── Top bar ── */
  .ep-topbar { position:sticky; top:0; z-index:100; background:#fff; border-bottom:1.5px solid #f0ede8; padding:0 1rem; height:54px; display:flex; align-items:center; justify-content:space-between; }
  .ep-logo { font-size:17px; font-weight:800; color:#111; }
  .ep-logo span { color:#7c3aed; }
  .ep-user-pill { font-size:12px; font-weight:700; color:#888; background:#f5f3ff; padding:4px 10px; border-radius:999px; }

  /* ── Page tabs ── */
  .ep-tabs { display:flex; background:#fff; border-bottom:1.5px solid #f0ede8; }
  .ep-tab { flex:1; padding:11px 0; background:none; border:none; border-bottom:3px solid transparent; font-family:'Nunito',sans-serif; font-size:12px; font-weight:700; color:#999; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px; transition:all .15s; }
  .ep-tab.active { color:#111; border-bottom-color:#7c3aed; }

  /* ── Main content ── */
  .ep-main { flex:1; padding:.9rem; padding-bottom:80px; max-width:600px; width:100%; margin:0 auto; }

  /* ── Mode toggle (Write / AI Generate) ── */
  .ep-mode-toggle { display:flex; background:#f0ede8; border-radius:12px; padding:3px; margin-bottom:.9rem; gap:3px; }
  .ep-mode-btn { flex:1; padding:8px 6px; border:none; border-radius:9px; font-family:'Nunito',sans-serif; font-size:12px; font-weight:700; color:#888; background:transparent; cursor:pointer; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:5px; }
  .ep-mode-btn.active { background:#7c3aed; color:#fff; }

  /* ── Section card ── */
  .ep-sec { background:#fff; border-radius:14px; border:1.5px solid #f0ede8; padding:1rem; margin-bottom:.75rem; }
  .ep-sec-title { font-size:11px; font-weight:800; color:#bbb; text-transform:uppercase; letter-spacing:.7px; margin-bottom:.65rem; }

  /* ── Form elements ── */
  .ep-label { font-size:11px; font-weight:700; color:#555; margin-bottom:3px; display:block; }
  .ep-fi { width:100%; padding:8px 10px; border-radius:9px; border:1.5px solid #e8e5e0; font-family:'Nunito',sans-serif; font-size:13px; color:#111; background:#fafaf8; outline:none; transition:border-color .15s; margin-bottom:9px; }
  .ep-fi:focus { border-color:#7c3aed; background:#fff; }
  .ep-fi::placeholder { color:#bbb; }
  textarea.ep-fi { resize:vertical; }
  .ep-row2 { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .ep-char { font-size:10px; color:#ccc; text-align:right; margin-top:2px; }

  /* ── Chip pills ── */
  .ep-chips { display:flex; flex-wrap:wrap; gap:6px; margin-bottom:9px; }
  .ep-chip { padding:5px 12px; border-radius:999px; border:1.5px solid #e8e5e0; background:#fff; font-family:'Nunito',sans-serif; font-size:11px; font-weight:700; color:#666; cursor:pointer; transition:all .15s; }
  .ep-chip:hover { border-color:#7c3aed; color:#7c3aed; }
  .ep-chip.ap { background:#7c3aed; border-color:#7c3aed; color:#fff; }
  .ep-chip.ag { background:#16a34a; border-color:#16a34a; color:#fff; }
  .ep-chip.aa { background:#d97706; border-color:#d97706; color:#fff; }

  /* ── AI prompt chips ── */
  .ep-prompt-label { font-size:10px; font-weight:700; color:#a78bfa; margin-bottom:5px; display:flex; align-items:center; gap:4px; }
  .ep-ai-badge { display:inline-flex; align-items:center; gap:2px; background:#ede9fe; color:#6d28d9; font-size:10px; font-weight:700; padding:2px 7px; border-radius:999px; }
  .ep-prompt-chips { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:8px; }
  .ep-prompt-chip { padding:4px 10px; border-radius:999px; border:1.5px dashed #c4b5fd; background:#faf5ff; font-family:'Nunito',sans-serif; font-size:11px; font-weight:700; color:#7c3aed; cursor:pointer; transition:all .15s; }
  .ep-prompt-chip:hover { background:#ede9fe; border-color:#7c3aed; }

  /* ── Buttons ── */
  .ep-post-btn { width:100%; padding:11px; border-radius:999px; border:none; background:#111; color:#fff; font-family:'Nunito',sans-serif; font-size:13px; font-weight:800; cursor:pointer; transition:opacity .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
  .ep-post-btn:hover { opacity:.85; }
  .ep-post-btn:disabled { opacity:.35; cursor:not-allowed; }
  .ep-gen-btn { width:100%; padding:11px; border-radius:999px; border:none; background:#7c3aed; color:#fff; font-family:'Nunito',sans-serif; font-size:13px; font-weight:800; cursor:pointer; transition:opacity .15s; display:flex; align-items:center; justify-content:center; gap:6px; }
  .ep-gen-btn:hover { opacity:.88; }
  .ep-gen-btn:disabled { opacity:.45; cursor:not-allowed; }
  .ep-outline-btn { padding:6px 14px; border-radius:999px; border:1.5px solid #7c3aed; background:#fff; color:#7c3aed; font-family:'Nunito',sans-serif; font-size:12px; font-weight:700; cursor:pointer; transition:all .15s; }
  .ep-outline-btn:hover, .ep-outline-btn.pri { background:#7c3aed; color:#fff; }

  /* ── AI result box ── */
  .ep-ai-result { background:#faf5ff; border:1.5px solid #ddd6fe; border-radius:13px; padding:.9rem; margin-top:.75rem; }
  .ep-ai-result-title { font-size:12px; font-weight:800; color:#6d28d9; margin-bottom:7px; }
  .ep-ai-result-text { font-size:12px; color:#374151; line-height:1.65; white-space:pre-wrap; }
  .ep-ai-actions { display:flex; gap:7px; margin-top:10px; flex-wrap:wrap; }

  /* ── Error / success banners ── */
  .ep-success { background:#d1fae5; border:1.5px solid #6ee7b7; border-radius:10px; padding:9px 12px; font-size:12px; font-weight:700; color:#065f46; margin-bottom:.75rem; display:flex; align-items:center; gap:7px; }
  .ep-error { background:#fef2f2; border:1.5px solid #fca5a5; border-radius:10px; padding:9px 12px; font-size:12px; font-weight:700; color:#991b1b; margin-top:10px; }

  /* ── Loading dots ── */
  .ep-dots span { display:inline-block; animation:epb 1.2s infinite ease-in-out both; font-size:16px; }
  .ep-dots span:nth-child(1) { animation-delay:-.32s; }
  .ep-dots span:nth-child(2) { animation-delay:-.16s; }
  @keyframes epb { 0%,80%,100% { transform:scale(.6); opacity:.3; } 40% { transform:scale(1); opacity:1; } }

  /* ── Browse filter chips ── */
  .ep-filter-row { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:1rem; }

  /* ── Event cards ── */
  .ep-grid { display:flex; flex-direction:column; gap:10px; }
  .ep-card { background:#fff; border-radius:14px; border:1.5px solid #f0ede8; overflow:hidden; transition:border-color .15s, transform .15s; }
  .ep-card:hover { border-color:#d4bbff; transform:translateY(-1px); }
  .ep-card-hdr { display:flex; align-items:center; gap:10px; padding:12px 12px 0; }
  .ep-card-emoji { width:42px; height:42px; border-radius:10px; background:linear-gradient(135deg,#ede9fe,#ddd6fe); display:flex; align-items:center; justify-content:center; font-size:21px; flex-shrink:0; }
  .ep-card-title { font-size:13px; font-weight:800; color:#111; line-height:1.2; }
  .ep-card-by { font-size:11px; color:#bbb; margin-top:1px; }
  .ep-pet-badge { font-size:10px; font-weight:700; padding:2px 9px; border-radius:999px; background:#ede9fe; color:#6d28d9; text-transform:capitalize; margin-left:auto; flex-shrink:0; }
  .ep-card-body { padding:8px 12px 12px; }
  .ep-card-meta { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:6px; }
  .ep-meta { font-size:11px; color:#999; }
  .ep-card-desc { font-size:12px; color:#555; line-height:1.55; }
  .ep-rsvp { margin-top:8px; padding:5px 14px; border-radius:999px; border:1.5px solid #7c3aed; background:#fff; color:#7c3aed; font-family:'Nunito',sans-serif; font-size:11px; font-weight:700; cursor:pointer; transition:all .15s; }
  .ep-rsvp:hover, .ep-rsvp.on { background:#7c3aed; color:#fff; }
  .ep-empty { text-align:center; padding:44px 16px; color:#ccc; }
  .ep-empty-icon { font-size:36px; margin-bottom:8px; }
  .ep-empty-text { font-size:13px; font-weight:700; }

  /* ── Quick Create specific ── */
  .ep-qc-heading { font-size:15px; font-weight:800; color:#111; margin-bottom:1rem; display:flex; align-items:center; gap:7px; }
  .ep-qc-tip { font-size:12px; color:#999; background:#f5f3ff; border-radius:9px; padding:9px 11px; margin-bottom:.9rem; line-height:1.5; }

  /* ── Bottom nav ── */
  .ep-bottom-nav { position:fixed; bottom:0; left:0; right:0; height:60px; background:#fff; border-top:1.5px solid #f0ede8; display:flex; align-items:center; justify-content:space-around; z-index:100; padding-bottom:env(safe-area-inset-bottom); }
  .ep-bottom-nav button { background:none; border:none; display:flex; flex-direction:column; align-items:center; gap:2px; padding:5px 10px; cursor:pointer; color:#ccc; font-family:'Nunito',sans-serif; font-size:9px; font-weight:700; transition:color .15s; }
  .ep-bottom-nav button.active { color:#7c3aed; }
  .ep-bottom-nav button:hover { color:#7c3aed; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

const API = process.env.REACT_APP_API_URL;

export default function EventPlannerPage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Tab + mode ──
  const [activeTab, setActiveTab] = useState("browse"); // browse | ai | create
  const [mode, setMode] = useState("write"); // write | ai  (inside AI Planner tab)

  // ── Browse ──
  const [events, setEvents] = useState(SEED_EVENTS);
  const [petFilter, setPetFilter] = useState("all");
  const [rsvpd, setRsvpd] = useState({});

  // ── Write-Yourself form ──
  const [wr, setWr] = useState({ ...EMPTY_WR });
  const [wrSuccess, setWrSuccess] = useState(false);

  // ── AI Generate ──
  const [ai, setAi] = useState({ ...EMPTY_AI });
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiError, setAiError] = useState("");

  // ── Quick Create ──
  const [qc, setQc] = useState({ ...EMPTY_QC });
  const [qcSuccess, setQcSuccess] = useState(false);
  const [qcErrors, setQcErrors] = useState({});

  // ── Updaters ──
  const upWr = (k, v) => setWr((p) => ({ ...p, [k]: v }));
  const tgWr = (k, v) => setWr((p) => ({ ...p, [k]: toggle(p[k], v) }));
  const upAi = (k, v) => setAi((p) => ({ ...p, [k]: v }));
  const tgAi = (k, v) => setAi((p) => ({ ...p, [k]: toggle(p[k], v) }));
  const upQc = (k, v) => setQc((p) => ({ ...p, [k]: v }));

  // ── Publish helper (shared) ──
  const publishEvent = (data, onDone) => {
    const newEv = {
      id: Date.now().toString(),
      title: data.title,
      petType: data.petType,
      date: data.date,
      time: data.time || "",
      location: data.location,
      description: data.description || "A great event for pet lovers! 🐾",
      createdBy: user?.username || "you",
      emoji: EMOJI_MAP[data.petType] || "🐾",
    };
    setEvents((prev) => [newEv, ...prev]);
    onDone();
    setTimeout(() => {
      setActiveTab("browse");
    }, 1800);
  };

  // ── Write-Yourself post ──
  const handleWrPost = () => {
    if (!wr.title || !wr.date || !wr.location) return;
    publishEvent(wr, () => {
      setWrSuccess(true);
      setWr({ ...EMPTY_WR });
      setTimeout(() => setWrSuccess(false), 1800);
    });
  };

  // ── Quick Create post ──
  const handleQcPost = () => {
    const errs = {};
    if (!qc.title) errs.title = "Title is required";
    if (!qc.date) errs.date = "Date is required";
    if (!qc.location) errs.location = "Location is required";
    if (Object.keys(errs).length) {
      setQcErrors(errs);
      return;
    }
    setQcErrors({});
    publishEvent(qc, () => {
      setQcSuccess(true);
      setQc({ ...EMPTY_QC });
      setTimeout(() => setQcSuccess(false), 1800);
    });
  };

  // ── AI Generate call ──
  const handleGenerate = async () => {
    setAiLoading(true);
    setAiResult("");
    setAiError("");
    try {
      const prompt = `You are an enthusiastic pet event planner for Pawth — a social app for pet owners.

Generate 3 creative, fun, and practical event ideas based on these preferences:
- Pet type: ${ai.petType}
- Date range: ${ai.dateFrom || "flexible"} to ${ai.dateTo || "flexible"}
- Event categories: ${ai.categories.length ? ai.categories.join(", ") : "any type"}
- Vibes wanted: ${ai.vibes.length ? ai.vibes.join(", ") : "any"}
- Group size: ${ai.groupSize || "any"}
- Budget: ${ai.budget || "any"}
- Extra notes: ${ai.extra || "none"}

For each event provide:
1. Event name with emoji
2. Best date & time suggestion
3. Ideal venue type
4. Short 2-sentence description
5. One reason it is perfect for ${ai.petType} owners

Format clearly. Be warm, creative, and fun with emojis!`;

      const res = await fetch(`${API}/api/ai/generate-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: token } : {}),
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      const text = data?.result || data?.text || "";
      if (!text) throw new Error("empty");
      setAiResult(text);
    } catch {
      setAiError(
        "Couldn't reach the AI right now — please try again in a moment!",
      );
    }
    setAiLoading(false);
  };

  // ── Use AI result → prefill Write form ──
  const useAiResult = () => {
    setWr((p) => ({
      ...p,
      petType: ai.petType,
      vibes: [...ai.vibes],
      description:
        "AI-suggested event — add a title, date and location above to post!",
    }));
    setMode("write");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render helpers
  // ─────────────────────────────────────────────────────────────────────────

  /** Pet type chip row (reused in multiple sections) */
  const PetChips = ({ value, onChange }) => (
    <div className="ep-chips">
      {PET_OPTIONS.map((o) => (
        <Chip
          key={o.val}
          label={o.label}
          active={value === o.val}
          onClick={() => onChange(o.val)}
        />
      ))}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // JSX
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{css}</style>
      <div className="ep">
        {/* ══════════ TOP BAR ══════════ */}
        <header className="ep-topbar">
          <span className="ep-logo">
            🐾 Pawth <span>Events</span>
          </span>
          {user && <span className="ep-user-pill">@{user.username}</span>}
        </header>

        {/* ══════════ PAGE TABS ══════════ */}
        <div className="ep-tabs">
          {[
            ["browse", "📅 Browse"],
            ["ai", "✨ AI Planner"],
            ["create", "➕ Quick Create"],
          ].map(([t, l]) => (
            <button
              key={t}
              className={`ep-tab${activeTab === t ? " active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {l}
            </button>
          ))}
        </div>

        <main className="ep-main">
          {/* ════════════════════════════════════════════════════
              TAB 1 — BROWSE
          ════════════════════════════════════════════════════ */}
          {activeTab === "browse" && (
            <>
              {/* Filter chips */}
              <div className="ep-filter-row">
                {[
                  { v: "all", l: "All 🐾" },
                  { v: "dog", l: "Dogs 🐕" },
                  { v: "cat", l: "Cats 🐱" },
                  { v: "bird", l: "Birds 🦜" },
                  { v: "other", l: "Other 🦔" },
                ].map((c) => (
                  <button
                    key={c.v}
                    className={`ep-chip${petFilter === c.v ? " ap" : ""}`}
                    onClick={() => setPetFilter(c.v)}
                  >
                    {c.l}
                  </button>
                ))}
              </div>

              {/* Event cards */}
              {(() => {
                const filtered = events.filter(
                  (e) => petFilter === "all" || e.petType === petFilter,
                );
                if (filtered.length === 0)
                  return (
                    <div className="ep-empty">
                      <div className="ep-empty-icon">🔍</div>
                      <div className="ep-empty-text">
                        No events for this filter yet
                      </div>
                    </div>
                  );
                return (
                  <div className="ep-grid">
                    {filtered.map((ev) => (
                      <div key={ev.id} className="ep-card">
                        <div className="ep-card-hdr">
                          <div className="ep-card-emoji">{ev.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="ep-card-title">{ev.title}</div>
                            <div className="ep-card-by">by @{ev.createdBy}</div>
                          </div>
                          <span className="ep-pet-badge">{ev.petType}</span>
                        </div>
                        <div className="ep-card-body">
                          <div className="ep-card-meta">
                            <span className="ep-meta">📅 {ev.date}</span>
                            {ev.time && (
                              <span className="ep-meta">⏰ {ev.time}</span>
                            )}
                            <span className="ep-meta">📍 {ev.location}</span>
                          </div>
                          <p className="ep-card-desc">{ev.description}</p>
                          <button
                            className={`ep-rsvp${rsvpd[ev.id] ? " on" : ""}`}
                            onClick={() =>
                              setRsvpd((r) => ({ ...r, [ev.id]: !r[ev.id] }))
                            }
                          >
                            {rsvpd[ev.id] ? "✓ RSVP'd!" : "RSVP"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          )}

          {/* ════════════════════════════════════════════════════
              TAB 2 — AI PLANNER  (Write-Yourself  |  AI Generate)
          ════════════════════════════════════════════════════ */}
          {activeTab === "ai" && (
            <>
              {/* Mode toggle */}
              <div className="ep-mode-toggle">
                <button
                  className={`ep-mode-btn${mode === "write" ? " active" : ""}`}
                  onClick={() => setMode("write")}
                >
                  <Edit3 size={13} /> Write it yourself
                </button>
                <button
                  className={`ep-mode-btn${mode === "ai" ? " active" : ""}`}
                  onClick={() => setMode("ai")}
                >
                  <Sparkles size={13} /> AI Generate
                </button>
              </div>

              {/* ─── MODE A: WRITE IT YOURSELF ─── */}
              {mode === "write" && (
                <>
                  {wrSuccess && (
                    <div className="ep-success">
                      <CheckCircle size={15} /> Event posted! Redirecting to
                      Browse…
                    </div>
                  )}

                  {/* Basics */}
                  <Sec title="Event basics">
                    <label className="ep-label">Event title *</label>
                    <input
                      className="ep-fi"
                      placeholder="e.g. Sunday Dog Park Romp"
                      value={wr.title}
                      onChange={(e) => upWr("title", e.target.value)}
                    />
                    <label className="ep-label">Pet type *</label>
                    <PetChips
                      value={wr.petType}
                      onChange={(v) => upWr("petType", v)}
                    />
                  </Sec>

                  {/* Date & time */}
                  <Sec title="Date & time">
                    <div className="ep-row2">
                      <div>
                        <label className="ep-label">📅 Date *</label>
                        <input
                          className="ep-fi"
                          type="date"
                          value={wr.date}
                          onChange={(e) => upWr("date", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="ep-label">⏰ Time</label>
                        <input
                          className="ep-fi"
                          type="time"
                          value={wr.time}
                          onChange={(e) => upWr("time", e.target.value)}
                        />
                      </div>
                    </div>
                    <label className="ep-label">⏱ Duration</label>
                    <div className="ep-chips">
                      {DURATIONS.map((d) => (
                        <Chip
                          key={d}
                          label={d}
                          active={wr.duration === d}
                          onClick={() => upWr("duration", d)}
                        />
                      ))}
                    </div>
                  </Sec>

                  {/* Location & group */}
                  <Sec title="Location & group">
                    <label className="ep-label">📍 Location *</label>
                    <input
                      className="ep-fi"
                      placeholder="e.g. Central Bark Park, Vancouver"
                      value={wr.location}
                      onChange={(e) => upWr("location", e.target.value)}
                    />
                    <label className="ep-label">👥 Group size</label>
                    <div className="ep-chips">
                      {GROUP_SIZES.map((g) => (
                        <Chip
                          key={g}
                          label={g}
                          active={wr.groupSize === g}
                          onClick={() => upWr("groupSize", g)}
                        />
                      ))}
                    </div>
                    <label className="ep-label">💰 Budget</label>
                    <div className="ep-chips">
                      {BUDGETS.map((b) => (
                        <Chip
                          key={b}
                          label={b}
                          color="amber"
                          active={wr.budget === b}
                          onClick={() => upWr("budget", b)}
                        />
                      ))}
                    </div>
                  </Sec>

                  {/* Vibe & accessibility */}
                  <Sec title="Vibe & accessibility">
                    <label className="ep-label">
                      Event vibe — pick all that fit
                    </label>
                    <div className="ep-chips">
                      {VIBES.map((v) => (
                        <Chip
                          key={v}
                          label={v}
                          color="green"
                          active={wr.vibes.includes(v)}
                          onClick={() => tgWr("vibes", v)}
                        />
                      ))}
                    </div>
                    <label className="ep-label">Accessibility notes</label>
                    <div className="ep-chips">
                      {ACCESSIBILITY.map((a) => (
                        <Chip
                          key={a}
                          label={a}
                          active={wr.accessibility.includes(a)}
                          onClick={() => tgWr("accessibility", a)}
                        />
                      ))}
                    </div>
                  </Sec>

                  {/* Description with AI prompt chips */}
                  <Sec title="Description">
                    <div className="ep-prompt-label">
                      <span className="ep-ai-badge">✨ AI</span>
                      Tap a prompt to get started
                    </div>
                    <div className="ep-prompt-chips">
                      {(PROMPT_CHIPS[wr.petType] || PROMPT_CHIPS.dog).map(
                        (p) => (
                          <button
                            key={p}
                            className="ep-prompt-chip"
                            onClick={() => upWr("description", p + " — ")}
                          >
                            + {p}
                          </button>
                        ),
                      )}
                    </div>
                    <textarea
                      className="ep-fi"
                      style={{ minHeight: 90, marginBottom: 0 }}
                      placeholder="Describe what pet owners can expect, what to bring, and why it'll be pawsome! 🐾"
                      value={wr.description}
                      onChange={(e) => upWr("description", e.target.value)}
                      maxLength={300}
                    />
                    <div className="ep-char">{wr.description.length}/300</div>
                  </Sec>

                  <button
                    className="ep-post-btn"
                    onClick={handleWrPost}
                    disabled={!wr.title || !wr.date || !wr.location}
                  >
                    🐾 Post Event
                  </button>
                </>
              )}

              {/* ─── MODE B: AI GENERATE ─── */}
              {mode === "ai" && (
                <>
                  {/* Pet */}
                  <Sec title="My pet">
                    <PetChips
                      value={ai.petType}
                      onChange={(v) => upAi("petType", v)}
                    />
                  </Sec>

                  {/* Date range */}
                  <Sec title="Preferred date range">
                    <div className="ep-row2">
                      <div>
                        <label className="ep-label">📅 From</label>
                        <input
                          className="ep-fi"
                          type="date"
                          value={ai.dateFrom}
                          onChange={(e) => upAi("dateFrom", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="ep-label">📅 To</label>
                        <input
                          className="ep-fi"
                          type="date"
                          value={ai.dateTo}
                          onChange={(e) => upAi("dateTo", e.target.value)}
                        />
                      </div>
                    </div>
                  </Sec>

                  {/* Event categories */}
                  <Sec title="Event categories — what kind?">
                    <div className="ep-chips">
                      {AI_CATS.map((c) => (
                        <Chip
                          key={c}
                          label={c}
                          active={ai.categories.includes(c)}
                          onClick={() => tgAi("categories", c)}
                        />
                      ))}
                    </div>
                  </Sec>

                  {/* Vibes & preferences */}
                  <Sec title="Vibes & preferences">
                    <label className="ep-label">Event vibe</label>
                    <div className="ep-chips">
                      {VIBES.map((v) => (
                        <Chip
                          key={v}
                          label={v}
                          color="green"
                          active={ai.vibes.includes(v)}
                          onClick={() => tgAi("vibes", v)}
                        />
                      ))}
                    </div>
                    <label className="ep-label">Group size</label>
                    <div className="ep-chips">
                      {GROUP_SIZES.map((g) => (
                        <Chip
                          key={g}
                          label={g}
                          active={ai.groupSize === g}
                          onClick={() => upAi("groupSize", g)}
                        />
                      ))}
                    </div>
                    <label className="ep-label">Budget</label>
                    <div className="ep-chips">
                      {BUDGETS.map((b) => (
                        <Chip
                          key={b}
                          label={b}
                          color="amber"
                          active={ai.budget === b}
                          onClick={() => upAi("budget", b)}
                        />
                      ))}
                    </div>
                  </Sec>

                  {/* Extra notes */}
                  <Sec title="Anything else? (optional)">
                    <textarea
                      className="ep-fi"
                      style={{ minHeight: 65 }}
                      placeholder="Any special needs, location preferences, specific ideas…"
                      value={ai.extra}
                      onChange={(e) => upAi("extra", e.target.value)}
                    />
                  </Sec>

                  {/* Generate button */}
                  <button
                    className="ep-gen-btn"
                    onClick={handleGenerate}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <>
                        <span className="ep-dots">
                          <span>•</span>
                          <span>•</span>
                          <span>•</span>
                        </span>{" "}
                        Generating…
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} /> Generate Event Plan
                      </>
                    )}
                  </button>

                  {/* Error */}
                  {aiError && <div className="ep-error">{aiError}</div>}

                  {/* AI result */}
                  {aiResult && (
                    <div className="ep-ai-result">
                      <div className="ep-ai-result-title">
                        ✨ AI event plan for your {ai.petType}
                      </div>
                      <p className="ep-ai-result-text">{aiResult}</p>
                      <div className="ep-ai-actions">
                        <button
                          className="ep-outline-btn pri"
                          onClick={useAiResult}
                        >
                          ✏️ Fill write form
                        </button>
                        <button
                          className="ep-outline-btn"
                          onClick={handleGenerate}
                        >
                          ↻ Regenerate
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════════════
              TAB 3 — QUICK CREATE
              A streamlined form for fast event publishing.
              Full-featured creation is in the AI Planner tab.
          ════════════════════════════════════════════════════ */}
          {activeTab === "create" && (
            <div className="ep-sec">
              <div className="ep-qc-heading">
                <PlusSquare size={16} style={{ color: "#7c3aed" }} />
                Quick Create Event
              </div>

              <div className="ep-qc-tip">
                💡 Want AI suggestions or more options? Switch to the{" "}
                <span
                  style={{
                    color: "#7c3aed",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                  onClick={() => setActiveTab("ai")}
                >
                  ✨ AI Planner
                </span>{" "}
                tab for vibes, budgets, accessibility filters and prompt chips.
              </div>

              {qcSuccess && (
                <div className="ep-success">
                  <CheckCircle size={15} /> Event posted! Heading to Browse…
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {/* Title */}
                <div>
                  <label className="ep-label">Event title *</label>
                  <input
                    className="ep-fi"
                    style={{
                      borderColor: qcErrors.title ? "#f87171" : undefined,
                      marginBottom: 0,
                    }}
                    placeholder="e.g. Weekend Dog Park Hangout"
                    value={qc.title}
                    onChange={(e) => {
                      upQc("title", e.target.value);
                      setQcErrors((p) => ({ ...p, title: "" }));
                    }}
                  />
                  {qcErrors.title && (
                    <div
                      style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}
                    >
                      {qcErrors.title}
                    </div>
                  )}
                </div>

                {/* Pet type */}
                <div>
                  <label className="ep-label">Pet type *</label>
                  <PetChips
                    value={qc.petType}
                    onChange={(v) => upQc("petType", v)}
                  />
                </div>

                {/* Date + Time */}
                <div className="ep-row2">
                  <div>
                    <label className="ep-label">📅 Date *</label>
                    <input
                      className="ep-fi"
                      type="date"
                      style={{
                        borderColor: qcErrors.date ? "#f87171" : undefined,
                        marginBottom: 0,
                      }}
                      value={qc.date}
                      onChange={(e) => {
                        upQc("date", e.target.value);
                        setQcErrors((p) => ({ ...p, date: "" }));
                      }}
                    />
                    {qcErrors.date && (
                      <div
                        style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}
                      >
                        {qcErrors.date}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="ep-label">⏰ Time</label>
                    <input
                      className="ep-fi"
                      type="time"
                      style={{ marginBottom: 0 }}
                      value={qc.time}
                      onChange={(e) => upQc("time", e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="ep-label">📍 Location *</label>
                  <input
                    className="ep-fi"
                    style={{
                      borderColor: qcErrors.location ? "#f87171" : undefined,
                      marginBottom: 0,
                    }}
                    placeholder="e.g. Central Park, New York"
                    value={qc.location}
                    onChange={(e) => {
                      upQc("location", e.target.value);
                      setQcErrors((p) => ({ ...p, location: "" }));
                    }}
                  />
                  {qcErrors.location && (
                    <div
                      style={{ fontSize: 11, color: "#ef4444", marginTop: 2 }}
                    >
                      {qcErrors.location}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="ep-label">Description</label>
                  <div className="ep-prompt-label" style={{ marginBottom: 5 }}>
                    <span className="ep-ai-badge">✨ AI</span> tap a prompt to
                    get started
                  </div>
                  <div className="ep-prompt-chips">
                    {(PROMPT_CHIPS[qc.petType] || PROMPT_CHIPS.dog).map((p) => (
                      <button
                        key={p}
                        className="ep-prompt-chip"
                        onClick={() => upQc("description", p + " — ")}
                      >
                        + {p}
                      </button>
                    ))}
                  </div>
                  <textarea
                    className="ep-fi"
                    style={{ minHeight: 80, marginBottom: 0 }}
                    placeholder="Tell pet owners what to expect and why it'll be pawsome 🐾"
                    value={qc.description}
                    onChange={(e) => upQc("description", e.target.value)}
                    maxLength={300}
                  />
                  <div className="ep-char">{qc.description.length}/300</div>
                </div>

                {/* Submit */}
                <button
                  className="ep-post-btn"
                  style={{ marginTop: 4 }}
                  onClick={handleQcPost}
                  disabled={!qc.title || !qc.date || !qc.location}
                >
                  🐾 Publish Event
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ══════════ BOTTOM NAV ══════════ */}
        <nav className="ep-bottom-nav">
          <button
            className={location.pathname === "/dashboard" ? "active" : ""}
            onClick={() => navigate("/dashboard")}
          >
            <Home size={21} />
            <span>Feed</span>
          </button>
          <button
            className={location.pathname === "/places" ? "active" : ""}
            onClick={() => navigate("/places")}
          >
            <MapPin size={21} />
            <span>Places</span>
          </button>
          <button className="active">
            <Calendar size={21} />
            <span>Events</span>
          </button>
          <button
            className={location.pathname === "/create" ? "active" : ""}
            onClick={() => navigate(token ? "/create" : "/login")}
          >
            <PlusSquare size={21} />
            <span>Post</span>
          </button>
          <button
            className={location.pathname === "/profile" ? "active" : ""}
            onClick={() => navigate(token ? "/profile" : "/login")}
          >
            <User size={21} />
            <span>Profile</span>
          </button>
        </nav>
      </div>
    </>
  );
}
