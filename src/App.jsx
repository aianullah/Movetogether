const WORKOUTS = {
  "Bröst":{emoji:"💪",color:"#C4462A",nybörjare:[{namn:"Push-ups",sets:3,reps:"8-10",vila:"60s",tips:"Håll kroppen rak som en planka."},{namn:"Incline Push-ups",sets:3,reps:"10-12",vila:"60s",tips:"Händerna på bänk – lättare för nybörjare."},{namn:"Dumbbell Chest Press",sets:3,reps:"10",vila:"90s",tips:"Ligg på bänk, pressa upp rakt."},{namn:"Cable Crossover",sets:3,reps:"12",vila:"60s",tips:"Kontrollerat, känn bröstet arbeta."}],medel:[{namn:"Barbell Bench Press",sets:4,reps:"8-10",vila:"90s",tips:"Skulderbladen ihop, sänk till bröstet."},{namn:"Incline Dumbbell Press",sets:3,reps:"10",vila:"90s",tips:"45° lutning, aktiverar övre bröst."},{namn:"Dips",sets:3,reps:"10-12",vila:"90s",tips:"Luta dig framåt för bröst-fokus."},{namn:"Cable Flyes",sets:3,reps:"12-15",vila:"60s",tips:"Stretch i botten, squeeze i toppen."},{namn:"Push-up variationer",sets:3,reps:"Till failure",vila:"60s",tips:"Wide, normal och diamond."}],avancerad:[{namn:"Barbell Bench Press",sets:5,reps:"5",vila:"3min",tips:"Progressiv överbelastning."},{namn:"Incline Barbell Press",sets:4,reps:"6-8",vila:"2min",tips:"Övre bröst prioritering."},{namn:"Weighted Dips",sets:4,reps:"8",vila:"2min",tips:"Bälte med extra vikt."},{namn:"Dumbbell Flyes",sets:3,reps:"12",vila:"90s",tips:"Maximalt stretch i botten."},{namn:"Cable Crossover (drop set)",sets:3,reps:"10+10",vila:"60s",tips:"Minska vikten och fortsätt."}]},
  "Rygg":{emoji:"🔙",color:"#185FA5",nybörjare:[{namn:"Assisted Pull-ups",sets:3,reps:"8",vila:"90s",tips:"Använd gummiband för hjälp."},{namn:"Seated Cable Row",sets:3,reps:"12",vila:"60s",tips:"Dra armbågarna bakåt."},{namn:"Lat Pulldown",sets:3,reps:"12",vila:"60s",tips:"Dra ner till bröstet."},{namn:"Superman",sets:3,reps:"15",vila:"45s",tips:"Lyft armar och ben från golvet."}],medel:[{namn:"Pull-ups",sets:4,reps:"6-8",vila:"2min",tips:"Full ROM, känn latsen."},{namn:"Barbell Row",sets:4,reps:"8-10",vila:"90s",tips:"Dra mot naveln, rak rygg."},{namn:"Lat Pulldown bred",sets:3,reps:"10-12",vila:"90s",tips:"Brett grepp aktiverar lats."},{namn:"Seated Row",sets:3,reps:"12",vila:"60s",tips:"Squeeze i slutet."},{namn:"Face Pulls",sets:3,reps:"15",vila:"60s",tips:"Dra mot ansiktet."}],avancerad:[{namn:"Weighted Pull-ups",sets:5,reps:"5-6",vila:"3min",tips:"Bälte med extra vikt."},{namn:"Pendlay Row",sets:4,reps:"6",vila:"2min",tips:"Explosiv från golvet."},{namn:"T-Bar Row",sets:4,reps:"8",vila:"2min",tips:"Tungt för tjocklek."},{namn:"Straight Arm Pulldown",sets:3,reps:"15",vila:"60s",tips:"Isolerar latsen perfekt."}]},
  "Ben":{emoji:"🦵",color:"#1A6B4A",nybörjare:[{namn:"Bodyweight Squat",sets:3,reps:"15",vila:"60s",tips:"Fötter axelbredd, knän ut."},{namn:"Lunges",sets:3,reps:"10/sida",vila:"60s",tips:"Bakre knät mot golvet."},{namn:"Leg Press",sets:3,reps:"12",vila:"90s",tips:"Medelhögt fotstöd."},{namn:"Leg Curl",sets:3,reps:"12",vila:"60s",tips:"Kontrollerad rörelse."}],medel:[{namn:"Barbell Back Squat",sets:4,reps:"8-10",vila:"2min",tips:"Bröstet upp, djup squat."},{namn:"Romanian Deadlift",sets:3,reps:"10",vila:"90s",tips:"Känn hamstrings sträcka."},{namn:"Leg Press",sets:4,reps:"12",vila:"90s",tips:"Öka vikten progressivt."},{namn:"Walking Lunges",sets:3,reps:"12/sida",vila:"90s",tips:"Med hantlar."},{namn:"Calf Raises",sets:4,reps:"20",vila:"45s",tips:"Fullt ROM."}],avancerad:[{namn:"Barbell Squat",sets:5,reps:"5",vila:"3min",tips:"Tung och djup."},{namn:"Front Squat",sets:4,reps:"6-8",vila:"2min",tips:"Aktiverar quads mer."},{namn:"Bulgarian Split Squat",sets:4,reps:"8/sida",vila:"2min",tips:"Utmanande unilateral."},{namn:"Stiff-Leg Deadlift",sets:3,reps:"10",vila:"90s",tips:"Hamstring-fokus."}]},
  "Axlar":{emoji:"🏋️",color:"#6B4AA8",nybörjare:[{namn:"DB Shoulder Press",sets:3,reps:"10",vila:"60s",tips:"Pressa rakt upp."},{namn:"Lateral Raises",sets:3,reps:"12",vila:"60s",tips:"Lätt vikt, kontrollerat."},{namn:"Front Raises",sets:3,reps:"12",vila:"60s",tips:"Växelvis eller simultant."},{namn:"Face Pulls",sets:3,reps:"15",vila:"60s",tips:"Skyddar axelleden."}],medel:[{namn:"Barbell OH Press",sets:4,reps:"8",vila:"2min",tips:"Pressa rakt upp."},{namn:"Arnold Press",sets:3,reps:"10",vila:"90s",tips:"Rotera hantlarna."},{namn:"Lateral Raises",sets:4,reps:"15",vila:"60s",tips:"Lätt vikt, hög rep."},{namn:"Rear Delt Flyes",sets:3,reps:"15",vila:"60s",tips:"Böj framåt, lyft bakåt."}],avancerad:[{namn:"Push Press",sets:5,reps:"5",vila:"3min",tips:"Explosiv med benhjälp."},{namn:"Lateral Raises drop",sets:4,reps:"12+12",vila:"60s",tips:"Minska och fortsätt."},{namn:"Cable Face Pulls",sets:4,reps:"20",vila:"60s",tips:"Hög rep, bakre delt."}]},
  "Armar":{emoji:"💪",color:"#854F0B",nybörjare:[{namn:"Dumbbell Curl",sets:3,reps:"12",vila:"60s",tips:"Håll armbågen still."},{namn:"Tricep Pushdown",sets:3,reps:"12",vila:"60s",tips:"Sträck ut helt."},{namn:"Hammer Curl",sets:3,reps:"10",vila:"60s",tips:"Neutralt grepp."},{namn:"OH Tricep Extension",sets:3,reps:"12",vila:"60s",tips:"Armbågen still."}],medel:[{namn:"Barbell Curl",sets:4,reps:"10",vila:"60s",tips:"Fullt ROM."},{namn:"Skull Crushers",sets:4,reps:"10",vila:"90s",tips:"Sänk till pannan."},{namn:"Incline DB Curl",sets:3,reps:"10",vila:"60s",tips:"Stretch i botten."},{namn:"Cable Pushdown",sets:3,reps:"15",vila:"60s",tips:"Armbågen stilla."}],avancerad:[{namn:"Barbell Curl 21s",sets:3,reps:"21",vila:"90s",tips:"7 nere, 7 uppe, 7 full."},{namn:"Close-grip Bench",sets:4,reps:"8",vila:"2min",tips:"Tungt tryck för triceps."},{namn:"French Press",sets:4,reps:"10",vila:"90s",tips:"Lång huvud fokus."}]},
  "Mage":{emoji:"🎯",color:"#0E7490",nybörjare:[{namn:"Crunches",sets:3,reps:"15",vila:"45s",tips:"Lyft skuldror, inte nacken."},{namn:"Planka",sets:3,reps:"30s",vila:"45s",tips:"Rak kropp, aktivera magen."},{namn:"Leg Raises",sets:3,reps:"10",vila:"45s",tips:"Kontrollerat ner."},{namn:"Mountain Climbers",sets:3,reps:"20",vila:"45s",tips:"Snabbt men kontrollerat."}],medel:[{namn:"Cable Crunch",sets:4,reps:"15",vila:"60s",tips:"Böj i midjan."},{namn:"Hanging Leg Raises",sets:4,reps:"12",vila:"60s",tips:"Lyft benen rakt."},{namn:"Russian Twists",sets:3,reps:"20",vila:"45s",tips:"Med vikt."},{namn:"Ab Rollout",sets:3,reps:"10",vila:"60s",tips:"Rull ut långsamt."}],avancerad:[{namn:"Dragon Flag",sets:4,reps:"6-8",vila:"90s",tips:"Extrem core. Kontrollerat."},{namn:"Toes-to-Bar",sets:4,reps:"10",vila:"60s",tips:"Lyft tårna till stången."},{namn:"L-Sit",sets:3,reps:"20s",vila:"60s",tips:"Benen raka och parallella."}]},
};

