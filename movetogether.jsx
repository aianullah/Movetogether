import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://lyblrmocrtsilxrdjpfm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5YmxybW9jcnRzaWx4cmRqcGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA0NDYsImV4cCI6MjA5NTEzNjQ0Nn0.8gfCAA_-m1J8BSK2NXmCOR4J8qrBzx7pFW5A2UDfayM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ACTIVITY_TYPES = [
  { type: "Löpning", emoji: "🏃" }, { type: "Promenad", emoji: "🚶" },
  { type: "Cykling", emoji: "🚴" }, { type: "Fotboll", emoji: "⚽" },
  { type: "Basket", emoji: "🏀" }, { type: "Gym", emoji: "🏋️" },
  { type: "Simning", emoji: "🏊" }, { type: "Yoga", emoji: "🧘" },
  { type: "Hiking", emoji: "🥾" }, { type: "Crossfit", emoji: "💪" },
  { type: "Studera", emoji: "📚" }, { type: "Co-working", emoji: "💻" },
  { type: "Socialt", emoji: "☕" }, { type: "Nybörjar", emoji: "🌱" },
  { type: "Återhämtning", emoji: "🌿" },
];

const TYPE_COLORS = {
  "Löpning": "#1A6B4A", "Promenad": "#2E9E6E", "Cykling": "#185FA5",
  "Fotboll": "#854F0B", "Basket": "#C4462A", "Gym": "#1A6B4A",
  "Simning": "#0E7490", "Yoga": "#6B4AA8", "Hiking": "#3D6B21",
  "Crossfit": "#9B1C1C", "Studera": "#1E40AF", "Co-working": "#374151",
  "Socialt": "#C4462A", "Nybörjar": "#166534", "Återhämtning": "#065F46",
};

const getEmoji = (typ) => ACTIVITY_TYPES.find(a => a.type === typ)?.emoji || "🏃";
const getColor = (typ) => TYPE_COLORS[typ] || "#1A6B4A";

// ── FONTS ──
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet" />
);

