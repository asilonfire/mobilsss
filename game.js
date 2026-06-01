/* =====================================================================
   SHINOBI TAP — Mühür Combo + Tap Titans tarzı ilerleme
   Saf HTML/CSS/JS. index.html'i tarayıcıda aç → çalışır.

   - SAVAŞ: yuvarlak skill bar'dan jutsu seç → el işareti kombosunu yap → hasar
   - JUTSU: jutsu aç (ryō) ve güçlendir
   - PET:   element petlerini aç ve güçlendir → otomatik anlık hasar
   - GÜÇ:   temel tap hasarını ve jutsu ustalığını yükselt
   ===================================================================== */

/* ---------- EL İŞARETİ İKONLARI (stilize SVG) ---------- */
const HAND_TOP = {
  RAT:    '<path d="M25 16 L39 41 M39 16 L25 41" fill="none"/>',
  OX:     '<rect x="15" y="30" width="34" height="7" rx="3.5"/>',
  TIGER:  '<rect x="28.5" y="12" width="7" height="30" rx="3.5"/>',
  HARE:   '<path d="M26 41 L22 14 M38 41 L42 14" fill="none"/>',
  DRAGON: '<path d="M20 41 Q32 11 44 41" fill="none"/>',
  SERPENT:'<rect x="16" y="29" width="32" height="11" rx="5"/><path d="M22 29 V40 M28 29 V40 M34 29 V40 M40 29 V40" fill="none"/>',
  HORSE:  '<path d="M22 41 L32 13 L42 41" fill="none"/>',
  RAM:    '<rect x="25" y="14" width="6" height="28" rx="3"/><rect x="33" y="14" width="6" height="28" rx="3"/>',
  MONKEY: '<rect x="16" y="32" width="32" height="8" rx="4"/><rect x="11" y="34" width="9" height="6" rx="3"/>',
  BIRD:   '<path d="M24 41 L20 15 M29 41 L28 12 M35 41 L36 12 M40 41 L44 15" fill="none"/>',
  DOG:    '<circle cx="32" cy="27" r="9"/><rect x="16" y="37" width="32" height="6" rx="3"/>',
  BOAR:   '<ellipse cx="32" cy="33" rx="15" ry="9"/>',
};
/* ---- Mühür ikonları: adına uygun TEK RENK pixel-art hayvan ----
   '#' = dolu piksel. fill=currentColor → tek renk (CSS'ten renklenir). */
