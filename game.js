/* =====================================================================
   SHINOBI 2048 — Mühür Akışı
   Saf HTML/CSS/JS. index.html'i tarayıcıda aç → çalışır.

   ÇEKİRDEK: 4x4 tahtada kaydır → aynı mührüler birleşir (burç zinciri:
   Fare→Öküz→...→Domuz → sonra JUTSU karoları). Her birleştirme canavara
   hasar verir; jutsu karosu oluşturmak büyük patlama yapar. Süre/ceza yok.
   Tahta tıkanırsa "çakra tükendi" → ryō/güç/aşama korunur, tahta sıfırlanır.
   ===================================================================== */

/* ---------- EL İŞARETİ / HAYVAN İKONLARI (tek renk pixel-art) ---------- */
const ANIMALS = {
  RAT:[
    "............",".##......##.","####....####","####....####",".##########.",
    "############","############",".##########.","..########..","...#....#...","............"],
  OX:[
    "#..........#","##........##",".##......##.","..#......#..","..########..",
    ".##########.","############","############",".##########.","..##....##..","............"],
  TIGER:[
    "............",".##......##.",".###....###.",".##########.","############",
    "############","############",".##########.","#.########.#","...#....#...","............"],
  HARE:[
    "....#..#....","....#..#....","....#..#....","....####....","...######...",
    "..########..","..########..","..########..","...######...","....#..#....","............"],
  DRAGON:[
    "##..........",".##.........",".#####......","..#######...","..#########.",
    "..########.#","..#########.","..#######...",".#####......",".##.........","............"],
  SERPENT:[
    "............","............",".########...","########.##.",".########...",
    "...#####....",".....######.","..####......","###.........","............","............"],
  HORSE:[
    ".###........",".####.......",".#####......",".#.####.....",".#..####....",
    ".#...####...",".....####...","......####..",".......###..","........##..","............"],
  RAM:[
    "............",".##......##.","#..#....#..#","#.##....##.#",".##########.",
    ".##########.",".##########.","..########..","...######...","....#..#....","............"],
  MONKEY:[
    "............","##........##","##........##",".##########.","############",
    "############",".##########.","..########..","..##....##..","...######...","............"],
  BIRD:[
    "...##.......","..####......",".######.....",".######.###.",".#########..",
    ".######.....","..####......","...##.......","............","............","............"],
  DOG:[
    "............",".##......##.",".###....###.",".####..####.",".##########.",
    "############","############",".##########.","..########..","...##..##...","............"],
  BOAR:[
    "............","...#....#...","..###..###..","..########..",".##########.",
    "############","############",".##########.","..########..","..##....##..","............"],
};
function handSVG(en){
  const g = ANIMALS[en];
  if(!g) return "";
  const cols = Math.max(...g.map(r => r.length)), rows = g.length;
  let r = "";
  for(let y = 0; y < rows; y++)
    for(let x = 0; x < g[y].length; x++)
      if(g[y][x] === "#") r += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  return `<svg class="hand" viewBox="0 0 ${cols} ${rows}" fill="currentColor" shape-rendering="crispEdges" aria-hidden="true">${r}</svg>`;
}

/* ---------- PIXEL ART SPRITE YÜKLEYİCİ ---------- */
function sprite(src, emoji, size, sheet){
  size = size || 32;
  if(!sheet){
    return `<img class="px" src="${src}" alt="" style="width:${size}px;height:${size}px"
              data-fb="${emoji}" data-sz="${size}" onerror="pxFail(this)">`;
  }
  const cols = sheet.cols || 3, rows = sheet.rows || 4;
  const col = sheet.col == null ? 1 : sheet.col;
  const row = sheet.row || 0;
  const anim = sheet.anim || "idle";
  const startX = anim === "static" ? -col * size : 0;
  const animCls = anim === "static" ? "" : " " + anim;
  return `<span class="px-anim${animCls}" style="--sz:${size}px;width:${size}px;height:${size}px;
      background-image:url('${src}');background-size:${size*cols}px ${size*rows}px;
      background-position:${startX}px ${-row*size}px;">
      <img src="${src}" alt="" class="probe" onerror="sheetFail(this,'${emoji}',${size})"></span>`;
}
window.pxFail = function(img){
  const s = document.createElement("span");
  s.className = "px-emoji";
  s.style.cssText = `font-size:${img.dataset.sz * 0.92}px;width:${img.dataset.sz}px;height:${img.dataset.sz}px`;
  s.textContent = img.dataset.fb;
  img.replaceWith(s);
};
window.sheetFail = function(probe, emoji, size){
  const s = document.createElement("span");
  s.className = "px-emoji";
  s.style.cssText = `font-size:${size * 0.92}px;width:${size}px;height:${size}px`;
  s.textContent = emoji;
  probe.parentNode.replaceWith(s);
};

/* ---- Yatay animasyon ŞERİDİ (hero/boss/düşman) ---- */
function stripSprite(src, frames, size, opt){
  opt = opt || {};
  const dur = opt.dur || frames * 0.12;
  const iter = opt.once ? "1 forwards" : "infinite";
  return `<span class="px-strip" style="--f:${frames};--sz:${size}px;width:${size}px;height:${size}px;
      background-image:url('${src}');background-size:${frames * size}px ${size}px;
      animation:stripPlay ${dur}s steps(${frames}) ${iter}"></span>`;
}
function renderCreature(e, size, boss){
  const t = e.type || "sheet";
  if(t === "strip")  return stripSprite(e.img, e.frames, size, { dur: e.dur });
  if(t === "static") return sprite(e.img, e.icon, size);
  const row = boss ? (e.row || 0) : 0;
  return sprite(e.img, e.icon, size, { row, anim: boss ? "idleSlow" : "idle" });
}
const HERO = {
  idle:   { img:"assets/hero/IDLE.png",     frames:10, dur:1.1 },
  attack: { img:"assets/hero/ATTACK%201.png",frames:7,  dur:0.42 },
  hurt:   { img:"assets/hero/HURT.png",      frames:4,  dur:0.3 },
};
const HERO_SIZE = 150;
let heroAnimTimer = null;
function setHeroSprite(state){
  const a = HERO[state] || HERO.idle;
  const once = state !== "idle";
  el.heroIcon.innerHTML = stripSprite(a.img, a.frames, HERO_SIZE, { dur: a.dur, once });
  clearTimeout(heroAnimTimer);
  if(once) heroAnimTimer = setTimeout(() => setHeroSprite("idle"), a.dur * 1000);
}

/* boss portalı */
const PORTAL_SHEET = "assets/boss_portals/192x192/pipo-gate01c192.png";
const PORTAL_COLS = 5, PORTAL_ROWS = 3, PORTAL_TOTAL = 15, PORTAL_DISP = 180;
let portalIv = null, portalFrame = 0;
function showPortalFrame(f){
  const col = f % PORTAL_COLS, row = Math.floor(f / PORTAL_COLS);
  el.portal.style.backgroundImage = `url('${PORTAL_SHEET}')`;
  el.portal.style.backgroundSize = `${PORTAL_COLS * PORTAL_DISP}px ${PORTAL_ROWS * PORTAL_DISP}px`;
  el.portal.style.backgroundPosition = `${-col * PORTAL_DISP}px ${-row * PORTAL_DISP}px`;
}
function playPortal(){
  clearInterval(portalIv);
  el.portal.classList.remove("hidden", "closing");
  portalFrame = 0; showPortalFrame(0);
  portalIv = setInterval(() => { portalFrame = (portalFrame + 1) % PORTAL_TOTAL; showPortalFrame(portalFrame); }, 90);
}
function hidePortal(){
  clearInterval(portalIv); portalIv = null;
  el.portal.classList.add("closing");
  setTimeout(() => el.portal.classList.add("hidden"), 350);
}

/* ---------- BÖLÜMLER (ZONE) ---------- */
const ZONES = [
  { cls:"z-forest",  name:"Konoha Ormanı" },
  { cls:"z-cave",    name:"Karanlık Mağara" },
  { cls:"z-snow",    name:"Buz Dağı" },
  { cls:"z-desert",  name:"Suna Çölü" },
  { cls:"z-volcano", name:"Lav Vadisi" },
  { cls:"z-castle",  name:"Gölge Kalesi" },
];
const currentZone = () => ZONES[Math.floor((G.stage - 1) / 3) % ZONES.length];

/* ---------- 12 EL MÜHRÜ (burç sırası = birleştirme zinciri) ---------- */
const SEALS = [
  { en:"RAT" }, { en:"OX" }, { en:"TIGER" }, { en:"HARE" },
  { en:"DRAGON" }, { en:"SERPENT" }, { en:"HORSE" }, { en:"RAM" },
  { en:"MONKEY" }, { en:"BIRD" }, { en:"DOG" }, { en:"BOAR" },
];

/* ---------- JUTSU (üst karolar) ---------- */
const JUTSU = [
  { jp:"火遁・豪火球の術",   name:"Katon: Gōkakyū",      icon:"🔥", img:"assets/jutsu/katon.png",        color:"#ff7a18" },
  { jp:"千鳥",               name:"Chidori",             icon:"⚡", img:"assets/jutsu/chidori.png",      color:"#37d0ff" },
  { jp:"影分身の術",         name:"Kage Bunshin",        icon:"👥", img:"assets/jutsu/kage_bunshin.png", color:"#bfa6ff" },
  { jp:"水遁・水龍弾",       name:"Suiton: Suiryūdan",   icon:"💧", img:"assets/jutsu/suiton.png",       color:"#3aa0ff" },
  { jp:"螺旋丸",             name:"Rasengan",            icon:"🌀", img:"assets/jutsu/rasengan.png",     color:"#7ae7ff" },
  { jp:"風遁・螺旋手裏剣",   name:"Fūton: Rasenshuriken",icon:"💥", img:"assets/jutsu/rasenshuriken.png",color:"#9dff5d" },
];

