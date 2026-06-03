# CLAUDE.md — Shinobi Tap (Proje Hafızası)

> **Bu dosya Claude için kalıcı hafızadır.** Hangi bilgisayardan / hangi sohbetten
> çalışırsan çalış, Claude **önce bu dosyayı okur**, kaldığı yeri anlar, işi yapar,
> sonra **bu dosyayı güncelleyip commit + push eder.** Böylece başka bir makinede
> `git pull` yapınca kaldığın yerden devam edersin.

---

## 🤖 CLAUDE İÇİN TALİMATLAR (her oturumda uygula)

1. **Oturum başında:** `git pull origin main` ile en güncel hali al, bu dosyanın
   **"Mevcut Durum"** ve **"Sıradaki / Yapılacaklar"** bölümlerini oku.
2. **Çalışırken:** Kodu `index.html`, `style.css`, `game.js` üzerinde değiştir.
   `style.css` / `game.js` değişince `index.html` içindeki `?v=NN` sürüm numarasını
   **bir artır** (telefon cache'i için — bkz. "Cache Notu").
3. **Oturum sonunda (ZORUNLU):**
   - Bu dosyada **"Son Oturum Özeti"**, **"Mevcut Durum"** ve gerekiyorsa
     **"Sıradaki"** bölümlerini güncelle. Tarihi de yaz.
   - `git add -A && git commit -m "<özet>" && git push origin main`
   - Commit mesajının sonuna şu satırı ekle:
     `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
4. **Asset eklenince:** Kullanıcı `assets/` altına dosya atar. Formatı (kaç kare,
   boyut) `assets/README.md`'ye veya buraya not düş ki diğer makinede bilinsin.
5. **Test:** Yerel test için `python -m http.server 8000` + tarayıcı. Telefon testi
   için Cloudflare quick tunnel (aşağıda). Tünel **geçici**; her açılışta URL değişir.

---

## 🎮 OYUN NEDİR

**Shinobi 2048 — Mühür Akışı** — Naruto temalı, **2048 tarzı kaydır-birleştir**
chill mobil web oyunu. Saf **HTML + CSS + JS** (bağımlılık yok). `index.html`'i
tarayıcıda aç → çalışır.

> **NOT (2026-06-03 pivot):** Oyun eski "Shinobi Tap" (tap/idle + seal combo)
> mantığından TAMAMEN çıkarıldı. Kullanıcı "akıcı, sürekli oynanabilen, popüler,
> chill bir mini oyun" istedi → 2048 birleştirme + canavara hasar melezine geçildi.

**Çekirdek döngü (ROGUELITE — "öl, güçlen, daha ileri git"):** 4×4 tahtada
parmakla kaydır → aynı hayvan mühürleri birleşir ve **burç zincirinde** bir üst
kademeye çıkar (Fare→…→Domuz → sonra 6 **JUTSU karosu**). **Her birleştirme =
üstteki canavara hasar.** Jutsu karosu oluşturunca **patlar, 3×3'ü (taşlar dahil)
süpürür** + büyük hasar. Canavar **ara sıra tahtaya kilitli taş 🪨 bırakır**
(saldırısı). Canavar ölünce ryō + aşama artar (her 5. aşama BOSS).

**AKIŞ (run) döngüsü:** Tahta **tıkanırsa AKIŞ BİTER** → aşama 1'e döner. Kazanılan
**ryō kalıcıdır** → **GÜÇ** sekmesinden hasar/jutsu/taş-direnci yükselt (kalıcı) →
sonraki akışta daha ileri. **En iyi skor + en iyi aşama + son 5 akış** İSTAT'ta.
İlerleme **localStorage**'a kaydedilir (kalıcı meta + güncel akış ayrı).

---

## 📁 DOSYA YAPISI

| Dosya | İçerik |
|---|---|
| `index.html` | Yapı: HUD, arena (sahne katmanları + canavar), dock (OYUN/GÜÇ/İSTAT sekmeleri), 4×4 tahta, `?v=NN` cache sürümü |
| `style.css` | Tüm görsel: pixel-art tema, sahne katmanları, **tahta + karo + jutsu efektleri** (en altta "SHINOBI 2048" bölümü) |
| `game.js` | Tüm mantık: **2048 birleştirme motoru** (`move`/`actuate`), karo kademeleri (`TIERS`), birleştirme→hasar (`resolveMerges`), canavar, sahne üretici, localStorage (`save`/`load`) |
| `assets/hero/` | `IDLE.png` (10 kare), `ATTACK 1.png` (7 kare), `HURT.png` (4 kare) — yatay şerit |
| `assets/enemies/` | `Enemy NN-1.png` (3×4 RPG Maker sheet), `rat-idle.png` (6 kare şerit), Goblin'ler |
| `assets/bosses/` | `Boss 01.png` (3×4, satır=boss), `cassidle.png` (7 kare şerit) |
| `assets/pets/` | Karakter sprite'ları (3×4 RPG Maker) → "Dostlar" |
| `assets/boss_portals/192x192/` | `pipo-gate01c192.png` = 960×576 spritesheet (5×3=15 kare) |
| `docs/` | Sohbet geçmişi / geliştirme günlüğü |

---

## ⚙️ MEVCUT DURUM (2026-06-03) — 2048 PİVOTU, İLK PROTOTİP

**Çalışan sistemler:**
- ✅ 4×4 2048 birleştirme motoru: kaydır (dokunmatik + ok tuşları + WASD + fare sürükle), akıcı transform geçişli kaydırma, spawn pop, merge pop
- ✅ Birleştirme zinciri: 12 hayvan (burç) + 6 jutsu karosu = 18 kademe (`TIERS`)
- ✅ Her birleştirme canavara hasar (`resolveMerges`→`dealDamage`); jutsu karosu = büyük patlama + alev + banner
- ✅ Combo: tek kaydırmada N birleştirme → çarpan (1 + 0.4·(N-1))
- ✅ Canavar HP + yenince ryō + aşama artışı; her 5. aşama BOSS (portal + 3-2-1)
- ✅ 6 prosedürel pixel-art sahne (eski sahne üretici korundu), her 3 aşamada bölge değişir
- ✅ GÜÇ mağazası: Çakra Gücü (+%18 hasar) + Mühür Ustalığı (+%25 jutsu)
- ✅ İSTAT sekmesi, HUD (aşama/skor/ryō/combo), canavar HP barı
- ✅ **localStorage kayıt** (tahta + ryō + güç + aşama) + "Çakra Tükendi" ekranı (yalnız tahta sıfırlanır)
- ✅ Birleştirme motoru node ile birim-test edildi (klasik 2048 vakaları geçti)

**Bilinen / izlenecek (DENGE + CİLA gerekli):**
- ⚖️ **Sayı dengesi tahmini** — hasar/HP/maliyet eğrileri test edilip ayarlanmalı (canavar çok yavaş/hızlı ölebilir). `tileValue`, `enemyMaxHp`, `dmgMult` ile oyna.
- Karo→hedef "kayıp karo" birleşmede hedefe doğru kayıyor ama kaynak karo görsel kaymıyor (sadece soluyor) — istenirse cilalanır.
- Ses yok. Jutsu karoları emoji ikon kullanıyor (assets/jutsu/ klasörü yok, sorun değil).
- Tarayıcıda gerçek el-testi yapılmadı (sandbox localhost'a curl atamadı; kullanıcı test edecek).
- `index.html` cache sürümü şu an: **?v=24** (style.css & game.js).
- **SES & JUICE (v24 — Faz 1):** WebAudio **sentezi** (asset yok) — `tone/noise` + efektler
  (`sndMerge/sndCombo/sndJutsu/sndGold/sndDefeat/sndBoss/sndAbility/sndOver`) + lo-fi ambient
  arpej (`startMusic`). İlk dokunuşta `ensureAudio`, HUD'da 🔊 mute (localStorage `snd`).
  Titreşim `buzz()` (navigator.vibrate). Mermi `launchProjectile`, altın yağmuru `goldRain`.
- **TEST butonu (💰 +1000 ryō) hâlâ duruyor — launch öncesi KALDIR** (`dbg-gold`, işaretli).
- **Repo politikası:** kullanıcı isteğiyle her anlamlı değişiklikten sonra commit + push.
- **ÖZEL KAROLAR (v22):** doğal spawn'da düşük şansla — 🃏 joker (her şeyle birleşir,
  `wild`), 🪙 altın (birleşince ryō, `gold`), 💣 bomba (birleşince 3×3 patlar, `bomb`/`detonate`).
  Bayraklar merge'de sonuca taşınır (`_gold`/`_bomb`), kayıt/undo'da bitmask 4. eleman olarak
  saklanır. `isGameOver` joker'i komşu-birleşme sayar. Tek-renk test `/tmp/tw.js` ile doğrulandı.
- **AKTİF YETENEKLER (v21):** her akış sınırlı kullanım, ryō ile aç/geliştir (YETENEK sekmesi),
  her seviye +1 kullanım/akış, **max 5 seviye, pahalı** (`ABILITIES.base·grow^lvl`, grow~2.0).
  Tahtanın üstünde yetenek çubuğu (`#ability-bar`, kilitliyse gizli). Yetenekler:
  🪨 Taş Kırma (en pahalı, base1200) · 💥 Çakra Bombası (%60 max HP) · 🔀 Karıştır · ↩️ Geri Al.
  `useAbility/abStone/abShuffle/abBomb/abUndo`, `snapshot/restoreSnap` (undo). Charges akışla kaydolur.
- **DENGE (v20, headless simülasyonla ayarlandı — `/tmp/sim2.js` mantığı):**
  HP=`60·1.08^(stage-1)` (boss×4), hasar=`1+0.40·mergeLvl`, jutsu=`+0.25·masteryLvl`,
  taş her `(boss?6:10)+stoneLvl` hamlede. İlk akış ~aşama 5; meta r1→r20: 5→17.
- **Dinamik tahta:** `N` artık değişken (`let N`), `applyBoardSize()` ile 4→6 arası.
  Geniş Tahta yükseltmesi sonraki akıştan geçerli. Kayıtta `boardSize` (meta) + `runN` (akış) ayrı.

---

## 📝 SIRADAKİ / YAPILACAKLAR (öneri havuzu)
- [ ] **Denge ayarı** (kullanıcı testinden sonra): hasar/HP/maliyet eğrileri
- [ ] Birleşen kaynak karonun hedefe doğru kayma animasyonu (cila)
- [ ] Canavarın da hafif "saldırısı" (örn. ara sıra tahtaya engel karo) — ama chill kalsın
- [ ] Jutsu karosu fırlatma efektini hero'dan canavara giden mermi gibi yap
- [ ] Ses efektleri (kaydır/birleştir/jutsu) — lo-fi ambiyans
- [ ] Çevrimdışı/idle kazanç, günlük ödül
- [ ] Kalıcı yayın (Cloudflare Pages / Netlify — sabit URL)

---

## 🧠 SON OTURUM ÖZETİ

**2026-06-03 (devam 5) — FAZ 1: HİS & JUICE (v24)**
- Yol haritası araştırması yapıldı (roguelite retention + merge juice). Kullanıcı Faz 1'i seçti.
- WebAudio sentezi ile ses efektleri + lo-fi ambient + 🔊 mute, titreşim, hero→canavar mermi,
  altın yağmuru eklendi. Asset gerekmedi. ROADMAP.md taslağı kullanıcı isteğiyle kaldırıldı
  (önce sohbet, sonra onayla devam). Sıradaki seçenekler: Faz 2 (perk draft/boss mekanikleri).

**2026-06-03 (devam 4) — ÖZEL KAROLAR (v22)**
- Kullanıcı isteğiyle 3 özel karo eklendi: 🃏 joker / 🪙 altın / 💣 bomba. Merge motoru
  joker (her kademeyle birleşir) + bayrak taşıma destekleyecek şekilde genişletildi.
  resolveMerges altın ödülü + bomba patlamasını işler. Görsel: rainbow joker, parıltılı badge.
- Sıradaki öneri havuzu: Perk/Kart draft · ses+lo-fi · boss mekanikleri · gerçek skor tablosu.

**2026-06-03 (devam 3) — AKTİF YETENEKLER (v21)**
- Kullanıcı isteği: her akış sınırlı kullanımlı, parayla açılıp geliştirilen yetenekler.
  4 yetenek eklendi (Taş Kırma/Çakra Bombası/Karıştır/Geri Al). YETENEK sekmesi + tahta üstü çubuk.
- Taş Kırma kullanıcı isteğiyle **pahalı + max 5 + erişmesi zor** (base1200, grow2.0). Geri Al için
  hamle-snapshot/undo (kill olduysa iptal). Cloudflare quick tunnel ile telefon testi açıldı.

**2026-06-03 (devam 2) — SİMÜLASYONLA DENGE + DİNAMİK TAHTA (v20)**
- Motor başsız simüle edildi (Node, ~250 akış/varyant + meta). Bulgu: yükseltmeler
  işe yaramıyordu çünkü 4×4'te ölüm yapısal (tahta kilidi), hasar değil. Çözüm:
  HP eğrisi düşürüldü + hasar/level güçlendirildi → canavarlar hızlı devrilip bir
  tahta ömründe çok aşama geçiliyor → yükseltmeler artık net hissediliyor.
- **Yenilikçi: Geniş Tahta yükseltmesi (4×4→5×5→6×6)** — "daha ileri"nin asıl
  kaldıracı (sim: 4×4 ağır=17, 6×6 ağır=29). `N` dinamikleştirildi.
- Final denge config C; meta r1→r20 = aşama 5→17. Sürüm v20.

**2026-06-03 (devam) — ROGUELITE döngü + dengeleme + bug avı (v17→v19)**
- **v17:** Canavar dengesi (HP↑) + canavar saldırısı (kilitli taş 🪨) + jutsu patlama
  (3×3 süpürme). `isGameOver`'da alt-satır `grid[y+1]` çökme bug'ı bulundu & düzeltildi.
- **v18:** Yüklenen/başlangıç karoları ekrana çizilmiyordu (DOM eleman yalnız `actuate`'te
  oluşuyordu) → `relayout` artık eksik eleman oluşturup çiziyor. Kullanıcının kayıtlı
  tahtası boş görünüyordu, düzeldi.
- **v19 (kullanıcı yönü):** "Öl-güçlen-daha ileri git" ROGUELITE'a çevrildi. Tahta
  tıkanınca **akış biter, aşama 1'e döner** (`endRun`/`newRun`/`showRunOver`). Ryō
  kalıcı meta para → GÜÇ'ten kalıcı yükseltme (Çakra Gücü / Mühür Ustalığı / **Taş
  Direnci** yeni). HP eğrisi yumuşatıldı (90·1.16^n). En iyi skor/aşama + son 5 akış
  İSTAT'ta. Kayıt v2: kalıcı meta + akış ayrı; eski kayıt migration ile akışı sıfırlar.
  Düzen: arena büyüsün (canavar ezilmesin), tahta küçüldü (38vh).
