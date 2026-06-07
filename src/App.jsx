import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lyblrmocrtsilxrdjpfm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5YmxybW9jcnRzaWx4cmRqcGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA0NDYsImV4cCI6MjA5NTEzNjQ0Nn0.8gfCAA_-m1J8BSK2NXmCOR4J8qrBzx7pFW5A2UDfayM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SWEDISH_CITIES = [
  "Stockholm","Göteborg","Malmö","Uppsala","Västerås","Örebro","Linköping",
  "Helsingborg","Jönköping","Norrköping","Lund","Umeå","Gävle","Borås",
  "Södertälje","Eskilstuna","Halmstad","Växjö","Karlstad","Sundsvall",
  "Östersund","Trollhättan","Luleå","Kalmar","Kristianstad","Falun",
  "Skellefteå","Karlskrona","Ronneby","Blekinge"
];

const ACTIVITY_TYPES = [
  {type:"Löpning",emoji:"🏃"},{type:"Promenad",emoji:"🚶"},
  {type:"Cykling",emoji:"🚴"},{type:"Fotboll",emoji:"⚽"},
  {type:"Basket",emoji:"🏀"},{type:"Gym",emoji:"🏋️"},
  {type:"Simning",emoji:"🏊"},{type:"Yoga",emoji:"🧘"},
  {type:"Hiking",emoji:"🥾"},{type:"Crossfit",emoji:"💪"},
  {type:"Studera",emoji:"📚"},{type:"Co-working",emoji:"💻"},
  {type:"Socialt",emoji:"☕"},{type:"Nybörjar",emoji:"🌱"},
  {type:"Återhämtning",emoji:"🌿"},
];

const TYPE_COLORS = {
  "Löpning":"#1A6B4A","Promenad":"#2E9E6E","Cykling":"#185FA5",
  "Fotboll":"#854F0B","Basket":"#C4462A","Gym":"#1A6B4A",
  "Simning":"#0E7490","Yoga":"#6B4AA8","Hiking":"#3D6B21",
  "Crossfit":"#9B1C1C","Studera":"#1E40AF","Co-working":"#374151",
  "Socialt":"#C4462A","Nybörjar":"#166534","Återhämtning":"#065F46",
};

const BADGES = {1:"🌱 Ny medlem",3:"🔥 Aktiv starter",5:"⭐ Regelbunden",10:"🏆 Veteran",20:"👑 MoveTogether-legend"};
const getBadge = (n) => { const keys = Object.keys(BADGES).map(Number).sort((a,b)=>b-a); for(const k of keys){if(n>=k)return BADGES[k];} return "🌱 Ny medlem"; };
const getEmoji = (typ) => ACTIVITY_TYPES.find(a=>a.type===typ)?.emoji||"🏃";
const getColor = (typ) => TYPE_COLORS[typ]||"#1A6B4A";

const isExpired = (datum, tid) => {
  if (!datum) return false;
  const dateStr = tid ? `${datum}T${tid}` : `${datum}T23:59`;
  return new Date(dateStr) < new Date();
};

const getDateLabel = (datum, tid) => {
  if (!datum) return "";
  if (isExpired(datum, tid)) return "⚫ Avslutad";
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(datum); d.setHours(0,0,0,0);
  const diff = Math.round((d-today)/(1000*60*60*24));
  if (diff === 0) return "🟢 Idag";
  if (diff === 1) return "🔵 Imorgon";
  if (diff <= 7) return `🟡 Om ${diff} dagar`;
  return `📅 ${datum}`;
};

const getStatusLabel = (count, max) => {
  const pct = count/max;
  if (count >= max) return {text:"🔴 Fullbokad",color:"#E53E3E",bg:"#FCEBEB"};
  if (pct >= 0.7) return {text:`⚡ ${max-count} platser kvar!`,color:"#854F0B",bg:"#FEF3E7"};
  return {text:`✅ ${max-count} av ${max} lediga`,color:"#1A6B4A",bg:"#E8F5EE"};
};