/* ---------- DÜŞMANLAR ---------- */
const ENEMIES = [
  {name:"Orc Haydut",icon:"👹",img:"assets/enemies/Enemy%2001-1.png"},
  {name:"Goblin",icon:"👾",img:"assets/enemies/Enemy%2002-1.png"},
  {name:"Kobold",icon:"👺",img:"assets/enemies/Enemy%2003-1.png"},
  {name:"Yarasa Sürüsü",icon:"🦇",img:"assets/enemies/Enemy%2004-1.png"},
  {name:"Aç Kurt",icon:"🐺",img:"assets/enemies/Enemy%2005-1.png"},
  {name:"İskelet",icon:"💀",img:"assets/enemies/Enemy%2006-1.png"},
  {name:"Zombi",icon:"🧟",img:"assets/enemies/Enemy%2007-1.png"},
  {name:"Slime",icon:"🟢",img:"assets/enemies/Enemy%2008-1.png"},
  {name:"Dev Örümcek",icon:"🕷️",img:"assets/enemies/Enemy%2009-1.png"},
  {name:"Hayalet",icon:"👻",img:"assets/enemies/Enemy%2010-1.png"},
  {name:"İmp",icon:"😈",img:"assets/enemies/Enemy%2011-1.png"},
  {name:"Golem",icon:"🗿",img:"assets/enemies/Enemy%2012-1.png"},
  {name:"Harpi",icon:"🦅",img:"assets/enemies/Enemy%2013-1.png"},
  {name:"Gölge Şinobi",icon:"🥷",img:"assets/enemies/Enemy%2014-1.png"},
];
const BOSSES = [
  {name:"Beyaz İblis",   icon:"👹", img:"assets/bosses/Boss%2001.png", row:0},
  {name:"Kara Cübbe",    icon:"🕴️", img:"assets/bosses/Boss%2001.png", row:1},
  {name:"Karanlık Göz",  icon:"🌑", img:"assets/bosses/Boss%2001.png", row:2},
  {name:"Kızıl Gargoyle",icon:"😈", img:"assets/bosses/Boss%2001.png", row:3},
  {name:"Cass", icon:"⚔️", img:"assets/bosses/cassidle.png", type:"strip", frames:7, dur:0.9},
];

/* ---------- KARO KADEMELERİ (tier) ---------- */
const TIER_COLORS = ["#8a8f98","#c0764a","#d89a4a","#cdd14a","#7dd14a","#4ad19a",
                     "#4aa6d1","#5a6ed1","#8a5ad1","#c14ad1","#d14a8a","#d14a4a"];
const TIERS = [];
SEALS.forEach((s,i)=>TIERS.push({kind:"animal", key:s.en, name:s.en, color:TIER_COLORS[i%12]}));
JUTSU.forEach(j=>TIERS.push({kind:"jutsu", name:j.name, jp:j.jp, icon:j.icon, img:j.img, color:j.color}));
const MAXT = TIERS.length - 1;
const tierData = (t) => TIERS[Math.min(t, MAXT)];
const tileValue = (t) => Math.round(3 * Math.pow(1.9, t));

/* ===================== DURUM ===================== */
let N = 4;                         // tahta boyutu (Geniş Tahta yükseltmesiyle artar)
const SIZE_MAX = 6;
const SAVE_KEY = "shinobi2048";
const G = {
  /* AKIŞ (run) — ölünce sıfırlanır */
  stage:1, score:0, moves:0, enemyMoves:0, comboMult:1, enemy:null, over:false,
  /* KALICI (meta) — akışlar arası taşınır */
  gold:0, mergeLvl:0, masteryLvl:0, stoneLvl:0, boardSize:4,
  abilities:{}, charges:{}, undoSnap:null,
  best:0, bestStage:1, history:[], maxTier:0, totalDmg:0, runs:0,
  tab:"board",
};

/* ---------- AKTİF YETENEKLER (her akış sınırlı kullanım; ryō ile aç/geliştir)
   Pahalı + max 5 seviye + erişmesi zor → ileri oyun hedefi. Her seviye = +1 kullanım/akış. ---------- */
const ABILITY_MAX = 5;
const ABILITIES = [
  { id:"stone",   icon:"🪨", name:"Taş Kırma",      color:"#9aa0aa", base:1200, grow:2.0, desc:"Tahtadaki TÜM taşları kır" },
  { id:"bomb",    icon:"💥", name:"Çakra Bombası",  color:"#ff7a18", base:800,  grow:2.0, desc:"Canavara anında büyük hasar (%60 max HP)" },
  { id:"shuffle", icon:"🔀", name:"Karıştır",       color:"#7ae7ff", base:500,  grow:2.0, desc:"Karoları yeniden dağıt (sıkışınca)" },
  { id:"undo",    icon:"↩️", name:"Geri Al",        color:"#bfa6ff", base:450,  grow:1.9, desc:"Son hamleyi geri al (hata affı)" },
];
const abilityCost = (a) => Math.floor(a.base * Math.pow(a.grow, G.abilities[a.id] || 0));
let grid, tiles, nextId;

/* türetilen değerler (denge: headless simülasyonla ayarlandı — config C) */
const dmgMult    = () => 1 + 0.40 * G.mergeLvl;
const jutsuMult  = () => 1 + 0.25 * G.masteryLvl;
const isBoss     = () => G.stage % 5 === 0;
const enemyMaxHp = () => Math.floor(60 * Math.pow(1.08, G.stage - 1)) * (isBoss() ? 4 : 1);
/* canavarı bu kadar hamlede yıkarsan taş YOK; geçersen taş başlar.
   Süre ilerledikçe kısalır (zorlaşır); boss tankı için +; Taş Direnci süreyi uzatır. */
const graceMoves = () => Math.max(5, Math.round(14 - (G.stage - 1) * 0.4)) + (isBoss() ? 4 : 0) + G.stoneLvl * 2;
/* süre aşıldıktan sonra kaç fazladan hamlede bir taş düşer (ileri aşamada sıklaşır) */
const overEvery  = () => Math.max(1, 3 - Math.floor(G.stage / 8));
const mergeCost   = () => Math.floor(40 * Math.pow(1.5, G.mergeLvl));
const masteryCost = () => Math.floor(120 * Math.pow(1.6, G.masteryLvl));
const stoneCost   = () => Math.floor(200 * Math.pow(1.8, G.stoneLvl));
const sizeCost    = () => Math.floor(2500 * Math.pow(5, G.boardSize - 4));

/* ===================== DOM ===================== */
const $ = (id) => document.getElementById(id);
const app = $("app");
const el = {
  enemy:$("enemy"), enemyIcon:$("enemy-icon"), enemyName:$("enemy-name"),
  hpbar:$("hpbar"), hptext:$("hptext"), deadline:$("deadline"),
  stageNum:$("stage-num"), gold:$("gold"), score:$("score"), xpbar:$("xpbar"),
  comboMult:$("combo-mult"), comboPill:$("combo-pill"),
  arena:$("arena"), hero:$("hero"), heroIcon:$("hero-icon"),
  floatLayer:$("float-layer"), particles:$("particle-layer"),
  flash:$("combo-flash"), banner:$("stage-banner"), gear:$("gear"),
  portal:$("portal"), countdown:$("countdown"),
  board:$("board"), tileLayer:$("tile-layer"), cellBg:$("cell-bg"),
  tabContent:$("tab-content"), boardOver:$("board-over"), boTip:$("board-tip"),
  powerList:$("power-list"), statsList:$("stats-list"),
  abilityBar:$("ability-bar"), abilityList:$("ability-list"),
};

/* =====================================================================
   PROSEDÜREL PIXEL-ART SAHNE ÜRETİCİ
   ===================================================================== */