- **Sıradaki:** kullanıcı denge testi → eğri ayarı; gerçek "best skor tablosu" cilası.
- **Hâlâ commit/push EDİLMEDİ.**

**2026-06-03 — BÜYÜK PİVOT: Tap oyunu → Shinobi 2048**
- Kullanıcı tap/idle + seal-combo mantığını tamamen bıraktı; "akıcı, sürekli
  oynanan, popüler, chill bir mini oyun" istedi → **2048 kaydır-birleştir +
  canavara hasar** melezi tasarlandı ve ilk prototip kuruldu.
- `index.html` tahta düzenine geçirildi (dock: OYUN/GÜÇ/İSTAT), `game.js` baştan
  yazıldı (2048 motoru + birleştirme→hasar + kayıt), `style.css`'e tahta/karo
  bölümü eklendi. Eski sahne üretici + sprite yükleyici + parçacık efektleri korundu.
- Birleştirme motorundaki "boşluklu karolar birleşmiyor" hatası bulundu & düzeltildi
  (orijinal hücre temizlenmeliydi), node birim-testiyle doğrulandı. `?v=16`.
- **Henüz commit/push EDİLMEDİ** — kullanıcı tarayıcıda his/denge testini bekliyor.

**2026-06-02 — Repo kurulumu**
- Git deposu başlatıldı, `origin = https://github.com/asilonfire/mobilsss`.
- CLAUDE.md (bu dosya) + `.gitignore` eklendi, sohbet geçmişi `docs/`'a aktarıldı.
- Oyun dosyaları ve assetler repoya yüklendi.