const S = {
  phone: {width:"100%",maxWidth:430,minHeight:"100vh",background:"#FAFAF8",position:"relative",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",margin:"0 auto"},
  input: {width:"100%",background:"#F5F3EE",border:"1.5px solid #E8E5E0",borderRadius:12,padding:"13px 16px",fontSize:15,color:"#1A1A1A",outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"},
  btn: (bg="#1A6B4A",color="white") => ({background:bg,border:"none",borderRadius:16,padding:"15px",color,fontSize:16,fontWeight:700,cursor:"pointer",width:"100%",fontFamily:"'DM Sans',sans-serif"}),
  card: {background:"white",borderRadius:20,overflow:"hidden",border:"1px solid #F0EDE8",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"},
  label: {fontSize:12,fontWeight:600,color:"#888",marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:0.5},
  scrollArea: {flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14},
  backBtn: {background:"rgba(255,255,255,0.2)",border:"none",borderRadius:20,padding:"7px 14px",color:"white",fontSize:13,cursor:"pointer",marginBottom:12},
};

export default function MoveTogether() {
  const [screen, setScreen] = useState("splash");
  const [authScreen, setAuthScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activities, setActivities] = useState([]);
  const [participantCounts, setParticipantCounts] = useState({});
  const [myParticipations, setMyParticipations] = useState([]);
  const [myHistory, setMyHistory] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedActivityParticipants, setSelectedActivityParticipants] = useState([]);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [filter, setFilter] = useState("Alla");
  const [cityFilter, setCityFilter] = useState("Alla städer");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [profileTab, setProfileTab] = useState("info"); // info | history | stats
  const dragStart = useRef(null);
  const fileInputRef = useRef(null);

  const [authForm, setAuthForm] = useState({email:"",password:"",namn:"",stad:"Karlskrona",bio:""});
  const [createForm, setCreateForm] = useState({type:"",titel:"",datum:"",tid:"",plats:"",stad:"Karlskrona",max_deltagare:"6",beskrivning:"",niva:"Alla nivåer"});
  const [editForm, setEditForm] = useState({namn:"",stad:"",bio:""});

  const showToast = (msg, color="#1A6B4A") => { setToast({msg,color}); setTimeout(()=>setToast(null),3000); };

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        await fetchActivities();
        await fetchMyParticipations(session.user.id);
        setScreen("home");
      } else setScreen("auth");
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from("profiles").select("*").eq("id",uid).single();
    if (data) { setProfile(data); setEditForm({namn:data.namn||"",stad:data.stad||"",bio:data.bio||""}); if(data.stad) setCreateForm(f=>({...f,stad:data.stad,plats:data.stad})); }
  };

  const fetchActivities = async () => {
    const { data } = await supabase.from("activities").select("*").order("datum",{ascending:true});
    if (data) {
      setActivities(data);
      const counts = {};
      await Promise.all(data.map(async (act) => {
        const { count } = await supabase.from("participants").select("*",{count:"exact",head:true}).eq("aktivitet_id",act.id);
        counts[act.id] = count||0;
      }));
      setParticipantCounts(counts);
    }
  };

  const fetchMyParticipations = async (uid) => {
    const { data } = await supabase.from("participants").select("aktivitet_id, activities(*)").eq("anvandare_id",uid);
    if (data) {
      setMyParticipations(data.map(p=>p.aktivitet_id));
      // Split into history (expired) and upcoming
      const hist = data.filter(p=>p.activities&&isExpired(p.activities.datum, p.activities.tid)).map(p=>p.activities);
      setMyHistory(hist);
    }
  };

  const fetchActivityParticipants = async (actId) => {
    const { data } = await supabase.from("participants").select("anvandare_id, profiles(namn, profilbild_url)").eq("aktivitet_id",actId);
    if (data) setSelectedActivityParticipants(data);
  };

  const handleRegister = async () => {
    if (!authForm.email||!authForm.password||!authForm.namn) { showToast("Fyll i alla fält!","#E53E3E"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({email:authForm.email,password:authForm.password});
    if (error) { showToast(error.message,"#E53E3E"); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert({id:data.user.id,namn:authForm.namn,stad:authForm.stad,bio:authForm.bio,streak:1,hedersemblem:"🌱 Ny medlem"});
      setUser(data.user);
      await fetchProfile(data.user.id);
      await fetchActivities();
      showToast("Välkommen till MoveTogether! 🎉");
      setScreen("home");
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!authForm.email||!authForm.password) { showToast("Fyll i e-post och lösenord!","#E53E3E"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({email:authForm.email,password:authForm.password});
    if (error) { showToast("Fel e-post eller lösenord!","#E53E3E"); setLoading(false); return; }
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
    setUser(null); setProfile(null); setActivities([]); setMyParticipations([]); setMyHistory([]);
    setScreen("auth");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await supabase.from("profiles").update({profilbild_url:ev.target.result}).eq("id",user.id);
      await fetchProfile(user.id);
      setUploadingPhoto(false);
      showToast("Profilbild uppdaterad! 📸");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setLoading(true);
    await supabase.from("profiles").update({namn:editForm.namn,stad:editForm.stad,bio:editForm.bio,hedersemblem:getBadge(myParticipations.length)}).eq("id",user.id);
    await fetchProfile(user.id);
    setEditingProfile(false);
    setLoading(false);
    showToast("Profil uppdaterad! ✅");
  };

  const joinActivity = async (activityId) => {
    if (!user) return;
    if (myParticipations.includes(activityId)) { showToast("Du är redan anmäld!","#854F0B"); return; }
    const act = activities.find(a=>a.id===activityId);
    if (act && (participantCounts[activityId]||0) >= act.max_deltagare) { showToast("Aktiviteten är fullbokad!","#E53E3E"); return; }
    const { error } = await supabase.from("participants").insert({aktivitet_id:activityId,anvandare_id:user.id,status:"Väntande"});
    if (!error) {
      const newList = [...myParticipations, activityId];
      setMyParticipations(newList);
      setParticipantCounts(prev=>({...prev,[activityId]:(prev[activityId]||0)+1}));
      await supabase.from("profiles").update({hedersemblem:getBadge(newList.length)}).eq("id",user.id);
      showToast("🎉 Du är anmäld!");
      setScreen("home");
    }
  };

  const leaveActivity = async (activityId) => {
    const { error } = await supabase.from("participants").delete().eq("aktivitet_id",activityId).eq("anvandare_id",user.id);
    if (!error) {
      setMyParticipations(prev=>prev.filter(id=>id!==activityId));
      setParticipantCounts(prev=>({...prev,[activityId]:Math.max((prev[activityId]||1)-1,0)}));
      showToast("Du har avanmält dig.","#854F0B");
      setScreen("home");
    }
  };

  const createActivity = async () => {
    if (!createForm.type||!createForm.titel||!createForm.datum) { showToast("Fyll i typ, titel och datum!","#E53E3E"); return; }
    setLoading(true);
    const { error } = await supabase.from("activities").insert({
      titel:createForm.titel, typ:createForm.type, datum:createForm.datum,
      tid:createForm.tid, plats:createForm.plats||createForm.stad,
      stad:createForm.stad, max_deltagare:parseInt(createForm.max_deltagare),
      beskrivning:createForm.beskrivning, skapad_av:user.id, status:"Öppen"
    });
    if (!error) {
      await fetchActivities();
      setCreateForm({type:"",titel:"",datum:"",tid:"",plats:"",stad:profile?.stad||"Karlskrona",max_deltagare:"6",beskrivning:"",niva:"Alla nivåer"});
      showToast("🚀 Aktivitet publicerad!");
      setScreen("home");
    } else showToast("Något gick fel!","#E53E3E");
    setLoading(false);
  };

  // Only show active (non-expired) activities in feed
  const getFilteredActivities = () => {
    let list = activities.filter(a => !isExpired(a.datum, a.tid));
    if (filter !== "Alla") list = list.filter(a=>a.typ===filter);
    if (cityFilter !== "Alla städer") list = list.filter(a=>a.stad===cityFilter||a.plats?.includes(cityFilter));
    if (searchQuery) list = list.filter(a=>a.titel?.toLowerCase().includes(searchQuery.toLowerCase())||a.plats?.toLowerCase().includes(searchQuery.toLowerCase())||a.typ?.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  };

  // Stats from history
  const getStats = () => {
    const total = myHistory.length;
    const typeCount = {};
    myHistory.forEach(a=>{ typeCount[a.typ]=(typeCount[a.typ]||0)+1; });
    const favType = Object.entries(typeCount).sort((a,b)=>b[1]-a[1])[0];
    const cities = [...new Set(myHistory.map(a=>a.stad||a.plats).filter(Boolean))];
    return { total, favType: favType?.[0], favCount: favType?.[1]||0, cities: cities.length, typeCount };
  };

  const swipeList = getFilteredActivities();
  const currentCard = swipeList[swipeIndex];

  const handleSwipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(() => {
      setSwipeDir(null); setSwipeIndex(i=>i+1);
      if (dir==="right"&&currentCard) joinActivity(currentCard.id);
    }, 400);
  };

  const handleDragStart = (e) => { dragStart.current=e.touches?e.touches[0].clientX:e.clientX; setDragging(true); };
  const handleDragMove = (e) => { if(!dragging)return; setDragX((e.touches?e.touches[0].clientX:e.clientX)-dragStart.current); };
  const handleDragEnd = () => { if(Math.abs(dragX)>80)handleSwipe(dragX>0?"right":"left"); setDragX(0); setDragging(false); dragStart.current=null; };

  const filters = ["Alla","Löpning","Cykling","Fotboll","Yoga","Socialt","Gym","Hiking"];
  const filteredList = getFilteredActivities();
  const stats = getStats();

  // SPLASH
  if (screen==="splash") return (
    <div style={{width:"100%",minHeight:"100vh",background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{textAlign:"center",color:"white"}}>
        <div style={{fontSize:72,marginBottom:16}}>🌿</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:38,fontWeight:900}}>MoveTogether</div>
        <div style={{fontSize:15,opacity:0.75,marginTop:8}}>Sverige · Rörelse & Gemenskap</div>
        <div style={{marginTop:40,display:"flex",justifyContent:"center",gap:6}}>
          {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:i===0?"white":"rgba(255,255,255,0.3)"}}/>)}
        </div>
      </div>
    </div>
  );

  // AUTH
  if (screen==="auth") return (
    <div style={{minHeight:"100vh",background:"#F5F3EE",display:"flex",justifyContent:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{...S.phone}}>
        <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"48px 24px 36px",textAlign:"center"}}>
          <div style={{fontSize:48}}>🌿</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:900,color:"white",marginTop:8}}>MoveTogether</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>Sverige · Rörelse & Gemenskap</div>
        </div>
        <div style={{display:"flex",background:"#EEECE8",margin:"20px 20px 0",borderRadius:16,padding:4}}>
          {["login","register"].map(t=>(
            <button key={t} onClick={()=>setAuthScreen(t)} style={{flex:1,border:"none",borderRadius:12,padding:"10px",fontSize:14,fontWeight:600,cursor:"pointer",background:authScreen===t?"white":"transparent",color:authScreen===t?"#1A1A1A":"#888",transition:"all 0.2s",boxShadow:authScreen===t?"0 2px 8px rgba(0,0,0,0.1)":"none"}}>
              {t==="login"?"Logga in":"Registrera"}
            </button>
          ))}
        </div>
        <div style={{padding:"16px 20px 40px",display:"flex",flexDirection:"column",gap:12}}>
          {authScreen==="register"&&<>
            <div><label style={S.label}>Namn</label><input style={S.input} placeholder="Förnamn Efternamn" value={authForm.namn} onChange={e=>setAuthForm(f=>({...f,namn:e.target.value}))}/></div>
            <div><label style={S.label}>Stad</label>
              <select style={S.input} value={authForm.stad} onChange={e=>setAuthForm(f=>({...f,stad:e.target.value}))}>
                {SWEDISH_CITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={S.label}>Bio (valfri)</label><input style={S.input} placeholder="t.ex. Gillar löpning och kaffe" value={authForm.bio} onChange={e=>setAuthForm(f=>({...f,bio:e.target.value}))}/></div>
          </>}
          <div><label style={S.label}>E-post</label><input style={S.input} type="email" placeholder="din@email.com" value={authForm.email} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))}/></div>
          <div><label style={S.label}>Lösenord</label><input style={S.input} type="password" placeholder="Minst 6 tecken" value={authForm.password} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))}/></div>
          <button onClick={authScreen==="login"?handleLogin:handleRegister} style={S.btn()} disabled={loading}>{loading?"Laddar...":authScreen==="login"?"Logga in →":"Skapa konto →"}</button>
          <div style={{textAlign:"center",fontSize:13,color:"#888"}}>
            {authScreen==="login"?"Inget konto? ":"Har du konto? "}
            <span onClick={()=>setAuthScreen(authScreen==="login"?"register":"login")} style={{color:"#1A6B4A",fontWeight:600,cursor:"pointer"}}>
              {authScreen==="login"?"Registrera dig":"Logga in"}
            </span>
          </div>
        </div>
        {toast&&<div style={{position:"fixed",bottom:40,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"white",borderRadius:16,padding:"14px 24px",fontSize:14,fontWeight:500,zIndex:200,whiteSpace:"nowrap"}}>{toast.msg}</div>}
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#F5F3EE",display:"flex",justifyContent:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{...S.phone}}>

        {/* HOME */}
        {screen==="home"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"52px 20px 8px",background:"#FAFAF8"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:900,color:"#1A1A1A"}}>MoveTogether</div>
                  <div style={{fontSize:12,color:"#888",marginTop:1}}>📍 {cityFilter==="Alla städer"?"Sverige":cityFilter} · {filteredList.length} aktiviteter</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button onClick={()=>setScreen("swipe")} style={{background:"#1A6B4A",border:"none",borderRadius:20,padding:"7px 14px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>✨ Swipa</button>
                  <div onClick={()=>setScreen("profile")} style={{cursor:"pointer"}}>
                    {profile?.profilbild_url?<img src={profile.profilbild_url} alt="profil" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover",border:"2px solid #1A6B4A"}}/>:<div style={{width:36,height:36,borderRadius:"50%",background:"#1A6B4A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"white"}}>{profile?.namn?.substring(0,2).toUpperCase()||"?"}</div>}
                  </div>
                </div>
              </div>
              <div style={{position:"relative",marginBottom:10}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#AAA"}}>🔍</span>
                <input style={{...S.input,paddingLeft:40,borderRadius:20,fontSize:14}} placeholder="Sök aktiviteter, stad, typ..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
              </div>
              <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
                <button onClick={()=>setShowCityPicker(!showCityPicker)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"7px 14px",fontSize:13,fontWeight:500,cursor:"pointer",background:cityFilter!=="Alla städer"?"#1A6B4A":"#EEECE8",color:cityFilter!=="Alla städer"?"white":"#555"}}>
                  📍 {cityFilter==="Alla städer"?"Välj stad":cityFilter}
                </button>
                {filters.map(f=>(
                  <button key={f} onClick={()=>setFilter(f)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"7px 14px",fontSize:13,fontWeight:500,cursor:"pointer",background:filter===f?"#1A6B4A":"#EEECE8",color:filter===f?"white":"#555"}}>{f}</button>
                ))}
              </div>
              {showCityPicker&&(
                <div style={{background:"white",borderRadius:16,border:"1px solid #F0EDE8",padding:12,marginTop:8,maxHeight:200,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:20,position:"relative"}}>
                  {["Alla städer",...SWEDISH_CITIES].map(city=>(
                    <div key={city} onClick={()=>{setCityFilter(city);setShowCityPicker(false);}} style={{padding:"8px 12px",borderRadius:10,cursor:"pointer",background:cityFilter===city?"#E8F5EE":"transparent",color:cityFilter===city?"#1A6B4A":"#333",fontWeight:cityFilter===city?600:400,fontSize:14}}>
                      {cityFilter===city?"✓ ":""}{city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{flex:1,overflowY:"auto",padding:"0 16px 12px",display:"flex",flexDirection:"column",gap:12,marginTop:10}}>
              <div style={{background:"linear-gradient(135deg,#1A6B4A,#2E9E6E)",borderRadius:20,padding:"14px 18px",color:"white",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:24}}>🔥</span>
                <div>
                  <div style={{fontWeight:700,fontSize:14}}>Händer nu i Sverige</div>
                  <div style={{fontSize:12,opacity:0.85}}>{filteredList.length} aktiva · {Object.values(participantCounts).reduce((a,b)=>a+b,0)} anmälda totalt</div>
                </div>
              </div>

              {filteredList.length===0&&(
                <div style={{textAlign:"center",padding:48,color:"#888"}}>
                  <div style={{fontSize:56,marginBottom:12}}>🌱</div>
                  <div style={{fontWeight:600,marginBottom:8}}>Inga aktiva aktiviteter!</div>
                  <div style={{fontSize:13}}>Skapa den första eller byt stad</div>
                </div>
              )}

              {filteredList.map(act=>{
                const count=participantCounts[act.id]||0;
                const status=getStatusLabel(count,act.max_deltagare);
                const dateLabel=getDateLabel(act.datum,act.tid);
                const isJoined=myParticipations.includes(act.id);
                return (
                  <div key={act.id} onClick={()=>{setSelectedActivity(act);fetchActivityParticipants(act.id);setScreen("detail");}} style={{...S.card,cursor:"pointer"}}>
                    <div style={{background:getColor(act.typ),padding:"14px 18px 12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                            <span style={{fontSize:22}}>{getEmoji(act.typ)}</span>
                            <span style={{background:"rgba(255,255,255,0.2)",borderRadius:10,padding:"2px 8px",fontSize:11,color:"white",fontWeight:500}}>{dateLabel}</span>
                          </div>
                          <div style={{color:"white",fontWeight:700,fontSize:15,lineHeight:1.2}}>{act.titel}</div>
                          <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginTop:3}}>📍 {act.plats||act.stad} · {act.tid}</div>
                        </div>
                        {isJoined&&<div style={{background:"rgba(255,255,255,0.9)",borderRadius:12,padding:"4px 10px",color:getColor(act.typ),fontSize:12,fontWeight:700,flexShrink:0}}>✓ Anmäld</div>}
                      </div>
                    </div>
                    <div style={{padding:"10px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{background:status.bg,color:status.color,borderRadius:10,padding:"3px 10px",fontSize:12,fontWeight:600}}>{status.text}</span>
                      <div style={{fontSize:12,color:"#888"}}>👥 {count}/{act.max_deltagare}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{height:90}}/>
            </div>
          </div>
        )}

        {/* SWIPE */}
        {screen==="swipe"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",minHeight:"100vh"}}>
            <div style={{padding:"52px 24px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <button onClick={()=>{setScreen("home");setSwipeIndex(0);}} style={S.backBtn}>← Tillbaka</button>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:900,color:"white"}}>Hitta aktivitet</div>
              <div style={{width:70}}/>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 20px 40px",gap:20}}>
              {currentCard?(
                <>
                  <div style={{position:"relative",width:"100%",height:460}}>
                    {swipeList[swipeIndex+1]&&<div style={{position:"absolute",top:10,left:10,right:10,height:440,background:"white",borderRadius:28,transform:"scale(0.95)",opacity:0.5}}/>}
                    <div
                      onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd}
                      onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}
                      style={{position:"absolute",inset:0,background:"white",borderRadius:28,overflow:"hidden",cursor:"grab",userSelect:"none",boxShadow:"0 24px 60px rgba(0,0,0,0.25)",transform:swipeDir==="right"?"translateX(120%) rotate(20deg)":swipeDir==="left"?"translateX(-120%) rotate(-20deg)":`translateX(${dragX}px) rotate(${dragX*0.05}deg)`,transition:swipeDir?"transform 0.4s ease":dragging?"none":"transform 0.2s ease"}}>
                      {dragX>40&&<div style={{position:"absolute",top:30,left:20,background:"#1A6B4A",color:"white",borderRadius:12,padding:"8px 16px",fontSize:18,fontWeight:700,zIndex:10,transform:"rotate(-15deg)"}}>✓ JOIN</div>}
                      {dragX<-40&&<div style={{position:"absolute",top:30,right:20,background:"#E53E3E",color:"white",borderRadius:12,padding:"8px 16px",fontSize:18,fontWeight:700,zIndex:10,transform:"rotate(15deg)"}}>✕ SKIP</div>}
                      <div style={{background:getColor(currentCard.typ),padding:"32px 24px 24px",minHeight:220,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div>
                            <div style={{fontSize:52}}>{getEmoji(currentCard.typ)}</div>
                            <div style={{color:"white",fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,marginTop:8}}>{currentCard.titel}</div>
                            <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginTop:4}}>📍 {currentCard.plats||currentCard.stad}</div>
                          </div>
                          <div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
                            <div style={{color:"white",fontSize:20,fontWeight:700}}>{participantCounts[currentCard.id]||0}</div>
                            <div style={{color:"rgba(255,255,255,0.8)",fontSize:10}}>anmälda</div>
                          </div>
                        </div>
                      </div>
                      <div style={{padding:"20px 24px"}}>
                        <div style={{display:"flex",gap:8,marginBottom:12}}>
                          <span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:12,padding:"4px 12px",fontSize:13,fontWeight:600}}>👥 {participantCounts[currentCard.id]||0}/{currentCard.max_deltagare}</span>
                          <span style={{background:"#F0EDE8",borderRadius:12,padding:"4px 12px",fontSize:13,color:"#666"}}>{getDateLabel(currentCard.datum,currentCard.tid)}</span>
                        </div>
                        <p style={{fontSize:14,color:"#555",lineHeight:1.6,margin:0}}>{currentCard.beskrivning||"Kom och häng!"}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:20,alignItems:"center"}}>
                    <button onClick={()=>handleSwipe("left")} style={{width:68,height:68,borderRadius:"50%",background:"white",border:"none",fontSize:26,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",color:"#E53E3E"}}>✕</button>
                    <button onClick={()=>{setSelectedActivity(currentCard);fetchActivityParticipants(currentCard.id);setScreen("detail");}} style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"none",fontSize:20,cursor:"pointer"}}>ℹ️</button>
                    <button onClick={()=>handleSwipe("right")} style={{width:68,height:68,borderRadius:"50%",background:"white",border:"none",fontSize:26,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",color:"#1A6B4A"}}>✓</button>
                  </div>
                  <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>Swipa höger för att gå med · vänster för att skippa</div>
                </>
              ):(
                <div style={{textAlign:"center",color:"white"}}>
                  <div style={{fontSize:72,marginBottom:16}}>🎉</div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,marginBottom:8}}>Du har sett allt!</div>
                  <button onClick={()=>{setSwipeIndex(0);setScreen("home");}} style={{background:"white",border:"none",borderRadius:20,padding:"14px 28px",color:"#1A6B4A",fontWeight:700,cursor:"pointer",fontSize:15}}>← Tillbaka</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DETAIL */}
        {screen==="detail"&&selectedActivity&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
            <div style={{background:getColor(selectedActivity.typ),padding:"52px 24px 24px"}}>
              <button onClick={()=>setScreen("home")} style={S.backBtn}>← Tillbaka</button>
              <div style={{fontSize:52}}>{getEmoji(selectedActivity.typ)}</div>
              <div style={{fontFamily:"'Fraunces',serif",color:"white",fontSize:24,fontWeight:700,marginTop:8}}>{selectedActivity.titel}</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginTop:4}}>{getDateLabel(selectedActivity.datum,selectedActivity.tid)} · {selectedActivity.tid}</div>
            </div>
            <div style={S.scrollArea}>
              {(()=>{const s=getStatusLabel(participantCounts[selectedActivity.id]||0,selectedActivity.max_deltagare);return(
                <div style={{background:s.bg,borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>{s.text.split(" ")[0]}</span>
                  <div><div style={{fontSize:14,fontWeight:600,color:s.color}}>{s.text}</div>
                  <div style={{fontSize:12,color:"#888"}}>{participantCounts[selectedActivity.id]||0} av {selectedActivity.max_deltagare} platser fyllda</div></div>
                </div>
              );})()}
              {myParticipations.includes(selectedActivity.id)&&(
                <div style={{background:"#E8F5EE",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,border:"1px solid #B8DFC4"}}>
                  <span style={{fontSize:20}}>✅</span><span style={{fontSize:14,fontWeight:600,color:"#1A6B4A"}}>Du är anmäld till denna aktivitet</span>
                </div>
              )}
              <div style={{...S.card,padding:18}}>
                {[["📍 Plats",selectedActivity.plats||selectedActivity.stad||"Ej angiven"],["🏙️ Stad",selectedActivity.stad||"Ej angiven"],["📅 Datum",selectedActivity.datum],["⏰ Tid",selectedActivity.tid||"Ej angiven"],["👥 Anmälda",`${participantCounts[selectedActivity.id]||0} av ${selectedActivity.max_deltagare}`],["🎯 Typ",selectedActivity.typ]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F5F3EE"}}>
                    <span style={{fontSize:13,color:"#888"}}>{l}</span><span style={{fontSize:13,fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>
              {selectedActivity.beskrivning&&<div style={{...S.card,padding:18}}><label style={S.label}>Om aktiviteten</label><p style={{fontSize:14,color:"#555",lineHeight:1.7,margin:0}}>{selectedActivity.beskrivning}</p></div>}
              {selectedActivityParticipants.length>0&&(
                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Anmälda ({selectedActivityParticipants.length})</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {selectedActivityParticipants.map((p,i)=>(
                      <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                        <div style={{width:40,height:40,borderRadius:"50%",background:"#E8F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#1A6B4A"}}>{p.profiles?.namn?.substring(0,2).toUpperCase()||"??"}</div>
                        <div style={{fontSize:10,color:"#888",maxWidth:48,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.profiles?.namn?.split(" ")[0]||"?"}</div>
                      </div>
                    ))}
                    {Array.from({length:Math.max(0,selectedActivity.max_deltagare-selectedActivityParticipants.length)}).map((_,i)=>(
                      <div key={`e${i}`} style={{width:40,height:40,borderRadius:"50%",background:"#F0EDE8",border:"2px dashed #CCC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#CCC"}}>+</div>
                    ))}
                  </div>
                </div>
              )}
              <a href={`https://wa.me/?text=Hej! Kolla in: ${selectedActivity.titel} den ${selectedActivity.datum} i ${selectedActivity.stad}!`} target="_blank" rel="noreferrer" style={{background:"#25D366",border:"none",borderRadius:16,padding:14,color:"white",fontSize:15,fontWeight:700,cursor:"pointer",textAlign:"center",display:"block",textDecoration:"none"}}>💬 Kontakta via WhatsApp</a>
              {myParticipations.includes(selectedActivity.id)?(
                <button onClick={()=>leaveActivity(selectedActivity.id)} style={S.btn("#FEF3E7","#854F0B")}>Avanmäl mig från aktiviteten</button>
              ):(
                <button onClick={()=>joinActivity(selectedActivity.id)} style={S.btn()} disabled={(participantCounts[selectedActivity.id]||0)>=selectedActivity.max_deltagare}>
                  {(participantCounts[selectedActivity.id]||0)>=selectedActivity.max_deltagare?"🔴 Fullbokad":"Gå med i aktiviteten →"}
                </button>
              )}
              <div style={{height:20}}/>
            </div>
          </div>
        )}

        {/* CREATE */}
        {screen==="create"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
            <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 24px"}}>
              <button onClick={()=>setScreen("home")} style={S.backBtn}>← Tillbaka</button>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,color:"white"}}>Skapa aktivitet</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:4}}>Sätt igång något i Sverige!</div>
            </div>
            <div style={S.scrollArea}>
              <div style={{...S.card,padding:18}}>
                <label style={S.label}>Aktivitetstyp</label>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {ACTIVITY_TYPES.map(({type,emoji})=>(
                    <button key={type} onClick={()=>setCreateForm(f=>({...f,type}))} style={{border:"none",borderRadius:14,padding:"10px 6px",cursor:"pointer",textAlign:"center",background:createForm.type===type?"#E8F5EE":"#F5F3EE",outline:createForm.type===type?"2px solid #1A6B4A":"none"}}>
                      <div style={{fontSize:22}}>{emoji}</div>
                      <div style={{fontSize:11,fontWeight:500,color:createForm.type===type?"#1A6B4A":"#666",marginTop:3}}>{type}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{...S.card,padding:18,display:"flex",flexDirection:"column",gap:14}}>
                <div><label style={S.label}>Titel</label><input type="text" placeholder="t.ex. Morgonlöpning i parken" value={createForm.titel} onChange={e=>setCreateForm(f=>({...f,titel:e.target.value}))} style={S.input}/></div>
                <div><label style={S.label}>Stad</label>
                  <select style={S.input} value={createForm.stad} onChange={e=>setCreateForm(f=>({...f,stad:e.target.value,plats:e.target.value}))}>
                    {SWEDISH_CITIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Exakt plats</label><input type="text" placeholder="t.ex. Kungsmarken parkeringen" value={createForm.plats} onChange={e=>setCreateForm(f=>({...f,plats:e.target.value}))} style={S.input}/></div>
                <div><label style={S.label}>Datum</label><input type="date" value={createForm.datum} onChange={e=>setCreateForm(f=>({...f,datum:e.target.value}))} style={S.input}/></div>
                <div><label style={S.label}>Tid</label><input type="time" value={createForm.tid} onChange={e=>setCreateForm(f=>({...f,tid:e.target.value}))} style={S.input}/></div>
                <div><label style={S.label}>Nivå</label>
                  <select value={createForm.niva} onChange={e=>setCreateForm(f=>({...f,niva:e.target.value}))} style={S.input}>
                    {["Alla nivåer","Nybörjare","Medel","Avancerad"].map(n=><option key={n}>{n}</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Max deltagare</label>
                  <select value={createForm.max_deltagare} onChange={e=>setCreateForm(f=>({...f,max_deltagare:e.target.value}))} style={S.input}>
                    {["2","4","6","8","10","15","20","50"].map(n=><option key={n}>{n} personer</option>)}
                  </select>
                </div>
                <div><label style={S.label}>Beskrivning</label><textarea rows={3} placeholder="Berätta om aktiviteten..." value={createForm.beskrivning} onChange={e=>setCreateForm(f=>({...f,beskrivning:e.target.value}))} style={{...S.input,resize:"none"}}/></div>
              </div>
              <button onClick={createActivity} style={S.btn()} disabled={loading}>{loading?"Publicerar...":"Publicera aktivitet 🚀"}</button>
              <div style={{height:20}}/>
            </div>
          </div>
        )}

        {/* PROFILE */}
        {screen==="profile"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
            <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 20px",position:"relative"}}>
              <button onClick={()=>setScreen("home")} style={{...S.backBtn,position:"absolute",top:52,left:24}}>← Tillbaka</button>
              <div style={{textAlign:"center"}}>
                <div style={{position:"relative",width:90,height:90,margin:"0 auto 12px"}}>
                  {profile?.profilbild_url?
                    <img src={profile.profilbild_url} alt="profil" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.3)"}}/>:
                    <div style={{width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,color:"white",border:"3px solid rgba(255,255,255,0.3)"}}>{profile?.namn?.substring(0,2).toUpperCase()||"??"}</div>
                  }
                  <button onClick={()=>fileInputRef.current?.click()} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:"white",border:"none",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>
                    {uploadingPhoto?"⏳":"📷"}
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:"none"}}/>
                </div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,color:"white"}}>{profile?.namn||"Okänd"}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>📍 {profile?.stad||"Sverige"}</div>
                <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"center"}}>
                  {[[myHistory.length,"Genomförda"],[myParticipations.length-myHistory.length,"Kommande"],[profile?.streak||1,"Streak 🔥"]].map(([n,l])=>(
                    <div key={l} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"8px 14px",textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:700,color:"white"}}>{n}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:1}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tabs */}
              <div style={{display:"flex",background:"rgba(255,255,255,0.15)",borderRadius:16,padding:4,marginTop:16}}>
                {[["info","👤 Info"],["history","📊 Historik"],["stats","🏆 Stats"]].map(([t,l])=>(
                  <button key={t} onClick={()=>setProfileTab(t)} style={{flex:1,border:"none",borderRadius:12,padding:"8px 4px",fontSize:13,fontWeight:600,cursor:"pointer",background:profileTab===t?"white":"transparent",color:profileTab===t?"#1A6B4A":"rgba(255,255,255,0.8)",transition:"all 0.2s"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.scrollArea}>
              {/* INFO TAB */}
              {profileTab==="info"&&<>
                {!editingProfile?(
                  <button onClick={()=>setEditingProfile(true)} style={S.btn("#F5F3EE","#1A6B4A")}>✏️ Redigera profil</button>
                ):(
                  <div style={{...S.card,padding:18,display:"flex",flexDirection:"column",gap:12}}>
                    <label style={S.label}>Redigera profil</label>
                    <div><label style={S.label}>Namn</label><input style={S.input} value={editForm.namn} onChange={e=>setEditForm(f=>({...f,namn:e.target.value}))}/></div>
                    <div><label style={S.label}>Stad</label>
                      <select style={S.input} value={editForm.stad} onChange={e=>setEditForm(f=>({...f,stad:e.target.value}))}>
                        {SWEDISH_CITIES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div><label style={S.label}>Bio</label><textarea rows={2} style={{...S.input,resize:"none"}} value={editForm.bio} onChange={e=>setEditForm(f=>({...f,bio:e.target.value}))}/></div>
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={()=>setEditingProfile(false)} style={{...S.btn("#F5F3EE","#888"),flex:1}}>Avbryt</button>
                      <button onClick={saveProfile} style={{...S.btn(),flex:1}} disabled={loading}>{loading?"Sparar...":"Spara"}</button>
                    </div>
                  </div>
                )}
                {profile?.bio&&!editingProfile&&<div style={{...S.card,padding:18}}><label style={S.label}>Om mig</label><p style={{fontSize:14,color:"#555",margin:0,lineHeight:1.6}}>{profile.bio}</p></div>}
                <div style={{background:"linear-gradient(135deg,#FF6B35,#FF8C55)",borderRadius:20,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:32}}>🔥</span>
                  <div><div style={{fontWeight:700,color:"white",fontSize:15}}>{profile?.streak||1} vecka i rad aktiv!</div>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>Fortsätt – du är på en streak!</div></div>
                </div>
                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Ditt emblem</label>
                  <span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:20,padding:"6px 14px",fontSize:14,fontWeight:500}}>{getBadge(myParticipations.length)}</span>
                  <div style={{fontSize:12,color:"#888",marginTop:10}}>
                    {myParticipations.length<3&&`${3-myParticipations.length} aktiviteter till för nästa emblem`}
                    {myParticipations.length>=3&&myParticipations.length<5&&`${5-myParticipations.length} till ⭐ Regelbunden`}
                    {myParticipations.length>=5&&myParticipations.length<10&&`${10-myParticipations.length} till 🏆 Veteran`}
                    {myParticipations.length>=10&&"Du är en legend! 👑"}
                  </div>
                </div>
                <button onClick={handleLogout} style={S.btn("#FEF3E7","#E53E3E")}>Logga ut</button>
              </>}

              {/* HISTORY TAB */}
              {profileTab==="history"&&<>
                {/* Skryt-kort */}
                {myHistory.length>0&&(
                  <div style={{background:"linear-gradient(135deg,#1A6B4A,#0D3D2B)",borderRadius:24,padding:20,color:"white"}}>
                    <div style={{fontSize:12,opacity:0.75,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Min aktivitetsresa 🌿</div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,marginBottom:4}}>{myHistory.length} aktiviteter</div>
                    <div style={{fontSize:14,opacity:0.85,marginBottom:16}}>avklarade med MoveTogether</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {Object.entries(stats.typeCount||{}).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([typ,count])=>(
                        <div key={typ} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:16}}>{getEmoji(typ)}</span>
                          <span style={{fontSize:13,fontWeight:600}}>{count}x {typ}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:12,fontSize:12,opacity:0.7}}>📍 {stats.cities} stad{stats.cities!==1?"er":""} besökta · {getBadge(myParticipations.length)}</div>
                  </div>
                )}

                {myHistory.length===0?(
                  <div style={{textAlign:"center",padding:48,color:"#888"}}>
                    <div style={{fontSize:56,marginBottom:12}}>📊</div>
                    <div style={{fontWeight:600,marginBottom:8}}>Ingen historik än!</div>
                    <div style={{fontSize:13}}>Gå med i aktiviteter så visas de här när de avslutats</div>
                  </div>
                ):(
                  myHistory.map(act=>(
                    <div key={act.id} style={{...S.card,padding:0,overflow:"hidden"}}>
                      <div style={{background:getColor(act.typ),padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:28}}>{getEmoji(act.typ)}</span>
                        <div style={{flex:1}}>
                          <div style={{color:"white",fontWeight:700,fontSize:14}}>{act.titel}</div>
                          <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginTop:2}}>📍 {act.plats||act.stad}</div>
                        </div>
                        <div style={{background:"rgba(255,255,255,0.2)",borderRadius:10,padding:"4px 10px",color:"white",fontSize:12,fontWeight:600}}>✓ Avklarad</div>
                      </div>
                      <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div style={{fontSize:13,color:"#888"}}>📅 {act.datum} · {act.tid}</div>
                        <div style={{fontSize:13,color:"#1A6B4A",fontWeight:600}}>+1 aktivitet 🔥</div>
                      </div>
                    </div>
                  ))
                )}
              </>}

              {/* STATS TAB */}
              {profileTab==="stats"&&<>
                <div style={{...S.card,padding:20}}>
                  <label style={S.label}>Din aktivitetsprofil</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
                    {[["🏁","Totalt genomförda",myHistory.length],["📅","Kommande",myParticipations.length-myHistory.length],["🏙️","Städer besökta",stats.cities],["🔥","Veckor streak",profile?.streak||1]].map(([icon,label,value])=>(
                      <div key={label} style={{background:"#F5F3EE",borderRadius:16,padding:"14px",textAlign:"center"}}>
                        <div style={{fontSize:28,marginBottom:4}}>{icon}</div>
                        <div style={{fontSize:22,fontWeight:700,color:"#1A1A1A"}}>{value}</div>
                        <div style={{fontSize:11,color:"#888",marginTop:2}}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {stats.favType&&(
                  <div style={{background:"linear-gradient(135deg,"+getColor(stats.favType)+","+getColor(stats.favType)+"CC)",borderRadius:20,padding:"16px 20px",color:"white"}}>
                    <div style={{fontSize:12,opacity:0.8,marginBottom:4}}>FAVORITAKTIVITET</div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:40}}>{getEmoji(stats.favType)}</span>
                      <div>
                        <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700}}>{stats.favType}</div>
                        <div style={{fontSize:13,opacity:0.85}}>{stats.favCount} gånger genomförd</div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Aktiviteter per typ</label>
                  {Object.entries(stats.typeCount||{}).sort((a,b)=>b[1]-a[1]).map(([typ,count])=>(
                    <div key={typ} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid #F5F3EE"}}>
                      <span style={{fontSize:20}}>{getEmoji(typ)}</span>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500}}>{typ}</div>
                        <div style={{height:6,background:"#F0EDE8",borderRadius:3,marginTop:4,overflow:"hidden"}}>
                          <div style={{height:"100%",background:getColor(typ),borderRadius:3,width:`${Math.min(100,(count/myHistory.length)*100)}%`}}/>
                        </div>
                      </div>
                      <span style={{fontSize:14,fontWeight:700,color:"#1A1A1A",minWidth:20,textAlign:"right"}}>{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.typeCount||{}).length===0&&<div style={{fontSize:13,color:"#888",textAlign:"center",padding:20}}>Gå med i aktiviteter för att se statistik</div>}
                </div>

                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Ditt emblem-framsteg</label>
                  {Object.entries(BADGES).map(([req,badge])=>{
                    const n=parseInt(req); const done=myParticipations.length>=n;
                    return (
                      <div key={req} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #F5F3EE",opacity:done?1:0.4}}>
                        <span style={{fontSize:20}}>{done?"✅":"🔒"}</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:done?600:400}}>{badge}</div>
                          <div style={{fontSize:12,color:"#888"}}>{n} aktiviteter</div>
                        </div>
                        {done&&<span style={{fontSize:12,color:"#1A6B4A",fontWeight:600}}>Upplåst!</span>}
                      </div>
                    );
                  })}
                </div>
              </>}

              <div style={{height:20}}/>
            </div>
          </div>
        )}


        {/* COACH SCREEN */}
        {screen==="coach"&&(
          <CoachScreen onBack={()=>setScreen("home")}/>
        )}

        {/* BOTTOM NAV */}
        {screen!=="swipe"&&(
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"white",borderTop:"1px solid #F0EDE8",display:"flex",padding:"10px 0 24px",boxShadow:"0 -4px 20px rgba(0,0,0,0.06)",zIndex:50}}>
            {[["home","🗺️","Utforska"],["swipe","✨","Swipa"],["coach","🧠","Coach"],["create","➕","Skapa"],["profile","👤","Profil"]].map(([s,icon,label])=>(
              <button key={s} onClick={()=>setScreen(s)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
                {s==="profile"&&profile?.profilbild_url?<img src={profile.profilbild_url} alt="p" style={{width:22,height:22,borderRadius:"50%",objectFit:"cover",border:screen==="profile"?"2px solid #1A6B4A":"2px solid transparent"}}/>:<span style={{fontSize:20}}>{icon}</span>}
                <span style={{fontSize:9,fontWeight:600,color:screen===s?"#1A6B4A":"#AAA"}}>{label}</span>
                {screen===s&&<div style={{width:4,height:4,borderRadius:"50%",background:"#1A6B4A"}}/>}
              </button>
            ))}
          </div>
        )}

        {toast&&<div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"white",borderRadius:16,padding:"14px 24px",fontSize:14,fontWeight:500,textAlign:"center",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:100,whiteSpace:"nowrap"}}>{toast.msg}</div>}
      </div>
    </div>
  );
}