function svgURL(w, h, inner){
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
}
function rect(x,y,w,h,c){ return `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${c}'/>`; }
function rng(seed){ let s = seed; return () => (s = (s*1103515245+12345)&0x7fffffff) / 0x7fffffff; }
function ridge(W, H, base, amp, step, colors, seed){
  const r = rng(seed); let out = ""; let y = base;
  for(let x = 0; x < W; x += step){
    y += Math.round((r()-0.5) * amp);
    y = Math.max(H*0.12, Math.min(base + amp, y));
    out += rect(x, y, step+1, H - y, colors[(x/step|0) % colors.length]);
  }
  return out;
}
function skyBands(W, H, stops){
  let out = "", n = stops.length;
  for(let i = 0; i < n; i++){ const y0 = Math.round(H * i / n); out += rect(0, y0, W, Math.ceil(H/n)+1, stops[i]); }
  return out;
}
function star(x,y,c){ return rect(x,y,2,2,c); }
const SCENES = {
  "z-forest":{
    sky:["#bfe9ff","#a9dcf2","#cdeb9a","#aee07a"],
    far:(W,H)=>ridge(W,H,H*0.55,40,16,["#3f7d3a","#356b32","#2c5a2a"],11)+ridge(W,H,H*0.7,28,14,["#2c5a2a","#234820"],22),
    mid:(W,H)=>treeRow(W,H,["#1f5524","#184019","#0f2e12"],7),
    cel:(W,H)=>`<circle cx='${W*0.8}' cy='${H*0.2}' r='26' fill='#fff7c2'/>`,
    atmo:rays("rgba(255,255,200,.5)"),
  },
  "z-cave":{
    sky:["#0d0a1c","#141128","#1c1838","#241d44"],
    far:(W,H)=>ridge(W,H,H*0.6,30,18,["#2a2348","#211a3a","#191430"],33),
    mid:(W,H)=>stalag(W,H,["#3a2f63","#2a2150","#1c1638"]),
    cel:(W,H)=>crystals(W,H), atmo:"",
  },
  "z-snow":{
    sky:["#cfeeff","#b6e2fb","#a3d4f0","#dff1ff"],
    far:(W,H)=>ridge(W,H,H*0.5,46,16,["#dfeefc","#c6e0f2","#aecde8"],44)+snowCaps(W,H),
    mid:(W,H)=>pineRow(W,H,["#2c5a4a","#1f4438","#fff"],6),
    cel:(W,H)=>`<circle cx='${W*0.78}' cy='${H*0.22}' r='22' fill='#fffef0'/>`,
    atmo:flakes("#ffffff"),
  },
  "z-desert":{
    sky:["#ffe6a3","#ffd27a","#ffb45e","#f0945a"],
    far:(W,H)=>ridge(W,H,H*0.58,34,20,["#e0a45a","#d4934a","#c5853f"],55)+pyramids(W,H),
    mid:(W,H)=>cactusRow(W,H,["#3f8a3a","#2f6e2c"]),
    cel:(W,H)=>`<circle cx='${W*0.74}' cy='${H*0.24}' r='30' fill='#fff3c0'/>`,
    atmo:heat("rgba(255,230,150,.4)"),
  },
  "z-volcano":{
    sky:["#2a0d14","#4a1418","#6e1d1a","#8a2a14"],
    far:(W,H)=>volcano(W,H),
    mid:(W,H)=>ridge(W,H,H*0.74,22,16,["#3a1410","#260c0a","#160604"],66),
    cel:(W,H)=>`<circle cx='${W*0.8}' cy='${H*0.2}' r='20' fill='#ff7a2b'/><circle cx='${W*0.8}' cy='${H*0.2}' r='30' fill='#ff7a2b' opacity='.3'/>`,
    atmo:embers("#ff7a2b"),
  },
  "z-castle":{
    sky:["#120e26","#1a1438","#241c4e","#2e2358"],
    far:(W,H)=>ridge(W,H,H*0.62,26,18,["#241c4e","#1c1640","#151030"],77)+castle(W,H),
    mid:(W,H)=>ridge(W,H,H*0.78,16,14,["#1a1430","#120e26"],88),
    cel:(W,H)=>`<circle cx='${W*0.78}' cy='${H*0.2}' r='24' fill='#e8e2ff'/><circle cx='${W*0.72}' cy='${H*0.18}' r='24' fill='#241c4e'/>`,
    atmo:stars("#fff"),
  },
};
function treeRow(W,H,cols,count){
  const r = rng(101); let out = "";
  for(let i = 0; i <= count; i++){
    const x = Math.round(W * i / count) + Math.round((r()-0.5)*20);
    const th = 70 + Math.round(r()*60), tw = 26 + Math.round(r()*18);
    const top = H - th, c = cols[i % cols.length];
    out += rect(x+tw/2-3, top+th*0.5, 6, th*0.5, "#3a2410");
    for(let k = 0; k < 3; k++){ const lw = tw - k*6, ly = top + k*(th*0.22), lh = th*0.26; out += rect(x+(tw-lw)/2, ly, lw, lh, c); }
  }
  return out;
}
function pineRow(W,H,cols,count){
  let out = ""; const r = rng(202);
  for(let i=0;i<=count;i++){
    const x = Math.round(W*i/count)+Math.round((r()-0.5)*16);
    const th=80+Math.round(r()*50), tw=30, top=H-th;
    out += rect(x+tw/2-3, top+th*0.55, 6, th*0.45, "#3a2410");
    for(let k=0;k<3;k++){ const lw=tw-k*7, ly=top+k*(th*0.2), lh=th*0.24;
      out += rect(x+(tw-lw)/2, ly, lw, lh, cols[0]); out += rect(x+(tw-lw)/2, ly, lw, 4, cols[2]); }
  }
  return out;
}
function stalag(W,H,cols){
  let out=""; const r=rng(303);
  for(let i=0;i<8;i++){ const x=Math.round(W*i/8); const h=50+Math.round(r()*90);
    for(let s=0;s<5;s++){ const sw=30-s*5; out+=rect(x+(30-sw)/2, H-h+s*(h/5), sw, h/5+1, cols[s%cols.length]); } }
  for(let i=0;i<7;i++){ const x=Math.round(W*(i+0.5)/7); const h=40+Math.round(r()*70);
    for(let s=0;s<5;s++){ const sw=26-s*4; out+=rect(x+(26-sw)/2, s*(h/5), sw, h/5+1, cols[(s+1)%cols.length]); } }
  return out;
}
function crystals(W,H){ let out=""; const r=rng(304); const cs=["#7ae7ff","#37d0ff","#9a5cff"];
  for(let i=0;i<6;i++){ const x=W*r(), y=H*(0.2+r()*0.4), s=6+Math.round(r()*8); out+=rect(x,y,s,s*2,cs[i%cs.length])+rect(x+s,y+s,s/2,s,cs[(i+1)%cs.length]); } return out; }
function snowCaps(W,H){ let out=""; for(let i=0;i<5;i++){ const x=W*i/5+W*0.05; const w=W*0.18; out+=rect(x,H*0.46,w,10,"#ffffff"); } return out; }
function pyramids(W,H){ let out=""; for(let i=0;i<2;i++){ const cx=W*(0.3+i*0.4), base=H*0.6, ph=90+i*20;
  for(let s=0;s<8;s++){ const lw=(ph)*(1-s/8); out+=rect(cx-lw/2, base-s*(ph/8), lw, ph/8+1, s%2?"#c9863f":"#d99a4a"); } } return out; }
function cactusRow(W,H,cols){ let out=""; const r=rng(506);
  for(let i=0;i<6;i++){ const x=W*i/6+20+r()*30, h=50+Math.round(r()*40), top=H-h;
    out+=rect(x,top,14,h,cols[0])+rect(x-10,top+h*0.3,10,6,cols[1])+rect(x-10,top+h*0.3,6,30,cols[0])+rect(x+14,top+h*0.45,10,6,cols[1])+rect(x+18,top+h*0.2,6,34,cols[0]); } return out; }
function volcano(W,H){ let out=rect(0,0,W,H,"transparent"); const cx=W*0.5, base=H*0.7, vh=150;
  for(let s=0;s<10;s++){ const lw=vh*1.6*(1-s/13); out+=rect(cx-lw/2, base-s*(vh/10), lw, vh/10+1, s%2?"#3a1410":"#2a0e0a"); }
  out+=rect(cx-26,base-vh,52,10,"#ff5a1e")+rect(cx-18,base-vh-8,36,10,"#ffb347");
  out+=rect(cx-6,base-vh+6,12,vh*0.7,"#ff5a1e")+rect(cx-3,base-vh+6,6,vh*0.7,"#ffb347"); return out; }
function castle(W,H){ let out=""; const bx=W*0.5-120, by=H*0.34, bw=240, bh=H*0.3;
  out+=rect(bx,by,bw,bh,"#2a2350");
  for(let t=0;t<5;t++){ const tx=bx+t*(bw/4)-14; out+=rect(tx,by-40,28,50,"#241c46"); out+=rect(tx,by-50,8,12,"#241c46")+rect(tx+20,by-50,8,12,"#241c46"); }
  for(let i=0;i<6;i++){ out+=rect(bx+20+i*36, by+30, 10, 16, "#ffd24a"); } return out; }
function rays(c){ return (W,H)=>{ let o=""; for(let i=0;i<6;i++){ o+=`<polygon points='${W*0.5},0 ${i*W/5},${H} ${i*W/5+40},${H}' fill='${c}'/>`; } return o; }; }
function flakes(c){ return (W,H)=>{ const r=rng(606); let o=""; for(let i=0;i<40;i++) o+=star(W*r(),H*r(),c); return o; }; }
function stars(c){ return (W,H)=>{ const r=rng(707); let o=""; for(let i=0;i<50;i++) o+=star(W*r(),H*r()*0.7,c); return o; }; }
function embers(c){ return (W,H)=>{ const r=rng(808); let o=""; for(let i=0;i<30;i++) o+=rect(W*r(),H*r(),2,2,c); return o; }; }
function heat(c){ return (W,H)=>{ let o=""; for(let i=0;i<8;i++) o+=rect(0,H*i/8,W,2,c); return o; }; }
function buildScene(cls){
  const S = SCENES[cls]; if(!S) return; const W = 480, H = 360;
  $("sc-sky").style.backgroundImage = svgURL(W, H, skyBands(W, H, S.sky));
  $("sc-cel").style.backgroundImage = svgURL(W, H, S.cel ? S.cel(W,H) : "");
  $("sc-far").style.backgroundImage = svgURL(W, H, S.far ? S.far(W,H) : "");
  $("sc-mid").style.backgroundImage = svgURL(W, H, S.mid ? S.mid(W,H) : "");
  $("sc-atmo").style.backgroundImage = svgURL(W, H, S.atmo ? S.atmo(W,H) : "");
  $("sc-deco").style.backgroundImage = "";
}
function applyZone(){
  const z = currentZone();
  if(el.arena.className !== z.cls){ el.arena.className = z.cls; buildScene(z.cls); }
}