**2026-06-01 (önceki sohbet) — son yapılanlar**
- Mühür sırası + kombo göstergesi toprak alana taşındı.
- Tuş takımı 3-sol/3-sağ yapıldı; skill bar sadece açık jutsuları gösterir.
- Kombo "2. aşamada takılma" düzeltildi (tamamlanınca inputPos=0).
- Katmanlı prosedürel pixel-art sahneler eklendi.
- Boss portalı (gerçek spritesheet) + 3-2-1 geri sayım bağlandı.
- Yeni hero/boss(Cass)/goblin/rat assetleri entegre.

---

## 🌐 TELEFONDA TEST (Cloudflare quick tunnel)

Geçici tünel — her açılışta **URL değişir**, bilgisayar kapanınca düşer.

```powershell
# 1) yerel sunucu
python -m http.server 8000 --directory "C:\Users\eysbl\OneDrive\Desktop\mobiletest"
# 2) tünel (ayrı pencere)
cloudflared tunnel --url http://localhost:8000
# çıktıdaki https://....trycloudflare.com adresini telefonda aç
```

Kalıcı sabit adres isteniyorsa → Cloudflare Pages / Netlify kurulabilir (sıradaki işler).

---

## 🔧 CACHE NOTU
Telefon eski sürümü cache'leyebiliyor. `style.css` veya `game.js` değişince
`index.html` içindeki `?v=NN` numarasını **artır** (ör. `style.css?v=16`,
`game.js?v=16`). Böylece tarayıcı yeni dosyayı çeker.