const S = {
  phone: { width: 390, minHeight: 844, background: "#FAFAF8", borderRadius: 40, overflow: "hidden", position: "relative", boxShadow: "0 32px 80px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" },
  statusBar: (dark) => ({ background: dark ? "#1A6B4A" : "#FAFAF8", padding: "14px 24px 0", display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, color: dark ? "white" : "#1A1A1A" }),
  input: { width: "100%", background: "#F5F3EE", border: "1.5px solid #E8E5E0", borderRadius: 12, padding: "13px 16px", fontSize: 15, color: "#1A1A1A", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
  btn: (bg = "#1A6B4A", color = "white") => ({ background: bg, border: "none", borderRadius: 16, padding: "15px", color, fontSize: 16, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "'DM Sans', sans-serif" }),
  card: { background: "white", borderRadius: 20, overflow: "hidden", border: "1px solid #F0EDE8", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" },
  label: { fontSize: 12, fontWeight: 600, color: "#888", marginBottom: 6, display: "block", textTransform: "uppercase", letterSpacing: 0.5 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, padding: "4px 4px 0" },
  greenHeader: (extra = {}) => ({ background: "#1A6B4A", padding: "16px 24px 24px", ...extra }),
  backBtn: { background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 20, padding: "7px 14px", color: "white", fontSize: 13, cursor: "pointer", marginBottom: 12 },
  scrollArea: { flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 },
};

export default function MoveTogether() {
  const [screen, setScreen] = useState("splash");
  const [authScreen, setAuthScreen] = useState("login"); // login | register
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [myParticipations, setMyParticipations] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [filter, setFilter] = useState("Alla");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  // Auth form
  const [authForm, setAuthForm] = useState({ email: "", password: "", namn: "", stad: "Karlskrona", bio: "" });
  // Create form
  const [createForm, setCreateForm] = useState({ type: "", titel: "", datum: "", tid: "", plats: "", max_deltagare: "6", beskrivning: "" });

  const showToast = (msg, color = "#1A6B4A") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  // Check session on load
  useEffect(() => {
    const timer = setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
          fetchActivities();
          setScreen("home");
        } else {
          setScreen("auth");
        }
      });
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", uid).single();
    if (data) setProfile(data);
  };

  const fetchActivities = async () => {
    const { data } = await supabase.from("activities").select("*").order("skapad", { ascending: false });
    if (data) setActivities(data);
  };

  const fetchMyParticipations = async (uid) => {
    const { data } = await supabase.from("participants").select("aktivitet_id").eq("anvandare_id", uid);
    if (data) setMyParticipations(data.map(p => p.aktivitet_id));
  };

  // AUTH
  const handleRegister = async () => {
    if (!authForm.email || !authForm.password || !authForm.namn) {
      showToast("Fyll i alla fält!", "#E53E3E"); return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email: authForm.email, password: authForm.password });
    if (error) { showToast(error.message, "#E53E3E"); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert({ id: data.user.id, namn: authForm.namn, stad: authForm.stad, bio: authForm.bio, streak: 1, hedersemblem: "🌱 Ny medlem" });
      setUser(data.user);
      await fetchProfile(data.user.id);
      await fetchActivities();
      await fetchMyParticipations(data.user.id);
      showToast("Välkommen till MoveTogether! 🎉");
      setScreen("home");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!authForm.email || !authForm.password) { showToast("Fyll i e-post och lösenord!", "#E53E3E"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
    if (error) { showToast("Fel e-post eller lösenord!", "#E53E3E"); setLoading(false); return; }
    if (data.user) {
      setUser(data.user);
      await fetchProfile(data.user.id);
      await fetchActivities();
      await fetchMyParticipations(data.user.id);
      showToast("Välkommen tillbaka! 👋");
      setScreen("home");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setActivities([]); setMyParticipations([]);
    setScreen("auth");
  };

  // JOIN ACTIVITY
  const joinActivity = async (activityId) => {
    if (!user) return;
    if (myParticipations.includes(activityId)) { showToast("Du är redan anmäld!", "#854F0B"); return; }
    const { error } = await supabase.from("participants").insert({ aktivitet_id: activityId, anvandare_id: user.id, status: "Väntande" });
    if (!error) {
      setMyParticipations(prev => [...prev, activityId]);
      showToast("🎉 Anmäld! Värden godkänner dig snart.");
      setScreen("home");
    }
  };

  // CREATE ACTIVITY
  const skapaAktivitet = async () => {
  // 1. Hämta inloggad användare
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    alert("Du måste vara inloggad för att skapa en aktivitet!");
    return;
  }

  // 2. Skapa aktiviteten (vi använder user.id från sessionen)
  const { error } = await supabase.from("activities").insert([{
    titel: createForm.titel,
    typ: createForm.typ,
    datum: createForm.datum,
    tid: createForm.tid,
    plats: createForm.plats,
    beskrivning: createForm.beskrivning,
    skapad_av: user.id // Här hämtar vi ID:t säkert
  }]);

  if (error) {
    console.error("Fel:", error);
    alert("Det blev fel: " + error.message);
  } else {
    alert("Aktivitet skapad!");
    setScreen("home");
  }
};

  // SWIPE
  const filteredActivities = filter === "Alla" ? activities : activities.filter(a => a.typ === filter);
  const currentCard = filteredActivities[swipeIndex];

  const handleSwipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(() => {
      setSwipeDir(null);
      setSwipeIndex(i => i + 1);
      if (dir === "right" && currentCard) joinActivity(currentCard.id);
    }, 400);
  };

  const handleDragStart = (e) => { dragStart.current = e.touches ? e.touches[0].clientX : e.clientX; setDragging(true); };
  const handleDragMove = (e) => { if (!dragging) return; setDragX((e.touches ? e.touches[0].clientX : e.clientX) - dragStart.current); };
  const handleDragEnd = () => { if (Math.abs(dragX) > 80) handleSwipe(dragX > 0 ? "right" : "left"); setDragX(0); setDragging(false); dragStart.current = null; };

  const filters = ["Alla", "Löpning", "Cykling", "Fotboll", "Yoga", "Socialt", "Gym"];

  // ── SPLASH ──
  if (screen === "splash") return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#1A6B4A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <FontLink />
      <div style={{ textAlign: "center", color: "white" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🌿</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 36, fontWeight: 900 }}>MoveTogether</div>
        <div style={{ fontSize: 16, opacity: 0.8, marginTop: 8 }}>Karlskrona · Rörelse & Gemenskap</div>
        <div style={{ marginTop: 32, width: 40, height: 4, background: "rgba(255,255,255,0.4)", borderRadius: 2, margin: "32px auto 0", animation: "pulse 1s infinite" }} />
      </div>
    </div>
  );

  // ── AUTH ──
  if (screen === "auth") return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F5F3EE" }}>
      <FontLink />
      <div style={S.phone}>
        <div style={{ background: "#1A6B4A", padding: "40px 24px 32px", textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🌿</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 900, color: "white", marginTop: 8 }}>MoveTogether</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>Karlskrona · Rörelse & Gemenskap</div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#F0EDE8", margin: 20, borderRadius: 16, padding: 4 }}>
          {["login", "register"].map(t => (
            <button key={t} onClick={() => setAuthScreen(t)} style={{ flex: 1, border: "none", borderRadius: 12, padding: "10px", fontSize: 14, fontWeight: 600, cursor: "pointer", background: authScreen === t ? "white" : "transparent", color: authScreen === t ? "#1A1A1A" : "#888", transition: "all 0.2s", boxShadow: authScreen === t ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>
              {t === "login" ? "Logga in" : "Registrera"}
            </button>
          ))}
        </div>

        <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
          {authScreen === "register" && (
            <>
              <div>
                <label style={S.label}>Namn</label>
                <input style={S.input} placeholder="Förnamn Efternamn" value={authForm.namn} onChange={e => setAuthForm(f => ({ ...f, namn: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Stad</label>
                <input style={S.input} placeholder="Karlskrona" value={authForm.stad} onChange={e => setAuthForm(f => ({ ...f, stad: e.target.value }))} />
              </div>
              <div>
                <label style={S.label}>Bio (valfri)</label>
                <input style={S.input} placeholder="t.ex. Gillar löpning och kaffe" value={authForm.bio} onChange={e => setAuthForm(f => ({ ...f, bio: e.target.value }))} />
              </div>
            </>
          )}
          <div>
            <label style={S.label}>E-post</label>
            <input style={S.input} type="email" placeholder="din@email.com" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label style={S.label}>Lösenord</label>
            <input style={S.input} type="password" placeholder="Minst 6 tecken" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button onClick={authScreen === "login" ? handleLogin : handleRegister} style={S.btn()} disabled={loading}>
            {loading ? "Laddar..." : authScreen === "login" ? "Logga in →" : "Skapa konto →"}
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: "#888", marginTop: 4 }}>
            {authScreen === "login" ? "Har du inget konto? " : "Har du redan ett konto? "}
            <span onClick={() => setAuthScreen(authScreen === "login" ? "register" : "login")} style={{ color: "#1A6B4A", fontWeight: 600, cursor: "pointer" }}>
              {authScreen === "login" ? "Registrera dig" : "Logga in"}
            </span>
          </div>
        </div>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 40, left: "50%", transform: "translateX(-50%)", background: toast.color, color: "white", borderRadius: 16, padding: "14px 24px", fontSize: 14, fontWeight: 500, zIndex: 200 }}>{toast.msg}</div>}
    </div>
  );

  // ── MAIN APP ──
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#F5F3EE" }}>
      <FontLink />
      <div style={S.phone}>
        <div style={S.statusBar(screen === "swipe")}>
          <span>12:00</span><span>●●●●○ 5G</span>
        </div>

        {/* ── HOME ── */}
        {screen === "home" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "16px 24px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 900, color: "#1A1A1A" }}>MoveTogether</div>
                <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>📍 {profile?.stad || "Karlskrona"} · {activities.length} aktiviteter</div>
              </div>
              <button onClick={() => setScreen("swipe")} style={{ background: "#1A6B4A", border: "none", borderRadius: 20, padding: "8px 16px", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>✨ Swipa</button>
            </div>

            <div style={{ display: "flex", gap: 8, padding: "0 24px 12px", overflowX: "auto", scrollbarWidth: "none" }}>
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ flexShrink: 0, border: "none", borderRadius: 20, padding: "7px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer", background: filter === f ? "#1A6B4A" : "#EEECE8", color: filter === f ? "white" : "#555" }}>{f}</button>
              ))}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ background: "linear-gradient(135deg, #1A6B4A, #2E9E6E)", borderRadius: 20, padding: "14px 18px", color: "white", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🔥</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Händer nu i {profile?.stad || "Karlskrona"}</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>{activities.length} aktiviteter · Var med du också!</div>
                </div>
              </div>

              {activities.length === 0 && (
                <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>Inga aktiviteter än!</div>
                  <div style={{ fontSize: 13 }}>Var den första att skapa en aktivitet</div>
                </div>
              )}

              {(filter === "Alla" ? activities : activities.filter(a => a.typ === filter)).map(act => (
                <div key={act.id} onClick={() => { setSelectedActivity(act); setScreen("detail"); }} style={{ ...S.card, cursor: "pointer" }}>
                  <div style={{ background: getColor(act.typ), padding: "16px 18px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span style={{ fontSize: 26 }}>{getEmoji(act.typ)}</span>
                        <div style={{ color: "white", fontWeight: 700, fontSize: 15, marginTop: 4 }}>{act.titel}</div>
                        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 }}>{act.datum} {act.tid} · {act.plats}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 12, padding: "4px 10px", color: "white", fontSize: 12, fontWeight: 600 }}>
                        {myParticipations.includes(act.id) ? "✓ Anmäld" : `${act.typ}`}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: "10px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 13, color: "#888" }}>👥 Max {act.max_deltagare} deltagare</div>
                    <div style={{ fontSize: 13, color: myParticipations.includes(act.id) ? "#1A6B4A" : "#888", fontWeight: myParticipations.includes(act.id) ? 600 : 400 }}>
                      {myParticipations.includes(act.id) ? "Du är med ✓" : "Tryck för info →"}
                    </div>
                  </div>
                </div>
              ))}
              <div style={{ height: 80 }} />
            </div>
          </div>
        )}

        {/* ── SWIPE ── */}
        {screen === "swipe" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#1A6B4A" }}>
            <div style={{ padding: "12px 24px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => { setScreen("home"); setSwipeIndex(0); }} style={S.backBtn}>← Tillbaka</button>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 900, color: "white" }}>Hitta aktivitet</div>
              <div style={{ width: 70 }} />
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 20px 20px", gap: 16 }}>
              {currentCard ? (
                <>
                  <div style={{ position: "relative", width: "100%", height: 440 }}>
                    {filteredActivities[swipeIndex + 1] && <div style={{ position: "absolute", top: 10, left: 10, right: 10, height: 420, background: "white", borderRadius: 28, transform: "scale(0.95)", opacity: 0.6 }} />}
                    <div
                      onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd}
                      onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}
                      style={{ position: "absolute", inset: 0, background: "white", borderRadius: 28, overflow: "hidden", cursor: "grab", userSelect: "none", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", transform: swipeDir === "right" ? "translateX(120%) rotate(20deg)" : swipeDir === "left" ? "translateX(-120%) rotate(-20deg)" : `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`, transition: swipeDir ? "transform 0.4s ease" : dragging ? "none" : "transform 0.2s ease" }}>
                      {dragX > 40 && <div style={{ position: "absolute", top: 30, left: 20, background: "#1A6B4A", color: "white", borderRadius: 12, padding: "8px 16px", fontSize: 18, fontWeight: 700, zIndex: 10, transform: "rotate(-15deg)" }}>✓ JOIN</div>}
                      {dragX < -40 && <div style={{ position: "absolute", top: 30, right: 20, background: "#E53E3E", color: "white", borderRadius: 12, padding: "8px 16px", fontSize: 18, fontWeight: 700, zIndex: 10, transform: "rotate(15deg)" }}>✕ SKIP</div>}
                      <div style={{ background: getColor(currentCard.typ), padding: "28px 24px 24px", minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                        <div style={{ fontSize: 52 }}>{getEmoji(currentCard.typ)}</div>
                        <div style={{ color: "white", fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, marginTop: 8 }}>{currentCard.titel}</div>
                        <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>{currentCard.datum} {currentCard.tid} · {currentCard.plats}</div>
                      </div>
                      <div style={{ padding: "20px 24px" }}>
                        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                          <span style={{ background: "#E8F5EE", color: "#1A6B4A", borderRadius: 12, padding: "4px 12px", fontSize: 13, fontWeight: 600 }}>👥 Max {currentCard.max_deltagare}</span>
                          <span style={{ background: "#F0EDE8", borderRadius: 12, padding: "4px 12px", fontSize: 13, color: "#666" }}>{currentCard.typ}</span>
                        </div>
                        <p style={{ fontSize: 14, color: "#555", lineHeight: 1.6, margin: 0 }}>{currentCard.beskrivning || "Kom och häng!"}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                    <button onClick={() => handleSwipe("left")} style={{ width: 64, height: 64, borderRadius: "50%", background: "white", border: "none", fontSize: 24, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}>✕</button>
                    <button onClick={() => { setSelectedActivity(currentCard); setScreen("detail"); }} style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", fontSize: 18, cursor: "pointer" }}>ℹ️</button>
                    <button onClick={() => handleSwipe("right")} style={{ width: 64, height: 64, borderRadius: "50%", background: "white", border: "none", fontSize: 28, cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", color: "#1A6B4A" }}>✓</button>
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Swipa höger för att gå med · vänster för att skippa</div>
                </>
              ) : (
                <div style={{ textAlign: "center", color: "white" }}>
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Du har sett allt!</div>
                  <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 24 }}>Skapa en egen aktivitet eller kom tillbaka imorgon</div>
                  <button onClick={() => { setSwipeIndex(0); setScreen("home"); }} style={{ background: "white", border: "none", borderRadius: 20, padding: "12px 24px", color: "#1A6B4A", fontWeight: 700, cursor: "pointer", fontSize: 15 }}>← Tillbaka</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DETAIL ── */}
        {screen === "detail" && selectedActivity && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ background: getColor(selectedActivity.typ), padding: "16px 24px 24px" }}>
              <button onClick={() => setScreen("home")} style={S.backBtn}>← Tillbaka</button>
              <div style={{ fontSize: 48 }}>{getEmoji(selectedActivity.typ)}</div>
              <div style={{ fontFamily: "'Fraunces', serif", color: "white", fontSize: 22, fontWeight: 700, marginTop: 8 }}>{selectedActivity.titel}</div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 4 }}>{selectedActivity.datum} {selectedActivity.tid}</div>
            </div>
            <div style={S.scrollArea}>
              <div style={{ ...S.card, padding: 18 }}>
                {[["📍 Plats", selectedActivity.plats || "Ej angiven"], ["📅 Datum", selectedActivity.datum], ["⏰ Tid", selectedActivity.tid || "Ej angiven"], ["👥 Max deltagare", selectedActivity.max_deltagare]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F3EE" }}>
                    <span style={{ fontSize: 13, color: "#888" }}>{l}</span>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
              {selectedActivity.beskrivning && (
                <div style={{ ...S.card, padding: 18 }}>
                  <label style={S.label}>Om aktiviteten</label>
                  <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>{selectedActivity.beskrivning}</p>
                </div>
              )}
              <a href={`https://wa.me/?text=Hej! Jag är intresserad av aktiviteten: ${selectedActivity.titel} den ${selectedActivity.datum}`} target="_blank" rel="noreferrer"
                style={{ background: "#25D366", border: "none", borderRadius: 16, padding: 14, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", textAlign: "center", display: "block", textDecoration: "none" }}>
                💬 Kontakta via WhatsApp
              </a>
              {myParticipations.includes(selectedActivity.id) ? (
                <div style={{ background: "#E8F5EE", borderRadius: 16, padding: 16, textAlign: "center", color: "#1A6B4A", fontWeight: 700, fontSize: 15, border: "2px solid #1A6B4A" }}>✓ Du är anmäld!</div>
              ) : (
                <button onClick={() => joinActivity(selectedActivity.id)} style={S.btn()}>Gå med i aktiviteten →</button>
              )}
              <div style={{ height: 20 }} />
            </div>
          </div>
        )}

        {/* ── CREATE ── */}
        {screen === "create" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={S.greenHeader()}>
              <button onClick={() => setScreen("home")} style={S.backBtn}>← Tillbaka</button>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "white" }}>Skapa aktivitet</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>Sätt igång något i {profile?.stad || "Karlskrona"}!</div>
            </div>
            <div style={S.scrollArea}>
              <div style={{ ...S.card, padding: 18 }}>
                <label style={S.label}>Aktivitetstyp</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {ACTIVITY_TYPES.map(({ type, emoji }) => (
                    <button key={type} onClick={() => setCreateForm(f => ({ ...f, type }))} style={{ border: "none", borderRadius: 14, padding: "10px 6px", cursor: "pointer", textAlign: "center", background: createForm.type === type ? "#E8F5EE" : "#F5F3EE", outline: createForm.type === type ? "2px solid #1A6B4A" : "none" }}>
                      <div style={{ fontSize: 20 }}>{emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: createForm.type === type ? "#1A6B4A" : "#666", marginTop: 3 }}>{type}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ ...S.card, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                {[["Titel", "text", "t.ex. Morgonlöpning i Kungsmarken", "titel"], ["Datum", "date", "", "datum"], ["Tid", "time", "", "tid"], ["Plats", "text", "t.ex. Kungsmarken parkeringen", "plats"]].map(([label, type, ph, key]) => (
                  <div key={key}>
                    <label style={S.label}>{label}</label>
                    <input type={type} placeholder={ph} value={createForm[key]} onChange={e => setCreateForm(f => ({ ...f, [key]: e.target.value }))} style={S.input} />
                  </div>
                ))}
                <div>
                  <label style={S.label}>Max deltagare</label>
                  <select value={createForm.max_deltagare} onChange={e => setCreateForm(f => ({ ...f, max_deltagare: e.target.value }))} style={S.input}>
                    {["2", "4", "6", "8", "10", "15", "20"].map(n => <option key={n}>{n} personer</option>)}
                  </select>
                </div>
                <div>
                  <label style={S.label}>Beskrivning</label>
                  <textarea rows={3} placeholder="Berätta om aktiviteten..." value={createForm.beskrivning} onChange={e => setCreateForm(f => ({ ...f, beskrivning: e.target.value }))} style={{ ...S.input, resize: "none" }} />
                </div>
              </div>
              <button onClick={createActivity} style={S.btn()} disabled={loading}>{loading ? "Publicerar..." : "Publicera aktivitet 🚀"}</button>
              <div style={{ height: 20 }} />
            </div>
          </div>
        )}

        {/* ── PROFILE ── */}
        {screen === "profile" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ background: "#1A6B4A", padding: "20px 24px 28px", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.2)", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "white" }}>
                {profile?.namn?.substring(0, 2).toUpperCase() || "??"}
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: "white" }}>{profile?.namn || "Okänd"}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>📍 {profile?.stad || "Karlskrona"}</div>
              <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
                {[[myParticipations.length, "Aktiviteter"], [profile?.streak || 1, "Streak 🔥"], ["5.0", "Betyg ⭐"]].map(([n, l]) => (
                  <div key={l} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "10px 16px", textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>{n}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={S.scrollArea}>
              {profile?.bio && (
                <div style={{ ...S.card, padding: 18 }}>
                  <label style={S.label}>Om mig</label>
                  <p style={{ fontSize: 14, color: "#555", margin: 0 }}>{profile.bio}</p>
                </div>
              )}
              <div style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C55)", borderRadius: 20, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 28 }}>🔥</span>
                <div>
                  <div style={{ fontWeight: 700, color: "white", fontSize: 15 }}>{profile?.streak || 1} vecka i rad aktiv!</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)" }}>Fortsätt så – du är på en streak!</div>
                </div>
              </div>
              <div style={{ ...S.card, padding: 18 }}>
                <label style={S.label}>Ditt emblem</label>
                <span style={{ background: "#E8F5EE", color: "#1A6B4A", borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500 }}>{profile?.hedersemblem || "🌱 Ny medlem"}</span>
              </div>
              <div style={{ ...S.card, padding: 18 }}>
                <label style={S.label}>Mina anmälningar</label>
                {myParticipations.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#888", textAlign: "center", padding: 20 }}>Du har inte gått med i någon aktivitet än</div>
                ) : (
                  <div style={{ fontSize: 14, color: "#555" }}>Du är anmäld till {myParticipations.length} aktivitet{myParticipations.length !== 1 ? "er" : ""}</div>
                )}
              </div>
              <button onClick={handleLogout} style={S.btn("#F5F3EE", "#E53E3E")}>Logga ut</button>
              <div style={{ height: 20 }} />
            </div>
          </div>
        )}

        {/* BOTTOM NAV */}
        {screen !== "swipe" && (
          <div style={{ background: "white", borderTop: "1px solid #F0EDE8", display: "flex", padding: "10px 0 14px", boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
            {[["home", "🗺️", "Utforska"], ["swipe", "✨", "Swipa"], ["create", "➕", "Skapa"], ["profile", "👤", "Profil"]].map(([s, icon, label]) => (
              <button key={s} onClick={() => setScreen(s)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: screen === s ? "#1A6B4A" : "#AAA" }}>{label}</span>
                {screen === s && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#1A6B4A" }} />}
              </button>
            ))}
          </div>
        )}

        {/* TOAST */}
        {toast && (
          <div style={{ position: "absolute", bottom: 80, left: 20, right: 20, background: toast.color, color: "white", borderRadius: 16, padding: "14px 18px", fontSize: 14, fontWeight: 500, textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 100 }}>
            {toast.msg}
          </div>
        )}
      </div>
    </div>
  );
}