/* ===================== CANAVAR ===================== */
function createEnemy(){
  const boss = isBoss();
  const pool = boss ? BOSSES : ENEMIES;
  const pick = pool[(G.stage - 1) % pool.length];
  const max = enemyMaxHp();
  G.enemy = { name: boss ? "👑 " + pick.name : pick.name, hp: max, max };
  G.enemyMoves = 0;                 // yeni canavar → süre sayacı sıfırlanır
  el.enemyIcon.innerHTML = renderCreature(pick, boss ? 132 : 116, boss);
  el.enemyName.textContent = G.enemy.name;
  renderHp(); updateDeadline();
}
function spawnEnemy(intro){
  applyZone();
  if(isBoss() && intro){ startBossIntro(); return; }
  el.enemy.classList.remove("dead", "enter");
  createEnemy();
  if(intro) banner(`${currentZone().name} · Aşama ${G.stage}`);
}
function startBossIntro(){
  G.enemy = null;
  el.enemy.classList.add("dead");
  el.enemyName.textContent = ""; el.hpbar.style.width = "0%"; el.hptext.textContent = "";
  playPortal();
  sndBoss(); buzz([20,30,20]);
  banner("⚠ BOSS GELİYOR!");
  let n = 3; setCount(n);
  const iv = setInterval(() => {
    n--;
    if(n >= 1){ setCount(n); }
    else {
      clearInterval(iv);
      el.countdown.classList.add("hidden");
      portalBurst();
      el.enemy.classList.remove("dead");
      createEnemy();
      el.enemy.classList.remove("enter"); void el.enemy.offsetWidth; el.enemy.classList.add("enter");
      banner("BOSS!  " + currentZone().name);
      setTimeout(hidePortal, 600);
    }
  }, 800);
}
function setCount(n){
  el.countdown.classList.remove("hidden");
  el.countdown.textContent = n;
  el.countdown.classList.remove("cd-pop"); void el.countdown.offsetWidth; el.countdown.classList.add("cd-pop");
}
function portalBurst(){
  comboFlash("#8a5cff");
  app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake");
  burst("#8a5cff"); burst("#c9a3ff"); miniSpark("#8a5cff", 18);
}
function renderHp(){
  if(!G.enemy) return;
  el.hpbar.style.width = Math.max(0, G.enemy.hp / G.enemy.max * 100) + "%";
  el.hptext.textContent = `${Math.max(0, Math.ceil(G.enemy.hp))} HP`;
}
function dealDamage(dmg, kind, color){
  if(!G.enemy || G.enemy.hp <= 0) return;
  G.enemy.hp -= dmg; G.totalDmg += dmg;
  floatDamage(fmt(dmg), kind, color);
  el.enemy.classList.remove("hit"); void el.enemy.offsetWidth; el.enemy.classList.add("hit");
  renderHp();
  if(G.enemy.hp <= 0) defeatEnemy();
}
function defeatEnemy(){
  el.enemy.classList.add("dead");
  const boss = isBoss();
  const reward = Math.floor(G.enemy.max * 0.10 * (boss ? 2.2 : 1));
  G.gold += reward;
  floatDamage("+" + fmt(reward) + " 🪙", "crit", "#ffd24a");
  sndDefeat(); goldRain(boss ? 14 : 7); buzz(boss ? [30,40,30] : 22);
  G.stage++;
  setTimeout(() => { spawnEnemy(true); renderHud(); save(); }, 520);
}

/* ===================== 2048 TAHTA MOTORU ===================== */
function emptyBoard(){
  grid = []; for(let y=0;y<N;y++) grid.push(new Array(N).fill(null));
  tiles = new Map(); nextId = 1;
  el.tileLayer.innerHTML = "";
}
function addRandomTile(tier){
  const empties = [];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(!grid[y][x]) empties.push({x,y});
  if(!empties.length) return null;
  const c = empties[Math.floor(Math.random()*empties.length)];
  const t = { id: nextId++, tier: tier!=null ? tier : (Math.random()<0.12?1:0), x:c.x, y:c.y,
              el:null, isNew:true, merged:false, stone:false, wild:false, gold:false, bomb:false };
  // düşük şansla ÖZEL karo (sadece doğal spawn'larda, başlangıç karolarında değil)
  if(tier == null){
    const r = Math.random();
    if(r < 0.025)      t.wild = true;   // 🃏 her şeyle birleşir
    else if(r < 0.075) t.gold = true;   // 🪙 birleşince ryō
    else if(r < 0.11)  t.bomb = true;   // 💣 birleşince 3×3 patlar
  }
  grid[c.y][c.x] = t; tiles.set(t.id, t);
  return t;
}
/* canavarın saldırısı: birleşmeyen "kilitli taş" karo bırakır */
function addStone(){
  let filled = 0;
  const empties = [];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){ if(grid[y][x]) filled++; else empties.push({x,y}); }
  if(empties.length <= 2) return null;   // tahta zaten dolmak üzereyse acıma — kilitleme
  const c = empties[Math.floor(Math.random()*empties.length)];
  const t = { id: nextId++, tier:-1, x:c.x, y:c.y, el:null, isNew:true, merged:false, stone:true };
  grid[c.y][c.x] = t; tiles.set(t.id, t);
  return t;
}
function move(dir){               // 0 yukarı, 1 sağ, 2 aşağı, 3 sol
  if(G.over) return;
  const snap = snapshot();         // Geri Al için: hamleden önceki durum
  const vx = [0,1,0,-1][dir], vy = [-1,0,1,0][dir];
  const order = [...Array(N).keys()];
  const tx = vx>0 ? [...order].reverse() : order;
  const ty = vy>0 ? [...order].reverse() : order;
  let moved = false; const merges = []; const removed = [];
  tiles.forEach(t => { t.isNew = false; t.merged = false; });
  for(const x of tx) for(const y of ty){
    const tile = grid[y][x]; if(!tile) continue;
    let cx = x, cy = y, gone = false;
    while(true){
      const nx = cx+vx, ny = cy+vy;
      if(nx<0||nx>=N||ny<0||ny>=N) break;
      const occ = grid[ny][nx];
      if(occ){
        // joker (wild) her şeyle birleşir; yoksa aynı kademe gerekir
        const canMerge = !tile.stone && !occ.stone && !occ.merged &&
                         (tile.wild || occ.wild || occ.tier === tile.tier);
        if(canMerge){
          grid[y][x] = null;        // karoyu ORİJİNAL hücresinden kaldır (yürüdüğü değil)
          const at = tile.wild ? -1 : tile.tier, bt = occ.wild ? -1 : occ.tier;
          const base = Math.max(at, bt);
          occ.tier = (base < 0 ? 0 : base) + 1;   // iki joker → kademe 1
          occ.merged = true; occ.wild = false;
          occ._gold = tile.gold || occ.gold;       // özel bayraklar sonuca taşınır
          occ._bomb = tile.bomb || occ.bomb;
          occ.gold = false; occ.bomb = false;
          tile._goneX = nx; tile._goneY = ny; gone = true;
          removed.push(tile); tiles.delete(tile.id);
          merges.push(occ);
          if(occ.tier > G.maxTier) G.maxTier = occ.tier;
          moved = true;
        }
        break;                       // taş ya da farklı kademe → yol kapalı
      } else { cx = nx; cy = ny; }
    }
    if(gone) continue;
    if(cx!==x || cy!==y){ grid[y][x] = null; grid[cy][cx] = tile; tile.x = cx; tile.y = cy; moved = true; }
  }
  if(!moved) return;
  const spawned = addRandomTile();
  // canavar saldırısı: SÜREYİ AŞARSAN taş başlar (zamanında yıkarsan taş yok)
  G.moves = (G.moves || 0) + 1;
  G.enemyMoves = (G.enemyMoves || 0) + 1;
  if(G.enemy && G.enemy.hp > 0){
    const over = G.enemyMoves - graceMoves();
    if(over > 0 && over % overEvery() === 0){
      if(addStone()){ enemyStrike(); if(over === overEvery()) banner("⏳ Çok yavaş — taş geliyor!"); }
    }
  }
  actuate(removed);
  resolveMerges(merges);
  if(spawned) setHeroSprite("attack");
  // canavar öldüyse (aşama değişti) geri alma iptal — aksi halde bu hamle geri alınabilir
  G.undoSnap = (G.stage === snap.stage) ? snap : null;
  updateDanger();
  updateDeadline();
  renderHud();
  renderAbilityBar();
  if(isGameOver()) endRun();
  save();
}
function isGameOver(){
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){
    const a = grid[y][x];
    if(!a) return false;
    if(a.stone) continue;                          // taş birleşmez, atla
    if(x<N-1){ const R = grid[y][x+1]; if(R && !R.stone && (R.tier===a.tier || a.wild || R.wild)) return false; }
    if(y<N-1){ const D = grid[y+1][x]; if(D && !D.stone && (D.tier===a.tier || a.wild || D.wild)) return false; }
  }
  return true;
}
/* canavarın vuruşu — küçük görsel geri bildirim (henüz oyuncu HP yok, chill) */
function enemyStrike(){
  app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake");
  comboFlash("#ff5a4d");
}
/* ===================== AKIŞ (RUN) DÖNGÜSÜ ===================== */
/* tahta tıkandı → AKIŞ BİTER: en iyi skor güncellenir, aşama 1'e döner.
   Kazanılan ryō kalıcı → GÜÇ'ten yükselt → sonraki akışta daha ileri. */