const ANIMALS = {
  // Fare — üstte iki YUVARLAK kulak
  RAT:[
    "............",".##......##.","####....####","####....####",".##########.",
    "############","############",".##########.","..########..","...#....#...","............"],
  // Öküz — geniş BOYNUZLAR (kulak yok)
  OX:[
    "#..........#","##........##",".##......##.","..#......#..","..########..",
    ".##########.","############","############",".##########.","..##....##..","............"],
  // Kaplan — sivri kulaklar + BIYIK (yanlarda)
  TIGER:[
    "............",".##......##.",".###....###.",".##########.","############",
    "############","############",".##########.","#.########.#","...#....#...","............"],
  // Tavşan — iki UZUN kulak
  HARE:[
    "....#..#....","....#..#....","....#..#....","....####....","...######...",
    "..########..","..########..","..########..","...######...","....#..#....","............"],
  // Ejderha — geriye boynuz + öne çene
  DRAGON:[
    "##..........",".##.........",".#####......","..#######...","..#########.",
    "..########.#","..#########.","..#######...",".#####......",".##.........","............"],
  // Yılan — YATAY kıvrımlı gövde + baş (artık "2" değil)
  SERPENT:[
    "............","............",".########...","########.##.",".########...",
    "...#####....",".....######.","..####......","###.........","............","............"],
  // At — uzun BURUN profili + yele
  HORSE:[
    ".###........",".####.......",".#####......",".#.####.....",".#..####....",
    ".#...####...",".....####...","......####..",".......###..","........##..","............"],
  // Koç — iki KIVRIK boynuz
  RAM:[
    "............",".##......##.","#..#....#..#","#.##....##.#",".##########.",
    ".##########.",".##########.","..########..","...######...","....#..#....","............"],
  // Maymun — YANLARDA iki yuvarlak kulak + ağız
  MONKEY:[
    "............","##........##","##........##",".##########.","############",
    "############",".##########.","..########..","..##....##..","...######...","............"],
  // Kuş — sağa bakan GAGA
  BIRD:[
    "...##.......","..####......",".######.....",".######.###.",".#########..",
    ".######.....","..####......","...##.......","............","............","............"],
  // Köpek — SARKAN kulaklar + burun
  DOG:[
    "............",".##......##.",".###....###.",".####..####.",".##########.",
    "############","############",".##########.","..########..","...##..##...","............"],
  // Yaban domuzu — yukarı DİŞLER (tusk) + burun
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

/* ---------- PIXEL ART SPRITE YÜKLEYİCİ ----------
   Resim varsa onu, yoksa emoji'yi gösterir (assets/README.md'ye bak).
   sheet={cols,rows,col,row} verilirse spritesheet'ten TEK kareyi keser
   (eklenen görseller 3x4 RPG Maker karakter sayfaları). */
function sprite(src, emoji, size, sheet){
  size = size || 32;
  if(!sheet){
    return `<img class="px" src="${src}" alt="" style="width:${size}px;height:${size}px"
              data-fb="${emoji}" data-sz="${size}" onerror="pxFail(this)">`;
  }
  const cols = sheet.cols || 3, rows = sheet.rows || 4;
  const col = sheet.col == null ? 1 : sheet.col;     // orta sütun = duruş karesi
  const row = sheet.row || 0;                         // satır = yön/karakter
  const anim = sheet.anim || "idle";                  // idle | idleSlow | static
  const startX = anim === "static" ? -col * size : 0; // statik = orta kare
  const animCls = anim === "static" ? "" : " " + anim;
  // background ile tek kare; X ekseni keyframe ile 3 kareyi döndürür (canlı animasyon)
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
/* Kahraman — elle çizilmiş pixel-art NINJA (kapüşon, alın bandı, maske) */
const NINJA = [
  "......HHHH......",
  ".....HDDDDH.....",
  "....HDDDDDDH....",
  "....HDDDDDDH....",
  "...RRRRRRRRRR...",
  "...RRRRRRRRRRRR.",
  "...SSWWSSWWSS...",
  "...DDDDDDDDDD...",
  "....DDDDDDDD....",
  "....DDDDDDDD....",
  "...DDDDDDDDDD...",
  "..DDDDDDDDDDDD..",
  ".DDDDDDDDDDDDDD.",
  ".DDDDDDDDDDDDDD.",
  "..DDDRRRRRRDDD..",
  "..DDDDDDDDDDDD..",
  "...DDDD..DDDD...",
  "...DDDD..DDDD...",
  "..HHHH....HHHH..",
];
const NINJA_COLORS = { H:"#11142a", D:"#1b2036", R:"#cf3b3b", S:"#f1c79b", W:"#ffffff" };
function pxSprite(grid, colors, size){
  const cols = Math.max(...grid.map(r => r.length)), rows = grid.length;
  let rects = "";
  for(let y = 0; y < rows; y++)
    for(let x = 0; x < grid[y].length; x++){
      const c = colors[grid[y][x]];
      if(c) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;
    }
  const w = Math.round(size * cols / rows);
  return `<svg viewBox="0 0 ${cols} ${rows}" width="${w}" height="${size}" shape-rendering="crispEdges" style="image-rendering:pixelated;display:block">${rects}</svg>`;
}

/* ---- Yatay animasyon ŞERİDİ (hero/boss/düşman) ----
   src: yan yana karelerden oluşan png | frames: kare sayısı (genişlik/yükseklik) */
function stripSprite(src, frames, size, opt){
  opt = opt || {};
  const dur = opt.dur || frames * 0.12;
  const iter = opt.once ? "1 forwards" : "infinite";
  return `<span class="px-strip" style="--f:${frames};--sz:${size}px;width:${size}px;height:${size}px;
      background-image:url('${src}');background-size:${frames * size}px ${size}px;
      animation:stripPlay ${dur}s steps(${frames}) ${iter}"></span>`;
}
/* yaratığı tipine göre çiz: strip | static | sheet(3x4) */
function renderCreature(e, size, boss){
  const t = e.type || "sheet";
  if(t === "strip")  return stripSprite(e.img, e.frames, size, { dur: e.dur });
  if(t === "static") return sprite(e.img, e.icon, size);
  const row = boss ? (e.row || 0) : 0;
  return sprite(e.img, e.icon, size, { row, anim: boss ? "idleSlow" : "idle" });
}
/* yeni hero — animasyon şeritleri (yan yana kareler) */
const HERO = {
  idle:   { img:"assets/hero/IDLE.png",     frames:10, dur:1.1 },
  attack: { img:"assets/hero/ATTACK%201.png",frames:7,  dur:0.42 },
  hurt:   { img:"assets/hero/HURT.png",      frames:4,  dur:0.3 },
};
/* boss portalı — spritesheet (960x576 = 5 sütun x 3 satır = 15 kare) */
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
  portalIv = setInterval(() => {
    portalFrame = (portalFrame + 1) % PORTAL_TOTAL;
    showPortalFrame(portalFrame);
  }, 90);
}
function hidePortal(){
  clearInterval(portalIv); portalIv = null;
  el.portal.classList.add("closing");
  setTimeout(() => el.portal.classList.add("hidden"), 350);
}
const HERO_SIZE = 190;        // hero boyutu (büyütüldü)
let heroAnimTimer = null;
function setHeroSprite(state){
  const a = HERO[state] || HERO.idle;
  const once = state !== "idle";
  el.heroIcon.innerHTML = stripSprite(a.img, a.frames, HERO_SIZE, { dur: a.dur, once });
  clearTimeout(heroAnimTimer);
  if(once) heroAnimTimer = setTimeout(() => setHeroSprite("idle"), a.dur * 1000);
}
const BOSS_TIME = 30;       // boss için saniye sınırı
const CHARGE_NEED = 3;      // özel vuruş için art arda combo sayısı
const SPECIAL_MULT = 4;     // özel vuruş hasar çarpanı
const COMBO_TIMEOUT = 2500; // ms — bu süre işlem olmazsa kombo sıfırlanır (başa döner)

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

/* ---------- 12 EL MÜHRÜ ---------- */
const SEALS = [
  { en:"RAT",     jp:"子", r:"Ne" },     { en:"OX",      jp:"丑", r:"Ushi" },
  { en:"TIGER",   jp:"寅", r:"Tora" },   { en:"HARE",    jp:"卯", r:"U" },
  { en:"DRAGON",  jp:"辰", r:"Tatsu" },  { en:"SERPENT", jp:"巳", r:"Mi" },
  { en:"HORSE",   jp:"午", r:"Uma" },    { en:"RAM",     jp:"未", r:"Hitsuji" },
  { en:"MONKEY",  jp:"申", r:"Saru" },   { en:"BIRD",    jp:"酉", r:"Tori" },
  { en:"DOG",     jp:"戌", r:"Inu" },    { en:"BOAR",    jp:"亥", r:"I" },
];

/* ---------- JUTSU (skiller) ---------- */
const JUTSU = [
  { id:0, jp:"火遁・豪火球の術",   name:"Katon: Gōkakyū",      icon:"🔥", img:"assets/jutsu/katon.png",        color:"#ff7a18", seals:[5,7,2],     power:40,  cost:0 },
  { id:1, jp:"千鳥",               name:"Chidori",             icon:"⚡", img:"assets/jutsu/chidori.png",      color:"#37d0ff", seals:[1,3,8],     power:55,  cost:0 },
  { id:2, jp:"影分身の術",         name:"Kage Bunshin",        icon:"👥", img:"assets/jutsu/kage_bunshin.png", color:"#bfa6ff", seals:[7,5,2],     power:35,  cost:200,  hits:3 },
  { id:3, jp:"水遁・水龍弾",       name:"Suiton: Suiryūdan",   icon:"💧", img:"assets/jutsu/suiton.png",       color:"#3aa0ff", seals:[4,2,5,7],   power:90,  cost:600 },
  { id:4, jp:"螺旋丸",             name:"Rasengan",            icon:"🌀", img:"assets/jutsu/rasengan.png",     color:"#7ae7ff", seals:[6,8,4,1],   power:140, cost:1800 },
  { id:5, jp:"風遁・螺旋手裏剣",   name:"Fūton: Rasenshuriken",icon:"💥", img:"assets/jutsu/rasenshuriken.png",color:"#9dff5d", seals:[3,5,6,8,2], power:240, cost:5000 },
];

/* ---------- DOSTLAR (ally — oto hasar) ----------
   img = eklenen 3x4 karakter spritesheet'leri (tek kare kesilir) */
const PETS = [
  { id:"a1", name:"Genin Dostu",      role:"Katon",    icon:"🧒", img:"assets/pets/Male%2001-1.png",   color:"#ff6a2b", base:4,   cost:150 },
  { id:"a2", name:"Tıbbi Ninja",      role:"İyileştirme",icon:"💗", img:"assets/pets/Female%2002-1.png", color:"#3aa0ff", base:9,   cost:500 },
  { id:"a3", name:"Ninken (Köpek)",   role:"Koku İzi",  icon:"🐕", img:"assets/pets/Dog-01-2r.png",     color:"#caa46a", base:18,  cost:1500 },
  { id:"a4", name:"Yıldırım Kunoiçi", role:"Raiton",   icon:"⚡", img:"assets/pets/Female%2005-3.png", color:"#ffe14a", base:34,  cost:4500 },
  { id:"a5", name:"Jōnin Dostu",      role:"Doton",    icon:"🥷", img:"assets/pets/Male%2010-2.png",   color:"#c08a4a", base:60,  cost:12000 },
  { id:"a6", name:"Nin-neko (Kedi)",  role:"Çeviklik",  icon:"🐱", img:"assets/pets/Cat%2001-1.png",    color:"#b89bff", base:105, cost:30000 },
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
  // yeni eklenenler (farklı format)
  {name:"Tarla Faresi",icon:"🐀",img:"assets/enemies/rat-idle.png",type:"strip",frames:6},
  {name:"Goblin Savaşçı",icon:"👺",img:"assets/enemies/Goblin%20Monsters%20Color%20A1.png",type:"static"},
  {name:"Goblin Okçu",icon:"🏹",img:"assets/enemies/Goblin%20Monsters%20Color%20A3.png",type:"static"},
  {name:"Goblin Şaman",icon:"🔮",img:"assets/enemies/Goblin%20Monsters%20Color%20A5.png",type:"static"},
  {name:"Goblin Reis",icon:"👹",img:"assets/enemies/Goblin%20Monsters%20Color%20A7.png",type:"static"},
];
/* Boss 01.png = tek sayfada 4 farklı boss (her satır biri) */
const BOSSES = [
  {name:"Beyaz İblis",   icon:"👹", img:"assets/bosses/Boss%2001.png", row:0},
  {name:"Kara Cübbe",    icon:"🕴️", img:"assets/bosses/Boss%2001.png", row:1},
  {name:"Karanlık Göz",  icon:"🌑", img:"assets/bosses/Boss%2001.png", row:2},
  {name:"Kızıl Gargoyle",icon:"😈", img:"assets/bosses/Boss%2001.png", row:3},
  // yeni boss — 7 kareli animasyon şeridi
  {name:"Cass", icon:"⚔️", img:"assets/bosses/cassidle.png", type:"strip", frames:7, dur:0.9},
];

/* ===================== DURUM ===================== */
const G = {
  stage:1, subKill:1, gold:0, level:1, xp:0,
  enemy:null, comboMult:1,
  comboStreak:0, charged:false, lastCombo:0,   // özel vuruş şarjı + kombo zamanı
  unlocked:new Set([0,1]),   // açık jutsu id'leri
  jLvl:{0:1,1:1},            // jutsu seviyeleri
  activeId:0, inputPos:0, padSeals:[],
  pets:{},                   // id -> seviye
  tapLvl:1, masteryLvl:0,
  tab:"combat",
  totalDmg:0,
};

/* ===================== DOM ===================== */
const $ = (id) => document.getElementById(id);
const app = $("app");
const el = {
  stage:$("stage"), kills:$("kills"), gold:$("gold"), level:$("level"), xpbar:$("xpbar"),
  enemy:$("enemy"), enemyIcon:$("enemy-icon"), enemyName:$("enemy-name"),
  hpbar:$("hpbar"), hptext:$("hptext"),
  comboMult:$("combo-mult"), comboPill:$("combo-pill"), comboGround:$("combo-ground"),
  arena:$("arena"), hero:$("hero"), heroIcon:$("hero-icon"),
  alliesLeft:$("allies-left"), alliesRight:$("allies-right"),
  skillBar:$("skill-bar"),
  jutsuIcon:$("jutsu-icon"), jutsuJp:$("jutsu-jp"), jutsuName:$("jutsu-name"),
  seq:$("seal-sequence"), pad:$("seal-pad"),
  skillList:$("skill-list"), petList:$("pet-list"), powerList:$("power-list"),
  statsList:$("stats-list"), tapTitle:$("tapdmg-title"), skillsTitle:$("skills-title"),
  floatLayer:$("float-layer"), particles:$("particle-layer"),
  flash:$("combo-flash"), banner:$("stage-banner"), gear:$("gear"),
  bossTimer:$("boss-timer"), bossBar:$("boss-bar"), bossText:$("boss-text"),
  portal:$("portal"), countdown:$("countdown"),
};
let bossInterval = null;
let bossIntroIv = null;

/* ===================== TÜRETİLEN DEĞERLER ===================== */
const tapDamage   = () => 3 + G.tapLvl * 2;
const masteryMult = () => 1 + 0.12 * G.masteryLvl;
const xpToLevel   = () => G.level * 80;
const diff        = () => (G.stage - 1) * 10 + G.subKill;   // genel zorluk
const isBoss      = () => G.subKill === 10;
const enemyMaxHp  = () => Math.floor(38 * Math.pow(1.13, diff() - 1)) * (isBoss() ? 5 : 1);

const unlockedJutsu = () => JUTSU.filter(j => G.unlocked.has(j.id));
const activeJutsu   = () => JUTSU.find(j => j.id === G.activeId);
const jutsuPower = (j) => j.power + ((G.jLvl[j.id] || 1) - 1) * Math.ceil(j.power * 0.3);

const petDps = (p) => (G.pets[p.id] || 0) * p.base;
const totalPetDps = () => PETS.reduce((s, p) => s + petDps(p), 0);

/* maliyetler */
const tapCost     = () => Math.floor(12 * Math.pow(1.16, G.tapLvl - 1));
const masteryCost = () => Math.floor(80 * Math.pow(1.4, G.masteryLvl));
const jutsuUpCost = (j) => Math.floor(Math.max(25, j.power * 0.6) * Math.pow(1.35, (G.jLvl[j.id] || 1) - 1));
const petUpCost   = (p) => Math.floor(p.cost * 0.35 * Math.pow(1.32, (G.pets[p.id] || 1) - 1));

/* ===================== TUŞ TAKIMI ===================== */
function computePadSeals(){
  const set = new Set();
  unlockedJutsu().forEach(j => j.seals.forEach(s => set.add(s)));
  return [...set].sort((a, b) => a - b);
}
function buildSealPad(){
  G.padSeals = computePadSeals();
  const left = $("pad-left"), right = $("pad-right");
  left.innerHTML = ""; right.innerHTML = "";
  const half = Math.ceil(G.padSeals.length / 2);   // ilk yarı sol, kalan sağ
  G.padSeals.forEach((sealIdx, pos) => {
    const s = SEALS[sealIdx];
    const key = pos < 9 ? String(pos + 1) : (pos === 9 ? "0" : "");
    const b = document.createElement("button");
    b.className = "seal-btn";
    b.dataset.idx = sealIdx;
    b.innerHTML = `${key ? `<span class="keyhint">${key}</span>` : ""}${handSVG(s.en)}<span class="seal-name">${s.en}</span>`;
    b.addEventListener("click", () => tapSeal(sealIdx));
    (pos < half ? left : right).appendChild(b);
  });
  highlightNextSeal();
}

/* ===================== SKILL BAR (sadece AÇIK jutsular) ===================== */
function buildSkillBar(){
  el.skillBar.innerHTML = "";
  unlockedJutsu().forEach(j => {
    const o = document.createElement("button");
    const isActive = j.id === G.activeId;
    o.className = "skill-orb" + (isActive ? " active" : "") + (isActive && G.charged ? " charged" : "");
    o.style.setProperty("--oc", j.color);
    o.innerHTML = `<span>${sprite(j.img, j.icon, 30)}</span><span class="lvtag">${G.jLvl[j.id]}</span>`;
    o.addEventListener("click", () => {
      if(j.id === G.activeId && G.charged){ fireSpecial(j); return; }  // şarjlı → özel vuruş
      G.activeId = j.id; G.inputPos = 0;
      buildSkillBar(); renderJutsu();
    });
    el.skillBar.appendChild(o);
  });
}

/* ===================== DÜŞMAN ===================== */
function applyZone(){
  const z = currentZone();
  if(el.arena.className !== z.cls){
    el.arena.className = z.cls;   // arena yalnızca zone class taşır
    buildScene(z.cls);           // detaylı pixel-art sahneyi kur
  }
}

/* =====================================================================
   PROSEDÜREL PIXEL-ART SAHNE ÜRETİCİ
   Her katman bir SVG (crispEdges) → data-URI olarak background.
   ===================================================================== */
function svgURL(w, h, inner){
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
}
function rect(x,y,w,h,c){ return `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='${c}'/>`; }
// deterministik sözde-rastgele (zone'a göre sabit) — Math.random kullanılmıyor
function rng(seed){ let s = seed; return () => (s = (s*1103515245+12345)&0x7fffffff) / 0x7fffffff; }

// basamaklı (pixel) dağ/tepe silüeti
function ridge(W, H, base, amp, step, colors, seed){
  const r = rng(seed); let out = "";
  let y = base;
  for(let x = 0; x < W; x += step){
    y += Math.round((r()-0.5) * amp);
    y = Math.max(H*0.12, Math.min(base + amp, y));
    out += rect(x, y, step+1, H - y, colors[(x/step|0) % colors.length]);
  }
  return out;
}
// dikey gradient'i pixel bantlarına böler
function skyBands(W, H, stops){
  let out = "", n = stops.length;
  for(let i = 0; i < n; i++){
    const y0 = Math.round(H * i / n);
    out += rect(0, y0, W, Math.ceil(H/n)+1, stops[i]);
  }
  return out;
}
function star(x,y,c){ return rect(x,y,2,2,c); }

const SCENES = {
  "z-forest":{
    sky:["#bfe9ff","#a9dcf2","#cdeb9a","#aee07a"],
    far:(W,H)=>ridge(W,H,H*0.55,40,16,["#3f7d3a","#356b32","#2c5a2a"],11)
            + ridge(W,H,H*0.7,28,14,["#2c5a2a","#234820"],22),
    mid:(W,H)=>treeRow(W,H,["#1f5524","#184019","#0f2e12"],7,33),
    cel:(W,H)=>`<circle cx='${W*0.8}' cy='${H*0.2}' r='26' fill='#fff7c2'/>`,
    atmo:rays("rgba(255,255,200,.5)"),
  },
  "z-cave":{
    sky:["#0d0a1c","#141128","#1c1838","#241d44"],
    far:(W,H)=>ridge(W,H,H*0.6,30,18,["#2a2348","#211a3a","#191430"],33),
    mid:(W,H)=>stalag(W,H,["#3a2f63","#2a2150","#1c1638"]),
    cel:(W,H)=>crystals(W,H),
    atmo:"",
  },
  "z-snow":{
    sky:["#cfeeff","#b6e2fb","#a3d4f0","#dff1ff"],
    far:(W,H)=>ridge(W,H,H*0.5,46,16,["#dfeefc","#c6e0f2","#aecde8"],44)
            + snowCaps(W,H),
    mid:(W,H)=>pineRow(W,H,["#2c5a4a","#1f4438","#fff"],6),
    cel:(W,H)=>`<circle cx='${W*0.78}' cy='${H*0.22}' r='22' fill='#fffef0'/>`,
    atmo:flakes("#ffffff"),
  },
  "z-desert":{
    sky:["#ffe6a3","#ffd27a","#ffb45e","#f0945a"],
    far:(W,H)=>ridge(W,H,H*0.58,34,20,["#e0a45a","#d4934a","#c5853f"],55)
            + pyramids(W,H),
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
    far:(W,H)=>ridge(W,H,H*0.62,26,18,["#241c4e","#1c1640","#151030"],77)
            + castle(W,H),
    mid:(W,H)=>ridge(W,H,H*0.78,16,14,["#1a1430","#120e26"],88),
    cel:(W,H)=>`<circle cx='${W*0.78}' cy='${H*0.2}' r='24' fill='#e8e2ff'/><circle cx='${W*0.72}' cy='${H*0.18}' r='24' fill='#241c4e'/>`,
    atmo:stars("#fff"),
  },
};

/* ---- katman yapı taşları ---- */
function treeRow(W,H,cols,count){
  const r = rng(101); let out = "";
  for(let i = 0; i <= count; i++){
    const x = Math.round(W * i / count) + Math.round((r()-0.5)*20);
    const th = 70 + Math.round(r()*60), tw = 26 + Math.round(r()*18);
    const top = H - th, c = cols[i % cols.length];
    out += rect(x+tw/2-3, top+th*0.5, 6, th*0.5, "#3a2410"); // gövde
    // çam katmanları (üçgen yerine pixel basamak)
    for(let k = 0; k < 3; k++){
      const lw = tw - k*6, ly = top + k*(th*0.22), lh = th*0.26;
      out += rect(x+(tw-lw)/2, ly, lw, lh, c);
    }
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
      out += rect(x+(tw-lw)/2, ly, lw, lh, cols[0]);
      out += rect(x+(tw-lw)/2, ly, lw, 4, cols[2]); } // kar tepesi
  }
  return out;
}
function stalag(W,H,cols){
  let out=""; const r=rng(303);
  for(let i=0;i<8;i++){ const x=Math.round(W*i/8); const h=50+Math.round(r()*90);
    // yerden yükselen
    for(let s=0;s<5;s++){ const sw=30-s*5; out+=rect(x+(30-sw)/2, H-h+s*(h/5), sw, h/5+1, cols[s%cols.length]); }
  }
  // tavandan sarkan
  for(let i=0;i<7;i++){ const x=Math.round(W*(i+0.5)/7); const h=40+Math.round(r()*70);
    for(let s=0;s<5;s++){ const sw=26-s*4; out+=rect(x+(26-sw)/2, s*(h/5), sw, h/5+1, cols[(s+1)%cols.length]); } }
  return out;
}
function crystals(W,H){
  let out=""; const r=rng(304); const cs=["#7ae7ff","#37d0ff","#9a5cff"];
  for(let i=0;i<6;i++){ const x=W*r(), y=H*(0.2+r()*0.4), s=6+Math.round(r()*8);
    out+=rect(x,y,s,s*2,cs[i%cs.length])+rect(x+s,y+s,s/2,s,cs[(i+1)%cs.length]); }
  return out;
}
function snowCaps(W,H){ let out=""; const r=rng(405);
  for(let i=0;i<5;i++){ const x=W*i/5+W*0.05; const w=W*0.18; out+=rect(x,H*0.46,w,10,"#ffffff"); } return out; }