const WORKOUTS = {
  "Bröst": {
    emoji: "💪",
    color: "#C4462A",
    nybörjare: [
      { namn: "Push-ups", sets: 3, reps: "8-10", vila: "60s", tips: "Håll kroppen rak som en planka. Sänk bröstet till golvet." },
      { namn: "Incline Push-ups", sets: 3, reps: "10-12", vila: "60s", tips: "Händerna på bänk – lättare variant för nybörjare." },
      { namn: "Dumbbell Chest Press", sets: 3, reps: "10", vila: "90s", tips: "Ligg på bänk, pressa upp rakt över bröstet." },
      { namn: "Cable Crossover", sets: 3, reps: "12", vila: "60s", tips: "Kontrollerat rörelsemönster, känn bröstet arbeta." },
    ],
    medel: [
      { namn: "Barbell Bench Press", sets: 4, reps: "8-10", vila: "90s", tips: "Skulderbladen ihop, sänk stången till bröstet." },
      { namn: "Incline Dumbbell Press", sets: 3, reps: "10", vila: "90s", tips: "45° lutning, aktiverar övre bröstmuskeln." },
      { namn: "Dips (bröst)", sets: 3, reps: "10-12", vila: "90s", tips: "Luta dig framåt för att aktivera bröstet mer." },
      { namn: "Cable Flyes", sets: 3, reps: "12-15", vila: "60s", tips: "Stretch i botten, squeeze i toppen." },
      { namn: "Push-up variationer", sets: 3, reps: "Till failure", vila: "60s", tips: "Wide, normal och diamond push-ups." },
    ],
    avancerad: [
      { namn: "Barbell Bench Press", sets: 5, reps: "5", vila: "3min", tips: "Progressiv överbelastning – öka vikt varje vecka." },
      { namn: "Incline Barbell Press", sets: 4, reps: "6-8", vila: "2min", tips: "Övre bröst prioritering." },
      { namn: "Weighted Dips", sets: 4, reps: "8", vila: "2min", tips: "Bälte med extra vikt." },
      { namn: "Dumbbell Flyes", sets: 3, reps: "12", vila: "90s", tips: "Maximalt stretch i botten." },
      { namn: "Cable Crossover (drop set)", sets: 3, reps: "10+10", vila: "60s", tips: "Minska vikten direkt och fortsätt." },
      { namn: "Push-up burnout", sets: 2, reps: "Till failure", vila: "60s", tips: "Avsluta med maxreps." },
    ],
  },
  "Rygg": {
    emoji: "🔙",
    color: "#185FA5",
    nybörjare: [
      { namn: "Assisted Pull-ups", sets: 3, reps: "8", vila: "90s", tips: "Använd maskin eller gummiband för hjälp." },
      { namn: "Seated Cable Row", sets: 3, reps: "12", vila: "60s", tips: "Dra armbågarna bakåt, håll ryggen rak." },
      { namn: "Lat Pulldown", sets: 3, reps: "12", vila: "60s", tips: "Dra ner till bröstet, känn latsen arbeta." },
      { namn: "Superman", sets: 3, reps: "15", vila: "45s", tips: "Lyft armar och ben samtidigt från golvet." },
    ],
    medel: [
      { namn: "Pull-ups", sets: 4, reps: "6-8", vila: "2min", tips: "Full ROM, känn latsen i botten." },
      { namn: "Barbell Row", sets: 4, reps: "8-10", vila: "90s", tips: "Dra mot naveln, håll ryggen plan." },
      { namn: "Lat Pulldown (bred)", sets: 3, reps: "10-12", vila: "90s", tips: "Brett grepp aktiverar lats mer." },
      { namn: "Seated Cable Row", sets: 3, reps: "12", vila: "60s", tips: "Squeeze i slutet av rörelsen." },
      { namn: "Face Pulls", sets: 3, reps: "15", vila: "60s", tips: "Dra mot ansiktet, rotera axlarna utåt." },
    ],
    avancerad: [
      { namn: "Weighted Pull-ups", sets: 5, reps: "5-6", vila: "3min", tips: "Bälte med extra vikt för progression." },
      { namn: "Pendlay Row", sets: 4, reps: "6", vila: "2min", tips: "Explosiv rörelse från golvet." },
      { namn: "T-Bar Row", sets: 4, reps: "8", vila: "2min", tips: "Tungt och effektivt för tjocklek." },
      { namn: "Meadows Row", sets: 3, reps: "10", vila: "90s", tips: "Unilateral – fokus på en sida åt gången." },
      { namn: "Straight Arm Pulldown", sets: 3, reps: "15", vila: "60s", tips: "Isolerar latsen perfekt." },
    ],
  },
  "Ben": {
    emoji: "🦵",
    color: "#1A6B4A",
    nybörjare: [
      { namn: "Bodyweight Squat", sets: 3, reps: "15", vila: "60s", tips: "Fötter axelbredd, knän följer tårna." },
      { namn: "Lunges", sets: 3, reps: "10/sida", vila: "60s", tips: "Axelbredds steg, bakre knät mot golvet." },
      { namn: "Leg Press", sets: 3, reps: "12", vila: "90s", tips: "Medelhögt fotstöd, knän utåt." },
      { namn: "Leg Curl", sets: 3, reps: "12", vila: "60s", tips: "Kontrollerad rörelse ner och upp." },
    ],
    medel: [
      { namn: "Barbell Back Squat", sets: 4, reps: "8-10", vila: "2min", tips: "Bröstet upp, sätet ner, djup squat." },
      { namn: "Romanian Deadlift", sets: 3, reps: "10", vila: "90s", tips: "Känn hamstrings sträcka i botten." },
      { namn: "Leg Press", sets: 4, reps: "12", vila: "90s", tips: "Öka vikten progressivt." },
      { namn: "Walking Lunges", sets: 3, reps: "12/sida", vila: "90s", tips: "Med hantlar för extra motstånd." },
      { namn: "Calf Raises", sets: 4, reps: "20", vila: "45s", tips: "Fullt ROM, stretch i botten." },
    ],
    avancerad: [
      { namn: "Barbell Back Squat", sets: 5, reps: "5", vila: "3min", tips: "Tung och djup – progressiv overload." },
      { namn: "Front Squat", sets: 4, reps: "6-8", vila: "2min", tips: "Aktiverar quads mer än back squat." },
      { namn: "Bulgarian Split Squat", sets: 4, reps: "8/sida", vila: "2min", tips: "Utmanande unilateral rörelse." },
      { namn: "Hack Squat", sets: 4, reps: "10", vila: "2min", tips: "Maskin – isolerar quads." },
      { namn: "Stiff-Leg Deadlift", sets: 3, reps: "10", vila: "90s", tips: "Hamstring-fokus med raka ben." },
      { namn: "Seated Calf Raises", sets: 5, reps: "20", vila: "45s", tips: "Soleus-fokus med böjda knän." },
    ],
  },
  "Axlar": {
    emoji: "🏋️",
    color: "#6B4AA8",
    nybörjare: [
      { namn: "Dumbbell Shoulder Press", sets: 3, reps: "10", vila: "60s", tips: "Pressa rakt upp, armbågar 90°." },
      { namn: "Lateral Raises", sets: 3, reps: "12", vila: "60s", tips: "Lätt vikt, kontrollerad rörelse." },
      { namn: "Front Raises", sets: 3, reps: "12", vila: "60s", tips: "Växelvis eller simultant." },
      { namn: "Face Pulls", sets: 3, reps: "15", vila: "60s", tips: "Skyddar axelleden långsiktigt." },
    ],
    medel: [
      { namn: "Barbell Overhead Press", sets: 4, reps: "8", vila: "2min", tips: "Stå eller sitt, pressa rakt upp." },
      { namn: "Arnold Press", sets: 3, reps: "10", vila: "90s", tips: "Rotera hantlarna under pressrörelsen." },
      { namn: "Lateral Raises", sets: 4, reps: "15", vila: "60s", tips: "Lätt vikt, hög rep – bäst för sidodelt." },
      { namn: "Rear Delt Flyes", sets: 3, reps: "15", vila: "60s", tips: "Böj framåt, lyft armbågarna bakåt." },
      { namn: "Cable Upright Row", sets: 3, reps: "12", vila: "60s", tips: "Dra upp till hakan, armbågar högt." },
    ],
    avancerad: [
      { namn: "Barbell Push Press", sets: 5, reps: "5", vila: "3min", tips: "Explosiv – använd benhjälp." },
      { namn: "Dumbbell Lateral Raises (drop set)", sets: 4, reps: "12+12", vila: "60s", tips: "Minska vikt och fortsätt direkt." },
      { namn: "Cable Face Pulls", sets: 4, reps: "20", vila: "60s", tips: "Hög rep, fokus på bakre delt." },
      { namn: "Seated Dumbbell Press", sets: 4, reps: "10", vila: "90s", tips: "Kontrollerad press utan hjälp från benen." },
      { namn: "Upright Row", sets: 3, reps: "12", vila: "90s", tips: "Brett grepp för mer deltoid-aktivering." },
    ],
  },
  "Armar": {
    emoji: "💪",
    color: "#854F0B",
    nybörjare: [
      { namn: "Dumbbell Curl", sets: 3, reps: "12", vila: "60s", tips: "Håll armbågen still, curl upp." },
      { namn: "Tricep Pushdown", sets: 3, reps: "12", vila: "60s", tips: "Armbågen vid sidan, sträck ut helt." },
      { namn: "Hammer Curl", sets: 3, reps: "10", vila: "60s", tips: "Neutralt grepp – tränar brachialis." },
      { namn: "Overhead Tricep Extension", sets: 3, reps: "12", vila: "60s", tips: "Håll armbågen still bakom huvudet." },
    ],
    medel: [
      { namn: "Barbell Curl", sets: 4, reps: "10", vila: "60s", tips: "Fullt ROM, känn bicepsen i toppen." },
      { namn: "Skull Crushers", sets: 4, reps: "10", vila: "90s", tips: "Sänk till pannan, sträck upp." },
      { namn: "Incline Dumbbell Curl", sets: 3, reps: "10", vila: "60s", tips: "Stretch i botten – aktiverar lång huvud." },
      { namn: "Cable Tricep Pushdown", sets: 3, reps: "15", vila: "60s", tips: "Pressa ner, håll armbågen stilla." },
      { namn: "Concentration Curl", sets: 3, reps: "12", vila: "60s", tips: "Isolerar bicepsen maximalt." },
    ],
    avancerad: [
      { namn: "Barbell Curl (21s)", sets: 3, reps: "21", vila: "90s", tips: "7 nere, 7 uppe, 7 full ROM." },
      { namn: "Close-grip Bench Press", sets: 4, reps: "8", vila: "2min", tips: "Tungt trycke för triceps massa." },
      { namn: "Cable Curl", sets: 4, reps: "12", vila: "60s", tips: "Konstant spänning genom hela rörelsen." },
      { namn: "French Press", sets: 4, reps: "10", vila: "90s", tips: "Lång huvud triceps fokus." },
      { namn: "Preacher Curl", sets: 3, reps: "10", vila: "60s", tips: "Eliminerar fusk – ren bicep-rörelse." },
      { namn: "Diamond Push-ups", sets: 3, reps: "Till failure", vila: "60s", tips: "Triceps burnout på slutet." },
    ],
  },
  "Mage / Core": {
    emoji: "🎯",
    color: "#0E7490",
    nybörjare: [
      { namn: "Crunches", sets: 3, reps: "15", vila: "45s", tips: "Lyfta skuldror, inte nacken." },
      { namn: "Planka", sets: 3, reps: "30s", vila: "45s", tips: "Rak kropp, aktivera magen." },
      { namn: "Leg Raises", sets: 3, reps: "10", vila: "45s", tips: "Kontrollera ner mot golvet." },
      { namn: "Mountain Climbers", sets: 3, reps: "20", vila: "45s", tips: "Snabbt men kontrollerat." },
    ],
    medel: [
      { namn: "Cable Crunch", sets: 4, reps: "15", vila: "60s", tips: "Böj i midjan, inte höften." },
      { namn: "Hanging Leg Raises", sets: 4, reps: "12", vila: "60s", tips: "Lyft benen rakt eller böjda." },
      { namn: "Russian Twists", sets: 3, reps: "20", vila: "45s", tips: "Med vikt för mer motstånd." },
      { namn: "Ab Rollout", sets: 3, reps: "10", vila: "60s", tips: "Rull ut långsamt, dra in." },
      { namn: "Side Planka", sets: 3, reps: "30s/sida", vila: "45s", tips: "Höften upp, kroppen rak." },
    ],
    avancerad: [
      { namn: "Dragon Flag", sets: 4, reps: "6-8", vila: "90s", tips: "Extrem core-övning. Kontrollerat." },
      { namn: "Weighted Cable Crunch", sets: 4, reps: "15", vila: "60s", tips: "Progressiv overload för magen." },
      { namn: "Toes-to-Bar", sets: 4, reps: "10", vila: "60s", tips: "Lyft tårna till stången." },
      { namn: "Ab Rollout (stående)", sets: 3, reps: "8", vila: "90s", tips: "Svåraste varianten av rollout." },
      { namn: "L-Sit", sets: 3, reps: "20s", vila: "60s", tips: "Benen raka och parallella med golvet." },
    ],
  },
};