function endRun(){
  G.over = true;
  if(G.score > G.best) G.best = G.score;
  if(G.stage > G.bestStage) G.bestStage = G.stage;
  G.runs = (G.runs || 0) + 1;
  G.history = G.history || [];
  G.history.unshift({ stage:G.stage, score:G.score, t:Date.now() });
  G.history = G.history.slice(0, 5);
  app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake");
  comboFlash("#ff3030");
  sndOver(); buzz([60,40,120]);
  showRunOver();
  save();
}
function showRunOver(){
  const o = el.boardOver;
  o.querySelector(".bo-title").textContent = "💀 Çakra Tükendi";
  o.querySelector(".bo-sub").innerHTML =
    `Bu akış: <b>Aşama ${G.stage}</b> · Skor <b>${fmt(G.score)}</b><br>` +
    `🏆 En iyi: Aşama ${G.bestStage} · ${fmt(G.best)}<br>` +
    `🪙 <b>${fmt(G.gold)}</b> ryō'nu <b>GÜÇ</b>'te harca → daha ileri git!`;
  o.querySelector("#bo-restart").textContent = "Yeni Akış ▶";
  o.classList.remove("hidden");
}
function newRun(){
  G.over = false;
  G.stage = 1; G.score = 0; G.moves = 0; G.comboMult = 1;
  el.comboMult.textContent = "1.0"; el.comboPill.classList.remove("active");
  el.boardOver.classList.add("hidden");
  applyBoardSize(G.boardSize);                 // satın alınan tahta boyutu bu akıştan geçerli
  emptyBoard(); addRandomTile(); addRandomTile();
  spawnEnemy(false);
  requestAnimationFrame(relayout);
  updateDanger(); renderHud(); save();
  resetCharges();
  renderAbilityBar();
  banner(N > 4 ? `Yeni akış — ${N}×${N} tahta!` : "Yeni akış — aşama 1");
}

/* ===================== AKTİF YETENEKLER ===================== */
function resetCharges(){
  G.charges = {};
  ABILITIES.forEach(a => { G.charges[a.id] = G.abilities[a.id] || 0; });
}
function snapshot(){
  const b = [];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){ const g = grid[y][x];
    if(g) b.push([x, y, g.tier, (g.wild?1:0)|(g.gold?2:0)|(g.bomb?4:0)]); }
  return { b, hp:G.enemy?G.enemy.hp:0, max:G.enemy?G.enemy.max:0, stage:G.stage, score:G.score, moves:G.moves };
}
function restoreSnap(s){
  emptyBoard();
  s.b.forEach(([x,y,tier,f]) => {
    f = f || 0;
    const t = { id:nextId++, tier, x, y, el:null, isNew:false, merged:false, stone: tier < 0,
                wild:!!(f&1), gold:!!(f&2), bomb:!!(f&4) };
    grid[y][x] = t; tiles.set(t.id, t);
  });
  if(G.enemy){ G.enemy.hp = s.hp; G.enemy.max = s.max; }
  G.stage = s.stage; G.score = s.score; G.moves = s.moves;
  requestAnimationFrame(relayout);
  renderHp(); updateDanger(); renderHud();
}
function useAbility(id){
  if(G.over) return;
  if((G.charges[id] || 0) <= 0) return;
  let used = false;
  if(id === "stone")        used = abStone();
  else if(id === "shuffle") used = abShuffle();
  else if(id === "bomb")    used = abBomb();
  else if(id === "undo")    used = abUndo();
  if(!used) return;
  sndAbility(); buzz(25);
  G.charges[id]--;
  if(id !== "undo") G.undoSnap = null;   // hamle-dışı eylem undo'yu geçersiz kılar
  renderAbilityBar();
  renderHud();
  save();
}
function abStone(){
  let removed = 0;
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){
    const t = grid[y][x];
    if(t && t.stone){
      grid[y][x] = null; tiles.delete(t.id);
      if(t.el){ t.el.classList.add("tile-gone"); const e = t.el; setTimeout(()=>e.remove(), 140); }
      removed++;
    }
  }
  if(!removed){ banner("Kırılacak taş yok"); return false; }
  burst("#9aa0aa"); miniSpark("#cfd2d8", 12);
  banner("🪨💥 Taşlar kırıldı!");
  updateDanger();
  return true;
}
function abShuffle(){
  const movable = [...tiles.values()].filter(t => !t.stone);
  if(movable.length < 2){ banner("Karıştıracak karo yok"); return false; }
  movable.forEach(t => { grid[t.y][t.x] = null; });
  const free = [];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(!grid[y][x]) free.push([x,y]);
  for(let i = free.length-1; i>0; i--){ const j = Math.random()*(i+1)|0; [free[i],free[j]]=[free[j],free[i]]; }
  movable.forEach((t, i) => { const [x,y] = free[i]; t.x=x; t.y=y; grid[y][x]=t; });
  comboFlash("#7ae7ff"); banner("🔀 Karıştırıldı");
  requestAnimationFrame(relayout); updateDanger();
  return true;
}
function abBomb(){
  if(!G.enemy || G.enemy.hp <= 0){ banner("Hedef yok"); return false; }
  const dmg = Math.round(G.enemy.max * 0.6);
  comboFlash("#ff7a18"); specialFlame("#ff7a18"); burst("#ff7a18"); burst("#fff"); miniSpark("#ff7a18", 16);
  launchProjectile("#ff7a18"); sndJutsu();
  app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake");
  setHeroSprite("attack");
  banner("💥 Çakra Bombası!");
  dealDamage(dmg, "jutsu", "#ff7a18");
  return true;
}
function abUndo(){
  if(!G.undoSnap){ banner("Geri alınacak hamle yok"); return false; }
  restoreSnap(G.undoSnap); G.undoSnap = null;
  banner("↩️ Geri alındı");
  return true;
}
function renderAbilityBar(){
  const unlocked = ABILITIES.filter(a => (G.abilities[a.id] || 0) > 0);
  if(!unlocked.length){ el.abilityBar.style.display = "none"; el.abilityBar.innerHTML = ""; return; }
  el.abilityBar.style.display = "flex";
  el.abilityBar.innerHTML = "";
  unlocked.forEach(a => {
    const ch = G.charges[a.id] || 0;
    const b = document.createElement("button");
    b.className = "ab-btn" + (ch <= 0 ? " empty" : "");
    b.style.setProperty("--ac", a.color);
    b.innerHTML = `<span class="ab-ic">${a.icon}</span><span class="ab-ch">${ch}</span>`;
    b.title = a.name + " — " + a.desc;
    if(ch > 0) b.addEventListener("click", () => useAbility(a.id));
    el.abilityBar.appendChild(b);
  });
}
function renderAbilityShop(){
  el.abilityList.innerHTML = "";
  ABILITIES.forEach(a => {
    const lvl = G.abilities[a.id] || 0, open = lvl > 0, maxed = lvl >= ABILITY_MAX;
    const cost = abilityCost(a);
    const can = !maxed && G.gold >= cost;
    const inner = maxed
      ? `<span class="bt-cost">MAX</span><span class="bt-sub">Lv5</span>`
      : `<span class="bt-cost">${fmt(cost)} 🪙</span><span class="bt-sub">${open ? "GELİŞTİR" : "AÇ"}</span>`;
    const row = document.createElement("div");
    row.className = "card" + (open ? "" : " locked");
    row.innerHTML = `
      <div class="card-thumb" style="--oc:${a.color};font-size:24px">${a.icon}</div>
      <div class="card-mid">
        <span class="card-name">${a.name}</span>
        <span class="card-lv">${open ? "Lv " + lvl + "/" + ABILITY_MAX + " · akış başına " + lvl + " kullanım" : "kilitli"}</span>
        <span class="card-desc">${a.desc}</span>
      </div>
      <button class="card-btn ${can ? "" : "locked"}" data-ab="${a.id}" ${can ? "" : "disabled"}>${inner}</button>`;
    el.abilityList.appendChild(row);
  });
  el.abilityList.querySelectorAll("[data-ab]").forEach(b => b.addEventListener("click", () => {
    const a = ABILITIES.find(x => x.id === b.dataset.ab);
    if((G.abilities[a.id] || 0) >= ABILITY_MAX) return;
    const c = abilityCost(a); if(G.gold < c) return;
    G.gold -= c;
    G.abilities[a.id] = (G.abilities[a.id] || 0) + 1;
    G.charges[a.id] = (G.charges[a.id] || 0) + 1;   // bu akışta da hemen +1 kullanım
    banner((G.abilities[a.id] === 1 ? "Açıldı: " : "Geliştirildi: ") + a.name);
    renderHud(); renderAbilityShop(); renderAbilityBar(); save();
  }));
}
/* tahta dolmak üzereyse kenar kırmızı uyarı */
function updateDanger(){
  let filled = 0;
  for(let y=0;y<N;y++) for(let x=0;x<N;x++) if(grid[y][x]) filled++;
  el.board.classList.toggle("danger", filled >= N*N - 2);
}
/* canavarı yıkma süresi göstergesi (kalan hamle / taş uyarısı) */
function updateDeadline(){
  if(!el.deadline) return;
  if(!G.enemy || G.enemy.hp <= 0){ el.deadline.textContent = ""; el.deadline.className = "deadline"; return; }
  const left = graceMoves() - (G.enemyMoves || 0);
  if(left > 0){ el.deadline.textContent = "⏳ " + left + " hamle"; el.deadline.className = "deadline" + (left <= 3 ? " warn" : ""); }
  else { el.deadline.textContent = "⚠ taş geliyor!"; el.deadline.className = "deadline alarm"; }
}