function pyramids(W,H){
  let out=""; const r=rng(505);
  for(let i=0;i<2;i++){ const cx=W*(0.3+i*0.4), base=H*0.6, ph=90+i*20;
    for(let s=0;s<8;s++){ const lw=(ph)*(1-s/8); out+=rect(cx-lw/2, base-s*(ph/8), lw, ph/8+1, s%2?"#c9863f":"#d99a4a"); } }
  return out;
}
function cactusRow(W,H,cols){
  let out=""; const r=rng(506);
  for(let i=0;i<6;i++){ const x=W*i/6+20+r()*30, h=50+Math.round(r()*40), top=H-h;
    out+=rect(x,top,14,h,cols[0])+rect(x-10,top+h*0.3,10,6,cols[1])+rect(x-10,top+h*0.3,6,30,cols[0])
       +rect(x+14,top+h*0.45,10,6,cols[1])+rect(x+18,top+h*0.2,6,34,cols[0]); }
  return out;
}
function volcano(W,H){
  let out=rect(0,0,W,H,"transparent");
  const cx=W*0.5, base=H*0.7, vh=150;
  for(let s=0;s<10;s++){ const lw=vh*1.6*(1-s/13); out+=rect(cx-lw/2, base-s*(vh/10), lw, vh/10+1, s%2?"#3a1410":"#2a0e0a"); }
  out+=rect(cx-26,base-vh,52,10,"#ff5a1e")+rect(cx-18,base-vh-8,36,10,"#ffb347"); // lav ağzı
  // akan lav
  out+=rect(cx-6,base-vh+6,12,vh*0.7,"#ff5a1e")+rect(cx-3,base-vh+6,6,vh*0.7,"#ffb347");
  return out;
}
function castle(W,H){
  let out=""; const bx=W*0.5-120, by=H*0.34, bw=240, bh=H*0.3;
  out+=rect(bx,by,bw,bh,"#2a2350");
  for(let t=0;t<5;t++){ const tx=bx+t*(bw/4)-14; out+=rect(tx,by-40,28,50,"#241c46");
    out+=rect(tx,by-50,8,12,"#241c46")+rect(tx+20,by-50,8,12,"#241c46"); } // mazgal
  // pencereler (ışıklı)
  for(let i=0;i<6;i++){ out+=rect(bx+20+i*36, by+30, 10, 16, "#ffd24a"); }
  return out;
}