const ROUTES=[
  {km:2,tid:"20-25 min",namn:"Kvällspromenad",emoji:"🌙",beskrivning:"Perfekt för återhämtning"},
  {km:3,tid:"30-35 min",namn:"Morgonpromenad",emoji:"☀️",beskrivning:"Starta dagen med frisk luft"},
  {km:5,tid:"25-30 min",namn:"Löprundan",emoji:"🏃",beskrivning:"Klassiska 5 km"},
  {km:7,tid:"35-45 min",namn:"Tempolöpning",emoji:"⚡",beskrivning:"Längre med bra tempo"},
  {km:10,tid:"50-60 min",namn:"Långpass",emoji:"🎯",beskrivning:"Bygg uthållighet"},
  {km:15,tid:"80-90 min",namn:"Halvmarathon-prep",emoji:"🏅",beskrivning:"Siktar på halvmarathon"},
];

function CoachScreen({onBack}){
  const [tab,setTab]=useState("workout");
  const [selMuscle,setSelMuscle]=useState(null);
  const [level,setLevel]=useState("medel");
  const [showProg,setShowProg]=useState(false);
  const [loc,setLoc]=useState(null);
  const [locErr,setLocErr]=useState(null);
  const [selRoute,setSelRoute]=useState(null);
  const [routeInfo,setRouteInfo]=useState(null);
  const [loadingRoute,setLoadingRoute]=useState(false);
  const [startAddr,setStartAddr]=useState("");
  const mapRef=useRef(null);
  const mapInst=useRef(null);

  useEffect(()=>{
    if(tab==="routes"&&!loc){
      navigator.geolocation?.getCurrentPosition(
        pos=>setLoc({lat:pos.coords.latitude,lng:pos.coords.longitude}),
        ()=>setLocErr("Kunde inte hämta position. Tillåt platsåtkomst.")
      );
    }
  },[tab]);

  useEffect(()=>{
    if(tab==="routes"&&loc&&selRoute&&mapRef.current)loadMap();
  },[loc,selRoute,tab]);

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
    setLoadingRoute(true);setRouteInfo(null);
    try{
      const geoRes=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json&accept-language=sv`);
      const geoData=await geoRes.json();
      const road=geoData.address?.road||geoData.address?.pedestrian||"";
      const city=geoData.address?.city||geoData.address?.town||"";
      setStartAddr(road?`${road}, ${city}`:city||"Din position");
      const d=(selRoute.km/4)/111.32;
      const lc=Math.cos(loc.lat*Math.PI/180);
      const wps=[{lat:loc.lat,lng:loc.lng},{lat:loc.lat+d,lng:loc.lng+d*0.8/lc},{lat:loc.lat+d*1.2,lng:loc.lng+d*0.1/lc},{lat:loc.lat+d*0.5,lng:loc.lng-d*0.7/lc},{lat:loc.lat,lng:loc.lng}];
      const coords=wps.map(w=>`${w.lng},${w.lat}`).join(";");
      const res=await fetch(`https://router.project-osrm.org/route/v1/foot/${coords}?overview=full&geometries=geojson&steps=true`);
      const data=await res.json();
      if(data.code==="Ok"&&data.routes?.[0]){
        const route=data.routes[0];
        const distKm=(route.distance/1000).toFixed(1);
        const timeMin=Math.round(route.duration/60);
        const allSteps=[];
        route.legs.forEach(leg=>{
          leg.steps.forEach(step=>{
            const mt=step.maneuver.type;const mm=step.maneuver.modifier||"";
            let icon="↑";
            if(mt==="depart")icon="🏁";
            else if(mt==="arrive")icon="🏁";
            else if(mt==="turn"&&mm.includes("left"))icon="↰";
            else if(mt==="turn"&&mm.includes("right"))icon="↱";
            else if(mt==="roundabout")icon="🔄";
            const street=step.name||"";
            let instr="";
            if(mt==="depart")instr=`Starta på ${street||"gatan"}`;
            else if(mt==="arrive")instr="Tillbaka vid start! 🎉";
            else if(mt==="turn"){const dir=mm.includes("left")?"vänster":mm.includes("right")?"höger":"rakt";instr=`Sväng ${dir}${street?` på ${street}`:""}`;} 
            else instr=street||"Fortsätt";
            const dist=step.distance<1000?`${Math.round(step.distance)} m`:`${(step.distance/1000).toFixed(1)} km`;
            if(step.distance>5||mt==="depart"||mt==="arrive")allSteps.push({icon,instr,dist});
          });
        });
        setRouteInfo({distKm,timeMin,steps:allSteps});
        initMap(route.geometry.coordinates,allSteps);
      } else initMapFallback();
    }catch(e){initMapFallback();}
    setLoadingRoute(false);
  };

  const initMap=(coords,steps)=>{
    if(!mapRef.current||!loc)return;
    if(mapInst.current){mapInst.current.remove();mapInst.current=null;}
    const L=window.L;
    const map=L.map(mapRef.current,{zoomControl:true}).setView([loc.lat,loc.lng],14);
    mapInst.current=map;
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(map);
    if(coords&&coords.length>0){
      const ll=coords.map(([lng,lat])=>[lat,lng]);
      L.polyline(ll,{color:"#0D3D2B",weight:8,opacity:0.25}).addTo(map);
      L.polyline(ll,{color:"#1A6B4A",weight:5,opacity:1}).addTo(map);
      map.fitBounds(L.polyline(ll).getBounds(),{padding:[30,30]});
    }
    const si=L.divIcon({html:`<div style="background:#1A6B4A;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.4)">🏁</div>`,iconSize:[36,36],iconAnchor:[18,18]});
    L.marker([loc.lat,loc.lng],{icon:si}).addTo(map).bindPopup(`<b>Start & Mål</b><br/><small>${startAddr}</small>`).openPopup();
    if(coords&&steps&&steps.length>1){
      const seg=Math.floor(coords.length/Math.min(steps.length,6));
      steps.slice(1,-1).forEach((step,i)=>{
        const idx=Math.min((i+1)*seg,coords.length-1);
        if(coords[idx]){
          const[lng,lat]=coords[idx];
          const ti=L.divIcon({html:`<div style="background:white;color:#1A6B4A;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-size:12px;border:2px solid #1A6B4A;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${step.icon}</div>`,iconSize:[24,24],iconAnchor:[12,12]});
          L.marker([lat,lng],{icon:ti}).addTo(map).bindPopup(`<b>${step.icon} ${step.instr}</b><br/><small>${step.dist}</small>`);
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
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap",maxZoom:19}).addTo(map);
    const r=(selRoute.km/(2*Math.PI))/111;
    const pts=[];
    for(let i=0;i<=360;i+=15){const a=(i*Math.PI)/180;pts.push([loc.lat+r*Math.cos(a),loc.lng+r*Math.sin(a)/Math.cos(loc.lat*Math.PI/180)]);}
    L.polyline(pts,{color:"#1A6B4A",weight:5,opacity:0.9}).addTo(map);
    L.marker([loc.lat,loc.lng],{icon:L.divIcon({html:`<div style="background:#1A6B4A;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.3)">🏁</div>`,iconSize:[32,32],iconAnchor:[16,16]})}).addTo(map).bindPopup("Start & Mål").openPopup();
  };

  const SC={
    lbl:{fontSize:12,fontWeight:600,color:"#888",marginBottom:6,display:"block",textTransform:"uppercase",letterSpacing:0.5},
    card:{background:"white",borderRadius:20,border:"1px solid #F0EDE8",boxShadow:"0 2px 12px rgba(0,0,0,0.05)",overflow:"hidden"},
    btn:(bg="#1A6B4A",c="white")=>({background:bg,border:"none",borderRadius:16,padding:"14px",color:c,fontSize:14,fontWeight:700,cursor:"pointer",width:"100%",fontFamily:"'DM Sans',sans-serif"}),
  };

  const muscles=Object.keys(WORKOUTS);
  const workout=selMuscle?WORKOUTS[selMuscle]:null;
  const exercises=workout?workout[level]:[];

  return(
    <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:"linear-gradient(160deg,#1A6B4A,#0D3D2B)",padding:"52px 24px 20px",position:"relative"}}>
        <button onClick={onBack} style={{position:"absolute",top:52,left:24,background:"rgba(255,255,255,0.2)",border:"none",borderRadius:20,padding:"7px 14px",color:"white",fontSize:13,cursor:"pointer"}}>← Tillbaka</button>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40}}>🧠</div>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:900,color:"white",marginTop:8}}>MoveTogether Coach</div>
          <div style={{fontSize:13,color:"rgba(255,255,255,0.75)",marginTop:4}}>Träningsprogram + GPS-rundor</div>
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
            </>
          ):(
            <>
              <button onClick={()=>setShowProg(false)} style={SC.btn("#F0EDE8","#1A6B4A")}>← Byt muskelgrupp</button>
              <div style={{background:`linear-gradient(135deg,${workout.color},${workout.color}CC)`,borderRadius:20,padding:"18px 20px",color:"white"}}>
                <div style={{fontSize:40,marginBottom:8}}>{workout.emoji}</div>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:700}}>{selMuscle}</div>
                <div style={{fontSize:13,opacity:0.85,marginTop:4}}>{exercises.length} övningar · {level} nivå</div>
              </div>
              {exercises.map((ex,i)=><ExCard key={i} exercise={ex} index={i} color={workout.color} SC={SC}/>)}
              <div style={{height:20}}/>
            </>
          )}
        </div>
      )}

      {tab==="routes"&&(
        <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:14,background:"#F5F3EE"}}>
          {locErr&&<div style={{background:"#FCEBEB",borderRadius:16,padding:16}}><div style={{fontSize:14,fontWeight:600,color:"#E53E3E"}}>📍 {locErr}</div></div>}
          {!loc&&!locErr&&<div style={{textAlign:"center",padding:32,color:"#888"}}><div style={{fontSize:48,marginBottom:12}}>📍</div><div style={{fontWeight:600}}>Hämtar din position...</div></div>}
          {loc&&<>
            <div style={{background:"white",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",gap:12,border:"1px solid #F0EDE8"}}>
              <div style={{width:40,height:40,background:"#E8F5EE",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>📍</div>
              <div><div style={{fontSize:14,fontWeight:600}}>Position hittad!</div><div style={{fontSize:12,color:"#888"}}>{startAddr||`${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}</div></div>
            </div>
            <label style={SC.lbl}>Välj rundalängd</label>
            {ROUTES.map((route,i)=>(
              <button key={i} onClick={()=>setSelRoute(route)} style={{background:"white",border:selRoute?.km===route.km?"2px solid #1A6B4A":"1.5px solid #F0EDE8",borderRadius:18,padding:"16px 18px",cursor:"pointer",textAlign:"left",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",width:"100%"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div><div style={{fontSize:20,marginBottom:4}}>{route.emoji}</div><div style={{fontSize:15,fontWeight:700,color:"#1A1A1A"}}>{route.namn}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{route.beskrivning}</div></div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:24,fontWeight:900,color:"#1A6B4A"}}>{route.km} km</div><div style={{fontSize:12,color:"#888"}}>{route.tid}</div></div>
                </div>
                {selRoute?.km===route.km&&<div style={{marginTop:10,height:3,background:"#1A6B4A",borderRadius:2}}/>}
              </button>
            ))}
            {selRoute&&(
              <div style={{...SC.card,overflow:"hidden"}}>
                <div style={{padding:"14px 16px",borderBottom:"1px solid #F0EDE8"}}>
                  <div style={{fontWeight:700,fontSize:15}}>{selRoute.emoji} {selRoute.namn} – {selRoute.km} km</div>
                  {startAddr&&<div style={{fontSize:12,color:"#1A6B4A",fontWeight:500,marginTop:2}}>📍 Start: {startAddr}</div>}
                  {routeInfo&&<div style={{fontSize:12,color:"#888",marginTop:2}}>🛣️ {routeInfo.distKm} km faktisk rutt · ⏱️ ca {routeInfo.timeMin} min</div>}
                  {!routeInfo&&<div style={{fontSize:12,color:"#888",marginTop:2}}>Beräknar rutt längs riktiga gator...</div>}
                </div>
                {loadingRoute&&<div style={{height:300,background:"#E8F5EE",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{fontSize:32}}>🗺️</div><div style={{fontSize:14,fontWeight:600,color:"#1A6B4A"}}>Beräknar rutt...</div></div>}
                <div ref={mapRef} style={{height:300,width:"100%",background:"#E8F5EE",display:loadingRoute?"none":"block"}}/>
                {routeInfo?.steps?.length>0&&(
                  <div style={{padding:"12px 16px",borderTop:"1px solid #F0EDE8",maxHeight:280,overflowY:"auto"}}>
                    <div style={{fontSize:12,fontWeight:600,color:"#888",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>🗺️ Turn-by-turn vägbeskrivning</div>
                    {routeInfo.steps.map((step,i)=>(
                      <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid #F5F3EE",alignItems:"center"}}>
                        <div style={{width:32,height:32,background:i===0||i===routeInfo.steps.length-1?"#1A6B4A":"#E8F5EE",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{step.icon}</div>
                        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:"#1A1A1A"}}>{step.instr}</div><div style={{fontSize:11,color:"#888",marginTop:1}}>{step.dist}</div></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:"#1A1A1A"}}>{exercise.namn}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{exercise.sets} sets × {exercise.reps} · Vila {exercise.vila}</div></div>
        <span style={{fontSize:18,color:"#AAA",transform:exp?"rotate(90deg)":"rotate(0deg)",display:"inline-block",transition:"transform 0.2s"}}>›</span>
      </div>
      {exp&&(
        <div style={{padding:"0 16px 16px",borderTop:"1px solid #F5F3EE"}}>
          <div style={{background:"#F5F3EE",borderRadius:12,padding:"12px 14px",margin:"12px 0"}}>
            <div style={{fontSize:12,fontWeight:600,color:"#888",marginBottom:4}}>💡 Tips</div>
            <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>{exercise.tips}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
            {[["🔁","Sets",exercise.sets],["💪","Reps",exercise.reps],["⏱️","Vila",exercise.vila]].map(([ic,lb,val])=>(
              <div key={lb} style={{background:"#F5F3EE",borderRadius:12,padding:"10px",textAlign:"center"}}>
                <div style={{fontSize:16}}>{ic}</div><div style={{fontSize:11,color:"#888",marginTop:2}}>{lb}</div><div style={{fontSize:13,fontWeight:700,marginTop:1}}>{val}</div>
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