/* ---- birleştirmeleri hasara/efekte çevir ---- */
function resolveMerges(merges){
  if(!merges.length){ G.comboMult = 1; el.comboPill.classList.remove("active"); return; }
  G.comboMult = merges.length>=2 ? +(1 + 0.4*(merges.length-1)).toFixed(1) : 1;
  el.comboMult.textContent = G.comboMult.toFixed(1);
  el.comboPill.classList.toggle("active", G.comboMult>1);
  let total = 0, goldGain = 0;
  const deto = [];          // patlayacak karolar (jutsu kademesi veya bomba)
  const seen = new Set();
  merges.forEach(m => {
    G.score += tileValue(m.tier);
    total += tileValue(m.tier);
    if(m.tier >= 12){ total += tileValue(m.tier) * (1 + jutsuMult()); if(!seen.has(m.id)){ deto.push(m); seen.add(m.id); } }
    if(m._bomb && !seen.has(m.id)){ deto.push(m); seen.add(m.id); }   // 💣 bomba da patlar
    if(m._gold){ goldGain += Math.round(tileValue(m.tier) * 3 + 20); }
    m._gold = false; m._bomb = false;
  });
  if(G.score > G.best) G.best = G.score;
  total = Math.round(total * dmgMult() * G.comboMult);
  const topTier = Math.max(...merges.map(m => m.tier));
  sndMerge(topTier); if(merges.length > 1) sndCombo(merges.length);
  buzz(merges.length > 1 ? 18 : 9);
  if(goldGain){ G.gold += goldGain; floatDamage("+" + fmt(goldGain) + " 🪙", "crit", "#ffd24a"); sndGold(); goldRain(6); }
  if(deto.length){
    let bonus = 0;
    deto.forEach(m => { bonus += detonate(m); });          // jutsu/bomba patlar → 3×3 süpürür
    const hasJutsu = deto.some(m => m.tier >= 12);
    const fx = hasJutsu ? tierData(Math.max(...deto.filter(m=>m.tier>=12).map(m=>m.tier))).color : "#ff5a1e";
    specialFlame(fx); burst(fx); burst("#fff"); miniSpark(fx, 16);
    comboFlash(fx); launchProjectile(fx); sndJutsu(); buzz(35);
    app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake");
    banner(hasJutsu ? "💥 " + tierData(Math.max(...deto.filter(m=>m.tier>=12).map(m=>m.tier))).name + "!" : "💣 Patlama!");
    setHeroSprite("attack");
    dealDamage(total + Math.round(bonus * dmgMult()), "jutsu", fx);
    updateDanger();
  } else {
    const topColor = tierData(topTier).color;
    miniSpark(topColor, 6);
    if(G.comboMult > 1) comboFlash(topColor);
    dealDamage(total, "merge", topColor);
  }
}
/* jutsu karosu patlar: kendisi + çevresindeki 3×3 karoları (taşlar dahil) süpürür.
   Süpürülen normal karoların değerinin yarısı bonus hasar olur. */
function detonate(m){
  let bonus = 0;
  for(let dy=-1; dy<=1; dy++) for(let dx=-1; dx<=1; dx++){
    const x = m.x + dx, y = m.y + dy;
    if(x<0||x>=N||y<0||y>=N) continue;
    const t = grid[y][x];
    if(!t) continue;
    if(t !== m && !t.stone) bonus += tileValue(t.tier) * 0.5;
    grid[y][x] = null; tiles.delete(t.id);
    if(t.el){ t.el.classList.add("tile-gone"); const e = t.el; setTimeout(() => e.remove(), 140); }
  }
  return bonus;
}

/* ---- tahtayı çiz (akıcı kaydırma: el'ler kalıcı, transform değişince geçiş) ---- */
let CELL = 0, GAP = 8, PAD = 8;
function measureBoard(){
  const w = el.board.clientWidth;
  CELL = (w - PAD*2 - GAP*(N-1)) / N;
}
function setTilePos(node, x, y){
  node.style.width = CELL + "px"; node.style.height = CELL + "px";
  node.style.transform = `translate(${PAD + x*(CELL+GAP)}px, ${PAD + y*(CELL+GAP)}px)`;
}
function renderTile(t){
  if(t.stone){
    t.el.dataset.kind = "stone";
    t.el.style.setProperty("--tc", "#5a5560");
    t.el.innerHTML = `<div class="tile-inner"><span class="tile-ic"><span class="tj">🪨</span></span></div>`;
    return;
  }
  if(t.wild){          // 🃏 joker — kademe yok, her şeyle birleşir
    t.el.dataset.kind = "wild";
    t.el.style.setProperty("--tc", "#ff5ad0");
    t.el.innerHTML = `<div class="tile-inner"><span class="tile-ic"><span class="tj">🃏</span></span><span class="tile-v">JOKER</span></div>`;
    return;
  }
  const T = tierData(t.tier);
  t.el.style.setProperty("--tc", T.color);
  t.el.dataset.kind = T.kind;
  t.el.dataset.special = t.gold ? "gold" : (t.bomb ? "bomb" : "");
  const ic = T.kind === "animal" ? handSVG(T.key) : `<span class="tj">${T.icon}</span>`;
  const badge = t.gold ? `<span class="tile-badge">🪙</span>` : (t.bomb ? `<span class="tile-badge">💣</span>` : "");
  t.el.innerHTML = `<div class="tile-inner">${badge}<span class="tile-ic">${ic}</span><span class="tile-v">${fmt(tileValue(t.tier))}</span></div>`;
}
function actuate(removed){
  measureBoard();
  (removed||[]).forEach(t => {
    if(t.el){ setTilePos(t.el, t._goneX, t._goneY); t.el.classList.add("tile-gone"); const e = t.el; setTimeout(()=>e.remove(), 130); }
  });
  tiles.forEach(t => {
    if(!t.el){
      t.el = document.createElement("div");
      t.el.className = "tile";
      el.tileLayer.appendChild(t.el);
      renderTile(t); setTilePos(t.el, t.x, t.y);
      if(t.isNew){ t.el.classList.add("tile-new"); }
    } else {
      setTilePos(t.el, t.x, t.y);
      if(t.merged){ renderTile(t); t.el.classList.remove("tile-merge"); void t.el.offsetWidth; t.el.classList.add("tile-merge"); }
    }
  });
}
/* tahta boyutunu uygula: N + boşluklar + arka plan hücreleri */
function applyBoardSize(size){
  N = Math.max(4, Math.min(SIZE_MAX, size || 4));
  GAP = N <= 4 ? 8 : (N === 5 ? 7 : 6);
  PAD = GAP;
  buildCellBg();
}
function relayout(){
  measureBoard();
  tiles.forEach(t => {
    if(!t.el){                                  // yüklenen/başlangıç karoları için eleman oluştur
      t.el = document.createElement("div");
      t.el.className = "tile";
      el.tileLayer.appendChild(t.el);
      renderTile(t);
    }
    setTilePos(t.el, t.x, t.y);
  });
  syncDockHeight();
}
/* tüm sekmeler OYUN (tahta) paneliyle aynı yüksekliğe kilitlenir → geçişte zıplamaz */
function syncDockHeight(){
  const p = document.querySelector('.panel[data-panel="board"]');
  if(p && !p.classList.contains("hidden") && p.offsetHeight > 0){
    el.tabContent.style.height = p.offsetHeight + "px";
  }
}
function buildCellBg(){
  el.cellBg.style.gridTemplateColumns = `repeat(${N},1fr)`;
  el.cellBg.style.gridTemplateRows = `repeat(${N},1fr)`;
  el.cellBg.style.gap = GAP + "px";
  el.cellBg.style.padding = PAD + "px";
  el.cellBg.innerHTML = "";
  for(let i=0;i<N*N;i++){ const c = document.createElement("div"); c.className = "cell"; el.cellBg.appendChild(c); }
}