/* ---- atmosfer (sis/ışık/parçacık) — sabit SVG döndürür ---- */
function rays(c){ return (W,H)=>{ let o=""; for(let i=0;i<6;i++){ o+=`<polygon points='${W*0.5},0 ${i*W/5},${H} ${i*W/5+40},${H}' fill='${c}'/>`; } return o; }; }
function flakes(c){ return (W,H)=>{ const r=rng(606); let o=""; for(let i=0;i<40;i++) o+=star(W*r(),H*r(),c); return o; }; }
function stars(c){ return (W,H)=>{ const r=rng(707); let o=""; for(let i=0;i<50;i++) o+=star(W*r(),H*r()*0.7,c); return o; }; }
function embers(c){ return (W,H)=>{ const r=rng(808); let o=""; for(let i=0;i<30;i++) o+=rect(W*r(),H*r(),2,2,c); return o; }; }
function heat(c){ return (W,H)=>{ let o=""; for(let i=0;i<8;i++) o+=rect(0,H*i/8,W,2,c); return o; }; }

function buildScene(cls){
  const S = SCENES[cls]; if(!S) return;
  const W = 480, H = 360;
  document.getElementById("sc-sky").style.backgroundImage = svgURL(W, H, skyBands(W, H, S.sky));
  document.getElementById("sc-cel").style.backgroundImage = svgURL(W, H, S.cel ? S.cel(W,H) : "");
  document.getElementById("sc-far").style.backgroundImage = svgURL(W, H, S.far ? S.far(W,H) : "");
  document.getElementById("sc-mid").style.backgroundImage = svgURL(W, H, S.mid ? S.mid(W,H) : "");
  document.getElementById("sc-atmo").style.backgroundImage = svgURL(W, H, S.atmo ? S.atmo(W,H) : "");
  document.getElementById("sc-deco").style.backgroundImage = "";
}

