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
  return new Date(tid ? `${datum}T${tid}` : `${datum}T23:59`) < new Date();
};

const getDateLabel = (datum, tid) => {
  if (!datum) return "";
  if (isExpired(datum, tid)) return "⚫ Avslutad";
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(datum); d.setHours(0,0,0,0);
  const diff = Math.round((d-today)/(1000*60*60*24));
  if (diff===0) return "🟢 Idag";
  if (diff===1) return "🔵 Imorgon";
  if (diff<=7) return `🟡 Om ${diff} dagar`;
  return `📅 ${datum}`;
};

const getStatusLabel = (count, max) => {
  const pct = count/max;
  if (count>=max) return {text:"🔴 Fullbokad",color:"#E53E3E",bg:"#FCEBEB"};
  if (pct>=0.7) return {text:`⚡ ${max-count} platser kvar!`,color:"#854F0B",bg:"#FEF3E7"};
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

const Avatar = ({profile, size=40, onClick}) => {
  const initials = profile?.namn?.substring(0,2).toUpperCase()||"??";
  if (profile?.profilbild_url) return <img src={profile.profilbild_url} onClick={onClick} alt="profil" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",cursor:onClick?"pointer":"default",flexShrink:0}}/>;
  return <div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:"#1A6B4A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,fontWeight:700,color:"white",flexShrink:0,cursor:onClick?"pointer":"default"}}>{initials}</div>;
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
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedActivityParticipants, setSelectedActivityParticipants] = useState([]);
  const [selectedActivityCreator, setSelectedActivityCreator] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState(null);
  const [filter, setFilter] = useState("Alla");
  const [cityFilter, setCityFilter] = useState("Alla städer");
  const [searchQuery, setSearchQuery] = useState("");
  const [friendSearch, setFriendSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [profileTab, setProfileTab] = useState("info");
  const [inviteActivityId, setInviteActivityId] = useState(null);
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
        await fetchAll(session.user.id);
        setScreen("home");
      } else setScreen("auth");
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const fetchAll = async (uid) => {
    await Promise.all([
      fetchProfile(uid),
      fetchActivities(),
      fetchMyParticipations(uid),
      fetchFriends(uid),
      fetchFriendRequests(uid),
      fetchSentRequests(uid),
      fetchAllProfiles(),
    ]);
  };

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
      setMyHistory(data.filter(p=>p.activities&&isExpired(p.activities.datum,p.activities.tid)).map(p=>p.activities));
    }
  };

  const fetchFriends = async (uid) => {
    const { data } = await supabase.from("friends").select("*, friend:friend_id(*)").eq("user_id",uid).eq("status","accepted");
    if (data) setFriends(data.map(f=>f.friend).filter(Boolean));
  };

  const fetchFriendRequests = async (uid) => {
    const { data } = await supabase.from("friends").select("*, requester:user_id(*)").eq("friend_id",uid).eq("status","pending");
    if (data) setFriendRequests(data);
  };

  const fetchSentRequests = async (uid) => {
    const { data } = await supabase.from("friends").select("friend_id").eq("user_id",uid).eq("status","pending");
    if (data) setSentRequests(data.map(r=>r.friend_id));
  };

  const fetchAllProfiles = async () => {
    const { data } = await supabase.from("profiles").select("*");
    if (data) setAllProfiles(data);
  };

  const fetchActivityParticipants = async (actId, creatorId) => {
    const { data } = await supabase.from("participants").select("anvandare_id, profiles(*)").eq("aktivitet_id",actId);
    if (data) setSelectedActivityParticipants(data);
    if (creatorId) {
      const { data: creator } = await supabase.from("profiles").select("*").eq("id",creatorId).single();
      if (creator) setSelectedActivityCreator(creator);
    }
  };

  // AUTH
  const handleRegister = async () => {
    if (!authForm.email||!authForm.password||!authForm.namn) { showToast("Fyll i alla fält!","#E53E3E"); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({email:authForm.email,password:authForm.password});
    if (error) { showToast(error.message,"#E53E3E"); setLoading(false); return; }
    if (data.user) {
      await supabase.from("profiles").insert({id:data.user.id,namn:authForm.namn,stad:authForm.stad,bio:authForm.bio,streak:1,hedersemblem:"🌱 Ny medlem"});
      setUser(data.user);
      await fetchAll(data.user.id);
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
      await fetchAll(data.user.id);
      showToast("Välkommen tillbaka! 👋");
      setScreen("home");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setActivities([]); setMyParticipations([]); setMyHistory([]); setFriends([]); setFriendRequests([]);
    setScreen("auth");
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await supabase.from("profiles").update({profilbild_url:ev.target.result}).eq("id",user.id);
      await fetchProfile(user.id); setUploadingPhoto(false); showToast("Profilbild uppdaterad! 📸");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setLoading(true);
    await supabase.from("profiles").update({namn:editForm.namn,stad:editForm.stad,bio:editForm.bio,hedersemblem:getBadge(myParticipations.length)}).eq("id",user.id);
    await fetchProfile(user.id); setEditingProfile(false); setLoading(false); showToast("Profil uppdaterad! ✅");
  };

  // FRIENDS
  const sendFriendRequest = async (friendId) => {
    if (friendId===user.id) { showToast("Det är du själv! 😄","#854F0B"); return; }
    if (friends.find(f=>f.id===friendId)) { showToast("Redan vänner!","#854F0B"); return; }
    if (sentRequests.includes(friendId)) { showToast("Förfrågan redan skickad!","#854F0B"); return; }
    const { error } = await supabase.from("friends").insert({user_id:user.id,friend_id:friendId,status:"pending"});
    if (!error) {
      setSentRequests(prev=>[...prev, friendId]);
      showToast("Vänförfrågan skickad! 🤝");
    }
  };

  const acceptFriendRequest = async (requestId, requesterId) => {
    await supabase.from("friends").update({status:"accepted"}).eq("id",requestId);
    await supabase.from("friends").insert({user_id:user.id,friend_id:requesterId,status:"accepted"});
    await fetchFriends(user.id); await fetchFriendRequests(user.id);
    showToast("Vän tillagd! 🎉");
  };

  const declineFriendRequest = async (requestId) => {
    await supabase.from("friends").delete().eq("id",requestId);
    await fetchFriendRequests(user.id); showToast("Förfrågan nekad","#888");
  };

  const inviteFriend = async (friendId, activityId) => {
    const act = activities.find(a=>a.id===activityId);
    showToast(`Inbjudan skickad via WhatsApp! 📲`);
    const msg = encodeURIComponent(`Hej! Jag bjuder in dig till "${act?.titel}" den ${act?.datum} kl ${act?.tid} i ${act?.stad}. Öppna appen: movetogether-karlskrona.vercel.app`);
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  // JOIN / LEAVE
  const joinActivity = async (activityId) => {
    if (!user) return;
    if (myParticipations.includes(activityId)) { showToast("Du är redan anmäld!","#854F0B"); return; }
    const act = activities.find(a=>a.id===activityId);
    if (act&&(participantCounts[activityId]||0)>=act.max_deltagare) { showToast("Aktiviteten är fullbokad!","#E53E3E"); return; }
    const { error } = await supabase.from("participants").insert({aktivitet_id:activityId,anvandare_id:user.id,status:"Väntande"});
    if (!error) {
      const newList=[...myParticipations,activityId];
      setMyParticipations(newList);
      setParticipantCounts(prev=>({...prev,[activityId]:(prev[activityId]||0)+1}));
      await supabase.from("profiles").update({hedersemblem:getBadge(newList.length)}).eq("id",user.id);
      showToast("🎉 Du är anmäld!"); setScreen("home");
    }
  };

  const leaveActivity = async (activityId) => {
    const { error } = await supabase.from("participants").delete().eq("aktivitet_id",activityId).eq("anvandare_id",user.id);
    if (!error) {
      setMyParticipations(prev=>prev.filter(id=>id!==activityId));
      setParticipantCounts(prev=>({...prev,[activityId]:Math.max((prev[activityId]||1)-1,0)}));
      showToast("Du har avanmält dig.","#854F0B"); setScreen("home");
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
      showToast("🚀 Aktivitet publicerad!"); setScreen("home");
    } else showToast("Något gick fel!","#E53E3E");
    setLoading(false);
  };

  const getFilteredActivities = () => {
    let list = activities.filter(a=>!isExpired(a.datum,a.tid));
    if (filter!=="Alla") list=list.filter(a=>a.typ===filter);
    if (cityFilter!=="Alla städer") list=list.filter(a=>a.stad===cityFilter||a.plats?.includes(cityFilter));
    if (searchQuery) list=list.filter(a=>a.titel?.toLowerCase().includes(searchQuery.toLowerCase())||a.plats?.toLowerCase().includes(searchQuery.toLowerCase())||a.typ?.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  };

  const getStats = () => {
    const total=myHistory.length;
    const typeCount={};
    myHistory.forEach(a=>{typeCount[a.typ]=(typeCount[a.typ]||0)+1;});
    const favType=Object.entries(typeCount).sort((a,b)=>b[1]-a[1])[0];
    const cities=[...new Set(myHistory.map(a=>a.stad||a.plats).filter(Boolean))];
    return {total,favType:favType?.[0],favCount:favType?.[1]||0,cities:cities.length,typeCount};
  };

  const swipeList = getFilteredActivities();
  const currentCard = swipeList[swipeIndex];
  const handleSwipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(()=>{setSwipeDir(null);setSwipeIndex(i=>i+1);if(dir==="right"&&currentCard)joinActivity(currentCard.id);},400);
  };
  const handleDragStart=(e)=>{dragStart.current=e.touches?e.touches[0].clientX:e.clientX;setDragging(true);};
  const handleDragMove=(e)=>{if(!dragging)return;setDragX((e.touches?e.touches[0].clientX:e.clientX)-dragStart.current);};
  const handleDragEnd=()=>{if(Math.abs(dragX)>80)handleSwipe(dragX>0?"right":"left");setDragX(0);setDragging(false);dragStart.current=null;};

  const filters = ["Alla","Löpning","Cykling","Fotboll","Yoga","Socialt","Gym","Hiking"];
  const filteredList = getFilteredActivities();
  const stats = getStats();

  const isFriend = (uid) => friends.some(f=>f.id===uid);
  const hasPendingRequest = (uid) => friendRequests.some(r=>r.user_id===uid);

  // SPLASH
  if (screen==="splash") return (
    <div style={{width:"100%",minHeight:"100vh",background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{textAlign:"center",color:"white"}}>
        <div style={{fontSize:72,marginBottom:16}}>🌿</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:38,fontWeight:900}}>MoveTogether</div>
        <div style={{fontSize:15,opacity:0.75,marginTop:8}}>Sverige · Rörelse & Gemenskap</div>
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
            <button key={t} onClick={()=>setAuthScreen(t)} style={{flex:1,border:"none",borderRadius:12,padding:"10px",fontSize:14,fontWeight:600,cursor:"pointer",background:authScreen===t?"white":"transparent",color:authScreen===t?"#1A1A1A":"#888",boxShadow:authScreen===t?"0 2px 8px rgba(0,0,0,0.1)":"none"}}>
              {t==="login"?"Logga in":"Registrera"}
            </button>
          ))}
        </div>
        <div style={{padding:"16px 20px 40px",display:"flex",flexDirection:"column",gap:12}}>
          {authScreen==="register"&&<>
            <div><label style={S.label}>Namn</label><input style={S.input} placeholder="Förnamn Efternamn" value={authForm.namn} onChange={e=>setAuthForm(f=>({...f,namn:e.target.value}))}/></div>
            <div><label style={S.label}>Stad</label><select style={S.input} value={authForm.stad} onChange={e=>setAuthForm(f=>({...f,stad:e.target.value}))}>{SWEDISH_CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={S.label}>Bio (valfri)</label><input style={S.input} placeholder="t.ex. Gillar löpning och kaffe" value={authForm.bio} onChange={e=>setAuthForm(f=>({...f,bio:e.target.value}))}/></div>
          </>}
          <div><label style={S.label}>E-post</label><input style={S.input} type="email" placeholder="din@email.com" value={authForm.email} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))}/></div>
          <div><label style={S.label}>Lösenord</label><input style={S.input} type="password" placeholder="Minst 6 tecken" value={authForm.password} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))}/></div>
          <button onClick={authScreen==="login"?handleLogin:handleRegister} style={S.btn()} disabled={loading}>{loading?"Laddar...":authScreen==="login"?"Logga in →":"Skapa konto →"}</button>
          <div style={{textAlign:"center",fontSize:13,color:"#888"}}>
            {authScreen==="login"?"Inget konto? ":"Har du konto? "}
            <span onClick={()=>setAuthScreen(authScreen==="login"?"register":"login")} style={{color:"#1A6B4A",fontWeight:600,cursor:"pointer"}}>{authScreen==="login"?"Registrera dig":"Logga in"}</span>
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
                  {friendRequests.length>0&&(
                    <button onClick={()=>{setScreen("profile");setProfileTab("friends");}} style={{background:"#E53E3E",border:"none",borderRadius:20,padding:"6px 12px",color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                      🤝 {friendRequests.length}
                    </button>
                  )}
                  <button onClick={()=>setScreen("swipe")} style={{background:"#1A6B4A",border:"none",borderRadius:20,padding:"7px 14px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>✨ Swipa</button>
                  <div onClick={()=>setScreen("profile")} style={{cursor:"pointer"}}>
                    <Avatar profile={profile} size={36}/>
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
                {filters.map(f=>(<button key={f} onClick={()=>setFilter(f)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"7px 14px",fontSize:13,fontWeight:500,cursor:"pointer",background:filter===f?"#1A6B4A":"#EEECE8",color:filter===f?"white":"#555"}}>{f}</button>))}
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
                  <div style={{fontSize:12,opacity:0.85}}>{filteredList.length} aktiva · {Object.values(participantCounts).reduce((a,b)=>a+b,0)} anmälda</div>
                </div>
                {friends.length>0&&(
                  <div style={{marginLeft:"auto",background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"4px 10px",fontSize:12,fontWeight:600}}>
                    👥 {friends.length} vänner
                  </div>
                )}
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
                const creator=allProfiles.find(p=>p.id===act.skapad_av);
                const friendsJoined=selectedActivityParticipants.filter(p=>friends.some(f=>f.id===p.anvandare_id));
                return (
                  <div key={act.id} onClick={()=>{setSelectedActivity(act);fetchActivityParticipants(act.id,act.skapad_av);setScreen("detail");}} style={{...S.card,cursor:"pointer"}}>
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
                    <div style={{padding:"10px 18px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{background:status.bg,color:status.color,borderRadius:10,padding:"3px 10px",fontSize:12,fontWeight:600}}>{status.text}</span>
                        <div style={{fontSize:12,color:"#888"}}>👥 {count}/{act.max_deltagare}</div>
                      </div>
                      {creator&&(
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <Avatar profile={creator} size={20}/>
                          <span style={{fontSize:12,color:"#888"}}>Skapad av <span style={{fontWeight:500,color:"#555"}}>{creator.namn}</span></span>
                          {creator.id===user?.id&&<span style={{fontSize:11,background:"#E8F5EE",color:"#1A6B4A",borderRadius:8,padding:"1px 6px",fontWeight:600}}>Du</span>}
                        </div>
                      )}
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
                        {(()=>{const creator=allProfiles.find(p=>p.id===currentCard.skapad_av);return creator&&(
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"8px 12px",background:"#F5F3EE",borderRadius:12}}>
                            <Avatar profile={creator} size={28}/>
                            <div>
                              <div style={{fontSize:12,color:"#888"}}>Skapad av</div>
                              <div style={{fontSize:13,fontWeight:600}}>{creator.namn} · 📍 {creator.stad}</div>
                            </div>
                          </div>
                        );})()}
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
                    <button onClick={()=>{setSelectedActivity(currentCard);fetchActivityParticipants(currentCard.id,currentCard.skapad_av);setScreen("detail");}} style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"none",fontSize:20,cursor:"pointer"}}>ℹ️</button>
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

              {/* Creator card */}
              {selectedActivityCreator&&(
                <div style={{...S.card,padding:16,display:"flex",alignItems:"center",gap:12}}>
                  <Avatar profile={selectedActivityCreator} size={48} onClick={()=>{setViewingProfile(selectedActivityCreator);setScreen("viewprofile");}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,color:"#888"}}>Skapad av</div>
                    <div style={{fontSize:15,fontWeight:700,color:"#1A1A1A"}}>{selectedActivityCreator.namn}</div>
                    <div style={{fontSize:12,color:"#888"}}>📍 {selectedActivityCreator.stad} · {getBadge(0)}</div>
                  </div>
                  {selectedActivityCreator.id!==user?.id&&(
                    isFriend(selectedActivityCreator.id)?(
                      <span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:600}}>✓ Vän</span>
                    ):sentRequests.includes(selectedActivityCreator.id)?(
                      <span style={{background:"#F5F3EE",color:"#888",borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:600}}>Skickad ✓</span>
                    ):(
                      <button onClick={()=>sendFriendRequest(selectedActivityCreator.id)} style={{background:"#1A6B4A",border:"none",borderRadius:12,padding:"6px 12px",color:"white",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Vän</button>
                    )
                  )}
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

              {/* Participants */}
              {selectedActivityParticipants.length>0&&(
                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Anmälda ({selectedActivityParticipants.length})</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {selectedActivityParticipants.map((p,i)=>(
                      <div key={i} onClick={()=>{if(p.profiles){setViewingProfile(p.profiles);setScreen("viewprofile");}}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}>
                        <Avatar profile={p.profiles} size={40}/>
                        <div style={{fontSize:10,color:"#888",maxWidth:48,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.profiles?.namn?.split(" ")[0]||"?"}</div>
                        {friends.some(f=>f.id===p.anvandare_id)&&<div style={{fontSize:9,color:"#1A6B4A",fontWeight:600}}>Vän ✓</div>}
                      </div>
                    ))}
                    {Array.from({length:Math.max(0,selectedActivity.max_deltagare-selectedActivityParticipants.length)}).map((_,i)=>(
                      <div key={`e${i}`} style={{width:40,height:40,borderRadius:"50%",background:"#F0EDE8",border:"2px dashed #CCC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#CCC"}}>+</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invite friends */}
              {friends.length>0&&!myParticipations.includes(selectedActivity.id)&&(
                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Bjud in vänner</label>
                  <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none"}}>
                    {friends.map(friend=>(
                      <div key={friend.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
                        <Avatar profile={friend} size={44}/>
                        <div style={{fontSize:11,color:"#555",maxWidth:60,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{friend.namn?.split(" ")[0]}</div>
                        <button onClick={()=>inviteFriend(friend.id,selectedActivity.id)} style={{background:"#1A6B4A",border:"none",borderRadius:10,padding:"4px 10px",color:"white",fontSize:11,fontWeight:600,cursor:"pointer"}}>Bjud in</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <a href={`https://wa.me/?text=Kolla in: ${selectedActivity.titel} den ${selectedActivity.datum} i ${selectedActivity.stad}! movetogether-karlskrona.vercel.app`} target="_blank" rel="noreferrer" style={{background:"#25D366",border:"none",borderRadius:16,padding:14,color:"white",fontSize:15,fontWeight:700,cursor:"pointer",textAlign:"center",display:"block",textDecoration:"none"}}>💬 Dela via WhatsApp</a>

              {myParticipations.includes(selectedActivity.id)?(
                <button onClick={()=>leaveActivity(selectedActivity.id)} style={S.btn("#FEF3E7","#854F0B")}>Avanmäl mig</button>
              ):(
                <button onClick={()=>joinActivity(selectedActivity.id)} style={S.btn()} disabled={(participantCounts[selectedActivity.id]||0)>=selectedActivity.max_deltagare}>
                  {(participantCounts[selectedActivity.id]||0)>=selectedActivity.max_deltagare?"🔴 Fullbokad":"Gå med i aktiviteten →"}
                </button>
              )}
              <div style={{height:20}}/>
            </div>
          </div>
        )}

        {/* VIEW OTHER PROFILE */}
        {screen==="viewprofile"&&viewingProfile&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
            <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 24px",textAlign:"center",position:"relative"}}>
              <button onClick={()=>setScreen(selectedActivity?"detail":"home")} style={{...S.backBtn,position:"absolute",top:52,left:24}}>← Tillbaka</button>
              <Avatar profile={viewingProfile} size={80}/>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,color:"white",marginTop:12}}>{viewingProfile.namn}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>📍 {viewingProfile.stad}</div>
              <div style={{marginTop:8}}><span style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"4px 14px",color:"white",fontSize:13}}>{viewingProfile.hedersemblem||"🌱 Ny medlem"}</span></div>
            </div>
            <div style={S.scrollArea}>
              {viewingProfile.bio&&<div style={{...S.card,padding:18}}><label style={S.label}>Om</label><p style={{fontSize:14,color:"#555",margin:0,lineHeight:1.6}}>{viewingProfile.bio}</p></div>}
              {viewingProfile.id!==user?.id&&(
                isFriend(viewingProfile.id)?(
                  <div style={{...S.card,padding:16,display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:24}}>🤝</span>
                    <div style={{flex:1}}><div style={{fontWeight:600}}>Ni är vänner!</div><div style={{fontSize:12,color:"#888"}}>Du kan bjuda in {viewingProfile.namn?.split(" ")[0]} till aktiviteter</div></div>
                  </div>
                ):sentRequests.includes(viewingProfile.id)?(
                  <div style={{background:"#F5F3EE",borderRadius:16,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:22}}>✉️</span>
                    <div>
                      <div style={{fontWeight:600,color:"#555"}}>Vänförfrågan skickad!</div>
                      <div style={{fontSize:12,color:"#888"}}>Väntar på att {viewingProfile.namn?.split(" ")[0]} accepterar</div>
                    </div>
                  </div>
                ):(
                  <button onClick={()=>sendFriendRequest(viewingProfile.id)} style={S.btn()}>🤝 Lägg till som vän</button>
                )
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
                <div><label style={S.label}>Stad</label><select style={S.input} value={createForm.stad} onChange={e=>setCreateForm(f=>({...f,stad:e.target.value,plats:e.target.value}))}>{SWEDISH_CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label style={S.label}>Exakt plats</label><input type="text" placeholder="t.ex. Kungsmarken parkeringen" value={createForm.plats} onChange={e=>setCreateForm(f=>({...f,plats:e.target.value}))} style={S.input}/></div>
                <div><label style={S.label}>Datum</label><input type="date" value={createForm.datum} onChange={e=>setCreateForm(f=>({...f,datum:e.target.value}))} style={S.input}/></div>
                <div><label style={S.label}>Tid</label><input type="time" value={createForm.tid} onChange={e=>setCreateForm(f=>({...f,tid:e.target.value}))} style={S.input}/></div>
                <div><label style={S.label}>Nivå</label><select value={createForm.niva} onChange={e=>setCreateForm(f=>({...f,niva:e.target.value}))} style={S.input}>{["Alla nivåer","Nybörjare","Medel","Avancerad"].map(n=><option key={n}>{n}</option>)}</select></div>
                <div><label style={S.label}>Max deltagare</label><select value={createForm.max_deltagare} onChange={e=>setCreateForm(f=>({...f,max_deltagare:e.target.value}))} style={S.input}>{["2","4","6","8","10","15","20","50"].map(n=><option key={n}>{n} personer</option>)}</select></div>
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
                  {profile?.profilbild_url?<img src={profile.profilbild_url} alt="profil" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.3)"}}/>:<div style={{width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,color:"white",border:"3px solid rgba(255,255,255,0.3)"}}>{profile?.namn?.substring(0,2).toUpperCase()||"??"}</div>}
                  <button onClick={()=>fileInputRef.current?.click()} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:"white",border:"none",fontSize:14,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>{uploadingPhoto?"⏳":"📷"}</button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:"none"}}/>
                </div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,color:"white"}}>{profile?.namn||"Okänd"}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>📍 {profile?.stad||"Sverige"}</div>
                <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"center"}}>
                  {[[myHistory.length,"Genomförda"],[friends.length,"Vänner 👥"],[profile?.streak||1,"Streak 🔥"]].map(([n,l])=>(
                    <div key={l} style={{background:"rgba(255,255,255,0.15)",borderRadius:14,padding:"8px 14px",textAlign:"center"}}>
                      <div style={{fontSize:18,fontWeight:700,color:"white"}}>{n}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.7)",marginTop:1}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",background:"rgba(255,255,255,0.15)",borderRadius:16,padding:4,marginTop:16}}>
                {[["info","👤 Info"],["friends","👥 Vänner"],["history","📊 Historik"],["stats","🏆 Stats"]].map(([t,l])=>(
                  <button key={t} onClick={()=>setProfileTab(t)} style={{flex:1,border:"none",borderRadius:12,padding:"8px 2px",fontSize:12,fontWeight:600,cursor:"pointer",background:profileTab===t?"white":"transparent",color:profileTab===t?"#1A6B4A":"rgba(255,255,255,0.8)",transition:"all 0.2s",position:"relative"}}>
                    {l}
                    {t==="friends"&&friendRequests.length>0&&<span style={{position:"absolute",top:-2,right:-2,background:"#E53E3E",color:"white",borderRadius:"50%",width:14,height:14,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{friendRequests.length}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.scrollArea}>
              {/* INFO */}
              {profileTab==="info"&&<>
                {!editingProfile?(
                  <button onClick={()=>setEditingProfile(true)} style={S.btn("#F5F3EE","#1A6B4A")}>✏️ Redigera profil</button>
                ):(
                  <div style={{...S.card,padding:18,display:"flex",flexDirection:"column",gap:12}}>
                    <label style={S.label}>Redigera profil</label>
                    <div><label style={S.label}>Namn</label><input style={S.input} value={editForm.namn} onChange={e=>setEditForm(f=>({...f,namn:e.target.value}))}/></div>
                    <div><label style={S.label}>Stad</label><select style={S.input} value={editForm.stad} onChange={e=>setEditForm(f=>({...f,stad:e.target.value}))}>{SWEDISH_CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
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
                  <div><div style={{fontWeight:700,color:"white",fontSize:15}}>{profile?.streak||1} vecka i rad aktiv!</div><div style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>Fortsätt – du är på en streak!</div></div>
                </div>
                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Ditt emblem</label>
                  <span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:20,padding:"6px 14px",fontSize:14,fontWeight:500}}>{getBadge(myParticipations.length)}</span>
                </div>
                <button onClick={handleLogout} style={S.btn("#FEF3E7","#E53E3E")}>Logga ut</button>
              </>}

              {/* FRIENDS */}
              {profileTab==="friends"&&<>
                {/* Incoming friend requests - prominent banner */}
                {friendRequests.length>0&&(
                  <div style={{background:"linear-gradient(135deg,#1A6B4A,#2E9E6E)",borderRadius:20,padding:18}}>
                    <div style={{color:"white",fontWeight:700,fontSize:15,marginBottom:12}}>🤝 Vänförfrågningar ({friendRequests.length})</div>
                    {friendRequests.map(req=>(
                      <div key={req.id} style={{background:"rgba(255,255,255,0.15)",borderRadius:16,padding:"12px 14px",marginBottom:8,display:"flex",alignItems:"center",gap:12}}>
                        <Avatar profile={req.requester} size={46}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:700,color:"white"}}>{req.requester?.namn}</div>
                          <div style={{fontSize:12,color:"rgba(255,255,255,0.75)"}}>📍 {req.requester?.stad} · {req.requester?.hedersemblem||"🌱 Ny medlem"}</div>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>acceptFriendRequest(req.id,req.user_id)} style={{background:"white",border:"none",borderRadius:12,padding:"8px 14px",color:"#1A6B4A",fontSize:13,fontWeight:700,cursor:"pointer"}}>Acceptera</button>
                          <button onClick={()=>declineFriendRequest(req.id)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:12,padding:"8px 10px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {friendRequests.length===0&&(
                  <div style={{background:"#F5F3EE",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:20}}>✉️</span>
                    <span style={{fontSize:13,color:"#888"}}>Inga inkommande vänförfrågningar just nu</span>
                  </div>
                )}

                {/* Search people */}
                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Hitta folk</label>
                  <div style={{position:"relative",marginBottom:12}}>
                    <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#AAA"}}>🔍</span>
                    <input style={{...S.input,paddingLeft:36,fontSize:14}} placeholder="Sök på namn eller stad..." value={friendSearch} onChange={e=>setFriendSearch(e.target.value)}/>
                  </div>
                  {friendSearch&&allProfiles.filter(p=>p.id!==user?.id&&(p.namn?.toLowerCase().includes(friendSearch.toLowerCase())||p.stad?.toLowerCase().includes(friendSearch.toLowerCase()))).slice(0,5).map(p=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F5F3EE"}}>
                      <Avatar profile={p} size={44}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:600}}>{p.namn}</div>
                        <div style={{fontSize:12,color:"#888"}}>📍 {p.stad} · {p.hedersemblem||"🌱 Ny"}</div>
                      </div>
                      {isFriend(p.id)?(
                        <span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:12,padding:"4px 10px",fontSize:12,fontWeight:600}}>✓ Vän</span>
                      ):sentRequests.includes(p.id)?(
                        <span style={{background:"#F5F3EE",color:"#888",borderRadius:12,padding:"4px 10px",fontSize:12,fontWeight:600}}>Skickad ✓</span>
                      ):(
                        <button onClick={()=>sendFriendRequest(p.id)} style={{background:"#1A6B4A",border:"none",borderRadius:12,padding:"6px 12px",color:"white",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Lägg till</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Friends list */}
                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Mina vänner ({friends.length})</label>
                  {friends.length===0?(
                    <div style={{textAlign:"center",padding:24,color:"#888"}}>
                      <div style={{fontSize:40,marginBottom:8}}>👥</div>
                      <div style={{fontSize:13}}>Inga vänner än – sök efter folk ovan!</div>
                    </div>
                  ):(
                    friends.map(friend=>(
                      <div key={friend.id} onClick={()=>{setViewingProfile(friend);setScreen("viewprofile");}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F5F3EE",cursor:"pointer"}}>
                        <Avatar profile={friend} size={44}/>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14,fontWeight:600}}>{friend.namn}</div>
                          <div style={{fontSize:12,color:"#888"}}>📍 {friend.stad} · {friend.hedersemblem||"🌱 Ny"}</div>
                        </div>
                        <span style={{fontSize:18,color:"#AAA"}}>›</span>
                      </div>
                    ))
                  )}
                </div>
              </>}

              {/* HISTORY */}
              {profileTab==="history"&&<>
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
                    <div style={{marginTop:12,fontSize:12,opacity:0.7}}>📍 {stats.cities} städer · {getBadge(myParticipations.length)}</div>
                  </div>
                )}
                {myHistory.length===0?(
                  <div style={{textAlign:"center",padding:48,color:"#888"}}>
                    <div style={{fontSize:56,marginBottom:12}}>📊</div>
                    <div style={{fontWeight:600,marginBottom:8}}>Ingen historik än!</div>
                    <div style={{fontSize:13}}>Gå med i aktiviteter – de visas här när de avslutats</div>
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
                      <div style={{padding:"10px 16px",display:"flex",justifyContent:"space-between"}}>
                        <div style={{fontSize:13,color:"#888"}}>📅 {act.datum} · {act.tid}</div>
                        <div style={{fontSize:13,color:"#1A6B4A",fontWeight:600}}>+1 🔥</div>
                      </div>
                    </div>
                  ))
                )}
              </>}

              {/* STATS */}
              {profileTab==="stats"&&<>
                <div style={{...S.card,padding:20}}>
                  <label style={S.label}>Din aktivitetsprofil</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
                    {[["🏁","Genomförda",myHistory.length],["👥","Vänner",friends.length],["🏙️","Städer",stats.cities],["🔥","Streak",profile?.streak||1]].map(([icon,label,value])=>(
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
                      <div><div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700}}>{stats.favType}</div><div style={{fontSize:13,opacity:0.85}}>{stats.favCount} gånger</div></div>
                    </div>
                  </div>
                )}
                <div style={{...S.card,padding:18}}>
                  <label style={S.label}>Emblem-framsteg</label>
                  {Object.entries(BADGES).map(([req,badge])=>{
                    const n=parseInt(req); const done=myParticipations.length>=n;
                    return <div key={req} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #F5F3EE",opacity:done?1:0.4}}>
                      <span style={{fontSize:20}}>{done?"✅":"🔒"}</span>
                      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:done?600:400}}>{badge}</div><div style={{fontSize:12,color:"#888"}}>{n} aktiviteter</div></div>
                      {done&&<span style={{fontSize:12,color:"#1A6B4A",fontWeight:600}}>Upplåst!</span>}
                    </div>;
                  })}
                </div>
              </>}

              <div style={{height:20}}/>
            </div>
          </div>
        )}

        {/* BOTTOM NAV */}
        {screen!=="swipe"&&(
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"white",borderTop:"1px solid #F0EDE8",display:"flex",padding:"10px 0 24px",boxShadow:"0 -4px 20px rgba(0,0,0,0.06)",zIndex:50}}>
            {[["home","🗺️","Utforska"],["swipe","✨","Swipa"],["create","➕","Skapa"],["profile","👤","Profil"]].map(([s,icon,label])=>(
              <button key={s} onClick={()=>setScreen(s)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
                {s==="profile"&&profile?.profilbild_url?<img src={profile.profilbild_url} alt="p" style={{width:26,height:26,borderRadius:"50%",objectFit:"cover",border:screen==="profile"?"2px solid #1A6B4A":"2px solid transparent"}}/>:<span style={{fontSize:22}}>{icon}</span>}
                <span style={{fontSize:10,fontWeight:600,color:screen===s?"#1A6B4A":"#AAA"}}>{label}</span>
                {screen===s&&<div style={{width:4,height:4,borderRadius:"50%",background:"#1A6B4A"}}/>}
                {s==="profile"&&friendRequests.length>0&&<span style={{position:"absolute",top:2,right:16,background:"#E53E3E",color:"white",borderRadius:"50%",width:14,height:14,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{friendRequests.length}</span>}
              </button>
            ))}
          </div>
        )}

        {toast&&<div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:toast.color,color:"white",borderRadius:16,padding:"14px 24px",fontSize:14,fontWeight:500,textAlign:"center",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:100,whiteSpace:"nowrap"}}>{toast.msg}</div>}
      </div>
    </div>
  );
}