/* ===================== EFEKTLER ===================== */
function floatDamage(text, kind, color){
  const d = document.createElement("div");
  d.className = "dmg " + kind; d.textContent = text;
  if(color) d.style.color = color;
  d.style.left = (52 + Math.random() * 12) + "%";
  d.style.top  = (30 + Math.random() * 14) + "%";
  el.floatLayer.appendChild(d);
  setTimeout(() => d.remove(), 1000);
}
function burst(color){
  const cx = el.particles.clientWidth * 0.58, cy = el.particles.clientHeight * 0.46;
  for(let i = 0; i < 14; i++){
    const p = document.createElement("div"); p.className = "spark";
    p.style.setProperty("--sc", color);
    const ang = Math.random() * Math.PI * 2, dist = 60 + Math.random() * 90;
    p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
    p.style.left = cx + "px"; p.style.top = cy + "px";
    el.particles.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}
function miniSpark(color, count){
  count = count || 5;
  const cx = el.particles.clientWidth * 0.58, cy = el.particles.clientHeight * 0.46;
  for(let i = 0; i < count; i++){
    const p = document.createElement("div"); p.className = "spark";
    p.style.setProperty("--sc", color);
    const ang = Math.random() * Math.PI * 2, dist = 28 + Math.random() * 55;
    p.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    p.style.setProperty("--dy", Math.sin(ang) * dist + "px");
    p.style.left = cx + "px"; p.style.top = cy + "px";
    el.particles.appendChild(p);
    setTimeout(() => p.remove(), 600);
  }
}
function specialFlame(color){
  const cx = el.particles.clientWidth * 0.5, cy = el.particles.clientHeight * 0.5;
  for(let i = 0; i < 3; i++){
    const f = document.createElement("div"); f.className = "flame";
    f.style.setProperty("--fc", color);
    f.style.left = (cx + (i - 1) * 26) + "px"; f.style.top = cy + "px";
    f.style.animationDelay = (i * 60) + "ms";
    el.particles.appendChild(f);
    setTimeout(() => f.remove(), 800);
  }
}
function comboFlash(color){ el.flash.style.setProperty("--flash", color); el.flash.classList.remove("go"); void el.flash.offsetWidth; el.flash.classList.add("go"); }
function banner(text){ el.banner.textContent = text; el.banner.classList.remove("show"); void el.banner.offsetWidth; el.banner.classList.add("show"); }
/* hero'dan canavara giden mermi */
function launchProjectile(color){
  const W = el.particles.clientWidth, H = el.particles.clientHeight;
  const p = document.createElement("div"); p.className = "proj"; p.style.setProperty("--pc", color);
  p.style.left = (W*0.18) + "px"; p.style.top = (H*0.62) + "px";
  el.particles.appendChild(p);
  requestAnimationFrame(() => { p.style.transform = `translate(${W*0.40}px, ${-H*0.16}px) scale(1.3)`; p.style.opacity = "0.85"; });
  setTimeout(() => { burst(color); p.remove(); }, 260);
}
/* altın yağmuru */
function goldRain(n){
  for(let i=0;i<(n||8);i++){
    const c = document.createElement("div"); c.className = "coinfall"; c.textContent = "🪙";
    c.style.left = (38 + Math.random()*44) + "%"; c.style.animationDelay = (Math.random()*0.35) + "s";
    el.floatLayer.appendChild(c); setTimeout(() => c.remove(), 1200);
  }
}

/* ===================== SES & TİTREŞİM (WebAudio sentezi, asset yok) ===================== */
let AC = null, gMaster = null, gSfx = null, gMusic = null, musicTimer = null;
const SND = { on: true };
function loadAudioPref(){ try { SND.on = localStorage.getItem("snd") !== "0"; } catch(e){} }
function ensureAudio(){
  if(AC){ if(AC.state === "suspended") AC.resume(); return; }
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    gMaster = AC.createGain(); gMaster.gain.value = SND.on ? 1 : 0; gMaster.connect(AC.destination);
    gSfx = AC.createGain(); gSfx.gain.value = 0.6; gSfx.connect(gMaster);
    gMusic = AC.createGain(); gMusic.gain.value = 0; gMusic.connect(gMaster);
    startMusic();
  } catch(e){ AC = null; }
}
function tone(freq, dur, type, gain, slideTo){
  if(!AC || !SND.on) return;
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = type || "triangle"; o.frequency.setValueAtTime(freq, t);
  if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain || 0.3, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(gSfx); o.start(t); o.stop(t + dur + 0.03);
}
function noise(dur, gain, filterFreq){
  if(!AC || !SND.on) return;
  const t = AC.currentTime, n = Math.floor(AC.sampleRate * dur);
  const buf = AC.createBuffer(1, n, AC.sampleRate), d = buf.getChannelData(0);
  for(let i=0;i<n;i++) d[i] = Math.random()*2 - 1;
  const src = AC.createBufferSource(); src.buffer = buf;
  const f = AC.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filterFreq || 1200;
  const g = AC.createGain(); g.gain.setValueAtTime(gain || 0.3, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f); f.connect(g); g.connect(gSfx); src.start(t); src.stop(t + dur);
}
const PENTA = [0,3,5,7,10,12,15,17];
function sndMerge(tier){ const s = PENTA[Math.min(tier, PENTA.length-1)] + (tier>=PENTA.length?12:0); tone(220*Math.pow(2, s/12), 0.12, "triangle", 0.22); }
function sndCombo(n){ tone(523*Math.pow(2, Math.min(n,5)/12), 0.1, "square", 0.15); }
function sndJutsu(){ noise(0.3, 0.32, 1800); tone(330, 0.35, "sawtooth", 0.22, 80); }
function sndGold(){ tone(880, 0.07, "square", 0.18); setTimeout(() => tone(1318, 0.1, "square", 0.18), 70); }
function sndDefeat(){ tone(180, 0.22, "sawtooth", 0.2, 60); noise(0.18, 0.18, 700); }
function sndBoss(){ tone(110, 0.6, "sawtooth", 0.22, 440); }
function sndAbility(){ noise(0.25, 0.22, 2600); }
function sndOver(){ tone(220, 0.5, "triangle", 0.22, 80); }
/* lo-fi ambient: yumuşak pentatonik arpej + bas drone */
function startMusic(){
  if(!AC) return;
  clearInterval(musicTimer);
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = "sine"; o.frequency.value = 110; g.gain.value = 0.05; o.connect(g); g.connect(gMusic); o.start();
  gMusic.gain.linearRampToValueAtTime(SND.on ? 0.5 : 0, AC.currentTime + 2);
  const scale = [220, 261.63, 293.66, 329.63, 392, 440, 329.63, 293.66];
  let i = 0;
  musicTimer = setInterval(() => {
    if(!AC) return;
    const f = scale[i % scale.length]; i++;
    const tt = AC.currentTime, oo = AC.createOscillator(), gg = AC.createGain();
    oo.type = "triangle"; oo.frequency.value = f;
    gg.gain.setValueAtTime(0.0001, tt);
    gg.gain.exponentialRampToValueAtTime(0.1, tt + 0.12);
    gg.gain.exponentialRampToValueAtTime(0.0001, tt + 1.4);
    oo.connect(gg); gg.connect(gMusic); oo.start(tt); oo.stop(tt + 1.5);
  }, 920);
}
function setSound(on){
  SND.on = on;
  try { localStorage.setItem("snd", on ? "1" : "0"); } catch(e){}
  if(gMaster) gMaster.gain.value = on ? 1 : 0;
  const b = $("snd-toggle"); if(b) b.textContent = on ? "🔊" : "🔇";
}
function buzz(ms){ if(SND.on && navigator.vibrate){ try { navigator.vibrate(ms); } catch(e){} } }