/* ---------- BOSS ZAMANLAYICI ---------- */
function startBossTimer(){
  G.bossLeft = BOSS_TIME;
  el.bossTimer.classList.remove("hidden");
  updateBossTimer();
  clearInterval(bossInterval);
  bossInterval = setInterval(() => {
    G.bossLeft -= 0.1;
    if(G.bossLeft <= 0){ stopBossTimer(); bossFail(); }
    else updateBossTimer();
  }, 100);
}
function stopBossTimer(){
  clearInterval(bossInterval); bossInterval = null;
  el.bossTimer.classList.add("hidden");
}
function updateBossTimer(){
  const pct = Math.max(0, G.bossLeft / BOSS_TIME * 100);
  el.bossBar.style.width = pct + "%";
  el.bossBar.classList.toggle("low", G.bossLeft <= 8);
  el.bossText.textContent = "⏱ " + Math.ceil(G.bossLeft);
}
function bossFail(){
  G.comboMult = 1;
  G.subKill = 1;            // 10'luk seriyi başa sar, tekrar boss'a kadar
  app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake");
  spawnEnemy(); renderHud();
  banner("⏱ Süre doldu! Başa dönüldü");
}

function createEnemy(){
  const boss = isBoss();
  const pool = boss ? BOSSES : ENEMIES;
  const pick = pool[diff() % pool.length];
  const max = enemyMaxHp();
  G.enemy = { name: boss ? "👑 " + pick.name : pick.name, icon: pick.icon, hp: max, max };
  el.enemyIcon.innerHTML = renderCreature(pick, boss ? 132 : 116, boss);
  el.enemyName.textContent = G.enemy.name;
  renderHp();
}
function spawnEnemy(){
  applyZone();
  if(isBoss()){ startBossIntro(); return; }
  el.enemy.classList.remove("dead", "enter");
  createEnemy();
  banner(`${currentZone().name} · Aşama ${G.stage}`);
}