const ROUND_SUGGESTIONS = [
  { km: 2, tid: "20-25 min", namn: "Kvällspromenad", emoji: "🌙", beskrivning: "Perfekt för återhämtning och mental avkoppling" },
  { km: 3, tid: "30-35 min", namn: "Morgonpromenad", emoji: "☀️", beskrivning: "Starta dagen med frisk luft och rörelse" },
  { km: 5, tid: "25-30 min", namn: "Löprundan", emoji: "🏃", beskrivning: "Klassiska 5 km – perfekt distans för nybörjare" },
  { km: 7, tid: "35-45 min", namn: "Tempolöpning", emoji: "⚡", beskrivning: "Lite längre med bra tempo" },
  { km: 10, tid: "50-60 min", namn: "Långpass", emoji: "🎯", beskrivning: "Bygg uthållighet med ett riktigt långpass" },
  { km: 15, tid: "80-90 min", namn: "Halfmarathon-prep", emoji: "🏅", beskrivning: "För dig som siktar på halvmarathon" },
];

const S = {
  label: {fontSize:12,fontWeight:600,color:"#888",marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:0.5},
  card: {background:"white",borderRadius:20,border:"1px solid #F0EDE8",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden"},
  btn: (bg="#1A6B4A",color="white") => ({background:bg,border:"none",borderRadius:16,padding:"14px",color,fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",fontFamily:"'DM Sans',sans-serif"}),
};

function CoachScreen({ onBack }) {
  const [tab, setTab] = useState("workout"); // workout | routes
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("medel");
  const [showProgram, setShowProgram] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (tab === "routes" && !location) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setLocationError("Kunde inte hämta din position. Tillåt platsåtkomst i webbläsaren.")
      );
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "routes" && location && selectedRoute && mapRef.current) {
      loadMap();
    }
  }, [location, selectedRoute, tab]);

  const loadMap = async () => {
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => initMap();
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    } else {
      initMap();
    }
  };

  const initMap = () => {
    if (!mapRef.current || !location) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const L = window.L;
    const map = L.map(mapRef.current).setView([location.lat, location.lng], 14);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap"
    }).addTo(map);

    // User marker
    const userIcon = L.divIcon({
      html: '<div style="width:16px;height:16px;background:#1A6B4A;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>',
      iconSize: [16, 16], iconAnchor: [8, 8]
    });
    L.marker([location.lat, location.lng], { icon: userIcon }).addTo(map).bindPopup("📍 Du är här").openPopup();

    // Generate circular route points
    if (selectedRoute) {
      const km = selectedRoute.km;
      const radius = (km / (2 * Math.PI)) / 111; // approx degrees
      const points = [];
      for (let i = 0; i <= 360; i += 30) {
        const angle = (i * Math.PI) / 180;
        points.push([
          location.lat + radius * Math.cos(angle),
          location.lng + radius * Math.sin(angle) / Math.cos(location.lat * Math.PI / 180)
        ]);
      }

      L.polyline(points, { color: "#1A6B4A", weight: 4, opacity: 0.8, dashArray: "10, 5" }).addTo(map);

      // Waypoint markers
      const waypointIcon = (n) => L.divIcon({
        html: `<div style="width:24px;height:24px;background:#1A6B4A;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${n}</div>`,
        iconSize: [24, 24], iconAnchor: [12, 12]
      });

      [[0, "1"], [3, "2"], [6, "3"]].forEach(([idx, n]) => {
        if (points[idx]) L.marker(points[idx], { icon: waypointIcon(n) }).addTo(map);
      });

      setMapLoaded(true);
    }
  };

  const muscles = Object.keys(WORKOUTS);
  const workout = selectedMuscle ? WORKOUTS[selectedMuscle] : null;
  const exercises = workout ? workout[selectedLevel] : [];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet"/>

      {/* Header */}
      <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 20px",position:"relative"}}>
        <button onClick={onBack} style={{position:"absolute",top:52,left:24,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:20,padding:"7px 14px",color:"white",fontSize:13,cursor:"pointer"}}>← Tillbaka</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40}}>🧠</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:"white",marginTop:8}}>MoveTogether Coach</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:4}}>Träningsprogram + Rundförslag</div>
        </div>
        <div style={{display:"flex",background:"rgba(255,255,255,0.15)",borderRadius:16,padding:4,marginTop:16}}>
          {[["workout","💪 Träning"],["routes","🗺️ Rundor"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,border:"none",borderRadius:12,padding:"10px",fontSize:14,fontWeight:600,cursor:"pointer",background:tab===t?"white":"transparent",color:tab===t?"#1A6B4A":"rgba(255,255,255,0.8)",transition:"all 0.2s"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* WORKOUT TAB */}
      {tab==="workout"&&(
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14,background:"#F5F3EE"}}>
          {!showProgram?(
            <>
              {/* Level selector */}
              <div style={{...S.card,padding:16}}>
                <label style={S.label}>Din nivå</label>
                <div style={{display:"flex",gap:8}}>
                  {[["nybörjare","🌱 Nybörjare"],["medel","⭐ Medel"],["avancerad","🏆 Avancerad"]].map(([l,label])=>(
                    <button key={l} onClick={()=>setSelectedLevel(l)} style={{flex:1,border:"none",borderRadius:12,padding:"10px 4px",fontSize:12,fontWeight:600,cursor:"pointer",background:selectedLevel===l?"#1A6B4A":"#F0EDE8",color:selectedLevel===l?"white":"#555",transition:"all 0.2s"}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Muscle groups */}
              <label style={S.label}>Välj muskelgrupp</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {muscles.map(muscle=>{
                  const w = WORKOUTS[muscle];
                  return (
                    <button key={muscle} onClick={()=>{setSelectedMuscle(muscle);setShowProgram(true);}} style={{background:"white",border:selectedMuscle===muscle?"2px solid #1A6B4A":"1.5px solid #F0EDE8",borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",transition:"all 0.2s"}}>
                      <div style={{fontSize:32,marginBottom:8}}>{w.emoji}</div>
                      <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>{muscle}</div>
                      <div style={{fontSize:11,color:"#888",marginTop:3}}>{w[selectedLevel].length} övningar</div>
                      <div style={{height:4,background:w.color,borderRadius:2,marginTop:8,width:"60%"}}/>
                    </button>
                  );
                })}
              </div>

              <div style={{...S.card,padding:16,background:"linear-gradient(135deg,#E8F5EE,#F0FAF5)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#1A6B4A",marginBottom:4}}>💡 Tips från coachen</div>
                <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Värm alltid upp i 5-10 minuter innan träning. Vila tillräckligt mellan sets. Drick vatten. Lyssna på kroppen!</div>
              </div>
            </>
          ):(
            <>
              {/* Back to muscle selection */}
              <button onClick={()=>setShowProgram(false)} style={{...S.btn("#F0EDE8","#1A6B4A"),marginBottom:4}}>← Byt muskelgrupp</button>

              {/* Program header */}
              <div style={{background:`linear-gradient(135deg,${workout.color},${workout.color}CC)`,borderRadius:20,padding:"18px 20px",color:"white"}}>
                <div style={{fontSize:40,marginBottom:8}}>{workout.emoji}</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700}}>{selectedMuscle}</div>
                <div style={{fontSize:13,opacity:0.85,marginTop:4}}>{exercises.length} övningar · {selectedLevel.charAt(0).toUpperCase()+selectedLevel.slice(1)} nivå</div>
                <div style={{display:"flex",gap:10,marginTop:12}}>
                  {[["🔥","Intensitet",selectedLevel==="nybörjare"?"Låg":selectedLevel==="medel"?"Medel":"Hög"],["⏱️","Tid","45-60 min"],["💧","Vila","Enligt schema"]].map(([icon,lbl,val])=>(
                    <div key={lbl} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"8px 10px",flex:1,textAlign:"center"}}>
                      <div style={{fontSize:16}}>{icon}</div>
                      <div style={{fontSize:10,opacity:0.8,marginTop:2}}>{lbl}</div>
                      <div style={{fontSize:12,fontWeight:700,marginTop:1}}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exercise list */}
              {exercises.map((ex, i) => (
                <ExerciseCard key={i} exercise={ex} index={i} color={workout.color}/>
              ))}

              <div style={{...S.card,padding:16,background:"#FEF3E7"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#854F0B",marginBottom:4}}>⚠️ Kom ihåg</div>
                <div style={{fontSize:13,color:"#6B3A0A",lineHeight:1.6}}>Värm upp ordentligt. Öka vikt gradvis. Vila 1-2 dagar innan nästa benpass. Protein efter träning!</div>
              </div>

              <div style={{height:20}}/>
            </>
          )}
        </div>
      )}

      {/* ROUTES TAB */}
      {tab==="routes"&&(
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14,background:"#F5F3EE"}}>
          {locationError&&(
            <div style={{background:"#FCEBEB",borderRadius:16,padding:16,border:"1px solid #F4BDBD"}}>
              <div style={{fontSize:14,fontWeight:600,color:"#E53E3E",marginBottom:4}}>📍 Platsåtkomst nekad</div>
              <div style={{fontSize:13,color:"#888"}}>{locationError}</div>
            </div>
          )}

          {!location&&!locationError&&(
            <div style={{textAlign:"center",padding:32,color:"#888"}}>
              <div style={{fontSize:48,marginBottom:12}}>📍</div>
              <div style={{fontWeight:600,marginBottom:4}}>Hämtar din position...</div>
              <div style={{fontSize:13}}>Tillåt platsåtkomst i webbläsaren</div>
            </div>
          )}

          {location&&(
            <>
              <div style={{...S.card,padding:14,display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:40,height:40,background:"#E8F5EE",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📍</div>
                <div>
                  <div style={{fontSize:14,fontWeight:600}}>Din position hittad!</div>
                  <div style={{fontSize:12,color:"#888"}}>Lat: {location.lat.toFixed(4)} · Lng: {location.lng.toFixed(4)}</div>
                </div>
              </div>

              <label style={S.label}>Välj rundalängd</label>
              {ROUND_SUGGESTIONS.map((route, i)=>(
                <button key={i} onClick={()=>setSelectedRoute(route)} style={{background:"white",border:selectedRoute?.km===route.km?"2px solid #1A6B4A":"1.5px solid #F0EDE8",borderRadius:18,padding:"16px 18px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",width:"100%",transition:"all 0.2s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontSize:22,marginBottom:4}}>{route.emoji}</div>
                      <div style={{fontSize:15,fontWeight:700,color:"#1A1A1A"}}>{route.namn}</div>
                      <div style={{fontSize:13,color:"#888",marginTop:2}}>{route.beskrivning}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:24,fontWeight:900,color:"#1A6B4A"}}>{route.km} km</div>
                      <div style={{fontSize:12,color:"#888"}}>{route.tid}</div>
                    </div>
                  </div>
                  {selectedRoute?.km===route.km&&(
                    <div style={{marginTop:12,height:4,background:"#1A6B4A",borderRadius:2}}/>
                  )}
                </button>
              ))}

              {/* Map */}
              {selectedRoute&&(
                <div style={{...S.card,overflow:"hidden"}}>
                  <div style={{padding:"14px 16px",borderBottom:"1px solid #F0EDE8"}}>
                    <div style={{fontWeight:700,fontSize:15}}>{selectedRoute.emoji} {selectedRoute.namn} – {selectedRoute.km} km</div>
                    <div style={{fontSize:12,color:"#888",marginTop:2}}>Ungefärlig runda från din position · {selectedRoute.tid}</div>
                  </div>
                  <div ref={mapRef} style={{height:300,width:"100%",background:"#E8F5EE"}}/>
                  <div style={{padding:"12px 16px",background:"#F5F3EE"}}>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      {[["🟢","Start/Mål","Din position"],["1️⃣","Waypoint 1","Ca ¼ av rundan"],["2️⃣","Waypoint 2","Halvvägs"],["3️⃣","Waypoint 3","¾ av rundan"]].map(([icon,lbl,desc])=>(
                        <div key={lbl} style={{display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:14}}>{icon}</span>
                          <div><div style={{fontSize:11,fontWeight:600,color:"#333"}}>{lbl}</div><div style={{fontSize:10,color:"#888"}}>{desc}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedRoute&&(
                <div style={{...S.card,padding:16,background:"linear-gradient(135deg,#E8F5EE,#F0FAF5)"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1A6B4A",marginBottom:8}}>💡 Tips för din {selectedRoute.namn.toLowerCase()}</div>
                  {selectedRoute.km<=3&&<div style={{fontSize:13,color:"#555",lineHeight:1.7}}>• Ta det lugnt och njut av omgivningen{"\n"}• Bra för återhämtning och mental hälsa{"\n"}• Perfekt att göra med en vän</div>}
                  {selectedRoute.km>3&&selectedRoute.km<=7&&<div style={{fontSize:13,color:"#555",lineHeight:1.7}}>• Värm upp 5 min med promenad{"\n"}• Håll ett prat-tempo (kan prata men ansträngt){"\n"}• Drick vatten innan och efter</div>}
                  {selectedRoute.km>7&&<div style={{fontSize:13,color:"#555",lineHeight:1.7}}>• Ta med vatten{"\n"}• Ät kolhydrater 2h innan{"\n"}• Sänk tempot om det känns tungt{"\n"}• Sträck ut ordentligt efteråt</div>}
                </div>
              )}
            </>
          )}
          <div style={{height:20}}/>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({ exercise, index, color }) {
  const [expanded, setExpanded] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const startTimer = (seconds) => {
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [timerActive, timeLeft]);

  const vilaSeconds = parseInt(exercise.vila) || 60;

  return (
    <div style={{background:"white",borderRadius:18,border:"1px solid #F0EDE8",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
      <div onClick={()=>setExpanded(!expanded)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
        <div style={{width:36,height:36,background:color+"22",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color,flexShrink:0}}>{index+1}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>{exercise.namn}</div>
          <div style={{fontSize:12,color:"#888",marginTop:2}}>{exercise.sets} sets × {exercise.reps} reps · Vila {exercise.vila}</div>
        </div>
        <span style={{fontSize:18,color:"#AAA",transition:"transform 0.2s",transform:expanded?"rotate(90deg)":"rotate(0deg)"}}>›</span>
      </div>

      {expanded&&(
        <div style={{padding:"0 16px 16px",borderTop:"1px solid #F5F3EE"}}>
          <div style={{background:"#F5F3EE",borderRadius:12,padding:"12px 14px",marginTop:12,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"#888",marginBottom:4}}>💡 Teknik-tips</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>{exercise.tips}</div>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[["🔁","Sets",exercise.sets],["💪","Reps",exercise.reps],["⏱️","Vila",exercise.vila]].map(([icon,lbl,val])=>(
              <div key={lbl} style={{background:"#F5F3EE",borderRadius:12,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:16}}>{icon}</div>
                <div style={{fontSize:11,color:"#888",marginTop:2}}>{lbl}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#1A1A1A",marginTop:1}}>{val}</div>
              </div>
            ))}
          </div>

          {/* Rest timer */}
          {timerActive?(
            <div style={{background: timeLeft>10?"#E8F5EE":"#FEF3E7",borderRadius:12,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:32,fontWeight:900,color:timeLeft>10?"#1A6B4A":"#E53E3E"}}>{timeLeft}s</div>
              <div style={{fontSize:12,color:"#888"}}>Vilatimer – {timeLeft===0?"Klar!":"Vila pågår..."}</div>
              <button onClick={()=>{setTimerActive(false);setTimeLeft(null);}} style={{marginTop:8,background:"#E53E3E",border:"none",borderRadius:10,padding:"6px 16px",color:"white",fontSize:12,fontWeight:600,cursor:"pointer"}}>Avbryt</button>
            </div>
          ):(
            <button onClick={()=>startTimer(vilaSeconds)} style={{background:color,border:"none",borderRadius:12,padding:"10px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",width:"100%"}}>
              ⏱️ Starta vilatimer ({exercise.vila})
            </button>
          )}
        </div>
      )}
    </div>
  );
}