/* ===================== HUD + MAĞAZA ===================== */
function renderHud(){
  el.stageNum.textContent = G.stage;
  el.gold.textContent = fmt(G.gold);
  el.score.textContent = fmt(G.score);
  el.xpbar.style.width = ((G.score % 1000) / 10) + "%";
  document.querySelectorAll(".gold-mirror").forEach(s => s.textContent = fmt(G.gold));
  refreshShop();
}
function renderPowerShop(){
  const items = [
    { icon:"🌀", oc:"#37d0ff", name:"Çakra Gücü", lv:"Lv " + G.mergeLvl + " · ×" + dmgMult().toFixed(2) + " hasar",
      desc:"Tüm birleştirme hasarı +%40 (kalıcı)", cost:mergeCost(), act:"merge" },
    { icon:"📖", oc:"#bfa6ff", name:"Mühür Ustalığı", lv:"Lv " + G.masteryLvl + " · +%" + (G.masteryLvl*25) + " jutsu",
      desc:"Jutsu karosu hasarı +%25 (kalıcı)", cost:masteryCost(), act:"mastery" },
    { icon:"🛡️", oc:"#9aa0aa", name:"Taş Direnci", lv:"Lv " + G.stoneLvl + " · +" + (G.stoneLvl*2) + " hamle süre",
      desc:"Canavarı yıkmak için +2 hamle süre (taş gecikir, kalıcı)", cost:stoneCost(), act:"stone" },
    { icon:"⬛", oc:"#7dff8a", name:"Geniş Tahta",
      lv: G.boardSize<SIZE_MAX ? `${G.boardSize}×${G.boardSize} → ${G.boardSize+1}×${G.boardSize+1}` : `${G.boardSize}×${G.boardSize} (MAX)`,
      desc:"Daha büyük tahta = çok daha ileri! (sonraki akışta)", cost:sizeCost(), act:"size", max:G.boardSize>=SIZE_MAX },
  ];
  el.powerList.innerHTML = "";
  items.forEach(it => {
    const can = !it.max && G.gold >= it.cost;
    const inner = it.max
      ? `<span class="bt-cost">MAX</span><span class="bt-sub">⬛</span>`
      : `<span class="bt-cost">${fmt(it.cost)} 🪙</span><span class="bt-sub">YÜKSELT</span>`;
    const row = document.createElement("div");
    row.className = "card";
    row.innerHTML = `
      <div class="card-thumb" style="--oc:${it.oc}">${it.icon}</div>
      <div class="card-mid">
        <span class="card-name">${it.name}</span><span class="card-lv">${it.lv}</span>
        <span class="card-desc">${it.desc}</span>
      </div>
      <button class="card-btn ${can ? "" : "locked"}" data-act="${it.act}" ${can ? "" : "disabled"}>${inner}</button>`;
    el.powerList.appendChild(row);
  });
  el.powerList.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
    const act = b.dataset.act;
    if(act === "merge"){ const c = mergeCost(); if(G.gold < c) return; G.gold -= c; G.mergeLvl++; }
    else if(act === "mastery"){ const c = masteryCost(); if(G.gold < c) return; G.gold -= c; G.masteryLvl++; }
    else if(act === "stone"){ const c = stoneCost(); if(G.gold < c) return; G.gold -= c; G.stoneLvl++; }
    else if(act === "size"){ if(G.boardSize >= SIZE_MAX) return; const c = sizeCost(); if(G.gold < c) return; G.gold -= c; G.boardSize++; banner(`Sonraki akış ${G.boardSize}×${G.boardSize} tahta!`); }
    renderHud(); renderPowerShop(); save();
  }));
}
function renderStats(){
  const s = [
    ["🏆 En İyi Aşama", G.bestStage], ["🏆 En İyi Skor", fmt(G.best)],
    ["Şu anki Aşama", G.stage], ["Şu anki Skor", fmt(G.score)],
    ["Ryō", fmt(G.gold)], ["Akış Sayısı", G.runs || 0],
    ["Hasar ×", dmgMult().toFixed(2)], ["En Yüksek Karo", tierData(G.maxTier).name],
  ];
  let html = s.map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");
  const hist = (G.history || []);
  if(hist.length){
    html += `<div class="stat hist-head"><div class="k">SON AKIŞLAR</div></div>`;
    html += hist.map((h, i) =>
      `<div class="stat hist"><div class="k">#${i+1}</div><div class="v">Aş.${h.stage} · ${fmt(h.score)}</div></div>`).join("");
  }
  el.statsList.innerHTML = html;
}
function refreshShop(){
  if(G.tab === "power") renderPowerShop();
  else if(G.tab === "ability") renderAbilityShop();
  else if(G.tab === "stats") renderStats();
}
function switchTab(name){
  G.tab = name;
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("hidden", p.dataset.panel !== name));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  if(name === "board"){ requestAnimationFrame(relayout); }
  else if(name === "power") renderPowerShop();
  else if(name === "ability") renderAbilityShop();
  else if(name === "stats") renderStats();
}

/* ===================== YARDIMCI ===================== */
function fmt(n){
  n = Math.round(n);
  if(n >= 1e9) return (n/1e9).toFixed(2) + "B";
  if(n >= 1e6) return (n/1e6).toFixed(2) + "M";
  if(n >= 1e3) return (n/1e3).toFixed(2) + "K";
  return "" + n;
}

/* ===================== KAYIT ===================== */
function save(){
  const board = [];
  for(let y=0;y<N;y++) for(let x=0;x<N;x++){ const g = grid[y][x];
    if(g) board.push([x, y, g.tier, (g.wild?1:0)|(g.gold?2:0)|(g.bomb?4:0)]); }
  const data = {
    ver:2,
    /* kalıcı (meta) */
    gold:G.gold, mergeLvl:G.mergeLvl, masteryLvl:G.masteryLvl, stoneLvl:G.stoneLvl, boardSize:G.boardSize,
    abilities:G.abilities,
    best:G.best, bestStage:G.bestStage, history:G.history, runs:G.runs,
    maxTier:G.maxTier, totalDmg:G.totalDmg,
    /* akış (run) */
    stage:G.stage, score:G.score, moves:G.moves, over:G.over, runN:N, board, charges:G.charges,
  };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch(e){}
}
function load(){
  let data;
  try { data = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch(e){ data = null; }
  if(!data) return false;
  // kalıcı alanlar her durumda taşınır
  Object.assign(G, {
    gold:data.gold||0, mergeLvl:data.mergeLvl||0, masteryLvl:data.masteryLvl||0, stoneLvl:data.stoneLvl||0,
    boardSize:Math.max(4, Math.min(SIZE_MAX, data.boardSize||4)),
    abilities:data.abilities||{},
    best:Math.max(data.best||0, data.score||0), bestStage:data.bestStage||data.stage||1,
    history:data.history||[], runs:data.runs||0, maxTier:data.maxTier||0, totalDmg:data.totalDmg||0,
  });
  const continuing = data.ver === 2 && !data.over && data.board && data.board.length && (data.runN||4) === G.boardSize;
  applyBoardSize(continuing ? (data.runN||4) : G.boardSize);
  emptyBoard();
  if(continuing){
    G.stage = data.stage||1; G.score = data.score||0; G.moves = data.moves||0;
    G.charges = data.charges || {};
    ABILITIES.forEach(a => { if(G.charges[a.id] == null) G.charges[a.id] = G.abilities[a.id] || 0; });
    data.board.forEach(([x,y,tier,f]) => {
      f = f || 0;
      const t = { id:nextId++, tier, x, y, el:null, isNew:false, merged:false, stone: tier < 0,
                  wild:!!(f&1), gold:!!(f&2), bomb:!!(f&4) };
      grid[y][x] = t; tiles.set(t.id, t);
    });
  } else {
    // eski sürüm / biten akış / boyut değişti → yeni akış başlat (kalıcılar korunur)
    G.stage = 1; G.score = 0; G.moves = 0;
    resetCharges();
    addRandomTile(); addRandomTile();
  }
  return true;
}
function resetGame(){
  try { localStorage.removeItem(SAVE_KEY); } catch(e){}
  location.reload();
}

/* ===================== GİRDİ ===================== */
function bindInput(){
  // klavye
  document.addEventListener("keydown", (e) => {
    const map = { ArrowUp:0, ArrowRight:1, ArrowDown:2, ArrowLeft:3, w:0, d:1, s:2, a:3, W:0, D:1, S:2, A:3 };
    if(e.key in map){ move(map[e.key]); e.preventDefault(); }
  });
  // dokunmatik kaydırma (tahta üzerinde)
  let sx = 0, sy = 0, tracking = false;
  const TH = 22;
  el.board.addEventListener("touchstart", (e) => {
    const t = e.touches[0]; sx = t.clientX; sy = t.clientY; tracking = true;
  }, { passive:true });
  el.board.addEventListener("touchmove", (e) => { if(tracking) e.preventDefault(); }, { passive:false });
  el.board.addEventListener("touchend", (e) => {
    if(!tracking) return; tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - sx, dy = t.clientY - sy;
    if(Math.max(Math.abs(dx), Math.abs(dy)) < TH) return;
    if(Math.abs(dx) > Math.abs(dy)) move(dx>0 ? 1 : 3);
    else move(dy>0 ? 2 : 0);
  }, { passive:true });
  // fare ile sürükleme (masaüstü)
  let mdown = false, mx = 0, my = 0;
  el.board.addEventListener("mousedown", (e) => { mdown = true; mx = e.clientX; my = e.clientY; });
  window.addEventListener("mouseup", (e) => {
    if(!mdown) return; mdown = false;
    const dx = e.clientX - mx, dy = e.clientY - my;
    if(Math.max(Math.abs(dx), Math.abs(dy)) < TH) return;
    if(Math.abs(dx) > Math.abs(dy)) move(dx>0 ? 1 : 3);
    else move(dy>0 ? 2 : 0);
  });

  document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => switchTab(t.dataset.tab)));
  el.gear.addEventListener("click", () => { if(confirm("Tüm ilerlemeyi sıfırla?")) resetGame(); });
  /* TEST BUTONU — SONRA KALDIR: her basışta +1000 ryō */
  const dbg = $("dbg-gold");
  if(dbg) dbg.addEventListener("click", () => { G.gold += 100000; renderHud(); renderAbilityBar(); save(); banner("+100K ryō (test)"); });
  $("bo-restart").addEventListener("click", newRun);
  window.addEventListener("resize", relayout);

  // ses: tercih + ilk dokunuşta başlat + mute düğmesi
  loadAudioPref();
  const sndBtn = $("snd-toggle");
  if(sndBtn){ sndBtn.textContent = SND.on ? "🔊" : "🔇"; sndBtn.addEventListener("click", () => { ensureAudio(); setSound(!SND.on); }); }
  const firstGesture = () => { ensureAudio(); window.removeEventListener("pointerdown", firstGesture); window.removeEventListener("keydown", firstGesture); };
  window.addEventListener("pointerdown", firstGesture);
  window.addEventListener("keydown", firstGesture);
}

/* ===================== BAŞLAT ===================== */
function init(){
  setHeroSprite("idle");
  const had = load();
  if(!had){ applyBoardSize(4); emptyBoard(); resetCharges(); }   // load yoksa varsayılan tahta
  if(tiles.size === 0){ addRandomTile(); addRandomTile(); }   // kayıt boşsa başlat
  spawnEnemy(false);
  requestAnimationFrame(() => { relayout(); });   // karoları İLK açılışta çiz (kaydırma beklemeden)
  setTimeout(syncDockHeight, 180);                 // fontlar/yerleşim oturunca yükseklik kesinleşsin
  renderHud();
  renderAbilityBar();
  bindInput();
  banner(had ? "Tekrar hoş geldin, şinobi" : "Kaydır ve birleştir!");
}
init();