/* ---------- BOSS GİRİŞİ: uyarı + 3-2-1 + portal + efekt ---------- */
function startBossIntro(){
  stopBossTimer();
  G.enemy = null;                       // hazır olana kadar vurulamaz
  el.enemy.classList.add("dead");       // mevcut düşmanı gizle
  el.enemyName.textContent = "";
  el.hpbar.style.width = "0%"; el.hptext.textContent = "";
  playPortal();                         // portal animasyonu döner
  banner("⚠ BOSS GELİYOR!");
  let n = 3; setCount(n);
  clearInterval(bossIntroIv);
  bossIntroIv = setInterval(() => {
    n--;
    if(n >= 1){ setCount(n); }
    else {
      clearInterval(bossIntroIv); bossIntroIv = null;
      el.countdown.classList.add("hidden");
      portalBurst();                    // giriş efekti
      el.enemy.classList.remove("dead");
      createEnemy();                    // boss portaldan çıkar
      el.enemy.classList.remove("enter"); void el.enemy.offsetWidth; el.enemy.classList.add("enter");
      banner("BOSS!  " + currentZone().name);
      startBossTimer();
      setTimeout(hidePortal, 600);   // boss çıktıktan sonra portal kapanır
    }
  }, 850);
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

/* ===================== RENDER ===================== */
function renderHp(){
  el.hpbar.style.width = Math.max(0, G.enemy.hp / G.enemy.max * 100) + "%";
  el.hptext.textContent = `${Math.max(0, Math.ceil(G.enemy.hp))} HP`;
}
function renderHud(){
  el.kills.textContent = G.subKill;
  el.gold.textContent = fmt(G.gold);
  el.level.textContent = G.level;
  el.xpbar.style.width = (G.xp / xpToLevel() * 100) + "%";
  el.comboMult.textContent = G.comboMult.toFixed(1);
  el.comboPill.classList.toggle("active", G.comboMult > 1);
  renderComboGround();
  document.querySelectorAll(".gold-mirror").forEach(s => s.textContent = fmt(G.gold));
  refreshShop();
}
function renderComboGround(){
  // kombo yoksa göstergeyi tamamen gizle (başa döner, takılı kalmaz)
  const active = G.comboMult > 1 || G.comboStreak > 0 || G.charged;
  el.comboGround.style.display = active ? "flex" : "none";
  if(!active){ el.comboGround.innerHTML = ""; return; }
  const pips = Array.from({ length: CHARGE_NEED }, (_, i) =>
    `<i class="${i < G.comboStreak ? "on" : ""}"></i>`).join("");
  el.comboGround.className = G.charged ? "ready" : (G.comboMult > 1 ? "active" : "");
  el.comboGround.innerHTML =
    `<span class="cg-x">x${G.comboMult.toFixed(1)}</span>` +
    `<span class="cg-lbl">COMBO</span>` +
    `<span class="cg-pips">${pips}</span>` +
    (G.charged ? `<span class="cg-ready">⚡ ÖZEL HAZIR</span>` : ``);
}
function renderJutsu(){
  const j = activeJutsu();
  el.jutsuIcon.innerHTML = sprite(j.img, j.icon, 26);
  el.jutsuJp.textContent = j.jp;
  el.jutsuName.textContent = `${j.name}  ·  Lv ${G.jLvl[j.id]}  ·  güç ${jutsuPower(j)}${j.hits ? " ×" + j.hits : ""}`;
  el.jutsuIcon.style.filter = `drop-shadow(0 0 10px ${j.color})`;
  el.seq.innerHTML = "";
  j.seals.forEach((si, pos) => {
    const d = document.createElement("div");
    d.className = "seq-seal" + (pos < G.inputPos ? " done" : pos === G.inputPos ? " next" : "");
    d.innerHTML = `${handSVG(SEALS[si].en)}<span class="r">${SEALS[si].en}</span>`;
    el.seq.appendChild(d);
  });
  highlightNextSeal();
}
function highlightNextSeal(){
  const nextIdx = activeJutsu().seals[G.inputPos];
  el.pad.querySelectorAll(".seal-btn").forEach(b => b.classList.toggle("hint-next", +b.dataset.idx === nextIdx));
}
function renderPetsField(){
  el.alliesLeft.innerHTML = ""; el.alliesRight.innerHTML = "";
  let i = 0;
  PETS.forEach(p => {
    if(!G.pets[p.id]) return;
    const left = (i % 2 === 0);                 // dönüşümlü: sol, sağ, sol...
    const d = document.createElement("div");
    d.className = "pet"; d.dataset.pet = p.id;
    d.style.setProperty("--pc", p.color);
    // sol grup sağa (ortaya) bakar (row2), sağ grup sola (ortaya) bakar (row1)
    d.innerHTML = sprite(p.img, p.icon, 40, { row: left ? 2 : 1, anim: "idle" });
    (left ? el.alliesLeft : el.alliesRight).appendChild(d);
    i++;
  });
}

/* ===================== GİRDİ / COMBO ===================== */
function tapSeal(idx){
  const j = activeJutsu();
  const expected = j.seals[G.inputPos];
  const btn = el.pad.querySelector(`[data-idx="${idx}"]`);
  if(idx === expected){
    flashBtn(btn, "correct");
    G.lastCombo = Date.now();     // kombo zamanlayıcısını tazele
    G.inputPos++;
    if(G.inputPos >= j.seals.length){
      G.inputPos = 0;            // sıra TAMAMLANDI → en başa dön (son karede kalmasın)
      castJutsu(j);
    }
    renderJutsu();
  } else {
    flashBtn(btn, "wrong");
    if(G.inputPos > 0 || G.comboMult > 1){ G.inputPos = 0; breakCombo(); renderJutsu(); }
  }
}
function flashBtn(btn, cls){ if(!btn) return; btn.classList.remove("correct","wrong"); void btn.offsetWidth; btn.classList.add(cls); }

/* ===================== SALDIRILAR ===================== */
function heroAnim(cls){ el.hero.classList.remove("attack","jutsu"); void el.hero.offsetWidth; el.hero.classList.add(cls); }
function basicAttack(){
  if(!G.enemy || G.enemy.hp <= 0) return;
  heroAnim("attack");
  miniSpark("#ffffff", 5);
  dealDamage(Math.round(tapDamage() * G.comboMult), "basic");
}
function castJutsu(j){
  const hits = j.hits || 1;
  const per = Math.round(jutsuPower(j) * masteryMult() * G.comboMult);
  G.comboMult = Math.min(5, G.comboMult + 0.5);
  heroAnim("jutsu"); comboFlash(j.color);
  app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake");
  for(let h = 0; h < hits; h++) setTimeout(() => { dealDamage(per, "jutsu", j.color); burst(j.color); }, h * 120);
  // combo serisi → özel vuruş şarjı
  if(!G.charged){
    G.comboStreak++;
    if(G.comboStreak >= CHARGE_NEED){
      G.comboStreak = 0;     // son aşama doldu → gösterge başa döner
      setCharged(true);      // özel vuruş hazır
    }
  }
  renderHud();
}
function setCharged(on){
  G.charged = on;
  buildSkillBar();
  if(on) banner("⚡ ÖZEL VURUŞ HAZIR! Skile bas");
}
function fireSpecial(j){
  if(!G.enemy || G.enemy.hp <= 0){ setCharged(false); G.comboStreak = 0; return; }
  const dmg = Math.round(jutsuPower(j) * masteryMult() * G.comboMult * SPECIAL_MULT);
  G.charged = false; G.comboStreak = 0;
  heroAnim("jutsu"); comboFlash(j.color);
  app.classList.remove("shake"); void app.offsetWidth; app.classList.add("shake");
  // güçlü çoklu patlama + skill renginde alev
  specialFlame(j.color); burst(j.color); burst("#fff"); miniSpark(j.color, 18);
  banner("💥 " + j.name + " — ÖZEL VURUŞ!");
  // hasarı uygula (özel hasar yazısıyla)
  G.enemy.hp -= dmg; G.totalDmg += dmg;
  floatDamage("ÖZEL! " + fmt(dmg), "special", j.color);
  el.enemy.classList.remove("hit"); void el.enemy.offsetWidth; el.enemy.classList.add("hit");
  renderHp();
  buildSkillBar();
  renderHud();
  if(G.enemy.hp <= 0) defeatEnemy();
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
  if(boss) stopBossTimer();
  const reward = Math.floor(diff() * 9 * (boss ? 5 : 1) * (1 + G.stage * 0.06));
  G.gold += reward;
  gainXp(diff() * 5 * (boss ? 3 : 1));
  floatDamage("+" + fmt(reward) + " 🪙", "crit", "#ffd24a");
  if(isBoss()){ G.stage++; G.subKill = 1; } else { G.subKill++; }
  setTimeout(() => { spawnEnemy(); renderHud(); }, 520);
}
function gainXp(a){ G.xp += a; while(G.xp >= xpToLevel()){ G.xp -= xpToLevel(); G.level++; banner("LEVEL UP! Lv " + G.level); } }
function breakCombo(){
  G.comboMult = 1;
  G.comboStreak = 0;
  G.inputPos = 0;                 // mühür sırasını da başa sar
  if(G.charged) G.charged = false;
  buildSkillBar();
  renderJutsu();                  // yeşil "yapıldı" kutuları sıfırla (takılı kalmasın)
  renderHud();
}

/* ===================== OTOMATİK PET HASARI ===================== */
function comboWatch(){
  // kombo boşta kalırsa SIFIRLA (yarım girilen mühür sırası dahil → başa döner)
  const inProgress = G.comboMult > 1 || G.comboStreak > 0 || G.charged || G.inputPos > 0;
  if(inProgress && Date.now() - G.lastCombo > COMBO_TIMEOUT) breakCombo();
}
function petTick(){
  if(!G.enemy || G.enemy.hp <= 0) return;
  const dps = totalPetDps();
  if(dps <= 0) return;
  const dmg = Math.max(1, Math.round(dps * 0.6));   // 0.6s'lik pay
  // dost saldırı animasyonu + renkli element kıvılcımları
  [...el.alliesLeft.children, ...el.alliesRight.children].forEach(d => { d.classList.remove("act"); void d.offsetWidth; d.classList.add("act"); });
  PETS.forEach(p => { if(G.pets[p.id]) miniSpark(p.color, 3); });
  G.enemy.hp -= dmg; G.totalDmg += dmg;
  floatDamage(fmt(dmg), "auto");
  renderHp();
  if(G.enemy.hp <= 0) defeatEnemy();
}

/* ===================== EFEKTLER ===================== */
function floatDamage(text, kind, color){
  const d = document.createElement("div");
  d.className = "dmg " + kind; d.textContent = text;
  if(color) d.style.color = color;
  d.style.left = (52 + Math.random() * 12) + "%";
  d.style.top  = (34 + Math.random() * 14) + "%";
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
    const f = document.createElement("div");
    f.className = "flame";
    f.style.setProperty("--fc", color);
    f.style.left = (cx + (i - 1) * 26) + "px";
    f.style.top = cy + "px";
    f.style.animationDelay = (i * 60) + "ms";
    el.particles.appendChild(f);
    setTimeout(() => f.remove(), 800);
  }
}
function comboFlash(color){ el.flash.style.setProperty("--flash", color); el.flash.classList.remove("go"); void el.flash.offsetWidth; el.flash.classList.add("go"); }
function banner(text){ el.banner.textContent = text; el.banner.classList.remove("show"); void el.banner.offsetWidth; el.banner.classList.add("show"); }

