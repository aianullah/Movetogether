import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://lyblrmocrtsilxrdjpfm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5YmxybW9jcnRzaWx4cmRqcGZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NjA0NDYsImV4cCI6MjA5NTEzNjQ0Nn0.8gfCAA_-m1J8BSK2NXmCOR4J8qrBzx7pFW5A2UDfayM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CITIES = ["Stockholm","Göteborg","Malmö","Uppsala","Västerås","Örebro","Linköping","Helsingborg","Jönköping","Norrköping","Lund","Umeå","Gävle","Borås","Södertälje","Eskilstuna","Halmstad","Växjö","Karlstad","Sundsvall","Östersund","Trollhättan","Luleå","Kalmar","Kristianstad","Falun","Skellefteå","Karlskrona","Ronneby","Blekinge"];

const ACT_TYPES = [
  {type:"Löpning",emoji:"🏃"},{type:"Promenad",emoji:"🚶"},{type:"Cykling",emoji:"🚴"},
  {type:"Fotboll",emoji:"⚽"},{type:"Basket",emoji:"🏀"},{type:"Gym",emoji:"🏋️"},
  {type:"Simning",emoji:"🏊"},{type:"Yoga",emoji:"🧘"},{type:"Hiking",emoji:"🥾"},
  {type:"Crossfit",emoji:"💪"},{type:"Studera",emoji:"📚"},{type:"Co-working",emoji:"💻"},
  {type:"Socialt",emoji:"☕"},{type:"Nybörjar",emoji:"🌱"},{type:"Återhämtning",emoji:"🌿"},
];

const COLORS = {
  "Löpning":"#1A6B4A","Promenad":"#2E9E6E","Cykling":"#185FA5","Fotboll":"#854F0B",
  "Basket":"#C4462A","Gym":"#1A6B4A","Simning":"#0E7490","Yoga":"#6B4AA8",
  "Hiking":"#3D6B21","Crossfit":"#9B1C1C","Studera":"#1E40AF","Co-working":"#374151",
  "Socialt":"#C4462A","Nybörjar":"#166534","Återhämtning":"#065F46",
};

const BADGES = {1:"🌱 Ny medlem",3:"🔥 Aktiv starter",5:"⭐ Regelbunden",10:"🏆 Veteran",20:"👑 Legend"};
const getBadge = n => { const keys=Object.keys(BADGES).map(Number).sort((a,b)=>b-a); for(const k of keys){if(n>=k)return BADGES[k];} return "🌱 Ny medlem"; };
const emoji = typ => ACT_TYPES.find(a=>a.type===typ)?.emoji||"🏃";
const color = typ => COLORS[typ]||"#1A6B4A";
const expired = (d,t) => { if(!d)return false; return new Date(t?`${d}T${t}`:`${d}T23:59`)<new Date(); };
const dateLabel = (d,t) => {
  if(!d)return""; if(expired(d,t))return"⚫ Avslutad";
  const diff=Math.round((new Date(d)-new Date().setHours(0,0,0,0))/(864e5));
  if(diff===0)return"🟢 Idag"; if(diff===1)return"🔵 Imorgon"; if(diff<=7)return`🟡 Om ${diff} dagar`; return`📅 ${d}`;
};
const statusLabel = (n,max) => {
  if(n>=max)return{text:"🔴 Fullbokad",color:"#E53E3E",bg:"#FCEBEB"};
  if(n/max>=0.7)return{text:`⚡ ${max-n} kvar!`,color:"#854F0B",bg:"#FEF3E7"};
  return{text:`✅ ${max-n} av ${max} lediga`,color:"#1A6B4A",bg:"#E8F5EE"};
};