/* ===================== MAĞAZA: JUTSU ===================== */
function renderSkillShop(){
  el.skillList.innerHTML = "";
  JUTSU.forEach(j => {
    const open = G.unlocked.has(j.id);
    const seals = j.seals.map(si => `<span style="opacity:.85">${SEALS[si].en}</span>`).join(" › ");
    let btn;
    if(!open){
      const can = G.gold >= j.cost;
      btn = `<button class="card-btn ${can ? "" : "locked"}" data-act="unlock-j" data-id="${j.id}" ${can ? "" : "disabled"}>
               <span class="bt-cost">${fmt(j.cost)} 🪙</span><span class="bt-sub">AÇ</span></button>`;
    } else {
      const c = jutsuUpCost(j), can = G.gold >= c;
      btn = `<button class="card-btn ${can ? "" : "locked"}" data-act="up-j" data-id="${j.id}" ${can ? "" : "disabled"}>
               <span class="bt-cost">${fmt(c)} 🪙</span><span class="bt-sub">GÜÇLENDİR</span></button>`;
    }
    const row = document.createElement("div");
    row.className = "card" + (open ? "" : " locked");
    row.innerHTML = `
      <div class="card-thumb" style="--oc:${j.color}">${sprite(j.img, j.icon, 34)}</div>
      <div class="card-mid">
        <span class="card-name">${j.name}</span>
        <span class="card-lv">${open ? "Lv " + G.jLvl[j.id] + " · güç " + jutsuPower(j) : "kilitli"}</span>
        <span class="card-desc">Kombo: ${seals}${j.hits ? " · ×" + j.hits + " vuruş" : ""}</span>
      </div>${btn}`;
    el.skillList.appendChild(row);
  });
  el.skillList.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
    const id = +b.dataset.id, j = JUTSU.find(x => x.id === id);
    if(b.dataset.act === "unlock-j"){
      if(G.gold < j.cost) return;
      G.gold -= j.cost; G.unlocked.add(id); G.jLvl[id] = 1;
      buildSealPad(); buildSkillBar(); banner("AÇILDI: " + j.name);
    } else {
      const c = jutsuUpCost(j); if(G.gold < c) return;
      G.gold -= c; G.jLvl[id]++; buildSkillBar(); renderJutsu();
    }
    renderHud(); renderSkillShop();
  }));
}