const S = {
  wrap:{width:"100%",maxWidth:430,minHeight:"100vh",background:"#FAFAF8",display:"flex",flexDirection:"column",fontFamily:"'DM Sans',sans-serif",margin:"0 auto",position:"relative"},
  inp:{width:"100%",background:"#F5F3EE",border:"1.5px solid #E8E5E0",borderRadius:12,padding:"13px 16px",fontSize:15,color:"#1A1A1A",outline:"none",boxSizing:"border-box",fontFamily:"'DM Sans',sans-serif"},
  btn:(bg="#1A6B4A",c="white")=>({background:bg,border:"none",borderRadius:16,padding:"15px",color:c,fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",fontFamily:"'DM Sans',sans-serif"}),
  card:{background:"white",borderRadius:20,border:"1px solid #F0EDE8",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden"},
  lbl:{fontSize:12,fontWeight:600,color:"#888",marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:0.5},
  scroll:{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14,background:"#F5F3EE"},
  back:{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:20,padding:"7px 14px",color:"white",fontSize:13,cursor:"pointer",marginBottom:12},
};

const Av = ({p,size=40,onClick})=>{
  const ini=p?.namn?.substring(0,2).toUpperCase()||"??";
  if(p?.profilbild_url)return<img src={p.profilbild_url} onClick={onClick} alt="" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",cursor:onClick?"pointer":"default",flexShrink:0,border:"2px solid rgba(255,255,255,0.3)"}}/>;
  return<div onClick={onClick} style={{width:size,height:size,borderRadius:"50%",background:"#1A6B4A",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.28,fontWeight:700,color:"white",flexShrink:0,cursor:onClick?"pointer":"default"}}>{ini}</div>;
};

export default function App() {
  const [screen,setScreen]=useState("splash");
  const [authTab,setAuthTab]=useState("login");
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [acts,setActs]=useState([]);
  const [counts,setCounts]=useState({});
  const [myParts,setMyParts]=useState([]);
  const [myHistory,setMyHistory]=useState([]);
  const [friends,setFriends]=useState([]);
  const [friendReqs,setFriendReqs]=useState([]);
  const [allProfiles,setAllProfiles]=useState([]);
  const [selAct,setSelAct]=useState(null);
  const [actParts,setActParts]=useState([]);
  const [actCreator,setActCreator]=useState(null);
  const [viewProf,setViewProf]=useState(null);
  const [prevScreen,setPrevScreen]=useState("home");
  const [swipeIdx,setSwipeIdx]=useState(0);
  const [swipeDir,setSwipeDir]=useState(null);
  const [filter,setFilter]=useState("Alla");
  const [cityFilter,setCityFilter]=useState("Alla städer");
  const [search,setSearch]=useState("");
  const [friendSearch,setFriendSearch]=useState("");
  const [toast,setToast]=useState(null);
  const [loading,setLoading]=useState(false);
  const [dragX,setDragX]=useState(0);
  const [dragging,setDragging]=useState(false);
  const [editingProf,setEditingProf]=useState(false);
  const [uploadingPhoto,setUploadingPhoto]=useState(false);
  const [showCityPicker,setShowCityPicker]=useState(false);
  const [profTab,setProfTab]=useState("info");
  const dragRef=useRef(null);
  const fileRef=useRef(null);

  const [authForm,setAuthForm]=useState({email:"",password:"",namn:"",stad:"Karlskrona",bio:""});
  const [createForm,setCreateForm]=useState({type:"",titel:"",datum:"",tid:"",plats:"",stad:"Karlskrona",max_deltagare:"6",beskrivning:"",niva:"Alla nivåer"});
  const [editForm,setEditForm]=useState({namn:"",stad:"",bio:""});

  const toast_=(msg,c="#1A6B4A")=>{setToast({msg,c});setTimeout(()=>setToast(null),3000);};
  const go=(s)=>setScreen(s);

  useEffect(()=>{
    setTimeout(async()=>{
      const{data:{session}}=await supabase.auth.getSession();
      if(session?.user){setUser(session.user);await fetchAll(session.user.id);go("home");}
      else go("auth");
    },1800);
  },[]);

  const fetchAll=async(uid)=>{
    await Promise.all([fetchProfile(uid),fetchActs(),fetchMyParts(uid),fetchFriends(uid),fetchFriendReqs(uid),fetchAllProfs()]);
  };

  const fetchProfile=async(uid)=>{
    const{data}=await supabase.from("profiles").select("*").eq("id",uid).single();
    if(data){setProfile(data);setEditForm({namn:data.namn||"",stad:data.stad||"",bio:data.bio||""});if(data.stad)setCreateForm(f=>({...f,stad:data.stad,plats:data.stad}));}
  };

  const fetchActs=async()=>{
    const{data}=await supabase.from("activities").select("*").order("datum",{ascending:true});
    if(data){
      setActs(data);
      const c={};
      await Promise.all(data.map(async a=>{const{count}=await supabase.from("participants").select("*",{count:"exact",head:true}).eq("aktivitet_id",a.id);c[a.id]=count||0;}));
      setCounts(c);
    }
  };

  const fetchMyParts=async(uid)=>{
    const{data}=await supabase.from("participants").select("aktivitet_id,activities(*)").eq("anvandare_id",uid);
    if(data){
      setMyParts(data.map(p=>p.aktivitet_id));
      setMyHistory(data.filter(p=>p.activities&&expired(p.activities.datum,p.activities.tid)).map(p=>p.activities));
    }
  };

  const fetchFriends=async(uid)=>{
    const{data}=await supabase.from("friends").select("*,friend:friend_id(*)").eq("user_id",uid).eq("status","accepted");
    if(data)setFriends(data.map(f=>f.friend).filter(Boolean));
  };

  const fetchFriendReqs=async(uid)=>{
    const{data}=await supabase.from("friends").select("*,requester:user_id(*)").eq("friend_id",uid).eq("status","pending");
    if(data)setFriendReqs(data);
  };

  const fetchAllProfs=async()=>{
    const{data}=await supabase.from("profiles").select("*");
    if(data)setAllProfiles(data);
  };

  const fetchActParts=async(actId,creatorId)=>{
    const{data}=await supabase.from("participants").select("anvandare_id,profiles(*)").eq("aktivitet_id",actId);
    if(data)setActParts(data);
    if(creatorId){const{data:cr}=await supabase.from("profiles").select("*").eq("id",creatorId).single();if(cr)setActCreator(cr);}
  };

  // AUTH
  const doRegister=async()=>{
    if(!authForm.email||!authForm.password||!authForm.namn){toast_("Fyll i alla fält!","#E53E3E");return;}
    setLoading(true);
    const{data,error}=await supabase.auth.signUp({email:authForm.email,password:authForm.password});
    if(error){toast_(error.message,"#E53E3E");setLoading(false);return;}
    if(data.user){
      await supabase.from("profiles").insert({id:data.user.id,namn:authForm.namn,stad:authForm.stad,bio:authForm.bio,streak:1,hedersemblem:"🌱 Ny medlem"});
      setUser(data.user);await fetchAll(data.user.id);toast_("Välkommen till MoveTogether! 🎉");go("home");
    }
    setLoading(false);
  };

  const doLogin=async()=>{
    if(!authForm.email||!authForm.password){toast_("Fyll i e-post och lösenord!","#E53E3E");return;}
    setLoading(true);
    const{data,error}=await supabase.auth.signInWithPassword({email:authForm.email,password:authForm.password});
    if(error){toast_("Fel e-post eller lösenord!","#E53E3E");setLoading(false);return;}
    if(data.user){setUser(data.user);await fetchAll(data.user.id);toast_("Välkommen tillbaka! 👋");go("home");}
    setLoading(false);
  };

  const doLogout=async()=>{
    await supabase.auth.signOut();
    setUser(null);setProfile(null);setActs([]);setMyParts([]);setMyHistory([]);setFriends([]);setFriendReqs([]);go("auth");
  };

  const doPhotoUpload=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    setUploadingPhoto(true);
    const reader=new FileReader();
    reader.onload=async(ev)=>{
      await supabase.from("profiles").update({profilbild_url:ev.target.result}).eq("id",user.id);
      await fetchProfile(user.id);setUploadingPhoto(false);toast_("Profilbild uppdaterad! 📸");
    };
    reader.readAsDataURL(file);
  };

  const doSaveProfile=async()=>{
    setLoading(true);
    await supabase.from("profiles").update({namn:editForm.namn,stad:editForm.stad,bio:editForm.bio,hedersemblem:getBadge(myParts.length)}).eq("id",user.id);
    await fetchProfile(user.id);setEditingProf(false);setLoading(false);toast_("Profil uppdaterad! ✅");
  };

  // FRIENDS
  const sendFriendReq=async(friendId)=>{
    if(friendId===user.id){toast_("Det är du själv! 😄","#854F0B");return;}
    if(friends.some(f=>f.id===friendId)){toast_("Redan vänner!","#854F0B");return;}
    const{error}=await supabase.from("friends").insert({user_id:user.id,friend_id:friendId,status:"pending"});
    if(!error){toast_("Vänförfrågan skickad! 🤝");await fetchFriends(user.id);}
    else toast_("Förfrågan redan skickad!","#854F0B");
  };

  const acceptFriend=async(reqId,requesterId)=>{
    await supabase.from("friends").update({status:"accepted"}).eq("id",reqId);
    await supabase.from("friends").insert({user_id:user.id,friend_id:requesterId,status:"accepted"});
    await fetchFriends(user.id);await fetchFriendReqs(user.id);toast_("Vän tillagd! 🎉");
  };

  const declineFriend=async(reqId)=>{
    await supabase.from("friends").delete().eq("id",reqId);
    await fetchFriendReqs(user.id);toast_("Förfrågan nekad","#888");
  };

  // JOIN / LEAVE
  const joinAct=async(actId)=>{
    if(!user)return;
    if(myParts.includes(actId)){toast_("Du är redan anmäld!","#854F0B");return;}
    const a=acts.find(x=>x.id===actId);
    if(a&&(counts[actId]||0)>=a.max_deltagare){toast_("Fullbokad!","#E53E3E");return;}
    const{error}=await supabase.from("participants").insert({aktivitet_id:actId,anvandare_id:user.id,status:"Väntande"});
    if(!error){
      const nl=[...myParts,actId];setMyParts(nl);setCounts(p=>({...p,[actId]:(p[actId]||0)+1}));
      await supabase.from("profiles").update({hedersemblem:getBadge(nl.length)}).eq("id",user.id);
      toast_("🎉 Du är anmäld!");go("home");
    }
  };

  const leaveAct=async(actId)=>{
    const{error}=await supabase.from("participants").delete().eq("aktivitet_id",actId).eq("anvandare_id",user.id);
    if(!error){setMyParts(p=>p.filter(id=>id!==actId));setCounts(p=>({...p,[actId]:Math.max((p[actId]||1)-1,0)}));toast_("Avanmäld.","#854F0B");go("home");}
  };

  const createAct=async()=>{
    if(!createForm.type||!createForm.titel||!createForm.datum){toast_("Fyll i typ, titel och datum!","#E53E3E");return;}
    setLoading(true);
    const{error}=await supabase.from("activities").insert({
      titel:createForm.titel,typ:createForm.type,datum:createForm.datum,tid:createForm.tid,
      plats:createForm.plats||createForm.stad,stad:createForm.stad,
      max_deltagare:parseInt(createForm.max_deltagare),beskrivning:createForm.beskrivning,
      skapad_av:user.id,status:"Öppen"
    });
    if(!error){await fetchActs();setCreateForm({type:"",titel:"",datum:"",tid:"",plats:"",stad:profile?.stad||"Karlskrona",max_deltagare:"6",beskrivning:"",niva:"Alla nivåer"});toast_("🚀 Publicerad!");go("home");}
    else toast_("Något gick fel!","#E53E3E");
    setLoading(false);
  };

  const inviteFriend=async(friendId,actId)=>{
    const a=acts.find(x=>x.id===actId);
    const msg=encodeURIComponent(`Hej! Jag bjuder in dig till "${a?.titel}" den ${a?.datum} kl ${a?.tid} i ${a?.stad}. Öppna appen: movetogether-karlskrona.vercel.app`);
    window.open(`https://wa.me/?text=${msg}`,"_blank");
    toast_("Inbjudan skickad! 📲");
  };

  const getFilt=()=>{
    let list=acts.filter(a=>!expired(a.datum,a.tid));
    if(filter!=="Alla")list=list.filter(a=>a.typ===filter);
    if(cityFilter!=="Alla städer")list=list.filter(a=>a.stad===cityFilter||a.plats?.includes(cityFilter));
    if(search)list=list.filter(a=>a.titel?.toLowerCase().includes(search.toLowerCase())||a.plats?.toLowerCase().includes(search.toLowerCase())||a.typ?.toLowerCase().includes(search.toLowerCase()));
    return list;
  };

  const getStats=()=>{
    const tc={};myHistory.forEach(a=>{tc[a.typ]=(tc[a.typ]||0)+1;});
    const fav=Object.entries(tc).sort((a,b)=>b[1]-a[1])[0];
    const cities=[...new Set(myHistory.map(a=>a.stad||a.plats).filter(Boolean))];
    return{total:myHistory.length,favType:fav?.[0],favCount:fav?.[1]||0,cities:cities.length,tc};
  };

  const swipeList=getFilt();
  const curCard=swipeList[swipeIdx];
  const doSwipe=(dir)=>{setSwipeDir(dir);setTimeout(()=>{setSwipeDir(null);setSwipeIdx(i=>i+1);if(dir==="right"&&curCard)joinAct(curCard.id);},400);};
  const onDragStart=(e)=>{dragRef.current=e.touches?e.touches[0].clientX:e.clientX;setDragging(true);};
  const onDragMove=(e)=>{if(!dragging)return;setDragX((e.touches?e.touches[0].clientX:e.clientX)-dragRef.current);};
  const onDragEnd=()=>{if(Math.abs(dragX)>80)doSwipe(dragX>0?"right":"left");setDragX(0);setDragging(false);dragRef.current=null;};

  const filtList=getFilt();
  const stats=getStats();
  const isFriend=uid=>friends.some(f=>f.id===uid);
  const filters=["Alla","Löpning","Cykling","Fotboll","Yoga","Socialt","Gym","Hiking"];

  // SPLASH
  if(screen==="splash")return(
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
  if(screen==="auth")return(
    <div style={{minHeight:"100vh",background:"#F5F3EE",display:"flex",justifyContent:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{...S.wrap}}>
        <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"48px 24px 36px",textAlign:"center"}}>
          <div style={{fontSize:48}}>🌿</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:900,color:"white",marginTop:8}}>MoveTogether</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>Sverige · Rörelse & Gemenskap</div>
        </div>
        <div style={{display:"flex",background:"#EEECE8",margin:"20px 20px 0",borderRadius:16,padding:4}}>
          {["login","register"].map(t=>(
            <button key={t} onClick={()=>setAuthTab(t)} style={{flex:1,border:"none",borderRadius:12,padding:"10px",fontSize:14,fontWeight:600,cursor:"pointer",background:authTab===t?"white":"transparent",color:authTab===t?"#1A1A1A":"#888",boxShadow:authTab===t?"0 2px 8px rgba(0,0,0,0.1)":"none"}}>
              {t==="login"?"Logga in":"Registrera"}
            </button>
          ))}
        </div>
        <div style={{padding:"16px 20px 40px",display:"flex",flexDirection:"column",gap:12}}>
          {authTab==="register"&&<>
            <div><label style={S.lbl}>Namn</label><input style={S.inp} placeholder="Förnamn Efternamn" value={authForm.namn} onChange={e=>setAuthForm(f=>({...f,namn:e.target.value}))}/></div>
            <div><label style={S.lbl}>Stad</label><select style={S.inp} value={authForm.stad} onChange={e=>setAuthForm(f=>({...f,stad:e.target.value}))}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
            <div><label style={S.lbl}>Bio (valfri)</label><input style={S.inp} placeholder="t.ex. Gillar löpning och kaffe" value={authForm.bio} onChange={e=>setAuthForm(f=>({...f,bio:e.target.value}))}/></div>
          </>}
          <div><label style={S.lbl}>E-post</label><input style={S.inp} type="email" placeholder="din@email.com" value={authForm.email} onChange={e=>setAuthForm(f=>({...f,email:e.target.value}))}/></div>
          <div><label style={S.lbl}>Lösenord</label><input style={S.inp} type="password" placeholder="Minst 6 tecken" value={authForm.password} onChange={e=>setAuthForm(f=>({...f,password:e.target.value}))}/></div>
          <button onClick={authTab==="login"?doLogin:doRegister} style={S.btn()} disabled={loading}>{loading?"Laddar...":authTab==="login"?"Logga in →":"Skapa konto →"}</button>
          <div style={{textAlign:"center",fontSize:13,color:"#888"}}>
            {authTab==="login"?"Inget konto? ":"Har du konto? "}
            <span onClick={()=>setAuthTab(authTab==="login"?"register":"login")} style={{color:"#1A6B4A",fontWeight:600,cursor:"pointer"}}>{authTab==="login"?"Registrera dig":"Logga in"}</span>
          </div>
        </div>
        {toast&&<div style={{position:"fixed",bottom:40,left:"50%",transform:"translateX(-50%)",background:toast.c,color:"white",borderRadius:16,padding:"14px 24px",fontSize:14,fontWeight:500,zIndex:200,whiteSpace:"nowrap"}}>{toast.msg}</div>}
      </div>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#F5F3EE",display:"flex",justifyContent:"center"}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@700;900&display=swap" rel="stylesheet"/>
      <div style={{...S.wrap}}>

        {/* HOME */}
        {screen==="home"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"52px 20px 8px",background:"#FAFAF8"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:900,color:"#1A1A1A"}}>MoveTogether</div>
                  <div style={{fontSize:12,color:"#888",marginTop:1}}>📍 {cityFilter==="Alla städer"?"Sverige":cityFilter} · {filtList.length} aktiviteter</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {friendReqs.length>0&&<button onClick={()=>{go("profile");setProfTab("friends");}} style={{background:"#E53E3E",border:"none",borderRadius:20,padding:"6px 12px",color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>🤝 {friendReqs.length}</button>}
                  <button onClick={()=>go("swipe")} style={{background:"#1A6B4A",border:"none",borderRadius:20,padding:"7px 14px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>✨ Swipa</button>
                  <div onClick={()=>go("profile")} style={{cursor:"pointer"}}><Av p={profile} size={36}/></div>
                </div>
              </div>
              <div style={{position:"relative",marginBottom:10}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",fontSize:16,color:"#AAA"}}>🔍</span>
                <input style={{...S.inp,paddingLeft:40,borderRadius:20,fontSize:14}} placeholder="Sök aktiviteter, stad, typ..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <div style={{display:"flex",gap:8,overflowX:"auto",scrollbarWidth:"none",paddingBottom:4}}>
                <button onClick={()=>setShowCityPicker(!showCityPicker)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"7px 14px",fontSize:13,fontWeight:500,cursor:"pointer",background:cityFilter!=="Alla städer"?"#1A6B4A":"#EEECE8",color:cityFilter!=="Alla städer"?"white":"#555"}}>
                  📍 {cityFilter==="Alla städer"?"Välj stad":cityFilter}
                </button>
                {filters.map(f=><button key={f} onClick={()=>setFilter(f)} style={{flexShrink:0,border:"none",borderRadius:20,padding:"7px 14px",fontSize:13,fontWeight:500,cursor:"pointer",background:filter===f?"#1A6B4A":"#EEECE8",color:filter===f?"white":"#555"}}>{f}</button>)}
              </div>
              {showCityPicker&&(
                <div style={{background:"white",borderRadius:16,border:"1px solid #F0EDE8",padding:12,marginTop:8,maxHeight:200,overflowY:"auto",boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:20,position:"relative"}}>
                  {["Alla städer",...CITIES].map(city=>(
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
                  <div style={{fontSize:12,opacity:0.85}}>{filtList.length} aktiva · {Object.values(counts).reduce((a,b)=>a+b,0)} anmälda</div>
                </div>
                {friends.length>0&&<div style={{marginLeft:"auto",background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"4px 10px",fontSize:12,fontWeight:600}}>👥 {friends.length} vänner</div>}
              </div>
              {filtList.length===0&&<div style={{textAlign:"center",padding:48,color:"#888"}}><div style={{fontSize:56,marginBottom:12}}>🌱</div><div style={{fontWeight:600,marginBottom:8}}>Inga aktiva aktiviteter!</div><div style={{fontSize:13}}>Skapa den första eller byt stad</div></div>}
              {filtList.map(act=>{
                const cnt=counts[act.id]||0;const st=statusLabel(cnt,act.max_deltagare);const dl=dateLabel(act.datum,act.tid);const isJ=myParts.includes(act.id);const creator=allProfiles.find(p=>p.id===act.skapad_av);
                return(
                  <div key={act.id} onClick={()=>{setSelAct(act);fetchActParts(act.id,act.skapad_av);go("detail");}} style={{...S.card,cursor:"pointer"}}>
                    <div style={{background:color(act.typ),padding:"14px 18px 12px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div style={{flex:1}}>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                            <span style={{fontSize:22}}>{emoji(act.typ)}</span>
                            <span style={{background:"rgba(255,255,255,0.2)",borderRadius:10,padding:"2px 8px",fontSize:11,color:"white",fontWeight:500}}>{dl}</span>
                          </div>
                          <div style={{color:"white",fontWeight:700,fontSize:15,lineHeight:1.2}}>{act.titel}</div>
                          <div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginTop:3}}>📍 {act.plats||act.stad} · {act.tid}</div>
                        </div>
                        {isJ&&<div style={{background:"rgba(255,255,255,0.9)",borderRadius:12,padding:"4px 10px",color:color(act.typ),fontSize:12,fontWeight:700,flexShrink:0}}>✓ Anmäld</div>}
                      </div>
                    </div>
                    <div style={{padding:"10px 18px"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{background:st.bg,color:st.color,borderRadius:10,padding:"3px 10px",fontSize:12,fontWeight:600}}>{st.text}</span>
                        <div style={{fontSize:12,color:"#888"}}>👥 {cnt}/{act.max_deltagare}</div>
                      </div>
                      {creator&&<div style={{display:"flex",alignItems:"center",gap:6}}>
                        <Av p={creator} size={18}/>
                        <span style={{fontSize:12,color:"#888"}}>Skapad av <span style={{fontWeight:500,color:"#555"}}>{creator.namn}</span>{creator.id===user?.id&&<span style={{marginLeft:4,fontSize:11,background:"#E8F5EE",color:"#1A6B4A",borderRadius:8,padding:"1px 6px",fontWeight:600}}>Du</span>}</span>
                      </div>}
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
              <button onClick={()=>{go("home");setSwipeIdx(0);}} style={S.back}>← Tillbaka</button>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:900,color:"white"}}>Hitta aktivitet</div>
              <div style={{width:70}}/>
            </div>
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 20px 40px",gap:20}}>
              {curCard?(
                <>
                  <div style={{position:"relative",width:"100%",height:460}}>
                    {swipeList[swipeIdx+1]&&<div style={{position:"absolute",top:10,left:10,right:10,height:440,background:"white",borderRadius:28,transform:"scale(0.95)",opacity:0.5}}/>}
                    <div onMouseDown={onDragStart} onMouseMove={onDragMove} onMouseUp={onDragEnd} onTouchStart={onDragStart} onTouchMove={onDragMove} onTouchEnd={onDragEnd}
                      style={{position:"absolute",inset:0,background:"white",borderRadius:28,overflow:"hidden",cursor:"grab",userSelect:"none",boxShadow:"0 24px 60px rgba(0,0,0,0.25)",transform:swipeDir==="right"?"translateX(120%) rotate(20deg)":swipeDir==="left"?"translateX(-120%) rotate(-20deg)":`translateX(${dragX}px) rotate(${dragX*0.05}deg)`,transition:swipeDir?"transform 0.4s ease":dragging?"none":"transform 0.2s ease"}}>
                      {dragX>40&&<div style={{position:"absolute",top:30,left:20,background:"#1A6B4A",color:"white",borderRadius:12,padding:"8px 16px",fontSize:18,fontWeight:700,zIndex:10,transform:"rotate(-15deg)"}}>✓ JOIN</div>}
                      {dragX<-40&&<div style={{position:"absolute",top:30,right:20,background:"#E53E3E",color:"white",borderRadius:12,padding:"8px 16px",fontSize:18,fontWeight:700,zIndex:10,transform:"rotate(15deg)"}}>✕ SKIP</div>}
                      <div style={{background:color(curCard.typ),padding:"32px 24px 24px",minHeight:220,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                          <div>
                            <div style={{fontSize:52}}>{emoji(curCard.typ)}</div>
                            <div style={{color:"white",fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,marginTop:8}}>{curCard.titel}</div>
                            <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginTop:4}}>📍 {curCard.plats||curCard.stad}</div>
                          </div>
                          <div style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"8px 12px",textAlign:"center"}}>
                            <div style={{color:"white",fontSize:20,fontWeight:700}}>{counts[curCard.id]||0}</div>
                            <div style={{color:"rgba(255,255,255,0.8)",fontSize:10}}>anmälda</div>
                          </div>
                        </div>
                      </div>
                      <div style={{padding:"16px 24px"}}>
                        {(()=>{const cr=allProfiles.find(p=>p.id===curCard.skapad_av);return cr&&(
                          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,padding:"8px 12px",background:"#F5F3EE",borderRadius:12}}>
                            <Av p={cr} size={28}/>
                            <div><div style={{fontSize:11,color:"#888"}}>Skapad av</div><div style={{fontSize:13,fontWeight:600}}>{cr.namn} · 📍 {cr.stad}</div></div>
                            {cr.id!==user?.id&&!isFriend(cr.id)&&<button onClick={(e)=>{e.stopPropagation();sendFriendReq(cr.id);}} style={{marginLeft:"auto",background:"#1A6B4A",border:"none",borderRadius:10,padding:"4px 10px",color:"white",fontSize:11,fontWeight:600,cursor:"pointer"}}>+ Vän</button>}
                            {isFriend(cr.id)&&<span style={{marginLeft:"auto",fontSize:11,color:"#1A6B4A",fontWeight:600}}>✓ Vän</span>}
                          </div>
                        );})()}
                        <div style={{display:"flex",gap:8,marginBottom:10}}>
                          <span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:12,padding:"4px 12px",fontSize:13,fontWeight:600}}>👥 {counts[curCard.id]||0}/{curCard.max_deltagare}</span>
                          <span style={{background:"#F0EDE8",borderRadius:12,padding:"4px 12px",fontSize:13,color:"#666"}}>{dateLabel(curCard.datum,curCard.tid)}</span>
                        </div>
                        <p style={{fontSize:14,color:"#555",lineHeight:1.6,margin:0}}>{curCard.beskrivning||"Kom och häng!"}</p>
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:20,alignItems:"center"}}>
                    <button onClick={()=>doSwipe("left")} style={{width:68,height:68,borderRadius:"50%",background:"white",border:"none",fontSize:26,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",color:"#E53E3E"}}>✕</button>
                    <button onClick={()=>{setSelAct(curCard);fetchActParts(curCard.id,curCard.skapad_av);go("detail");}} style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"none",fontSize:20,cursor:"pointer"}}>ℹ️</button>
                    <button onClick={()=>doSwipe("right")} style={{width:68,height:68,borderRadius:"50%",background:"white",border:"none",fontSize:26,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.2)",color:"#1A6B4A"}}>✓</button>
                  </div>
                  <div style={{color:"rgba(255,255,255,0.6)",fontSize:12}}>Swipa höger för att gå med · vänster för att skippa</div>
                </>
              ):(
                <div style={{textAlign:"center",color:"white"}}>
                  <div style={{fontSize:72,marginBottom:16}}>🎉</div>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,marginBottom:8}}>Du har sett allt!</div>
                  <button onClick={()=>{setSwipeIdx(0);go("home");}} style={{background:"white",border:"none",borderRadius:20,padding:"14px 28px",color:"#1A6B4A",fontWeight:700,cursor:"pointer",fontSize:15}}>← Tillbaka</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DETAIL */}
        {screen==="detail"&&selAct&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
            <div style={{background:color(selAct.typ),padding:"52px 24px 24px"}}>
              <button onClick={()=>go("home")} style={S.back}>← Tillbaka</button>
              <div style={{fontSize:52}}>{emoji(selAct.typ)}</div>
              <div style={{fontFamily:"'Fraunces',serif",color:"white",fontSize:24,fontWeight:700,marginTop:8}}>{selAct.titel}</div>
              <div style={{color:"rgba(255,255,255,0.8)",fontSize:13,marginTop:4}}>{dateLabel(selAct.datum,selAct.tid)} · {selAct.tid}</div>
            </div>
            <div style={S.scroll}>
              {(()=>{const st=statusLabel(counts[selAct.id]||0,selAct.max_deltagare);return(
                <div style={{background:st.bg,borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:20}}>{st.text.split(" ")[0]}</span>
                  <div><div style={{fontSize:14,fontWeight:600,color:st.color}}>{st.text}</div><div style={{fontSize:12,color:"#888"}}>{counts[selAct.id]||0} av {selAct.max_deltagare} platser fyllda</div></div>
                </div>
              );})()}

              {myParts.includes(selAct.id)&&<div style={{background:"#E8F5EE",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:10,border:"1px solid #B8DFC4"}}><span style={{fontSize:20}}>✅</span><span style={{fontSize:14,fontWeight:600,color:"#1A6B4A"}}>Du är anmäld!</span></div>}

              {/* Creator card */}
              {actCreator&&(
                <div style={{...S.card,padding:16,display:"flex",alignItems:"center",gap:12}}>
                  <Av p={actCreator} size={48} onClick={()=>{setViewProf(actCreator);setPrevScreen("detail");go("viewprofile");}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:11,color:"#888"}}>Skapad av</div>
                    <div style={{fontSize:15,fontWeight:700}}>{actCreator.namn}</div>
                    <div style={{fontSize:12,color:"#888"}}>📍 {actCreator.stad} · {actCreator.hedersemblem||"🌱"}</div>
                  </div>
                  {actCreator.id!==user?.id&&(
                    isFriend(actCreator.id)
                      ?<span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:12,padding:"6px 12px",fontSize:12,fontWeight:600}}>✓ Vän</span>
                      :<button onClick={()=>sendFriendReq(actCreator.id)} style={{background:"#1A6B4A",border:"none",borderRadius:12,padding:"6px 12px",color:"white",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Lägg till vän</button>
                  )}
                </div>
              )}

              <div style={{...S.card,padding:18}}>
                {[["📍 Plats",selAct.plats||selAct.stad||"Ej angiven"],["🏙️ Stad",selAct.stad||"Ej angiven"],["📅 Datum",selAct.datum],["⏰ Tid",selAct.tid||"Ej angiven"],["👥 Anmälda",`${counts[selAct.id]||0} av ${selAct.max_deltagare}`],["🎯 Typ",selAct.typ]].map(([l,v])=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #F5F3EE"}}>
                    <span style={{fontSize:13,color:"#888"}}>{l}</span><span style={{fontSize:13,fontWeight:500}}>{v}</span>
                  </div>
                ))}
              </div>

              {selAct.beskrivning&&<div style={{...S.card,padding:18}}><label style={S.lbl}>Om aktiviteten</label><p style={{fontSize:14,color:"#555",lineHeight:1.7,margin:0}}>{selAct.beskrivning}</p></div>}

              {/* Participants */}
              {actParts.length>0&&(
                <div style={{...S.card,padding:18}}>
                  <label style={S.lbl}>Anmälda ({actParts.length})</label>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    {actParts.map((p,i)=>(
                      <div key={i} onClick={()=>{if(p.profiles){setViewProf(p.profiles);setPrevScreen("detail");go("viewprofile");}}} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:"pointer"}}>
                        <Av p={p.profiles} size={40}/>
                        <div style={{fontSize:10,color:"#888",maxWidth:48,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.profiles?.namn?.split(" ")[0]||"?"}</div>
                        {friends.some(f=>f.id===p.anvandare_id)&&<div style={{fontSize:9,color:"#1A6B4A",fontWeight:600}}>Vän ✓</div>}
                      </div>
                    ))}
                    {Array.from({length:Math.max(0,selAct.max_deltagare-actParts.length)}).map((_,i)=>(
                      <div key={`e${i}`} style={{width:40,height:40,borderRadius:"50%",background:"#F0EDE8",border:"2px dashed #CCC",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:"#CCC"}}>+</div>
                    ))}
                  </div>
                </div>
              )}

              {/* Invite friends */}
              {friends.length>0&&(
                <div style={{...S.card,padding:18}}>
                  <label style={S.lbl}>Bjud in vänner</label>
                  <div style={{display:"flex",gap:10,overflowX:"auto",scrollbarWidth:"none"}}>
                    {friends.map(f=>(
                      <div key={f.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
                        <Av p={f} size={44}/>
                        <div style={{fontSize:11,color:"#555",maxWidth:60,textAlign:"center",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{f.namn?.split(" ")[0]}</div>
                        <button onClick={()=>inviteFriend(f.id,selAct.id)} style={{background:"#1A6B4A",border:"none",borderRadius:10,padding:"4px 10px",color:"white",fontSize:11,fontWeight:600,cursor:"pointer"}}>Bjud in</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <a href={`https://wa.me/?text=Kolla in: ${selAct.titel} den ${selAct.datum} i ${selAct.stad}! movetogether-karlskrona.vercel.app`} target="_blank" rel="noreferrer" style={{background:"#25D366",border:"none",borderRadius:16,padding:14,color:"white",fontSize:15,fontWeight:700,cursor:"pointer",textAlign:"center",display:"block",textDecoration:"none"}}>💬 Dela via WhatsApp</a>

              {myParts.includes(selAct.id)
                ?<button onClick={()=>leaveAct(selAct.id)} style={S.btn("#FEF3E7","#854F0B")}>Avanmäl mig</button>
                :<button onClick={()=>joinAct(selAct.id)} style={S.btn()} disabled={(counts[selAct.id]||0)>=selAct.max_deltagare}>{(counts[selAct.id]||0)>=selAct.max_deltagare?"🔴 Fullbokad":"Gå med i aktiviteten →"}</button>
              }
              <div style={{height:20}}/>
            </div>
          </div>
        )}

        {/* VIEW PROFILE */}
        {screen==="viewprofile"&&viewProf&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
            <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 24px",textAlign:"center",position:"relative"}}>
              <button onClick={()=>go(prevScreen)} style={{...S.back,position:"absolute",top:52,left:24}}>← Tillbaka</button>
              <Av p={viewProf} size={80}/>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700,color:"white",marginTop:12}}>{viewProf.namn}</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.7)",marginTop:4}}>📍 {viewProf.stad}</div>
              <div style={{marginTop:8}}><span style={{background:"rgba(255,255,255,0.2)",borderRadius:12,padding:"4px 14px",color:"white",fontSize:13}}>{viewProf.hedersemblem||"🌱 Ny medlem"}</span></div>
            </div>
            <div style={S.scroll}>
              {viewProf.bio&&<div style={{...S.card,padding:18}}><label style={S.lbl}>Om</label><p style={{fontSize:14,color:"#555",margin:0,lineHeight:1.6}}>{viewProf.bio}</p></div>}
              {viewProf.id!==user?.id&&(
                isFriend(viewProf.id)
                  ?<div style={{...S.card,padding:16,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:24}}>🤝</span><div style={{flex:1}}><div style={{fontWeight:600}}>Ni är vänner!</div><div style={{fontSize:12,color:"#888"}}>Du kan bjuda in {viewProf.namn?.split(" ")[0]} till aktiviteter</div></div></div>
                  :<button onClick={()=>sendFriendReq(viewProf.id)} style={S.btn()}>🤝 Lägg till som vän</button>
              )}
              <div style={{height:20}}/>
            </div>
          </div>
        )}

        {/* CREATE */}
        {screen==="create"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
            <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 24px"}}>
              <button onClick={()=>go("home")} style={S.back}>← Tillbaka</button>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,color:"white"}}>Skapa aktivitet</div>
              <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:4}}>Sätt igång något i Sverige!</div>
            </div>
            <div style={S.scroll}>
              <div style={{...S.card,padding:18}}>
                <label style={S.lbl}>Aktivitetstyp</label>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {ACT_TYPES.map(({type:t,emoji:e})=>(
                    <button key={t} onClick={()=>setCreateForm(f=>({...f,type:t}))} style={{border:"none",borderRadius:14,padding:"10px 6px",cursor:"pointer",textAlign:"center",background:createForm.type===t?"#E8F5EE":"#F5F3EE",outline:createForm.type===t?"2px solid #1A6B4A":"none"}}>
                      <div style={{fontSize:22}}>{e}</div>
                      <div style={{fontSize:11,fontWeight:500,color:createForm.type===t?"#1A6B4A":"#666",marginTop:3}}>{t}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{...S.card,padding:18,display:"flex",flexDirection:"column",gap:14}}>
                <div><label style={S.lbl}>Titel</label><input type="text" placeholder="t.ex. Morgonlöpning i parken" value={createForm.titel} onChange={e=>setCreateForm(f=>({...f,titel:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Stad</label><select style={S.inp} value={createForm.stad} onChange={e=>setCreateForm(f=>({...f,stad:e.target.value,plats:e.target.value}))}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
                <div><label style={S.lbl}>Exakt plats</label><input type="text" placeholder="t.ex. Kungsmarken parkeringen" value={createForm.plats} onChange={e=>setCreateForm(f=>({...f,plats:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Datum</label><input type="date" value={createForm.datum} onChange={e=>setCreateForm(f=>({...f,datum:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Tid</label><input type="time" value={createForm.tid} onChange={e=>setCreateForm(f=>({...f,tid:e.target.value}))} style={S.inp}/></div>
                <div><label style={S.lbl}>Nivå</label><select value={createForm.niva} onChange={e=>setCreateForm(f=>({...f,niva:e.target.value}))} style={S.inp}>{["Alla nivåer","Nybörjare","Medel","Avancerad"].map(n=><option key={n}>{n}</option>)}</select></div>
                <div><label style={S.lbl}>Max deltagare</label><select value={createForm.max_deltagare} onChange={e=>setCreateForm(f=>({...f,max_deltagare:e.target.value}))} style={S.inp}>{["2","4","6","8","10","15","20","50"].map(n=><option key={n}>{n} personer</option>)}</select></div>
                <div><label style={S.lbl}>Beskrivning</label><textarea rows={3} placeholder="Berätta om aktiviteten..." value={createForm.beskrivning} onChange={e=>setCreateForm(f=>({...f,beskrivning:e.target.value}))} style={{...S.inp,resize:"none"}}/></div>
              </div>
              <button onClick={createAct} style={S.btn()} disabled={loading}>{loading?"Publicerar...":"Publicera aktivitet 🚀"}</button>
              <div style={{height:20}}/>
            </div>
          </div>
        )}

        {/* COACH */}
        {screen==="coach"&&<CoachScreen onBack={()=>go("home")}/>}

        {/* PROFILE */}
        {screen==="profile"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh"}}>
            <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 20px",position:"relative"}}>
              <button onClick={()=>go("home")} style={{...S.back,position:"absolute",top:52,left:24}}>← Tillbaka</button>
              <div style={{textAlign:"center"}}>
                <div style={{position:"relative",width:90,height:90,margin:"0 auto 12px"}}>
                  {profile?.profilbild_url?<img src={profile.profilbild_url} alt="" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover",border:"3px solid rgba(255,255,255,0.3)"}}/>:<div style={{width:90,height:90,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:700,color:"white",border:"3px solid rgba(255,255,255,0.3)"}}>{profile?.namn?.substring(0,2).toUpperCase()||"??"}</div>}
                  <button onClick={()=>fileRef.current?.click()} style={{position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:"white",border:"none",fontSize:14,cursor:"pointer",boxShadow:"0 2px 8px rgba(0,0,0,0.2)"}}>{uploadingPhoto?"⏳":"📷"}</button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={doPhotoUpload} style={{display:"none"}}/>
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
                {[["info","👤"],["friends","👥"],["history","📊"],["stats","🏆"]].map(([t,l])=>(
                  <button key={t} onClick={()=>setProfTab(t)} style={{flex:1,border:"none",borderRadius:12,padding:"8px 2px",fontSize:12,fontWeight:600,cursor:"pointer",background:profTab===t?"white":"transparent",color:profTab===t?"#1A6B4A":"rgba(255,255,255,0.8)",position:"relative"}}>
                    {l}
                    {t==="friends"&&friendReqs.length>0&&<span style={{position:"absolute",top:-2,right:-2,background:"#E53E3E",color:"white",borderRadius:"50%",width:14,height:14,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{friendReqs.length}</span>}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.scroll}>
              {profTab==="info"&&<>
                {!editingProf?<button onClick={()=>setEditingProf(true)} style={S.btn("#F5F3EE","#1A6B4A")}>✏️ Redigera profil</button>:(
                  <div style={{...S.card,padding:18,display:"flex",flexDirection:"column",gap:12}}>
                    <div><label style={S.lbl}>Namn</label><input style={S.inp} value={editForm.namn} onChange={e=>setEditForm(f=>({...f,namn:e.target.value}))}/></div>
                    <div><label style={S.lbl}>Stad</label><select style={S.inp} value={editForm.stad} onChange={e=>setEditForm(f=>({...f,stad:e.target.value}))}>{CITIES.map(c=><option key={c}>{c}</option>)}</select></div>
                    <div><label style={S.lbl}>Bio</label><textarea rows={2} style={{...S.inp,resize:"none"}} value={editForm.bio} onChange={e=>setEditForm(f=>({...f,bio:e.target.value}))}/></div>
                    <div style={{display:"flex",gap:10}}><button onClick={()=>setEditingProf(false)} style={{...S.btn("#F5F3EE","#888"),flex:1}}>Avbryt</button><button onClick={doSaveProfile} style={{...S.btn(),flex:1}} disabled={loading}>{loading?"Sparar...":"Spara"}</button></div>
                  </div>
                )}
                {profile?.bio&&!editingProf&&<div style={{...S.card,padding:18}}><label style={S.lbl}>Om mig</label><p style={{fontSize:14,color:"#555",margin:0,lineHeight:1.6}}>{profile.bio}</p></div>}
                <div style={{background:"linear-gradient(135deg,#FF6B35,#FF8C55)",borderRadius:20,padding:"14px 18px",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:32}}>🔥</span><div><div style={{fontWeight:700,color:"white",fontSize:15}}>{profile?.streak||1} vecka i rad aktiv!</div><div style={{fontSize:12,color:"rgba(255,255,255,0.85)"}}>Fortsätt – du är på en streak!</div></div>
                </div>
                <div style={{...S.card,padding:18}}><label style={S.lbl}>Ditt emblem</label><span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:20,padding:"6px 14px",fontSize:14,fontWeight:500}}>{getBadge(myParts.length)}</span></div>
                <button onClick={doLogout} style={S.btn("#FEF3E7","#E53E3E")}>Logga ut</button>
              </>}

              {profTab==="friends"&&<>
                {friendReqs.length>0&&(
                  <div style={{...S.card,padding:18}}>
                    <label style={S.lbl}>Vänförfrågningar ({friendReqs.length})</label>
                    {friendReqs.map(req=>(
                      <div key={req.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F5F3EE"}}>
                        <Av p={req.requester} size={44}/>
                        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{req.requester?.namn}</div><div style={{fontSize:12,color:"#888"}}>📍 {req.requester?.stad}</div></div>
                        <button onClick={()=>acceptFriend(req.id,req.user_id)} style={{background:"#1A6B4A",border:"none",borderRadius:10,padding:"6px 12px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer"}}>✓</button>
                        <button onClick={()=>declineFriend(req.id)} style={{background:"#F5F3EE",border:"none",borderRadius:10,padding:"6px 12px",color:"#888",fontSize:13,fontWeight:600,cursor:"pointer"}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{...S.card,padding:18}}>
                  <label style={S.lbl}>Hitta folk</label>
                  <div style={{position:"relative",marginBottom:12}}>
                    <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:"#AAA"}}>🔍</span>
                    <input style={{...S.inp,paddingLeft:36,fontSize:14}} placeholder="Sök på namn eller stad..." value={friendSearch} onChange={e=>setFriendSearch(e.target.value)}/>
                  </div>
                  {friendSearch&&allProfiles.filter(p=>p.id!==user?.id&&(p.namn?.toLowerCase().includes(friendSearch.toLowerCase())||p.stad?.toLowerCase().includes(friendSearch.toLowerCase()))).slice(0,8).map(p=>(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F5F3EE"}}>
                      <Av p={p} size={44} onClick={()=>{setViewProf(p);setPrevScreen("profile");go("viewprofile");}}/>
                      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{p.namn}</div><div style={{fontSize:12,color:"#888"}}>📍 {p.stad} · {p.hedersemblem||"🌱"}</div></div>
                      {isFriend(p.id)?<span style={{background:"#E8F5EE",color:"#1A6B4A",borderRadius:12,padding:"4px 10px",fontSize:12,fontWeight:600}}>✓ Vän</span>:<button onClick={()=>sendFriendReq(p.id)} style={{background:"#1A6B4A",border:"none",borderRadius:12,padding:"6px 12px",color:"white",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Lägg till</button>}
                    </div>
                  ))}
                </div>
                <div style={{...S.card,padding:18}}>
                  <label style={S.lbl}>Mina vänner ({friends.length})</label>
                  {friends.length===0?<div style={{textAlign:"center",padding:24,color:"#888"}}><div style={{fontSize:40,marginBottom:8}}>👥</div><div style={{fontSize:13}}>Inga vänner än – sök efter folk ovan!</div></div>:(
                    friends.map(f=>(
                      <div key={f.id} onClick={()=>{setViewProf(f);setPrevScreen("profile");go("viewprofile");}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:"1px solid #F5F3EE",cursor:"pointer"}}>
                        <Av p={f} size={44}/>
                        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{f.namn}</div><div style={{fontSize:12,color:"#888"}}>📍 {f.stad} · {f.hedersemblem||"🌱"}</div></div>
                        <span style={{fontSize:18,color:"#AAA"}}>›</span>
                      </div>
                    ))
                  )}
                </div>
              </>}

              {profTab==="history"&&<>
                {myHistory.length>0&&(
                  <div style={{background:"linear-gradient(135deg,#1A6B4A,#0D3D2B)",borderRadius:24,padding:20,color:"white"}}>
                    <div style={{fontSize:12,opacity:0.75,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>Min aktivitetsresa 🌿</div>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,marginBottom:4}}>{myHistory.length} aktiviteter</div>
                    <div style={{fontSize:14,opacity:0.85,marginBottom:12}}>avklarade med MoveTogether</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      {Object.entries(stats.tc||{}).sort((a,b)=>b[1]-a[1]).slice(0,4).map(([typ,cnt])=>(
                        <div key={typ} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"6px 12px",display:"flex",alignItems:"center",gap:6}}>
                          <span style={{fontSize:16}}>{emoji(typ)}</span><span style={{fontSize:13,fontWeight:600}}>{cnt}x {typ}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:10,fontSize:12,opacity:0.7}}>📍 {stats.cities} städer · {getBadge(myParts.length)}</div>
                  </div>
                )}
                {myHistory.length===0?<div style={{textAlign:"center",padding:48,color:"#888"}}><div style={{fontSize:56,marginBottom:12}}>📊</div><div style={{fontWeight:600,marginBottom:8}}>Ingen historik än!</div><div style={{fontSize:13}}>Gå med i aktiviteter – de visas här när de avslutats</div></div>:(
                  myHistory.map(act=>(
                    <div key={act.id} style={{...S.card,padding:0,overflow:"hidden"}}>
                      <div style={{background:color(act.typ),padding:"12px 16px",display:"flex",alignItems:"center",gap:12}}>
                        <span style={{fontSize:28}}>{emoji(act.typ)}</span>
                        <div style={{flex:1}}><div style={{color:"white",fontWeight:700,fontSize:14}}>{act.titel}</div><div style={{color:"rgba(255,255,255,0.8)",fontSize:12,marginTop:2}}>📍 {act.plats||act.stad}</div></div>
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

              {profTab==="stats"&&<>
                <div style={{...S.card,padding:20}}>
                  <label style={S.lbl}>Din aktivitetsprofil</label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:8}}>
                    {[["🏁","Genomförda",myHistory.length],["👥","Vänner",friends.length],["🏙️","Städer",stats.cities],["🔥","Streak",profile?.streak||1]].map(([ic,lbl,val])=>(
                      <div key={lbl} style={{background:"#F5F3EE",borderRadius:16,padding:"14px",textAlign:"center"}}>
                        <div style={{fontSize:28,marginBottom:4}}>{ic}</div>
                        <div style={{fontSize:22,fontWeight:700,color:"#1A1A1A"}}>{val}</div>
                        <div style={{fontSize:11,color:"#888",marginTop:2}}>{lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {stats.favType&&(
                  <div style={{background:`linear-gradient(135deg,${color(stats.favType)},${color(stats.favType)}CC)`,borderRadius:20,padding:"16px 20px",color:"white"}}>
                    <div style={{fontSize:12,opacity:0.8,marginBottom:4}}>FAVORITAKTIVITET</div>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <span style={{fontSize:40}}>{emoji(stats.favType)}</span>
                      <div><div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700}}>{stats.favType}</div><div style={{fontSize:13,opacity:0.85}}>{stats.favCount} gånger</div></div>
                    </div>
                  </div>
                )}
                <div style={{...S.card,padding:18}}>
                  <label style={S.lbl}>Emblem-framsteg</label>
                  {Object.entries(BADGES).map(([req,badge])=>{
                    const n=parseInt(req);const done=myParts.length>=n;
                    return<div key={req} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid #F5F3EE",opacity:done?1:0.4}}>
                      <span style={{fontSize:20}}>{done?"✅":"🔒"}</span>
                      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:done?600:400}}>{badge}</div><div style={{fontSize:12,color:"#888"}}>{n} aktiviteter</div></div>
                      {done&&<span style={{fontSize:12,color:"#1A6B4A",fontWeight:600}}>Upplåst!</span>}
                    </div>;
                  })}
                </div>
                <div style={{...S.card,padding:18}}>
                  <label style={S.lbl}>Mina anmälningar ({myParts.length})</label>
                  {acts.filter(a=>myParts.includes(a.id)&&!expired(a.datum,a.tid)).map(act=>(
                    <div key={act.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:"1px solid #F5F3EE"}}>
                      <span style={{fontSize:22}}>{emoji(act.typ)}</span>
                      <div style={{flex:1}}><div style={{fontSize:14,fontWeight:500}}>{act.titel}</div><div style={{fontSize:12,color:"#888"}}>{dateLabel(act.datum,act.tid)} · {act.plats||act.stad}</div></div>
                      <button onClick={()=>leaveAct(act.id)} style={{background:"#FEF3E7",border:"none",borderRadius:10,padding:"6px 10px",fontSize:12,color:"#854F0B",cursor:"pointer",fontWeight:500}}>Avanmäl</button>
                    </div>
                  ))}
                  {acts.filter(a=>myParts.includes(a.id)&&!expired(a.datum,a.tid)).length===0&&<div style={{fontSize:13,color:"#888",textAlign:"center",padding:20}}>Inga kommande anmälningar</div>}
                </div>
              </>}
              <div style={{height:20}}/>
            </div>
          </div>
        )}

        {/* BOTTOM NAV */}
        {screen!=="swipe"&&(
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"white",borderTop:"1px solid #F0EDE8",display:"flex",padding:"10px 0 24px",boxShadow:"0 -4px 20px rgba(0,0,0,0.06)",zIndex:50}}>
            {[["home","🗺️","Utforska"],["swipe","✨","Swipa"],["coach","🧠","Coach"],["create","➕","Skapa"],["profile","👤","Profil"]].map(([s,ic,lbl])=>(
              <button key={s} onClick={()=>go(s)} style={{flex:1,background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3,position:"relative"}}>
                {s==="profile"&&profile?.profilbild_url?<img src={profile.profilbild_url} alt="" style={{width:22,height:22,borderRadius:"50%",objectFit:"cover",border:screen==="profile"?"2px solid #1A6B4A":"2px solid transparent"}}/>:<span style={{fontSize:20}}>{ic}</span>}
                <span style={{fontSize:9,fontWeight:600,color:screen===s?"#1A6B4A":"#AAA"}}>{lbl}</span>
                {screen===s&&<div style={{width:4,height:4,borderRadius:"50%",background:"#1A6B4A"}}/>}
                {s==="profile"&&friendReqs.length>0&&<span style={{position:"absolute",top:2,right:10,background:"#E53E3E",color:"white",borderRadius:"50%",width:14,height:14,fontSize:9,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{friendReqs.length}</span>}
              </button>
            ))}
          </div>
        )}

        {toast&&<div style={{position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:toast.c,color:"white",borderRadius:16,padding:"14px 24px",fontSize:14,fontWeight:500,textAlign:"center",boxShadow:"0 8px 24px rgba(0,0,0,0.2)",zIndex:100,whiteSpace:"nowrap"}}>{toast.msg}</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COACH SCREEN - Träningsprogram + Rundförslag
// ═══════════════════════════════════════════════════

const WORKOUTS = {
  "Bröst":{emoji:"💪",color:"#C4462A",nybörjare:[{namn:"Push-ups",sets:3,reps:"8-10",vila:"60s",tips:"Håll kroppen rak som en planka. Sänk bröstet till golvet."},{namn:"Incline Push-ups",sets:3,reps:"10-12",vila:"60s",tips:"Händerna på bänk – lättare variant för nybörjare."},{namn:"Dumbbell Chest Press",sets:3,reps:"10",vila:"90s",tips:"Ligg på bänk, pressa upp rakt över bröstet."},{namn:"Cable Crossover",sets:3,reps:"12",vila:"60s",tips:"Kontrollerat rörelsemönster, känn bröstet arbeta."}],medel:[{namn:"Barbell Bench Press",sets:4,reps:"8-10",vila:"90s",tips:"Skulderbladen ihop, sänk stången till bröstet."},{namn:"Incline Dumbbell Press",sets:3,reps:"10",vila:"90s",tips:"45° lutning, aktiverar övre bröstmuskeln."},{namn:"Dips (bröst)",sets:3,reps:"10-12",vila:"90s",tips:"Luta dig framåt för att aktivera bröstet mer."},{namn:"Cable Flyes",sets:3,reps:"12-15",vila:"60s",tips:"Stretch i botten, squeeze i toppen."},{namn:"Push-up variationer",sets:3,reps:"Till failure",vila:"60s",tips:"Wide, normal och diamond push-ups."}],avancerad:[{namn:"Barbell Bench Press",sets:5,reps:"5",vila:"3min",tips:"Progressiv överbelastning – öka vikt varje vecka."},{namn:"Incline Barbell Press",sets:4,reps:"6-8",vila:"2min",tips:"Övre bröst prioritering."},{namn:"Weighted Dips",sets:4,reps:"8",vila:"2min",tips:"Bälte med extra vikt."},{namn:"Dumbbell Flyes",sets:3,reps:"12",vila:"90s",tips:"Maximalt stretch i botten."},{namn:"Cable Crossover (drop set)",sets:3,reps:"10+10",vila:"60s",tips:"Minska vikten direkt och fortsätt."},{namn:"Push-up burnout",sets:2,reps:"Till failure",vila:"60s",tips:"Avsluta med maxreps."}]},
  "Rygg":{emoji:"🔙",color:"#185FA5",nybörjare:[{namn:"Assisted Pull-ups",sets:3,reps:"8",vila:"90s",tips:"Använd maskin eller gummiband för hjälp."},{namn:"Seated Cable Row",sets:3,reps:"12",vila:"60s",tips:"Dra armbågarna bakåt, håll ryggen rak."},{namn:"Lat Pulldown",sets:3,reps:"12",vila:"60s",tips:"Dra ner till bröstet, känn latsen arbeta."},{namn:"Superman",sets:3,reps:"15",vila:"45s",tips:"Lyft armar och ben samtidigt från golvet."}],medel:[{namn:"Pull-ups",sets:4,reps:"6-8",vila:"2min",tips:"Full ROM, känn latsen i botten."},{namn:"Barbell Row",sets:4,reps:"8-10",vila:"90s",tips:"Dra mot naveln, håll ryggen plan."},{namn:"Lat Pulldown (bred)",sets:3,reps:"10-12",vila:"90s",tips:"Brett grepp aktiverar lats mer."},{namn:"Seated Cable Row",sets:3,reps:"12",vila:"60s",tips:"Squeeze i slutet av rörelsen."},{namn:"Face Pulls",sets:3,reps:"15",vila:"60s",tips:"Dra mot ansiktet, rotera axlarna utåt."}],avancerad:[{namn:"Weighted Pull-ups",sets:5,reps:"5-6",vila:"3min",tips:"Bälte med extra vikt för progression."},{namn:"Pendlay Row",sets:4,reps:"6",vila:"2min",tips:"Explosiv rörelse från golvet."},{namn:"T-Bar Row",sets:4,reps:"8",vila:"2min",tips:"Tungt och effektivt för tjocklek."},{namn:"Meadows Row",sets:3,reps:"10",vila:"90s",tips:"Unilateral – fokus på en sida åt gången."},{namn:"Straight Arm Pulldown",sets:3,reps:"15",vila:"60s",tips:"Isolerar latsen perfekt."}]},
  "Ben":{emoji:"🦵",color:"#1A6B4A",nybörjare:[{namn:"Bodyweight Squat",sets:3,reps:"15",vila:"60s",tips:"Fötter axelbredd, knän följer tårna."},{namn:"Lunges",sets:3,reps:"10/sida",vila:"60s",tips:"Axelbredds steg, bakre knät mot golvet."},{namn:"Leg Press",sets:3,reps:"12",vila:"90s",tips:"Medelhögt fotstöd, knän utåt."},{namn:"Leg Curl",sets:3,reps:"12",vila:"60s",tips:"Kontrollerad rörelse ner och upp."}],medel:[{namn:"Barbell Back Squat",sets:4,reps:"8-10",vila:"2min",tips:"Bröstet upp, sätet ner, djup squat."},{namn:"Romanian Deadlift",sets:3,reps:"10",vila:"90s",tips:"Känn hamstrings sträcka i botten."},{namn:"Leg Press",sets:4,reps:"12",vila:"90s",tips:"Öka vikten progressivt."},{namn:"Walking Lunges",sets:3,reps:"12/sida",vila:"90s",tips:"Med hantlar för extra motstånd."},{namn:"Calf Raises",sets:4,reps:"20",vila:"45s",tips:"Fullt ROM, stretch i botten."}],avancerad:[{namn:"Barbell Back Squat",sets:5,reps:"5",vila:"3min",tips:"Tung och djup – progressiv overload."},{namn:"Front Squat",sets:4,reps:"6-8",vila:"2min",tips:"Aktiverar quads mer än back squat."},{namn:"Bulgarian Split Squat",sets:4,reps:"8/sida",vila:"2min",tips:"Utmanande unilateral rörelse."},{namn:"Hack Squat",sets:4,reps:"10",vila:"2min",tips:"Maskin – isolerar quads."},{namn:"Stiff-Leg Deadlift",sets:3,reps:"10",vila:"90s",tips:"Hamstring-fokus med raka ben."},{namn:"Seated Calf Raises",sets:5,reps:"20",vila:"45s",tips:"Soleus-fokus med böjda knän."}]},
  "Axlar":{emoji:"🏋️",color:"#6B4AA8",nybörjare:[{namn:"Dumbbell Shoulder Press",sets:3,reps:"10",vila:"60s",tips:"Pressa rakt upp, armbågar 90°."},{namn:"Lateral Raises",sets:3,reps:"12",vila:"60s",tips:"Lätt vikt, kontrollerad rörelse."},{namn:"Front Raises",sets:3,reps:"12",vila:"60s",tips:"Växelvis eller simultant."},{namn:"Face Pulls",sets:3,reps:"15",vila:"60s",tips:"Skyddar axelleden långsiktigt."}],medel:[{namn:"Barbell Overhead Press",sets:4,reps:"8",vila:"2min",tips:"Stå eller sitt, pressa rakt upp."},{namn:"Arnold Press",sets:3,reps:"10",vila:"90s",tips:"Rotera hantlarna under pressrörelsen."},{namn:"Lateral Raises",sets:4,reps:"15",vila:"60s",tips:"Lätt vikt, hög rep – bäst för sidodelt."},{namn:"Rear Delt Flyes",sets:3,reps:"15",vila:"60s",tips:"Böj framåt, lyft armbågarna bakåt."},{namn:"Cable Upright Row",sets:3,reps:"12",vila:"60s",tips:"Dra upp till hakan, armbågar högt."}],avancerad:[{namn:"Barbell Push Press",sets:5,reps:"5",vila:"3min",tips:"Explosiv – använd benhjälp."},{namn:"Lateral Raises (drop set)",sets:4,reps:"12+12",vila:"60s",tips:"Minska vikt och fortsätt direkt."},{namn:"Cable Face Pulls",sets:4,reps:"20",vila:"60s",tips:"Hög rep, fokus på bakre delt."},{namn:"Seated Dumbbell Press",sets:4,reps:"10",vila:"90s",tips:"Kontrollerad press utan hjälp från benen."},{namn:"Upright Row",sets:3,reps:"12",vila:"90s",tips:"Brett grepp för mer deltoid-aktivering."}]},
  "Armar":{emoji:"💪",color:"#854F0B",nybörjare:[{namn:"Dumbbell Curl",sets:3,reps:"12",vila:"60s",tips:"Håll armbågen still, curl upp."},{namn:"Tricep Pushdown",sets:3,reps:"12",vila:"60s",tips:"Armbågen vid sidan, sträck ut helt."},{namn:"Hammer Curl",sets:3,reps:"10",vila:"60s",tips:"Neutralt grepp – tränar brachialis."},{namn:"Overhead Tricep Extension",sets:3,reps:"12",vila:"60s",tips:"Håll armbågen still bakom huvudet."}],medel:[{namn:"Barbell Curl",sets:4,reps:"10",vila:"60s",tips:"Fullt ROM, känn bicepsen i toppen."},{namn:"Skull Crushers",sets:4,reps:"10",vila:"90s",tips:"Sänk till pannan, sträck upp."},{namn:"Incline Dumbbell Curl",sets:3,reps:"10",vila:"60s",tips:"Stretch i botten – aktiverar lång huvud."},{namn:"Cable Tricep Pushdown",sets:3,reps:"15",vila:"60s",tips:"Pressa ner, håll armbågen stilla."},{namn:"Concentration Curl",sets:3,reps:"12",vila:"60s",tips:"Isolerar bicepsen maximalt."}],avancerad:[{namn:"Barbell Curl (21s)",sets:3,reps:"21",vila:"90s",tips:"7 nere, 7 uppe, 7 full ROM."},{namn:"Close-grip Bench Press",sets:4,reps:"8",vila:"2min",tips:"Tungt tryck för triceps massa."},{namn:"Cable Curl",sets:4,reps:"12",vila:"60s",tips:"Konstant spänning genom hela rörelsen."},{namn:"French Press",sets:4,reps:"10",vila:"90s",tips:"Lång huvud triceps fokus."},{namn:"Preacher Curl",sets:3,reps:"10",vila:"60s",tips:"Eliminerar fusk – ren bicep-rörelse."},{namn:"Diamond Push-ups",sets:3,reps:"Till failure",vila:"60s",tips:"Triceps burnout på slutet."}]},
  "Mage/Core":{emoji:"🎯",color:"#0E7490",nybörjare:[{namn:"Crunches",sets:3,reps:"15",vila:"45s",tips:"Lyft skuldror, inte nacken."},{namn:"Planka",sets:3,reps:"30s",vila:"45s",tips:"Rak kropp, aktivera magen."},{namn:"Leg Raises",sets:3,reps:"10",vila:"45s",tips:"Kontrollera ner mot golvet."},{namn:"Mountain Climbers",sets:3,reps:"20",vila:"45s",tips:"Snabbt men kontrollerat."}],medel:[{namn:"Cable Crunch",sets:4,reps:"15",vila:"60s",tips:"Böj i midjan, inte höften."},{namn:"Hanging Leg Raises",sets:4,reps:"12",vila:"60s",tips:"Lyft benen rakt eller böjda."},{namn:"Russian Twists",sets:3,reps:"20",vila:"45s",tips:"Med vikt för mer motstånd."},{namn:"Ab Rollout",sets:3,reps:"10",vila:"60s",tips:"Rull ut långsamt, dra in."},{namn:"Side Planka",sets:3,reps:"30s/sida",vila:"45s",tips:"Höften upp, kroppen rak."}],avancerad:[{namn:"Dragon Flag",sets:4,reps:"6-8",vila:"90s",tips:"Extrem core-övning. Kontrollerat."},{namn:"Weighted Cable Crunch",sets:4,reps:"15",vila:"60s",tips:"Progressiv overload för magen."},{namn:"Toes-to-Bar",sets:4,reps:"10",vila:"60s",tips:"Lyft tårna till stången."},{namn:"Ab Rollout (stående)",sets:3,reps:"8",vila:"90s",tips:"Svåraste varianten av rollout."},{namn:"L-Sit",sets:3,reps:"20s",vila:"60s",tips:"Benen raka och parallella med golvet."}]},
};

const ROUTES=[
  {km:2,tid:"20-25 min",namn:"Kvällspromenad",emoji:"🌙",beskrivning:"Perfekt för återhämtning och mental avkoppling"},
  {km:3,tid:"30-35 min",namn:"Morgonpromenad",emoji:"☀️",beskrivning:"Starta dagen med frisk luft och rörelse"},
  {km:5,tid:"25-30 min",namn:"Löprundan",emoji:"🏃",beskrivning:"Klassiska 5 km – perfekt för nybörjare"},
  {km:7,tid:"35-45 min",namn:"Tempolöpning",emoji:"⚡",beskrivning:"Lite längre med bra tempo"},
  {km:10,tid:"50-60 min",namn:"Långpass",emoji:"🎯",beskrivning:"Bygg uthållighet med ett riktigt långpass"},
  {km:15,tid:"80-90 min",namn:"Halvmarathon-prep",emoji:"🏅",beskrivning:"För dig som siktar på halvmarathon"},
];

function CoachScreen({onBack}){
  const [tab,setTab]=useState("workout");
  const [selMuscle,setSelMuscle]=useState(null);
  const [level,setLevel]=useState("medel");
  const [showProg,setShowProg]=useState(false);
  const [loc,setLoc]=useState(null);
  const [locErr,setLocErr]=useState(null);
  const [selRoute,setSelRoute]=useState(null);
  const mapRef=useRef(null);
  const mapInst=useRef(null);

  useEffect(()=>{
    if(tab==="routes"&&!loc){
      navigator.geolocation?.getCurrentPosition(
        pos=>setLoc({lat:pos.coords.latitude,lng:pos.coords.longitude}),
        ()=>setLocErr("Kunde inte hämta din position. Tillåt platsåtkomst i webbläsaren.")
      );
    }
  },[tab]);

  useEffect(()=>{
    if(tab==="routes"&&loc&&selRoute&&mapRef.current)loadMap();
  },[loc,selRoute,tab]);

  const [routeInfo,setRouteInfo]=useState(null);
  const [loadingRoute,setLoadingRoute]=useState(false);
  const [startAddr,setStartAddr]=useState("");

  const loadMap=async()=>{
    if(!window.L){
      await new Promise(resolve=>{
        const s=document.createElement("script");s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";s.onload=resolve;document.head.appendChild(s);
        const l=document.createElement("link");l.rel="stylesheet";l.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";document.head.appendChild(l);
      });
    }
    await fetchRoute();
  };

  const fetchRoute=async()=>{
    if(!loc||!selRoute||!mapRef.current)return;
    setLoadingRoute(true);
    try{
      // Reverse geocode start position
      const geocodeRes=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json`);
      const geocodeData=await geocodeRes.json();
      const addr=geocodeData.display_name?.split(",").slice(0,2).join(",")||"Din position";
      setStartAddr(addr);

      // Generate waypoints around a loop based on km
      const deg=(selRoute.km/4)/111;
      const waypoints=[
        [loc.lat,loc.lng],
        [loc.lat+deg,loc.lng+deg*0.5],
        [loc.lat+deg*0.5,loc.lng+deg],
        [loc.lat-deg*0.3,loc.lng+deg*0.8],
        [loc.lat,loc.lng]
      ];

      // Fetch real road route from OSRM
      const coords=waypoints.map(([lat,lng])=>`${lng},${lat}`).join(";");
      const osrmRes=await fetch(`https://router.project-osrm.org/route/v1/walking/${coords}?overview=full&geometries=geojson&steps=true`);
      const osrmData=await osrmRes.json();

      if(osrmData.routes&&osrmData.routes[0]){
        const route=osrmData.routes[0];
        const distKm=(route.distance/1000).toFixed(1);
        const timeMin=Math.round(route.duration/60);
        setRouteInfo({distKm,timeMin,steps:route.legs[0]?.steps?.slice(0,6)||[]});
        initMap(route.geometry.coordinates);
      }else{
        initMapFallback();
      }
    }catch(e){
      initMapFallback();
    }
    setLoadingRoute(false);
  };

  const initMap=(routeCoords)=>{
    if(!mapRef.current||!loc)return;
    if(mapInst.current){mapInst.current.remove();mapInst.current=null;}
    const L=window.L;
    const map=L.map(mapRef.current).setView([loc.lat,loc.lng],14);
    mapInst.current=map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);

    // Draw real route
    if(routeCoords){
      const latlngs=routeCoords.map(([lng,lat])=>[lat,lng]);
      L.polyline(latlngs,{color:"#1A6B4A",weight:5,opacity:0.9}).addTo(map);
      map.fitBounds(L.polyline(latlngs).getBounds(),{padding:[20,20]});
    }

    // Start/end marker
    const startIcon=L.divIcon({html:`<div style="width:32px;height:32px;background:#1A6B4A;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 8px rgba(0,0,0,0.3)">🏁</div>`,iconSize:[32,32],iconAnchor:[16,16]});
    L.marker([loc.lat,loc.lng],{icon:startIcon}).addTo(map).bindPopup(`<b>Start & Mål</b><br/>${startAddr||"Din position"}`).openPopup();

    // Waypoint markers
    if(routeCoords&&routeCoords.length>0){
      const quarter=Math.floor(routeCoords.length/4);
      const half=Math.floor(routeCoords.length/2);
      const three=Math.floor(routeCoords.length*3/4);
      [[quarter,"1"],[half,"2"],[three,"3"]].forEach(([idx,n])=>{
        if(routeCoords[idx]){
          const[lng,lat]=routeCoords[idx];
          L.marker([lat,lng],{icon:L.divIcon({html:`<div style="width:24px;height:24px;background:#2E9E6E;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${n}</div>`,iconSize:[24,24],iconAnchor:[12,12]})}).addTo(map);
        }
      });
    }
  };

  const initMapFallback=()=>{
    if(!mapRef.current||!loc)return;
    if(mapInst.current){mapInst.current.remove();mapInst.current=null;}
    const L=window.L;
    const map=L.map(mapRef.current).setView([loc.lat,loc.lng],14);
    mapInst.current=map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(map);
    const r=(selRoute.km/(2*Math.PI))/111;
    const pts=[];
    for(let i=0;i<=360;i+=15){const a=(i*Math.PI)/180;pts.push([loc.lat+r*Math.cos(a),loc.lng+r*Math.sin(a)/Math.cos(loc.lat*Math.PI/180)]);}
    L.polyline(pts,{color:"#1A6B4A",weight:4,opacity:0.8,dashArray:"8,4"}).addTo(map);
    const icon=L.divIcon({html:`<div style="width:32px;height:32px;background:#1A6B4A;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 3px 8px rgba(0,0,0,0.3)">🏁</div>`,iconSize:[32,32],iconAnchor:[16,16]});
    L.marker([loc.lat,loc.lng],{icon}).addTo(map).bindPopup("Start & Mål").openPopup();
  };

  const muscles=Object.keys(WORKOUTS);
  const workout=selMuscle?WORKOUTS[selMuscle]:null;
  const exercises=workout?workout[level]:[];

  const SC={
    lbl:{fontSize:12,fontWeight:600,color:"#888",marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:0.5},
    card:{background:"white",borderRadius:20,border:"1px solid #F0EDE8",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden"},
    btn:(bg="#1A6B4A",c="white")=>({background:bg,border:"none",borderRadius:16,padding:"14px",color:c,fontSize:15,fontWeight:700,cursor:"pointer",width:"100%",fontFamily:"'DM Sans',sans-serif"}),
  };

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 20px",position:"relative"}}>
        <button onClick={onBack} style={{position:"absolute",top:52,left:24,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:20,padding:"7px 14px",color:"white",fontSize:13,cursor:"pointer"}}>← Tillbaka</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40}}>🧠</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:"white",marginTop:8}}>MoveTogether Coach</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:4}}>Träningsprogram + Rundförslag</div>
        </div>
        <div style={{display:"flex",background:"rgba(255,255,255,0.15)",borderRadius:16,padding:4,marginTop:16}}>
          {[["workout","💪 Träning"],["routes","🗺️ Rundor"]].map(([t,l])=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,border:"none",borderRadius:12,padding:"10px",fontSize:14,fontWeight:600,cursor:"pointer",background:tab===t?"white":"transparent",color:tab===t?"#1A6B4A":"rgba(255,255,255,0.8)"}}>{l}</button>
          ))}
        </div>
      </div>

      {tab==="workout"&&(
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14,background:"#F5F3EE"}}>
          {!showProg?(
            <>
              <div style={{...SC.card,padding:16}}>
                <label style={SC.lbl}>Din nivå</label>
                <div style={{display:"flex",gap:8}}>
                  {[["nybörjare","🌱 Nybörjare"],["medel","⭐ Medel"],["avancerad","🏆 Avancerad"]].map(([l,label])=>(
                    <button key={l} onClick={()=>setLevel(l)} style={{flex:1,border:"none",borderRadius:12,padding:"10px 4px",fontSize:12,fontWeight:600,cursor:"pointer",background:level===l?"#1A6B4A":"#F0EDE8",color:level===l?"white":"#555"}}>{label}</button>
                  ))}
                </div>
              </div>
              <label style={SC.lbl}>Välj muskelgrupp</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {muscles.map(m=>{const w=WORKOUTS[m];return(
                  <button key={m} onClick={()=>{setSelMuscle(m);setShowProg(true);}} style={{background:"white",border:"1.5px solid #F0EDE8",borderRadius:18,padding:"18px 14px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
                    <div style={{fontSize:32,marginBottom:8}}>{w.emoji}</div>
                    <div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>{m}</div>
                    <div style={{fontSize:11,color:"#888",marginTop:3}}>{w[level].length} övningar</div>
                    <div style={{height:4,background:w.color,borderRadius:2,marginTop:8,width:"60%"}}/>
                  </button>
                );})}
              </div>
              <div style={{...SC.card,padding:16,background:"linear-gradient(135deg,#E8F5EE,#F0FAF5)"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#1A6B4A",marginBottom:4}}>💡 Tips från coachen</div>
                <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>Värm alltid upp i 5-10 minuter innan träning. Vila tillräckligt mellan sets. Drick vatten. Lyssna på kroppen!</div>
              </div>
            </>
          ):(
            <>
              <button onClick={()=>setShowProg(false)} style={SC.btn("#F0EDE8","#1A6B4A")}>← Byt muskelgrupp</button>
              <div style={{background:`linear-gradient(135deg,${workout.color},${workout.color}CC)`,borderRadius:20,padding:"18px 20px",color:"white"}}>
                <div style={{fontSize:40,marginBottom:8}}>{workout.emoji}</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700}}>{selMuscle}</div>
                <div style={{fontSize:13,opacity:0.85,marginTop:4}}>{exercises.length} övningar · {level.charAt(0).toUpperCase()+level.slice(1)} nivå</div>
                <div style={{display:"flex",gap:10,marginTop:12}}>
                  {[["🔥","Intensitet",level==="nybörjare"?"Låg":level==="medel"?"Medel":"Hög"],["⏱️","Tid","45-60 min"],["💧","Vila","Enligt schema"]].map(([ic,lb,val])=>(
                    <div key={lb} style={{background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"8px 10px",flex:1,textAlign:"center"}}>
                      <div style={{fontSize:16}}>{ic}</div><div style={{fontSize:10,opacity:0.8,marginTop:2}}>{lb}</div><div style={{fontSize:12,fontWeight:700,marginTop:1}}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
              {exercises.map((ex,i)=><ExCard key={i} exercise={ex} index={i} color={workout.color} SC={SC}/>)}
              <div style={{...SC.card,padding:16,background:"#FEF3E7"}}>
                <div style={{fontSize:13,fontWeight:600,color:"#854F0B",marginBottom:4}}>⚠️ Kom ihåg</div>
                <div style={{fontSize:13,color:"#6B3A0A",lineHeight:1.6}}>Värm upp ordentligt. Öka vikt gradvis. Vila 1-2 dagar innan nästa benpass. Protein efter träning!</div>
              </div>
              <div style={{height:20}}/>
            </>
          )}
        </div>
      )}

      {tab==="routes"&&(
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14,background:"#F5F3EE"}}>
          {locErr&&<div style={{background:"#FCEBEB",borderRadius:16,padding:16,border:"1px solid #F4BDBD"}}><div style={{fontSize:14,fontWeight:600,color:"#E53E3E",marginBottom:4}}>📍 Platsåtkomst nekad</div><div style={{fontSize:13,color:"#888"}}>{locErr}</div></div>}
          {!loc&&!locErr&&<div style={{textAlign:"center",padding:32,color:"#888"}}><div style={{fontSize:48,marginBottom:12}}>📍</div><div style={{fontWeight:600,marginBottom:4}}>Hämtar din position...</div><div style={{fontSize:13}}>Tillåt platsåtkomst i webbläsaren</div></div>}
          {loc&&<>
            <div style={{...SC.card,padding:14,display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:40,height:40,background:"#E8F5EE",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📍</div>
              <div><div style={{fontSize:14,fontWeight:600}}>Din position hittad!</div><div style={{fontSize:12,color:"#888"}}>Lat: {loc.lat.toFixed(4)} · Lng: {loc.lng.toFixed(4)}</div></div>
            </div>
            <label style={SC.lbl}>Välj rundalängd</label>
            {ROUTES.map((route,i)=>(
              <button key={i} onClick={()=>setSelRoute(route)} style={{background:"white",border:selRoute?.km===route.km?"2px solid #1A6B4A":"1.5px solid #F0EDE8",borderRadius:18,padding:"16px 18px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",width:"100%"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div><div style={{fontSize:22,marginBottom:4}}>{route.emoji}</div><div style={{fontSize:15,fontWeight:700,color:"#1A1A1A"}}>{route.namn}</div><div style={{fontSize:13,color:"#888",marginTop:2}}>{route.beskrivning}</div></div>
                  <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:24,fontWeight:900,color:"#1A6B4A"}}>{route.km} km</div><div style={{fontSize:12,color:"#888"}}>{route.tid}</div></div>
                </div>
                {selRoute?.km===route.km&&<div style={{marginTop:12,height:4,background:"#1A6B4A",borderRadius:2}}/>}
              </button>
            ))}
            {selRoute&&(
              <>
                <div style={{...SC.card,overflow:"hidden"}}>
                  <div style={{padding:"14px 16px",borderBottom:"1px solid #F0EDE8"}}>
                    <div style={{fontWeight:700,fontSize:15}}>{selRoute.emoji} {selRoute.namn} – {selRoute.km} km</div>
                    {startAddr&&<div style={{fontSize:12,color:"#1A6B4A",fontWeight:500,marginTop:3}}>📍 {startAddr}</div>}
                    {routeInfo&&<div style={{fontSize:12,color:"#888",marginTop:2}}>🛣️ {routeInfo.distKm} km faktisk rutt · ⏱️ ca {routeInfo.timeMin} min</div>}
                    {!routeInfo&&<div style={{fontSize:12,color:"#888",marginTop:2}}>Beräknar rutt längs riktiga gator...</div>}
                  </div>
                  {loadingRoute&&<div style={{height:300,background:"#E8F5EE",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{fontSize:32}}>🗺️</div><div style={{fontSize:14,fontWeight:600,color:"#1A6B4A"}}>Beräknar rutt...</div><div style={{fontSize:12,color:"#888"}}>Hämtar riktiga gator</div></div>}
                  <div ref={mapRef} style={{height:300,width:"100%",background:"#E8F5EE",display:loadingRoute?"none":"block"}}/>
                  {routeInfo&&routeInfo.steps&&routeInfo.steps.length>0&&(
                    <div style={{padding:"12px 16px",borderTop:"1px solid #F0EDE8"}}>
                      <div style={{fontSize:12,fontWeight:600,color:"#888",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Vägbeskrivning</div>
                      {routeInfo.steps.map((step,i)=>(
                        <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:"1px solid #F5F3EE",alignItems:"flex-start"}}>
                          <div style={{width:20,height:20,background:"#E8F5EE",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#1A6B4A",flexShrink:0,marginTop:1}}>{i+1}</div>
                          <div>
                            <div style={{fontSize:13,color:"#333"}}>{step.maneuver?.instruction||step.name||"Fortsätt"}</div>
                            {step.distance>0&&<div style={{fontSize:11,color:"#888",marginTop:1}}>{step.distance<1000?`${Math.round(step.distance)} m`:`${(step.distance/1000).toFixed(1)} km`}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{padding:"12px 16px",background:"#F5F3EE"}}>
                    <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
                      {[["🏁","Start & Mål",startAddr||"Din position"],["1️⃣","Checkpoint 1","¼ av rundan"],["2️⃣","Checkpoint 2","Halvvägs"],["3️⃣","Checkpoint 3","¾ av rundan"]].map(([ic,lb,desc])=>(
                        <div key={lb} style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:14}}>{ic}</span><div><div style={{fontSize:11,fontWeight:600,color:"#333"}}>{lb}</div><div style={{fontSize:10,color:"#888",maxWidth:100,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{desc}</div></div></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div style={{...SC.card,padding:16,background:"linear-gradient(135deg,#E8F5EE,#F0FAF5)"}}>
                  <div style={{fontSize:13,fontWeight:600,color:"#1A6B4A",marginBottom:8}}>💡 Tips för din {selRoute.namn.toLowerCase()}</div>
                  {selRoute.km<=3&&<div style={{fontSize:13,color:"#555",lineHeight:1.8}}><div>• Ta det lugnt och njut av omgivningen</div><div>• Bra för återhämtning och mental hälsa</div><div>• Perfekt att göra med en vän</div></div>}
                  {selRoute.km>3&&selRoute.km<=7&&<div style={{fontSize:13,color:"#555",lineHeight:1.8}}><div>• Värm upp 5 min med promenad</div><div>• Håll ett pratbart tempo</div><div>• Drick vatten innan och efter</div></div>}
                  {selRoute.km>7&&<div style={{fontSize:13,color:"#555",lineHeight:1.8}}><div>• Ta med vatten</div><div>• Ät kolhydrater 2h innan</div><div>• Sänk tempot om det känns tungt</div><div>• Sträck ut ordentligt efteråt</div></div>}
                </div>
              </>
            )}
          </>}
          <div style={{height:20}}/>
        </div>
      )}
    </div>
  );
}

function ExCard({exercise,index,color,SC}){
  const [exp,setExp]=useState(false);
  const [timerActive,setTimerActive]=useState(false);
  const [timeLeft,setTimeLeft]=useState(null);
  const timerRef=useRef(null);
  const secs=parseInt(exercise.vila)||60;

  useEffect(()=>{
    if(timerActive&&timeLeft>0){timerRef.current=setTimeout(()=>setTimeLeft(t=>t-1),1000);}
    else if(timeLeft===0)setTimerActive(false);
    return()=>clearTimeout(timerRef.current);
  },[timerActive,timeLeft]);

  return(
    <div style={{background:"white",borderRadius:18,border:"1px solid #F0EDE8",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.04)"}}>
      <div onClick={()=>setExp(!exp)} style={{padding:"14px 16px",display:"flex",alignItems:"center",gap:12,cursor:"pointer"}}>
        <div style={{width:36,height:36,background:color+"22",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color,flexShrink:0}}>{index+1}</div>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>{exercise.namn}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{exercise.sets} sets × {exercise.reps} reps · Vila {exercise.vila}</div></div>
        <span style={{fontSize:18,color:"#AAA",transition:"transform 0.2s",transform:exp?"rotate(90deg)":"rotate(0deg)"}}>›</span>
      </div>
      {exp&&(
        <div style={{padding:"0 16px 16px",borderTop:"1px solid #F5F3EE"}}>
          <div style={{background:"#F5F3EE",borderRadius:12,padding:"12px 14px",marginTop:12,marginBottom:12}}>
            <div style={{fontSize:12,fontWeight:600,color:"#888",marginBottom:4}}>💡 Teknik-tips</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>{exercise.tips}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[["🔁","Sets",exercise.sets],["💪","Reps",exercise.reps],["⏱️","Vila",exercise.vila]].map(([ic,lb,val])=>(
              <div key={lb} style={{background:"#F5F3EE",borderRadius:12,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:16}}>{ic}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{lb}</div><div style={{fontSize:13,fontWeight:700,color:"#1A1A1A",marginTop:1}}>{val}</div>
              </div>
            ))}
          </div>
          {timerActive?(
            <div style={{background:timeLeft>10?"#E8F5EE":"#FEF3E7",borderRadius:12,padding:"12px",textAlign:"center"}}>
              <div style={{fontSize:32,fontWeight:900,color:timeLeft>10?"#1A6B4A":"#E53E3E"}}>{timeLeft}s</div>
              <div style={{fontSize:12,color:"#888"}}>{timeLeft===0?"Klar! 🎉":"Vila pågår..."}</div>
              <button onClick={()=>{setTimerActive(false);setTimeLeft(null);}} style={{marginTop:8,background:"#E53E3E",border:"none",borderRadius:10,padding:"6px 16px",color:"white",fontSize:12,fontWeight:600,cursor:"pointer"}}>Avbryt</button>
            </div>
          ):(
            <button onClick={()=>{setTimeLeft(secs);setTimerActive(true);}} style={{background:color,border:"none",borderRadius:12,padding:"10px",color:"white",fontSize:13,fontWeight:600,cursor:"pointer",width:"100%"}}>⏱️ Starta vilatimer ({exercise.vila})</button>
          )}
        </div>
      )}
    </div>
  );
}