/* ===================== MAĞAZA: PETLER ===================== */
function renderPetShop(){
  el.petList.innerHTML = "";
  PETS.forEach(p => {
    const lvl = G.pets[p.id] || 0, open = lvl > 0;
    let btn;
    if(!open){
      const can = G.gold >= p.cost;
      btn = `<button class="card-btn ${can ? "" : "locked"}" data-act="unlock-p" data-id="${p.id}" ${can ? "" : "disabled"}>
               <span class="bt-cost">${fmt(p.cost)} 🪙</span><span class="bt-sub">AÇ</span></button>`;
    } else {
      const c = petUpCost(p), can = G.gold >= c;
      btn = `<button class="card-btn ${can ? "" : "locked"}" data-act="up-p" data-id="${p.id}" ${can ? "" : "disabled"}>
               <span class="bt-cost">${fmt(c)} 🪙</span><span class="bt-sub">GÜÇLENDİR</span></button>`;
    }
    const row = document.createElement("div");
    row.className = "card" + (open ? "" : " locked");
    row.innerHTML = `
      <div class="card-thumb" style="--oc:${p.color}">${sprite(p.img, p.icon, 40, { row: 0, anim: "static" })}</div>
      <div class="card-mid">
        <span class="card-name">${p.name}</span>
        <span class="card-lv">${open ? "Lv " + lvl + " · " + fmt(petDps(p)) + " DPS" : p.role + " · kilitli"}</span>
        <span class="card-desc">${p.role} · saniyede otomatik hasar verir</span>
      </div>${btn}`;
    el.petList.appendChild(row);
  });
  el.petList.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
    const p = PETS.find(x => x.id === b.dataset.id);
    if(b.dataset.act === "unlock-p"){
      if(G.gold < p.cost) return;
      G.gold -= p.cost; G.pets[p.id] = 1; renderPetsField(); banner("DOST KATILDI: " + p.name);
    } else {
      const c = petUpCost(p); if(G.gold < c) return;
      G.gold -= c; G.pets[p.id]++;
    }
    renderHud(); renderPetShop();
  }));
}

/* ===================== MAĞAZA: GÜÇ ===================== */
function renderPowerShop(){
  el.tapTitle.textContent = `${tapDamage()} Tap Hasarı`;
  const items = [
    { icon:"🔪", oc:"#ff8a1e", name:"Kunai Atışı", lv:"Lv " + G.tapLvl + " · " + tapDamage() + " hasar",
      desc:"Temel tap hasarı +2", cost:tapCost(), act:"tap" },
    { icon:"📖", oc:"#bfa6ff", name:"Jutsu Ustalığı", lv:"Lv " + G.masteryLvl + " · +" + (G.masteryLvl*12) + "% jutsu",
      desc:"Tüm jutsu hasarı +%12", cost:masteryCost(), act:"mastery" },
  ];
  el.powerList.innerHTML = "";
  items.forEach(it => {
    const can = G.gold >= it.cost;
    const row = document.createElement("div");
    row.className = "card";
    row.innerHTML = `
      <div class="card-thumb" style="--oc:${it.oc}">${it.icon}</div>
      <div class="card-mid">
        <span class="card-name">${it.name}</span><span class="card-lv">${it.lv}</span>
        <span class="card-desc">${it.desc}</span>
      </div>
      <button class="card-btn ${can ? "" : "locked"}" data-act="${it.act}" ${can ? "" : "disabled"}>
        <span class="bt-cost">${fmt(it.cost)} 🪙</span><span class="bt-sub">YÜKSELT</span></button>`;
    el.powerList.appendChild(row);
  });
  el.powerList.querySelectorAll("[data-act]").forEach(b => b.addEventListener("click", () => {
    if(b.dataset.act === "tap"){ const c = tapCost(); if(G.gold < c) return; G.gold -= c; G.tapLvl++; }
    else { const c = masteryCost(); if(G.gold < c) return; G.gold -= c; G.masteryLvl++; }
    renderHud(); renderPowerShop();
  }));
}

/* ===================== İSTATİSTİK ===================== */
function renderStats(){
  const s = [
    ["Aşama", G.stage], ["Seviye", G.level], ["Tap Hasarı", tapDamage()],
    ["Dost DPS", fmt(totalPetDps())], ["Combo", "x" + G.comboMult.toFixed(1)],
    ["Toplam Hasar", fmt(G.totalDmg)], ["Açık Jutsu", G.unlocked.size + "/" + JUTSU.length],
    ["Açık Dost", Object.keys(G.pets).length + "/" + PETS.length],
  ];
  el.statsList.innerHTML = s.map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join("");
}

/* hangi mağaza açıksa onu tazele (altın değişince buton aktiflikleri) */
function refreshShop(){
  if(G.tab === "skills") renderSkillShop();
  else if(G.tab === "pets") renderPetShop();
  else if(G.tab === "power") renderPowerShop();
  else if(G.tab === "stats") renderStats();
}

/* ===================== SEKMELER ===================== */
function switchTab(name){
  G.tab = name;
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("hidden", p.dataset.panel !== name));
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  if(name === "skills") renderSkillShop();
  else if(name === "pets") renderPetShop();
  else if(name === "power") renderPowerShop();
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

/* ===================== OLAYLAR ===================== */
/* tüm oyun alanına dokunmak temel saldırı yapar (Tap Titans tarzı) */
el.arena.addEventListener("click", basicAttack);
document.querySelectorAll(".tab").forEach(t => t.addEventListener("click", () => switchTab(t.dataset.tab)));
el.gear.addEventListener("click", () => { if(confirm("İlerlemeyi sıfırla?")) location.reload(); });
document.addEventListener("keydown", (e) => {
  const num = e.key === "0" ? 10 : parseInt(e.key, 10);
  if(G.tab === "combat" && num >= 1 && num <= G.padSeals.length){ tapSeal(G.padSeals[num - 1]); e.preventDefault(); return; }
  if(e.key === " "){ basicAttack(); e.preventDefault(); }
});

/* ===================== BAŞLAT ===================== */
function init(){
  setHeroSprite("idle");
  buildSealPad();
  buildSkillBar();
  renderPetsField();
  spawnEnemy();
  renderJutsu();
  renderHud();
  setInterval(petTick, 600);   // otomatik pet hasarı döngüsü
  setInterval(comboWatch, 250); // kombo boşta kalırsa hızlı sıfırlama
}
init();
