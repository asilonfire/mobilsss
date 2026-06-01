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

**Shinobi Tap** — Naruto temalı, Tap Titans tarzı tap/idle mobil web oyunu.
Saf **HTML + CSS + JS** (bağımlılık yok). `index.html`'i tarayıcıda aç → çalışır.

**Çekirdek döngü:** Düşmana dokun = temel saldırı. Aktif jutsu'nun **el mührü
(seal) kombosunu** sırayla tapla → jutsu tetiklenir, büyük hasar. Altın (ryō) ile
jutsu/dost/güç aç & yükselt. Her 10. düşman = **BOSS** (portal + 3-2-1 + süre limiti).

---

## 📁 DOSYA YAPISI

| Dosya | İçerik |
|---|---|
| `index.html` | Yapı: HUD, arena (sahne katmanları), dock (5 sekme), `?v=NN` cache sürümü |
| `style.css` | Tüm görsel: pixel-art tema, sahne katmanları, animasyonlar |
| `game.js` | Tüm mantık: combo, jutsu, dostlar, boss, portal, sahne üretici |
| `assets/hero/` | `IDLE.png` (10 kare), `ATTACK 1.png` (7 kare), `HURT.png` (4 kare) — yatay şerit |
| `assets/enemies/` | `Enemy NN-1.png` (3×4 RPG Maker sheet), `rat-idle.png` (6 kare şerit), Goblin'ler |
| `assets/bosses/` | `Boss 01.png` (3×4, satır=boss), `cassidle.png` (7 kare şerit) |
| `assets/pets/` | Karakter sprite'ları (3×4 RPG Maker) → "Dostlar" |
| `assets/boss_portals/192x192/` | `pipo-gate01c192.png` = 960×576 spritesheet (5×3=15 kare) |
| `docs/` | Sohbet geçmişi / geliştirme günlüğü |

---

## ⚙️ MEVCUT DURUM (2026-06-02)

**Çalışan sistemler:**
- ✅ 12 el mührü (tek renk pixel-art hayvan ikonları), seal combo girişi
- ✅ 6 jutsu (Katon, Chidori, Kage Bunshin, Suiton, Rasengan, Rasenshuriken)
- ✅ Skill bar: **sadece açık jutsular** (kilitliler JUTSU sekmesinde)
- ✅ Mühür tuş takımı: **3 sol / 3 sağ** (iki elle basım)
- ✅ Mühür sırası göstergesi + kombo göstergesi **toprak alanda** (arena içinde)
- ✅ Özel vuruş: 3 ardışık combo → orb ⚡ parlar → basınca ×4 + skill renginde alev
- ✅ Kombo sıfırlama: yanlış mühür VEYA 2.5 sn boşta → tamamen başa döner
- ✅ Dostlar (ally, 6 adet) — sol/sağ platformlara dizilir, otomatik hasar
- ✅ Boss girişi: "BOSS GELİYOR" + portal animasyonu + 3-2-1 + boss çıkış efekti
- ✅ Boss süre limiti 30 sn; dolarsa 10'luk seri başa döner
- ✅ 6 bölüm (zone): prosedürel **katmanlı pixel-art sahne** (gök+dağ+ağaç/yapı+sis+parallax)
- ✅ Hero: yeni sprite (IDLE) + saldırıda ATTACK animasyonu, boyut ~190px
- ✅ Pixel-art tema (Press Start 2P + VT323 fontlar)

**Bilinen / izlenecek:**
- Sprite fallback: dosya yoksa emoji gösterir (oyun bozulmaz).
- İlerleme **kaydedilmiyor** (localStorage yok) — sayfa yenilenince sıfırlanır. (Olası sıradaki iş.)
- `index.html` cache sürümü şu an: **?v=15** (style.css & game.js).

---

## 📝 SIRADAKİ / YAPILACAKLAR (öneri havuzu)
- [ ] **localStorage kaydı** (ilerleme kalıcı olsun)
- [ ] Portal görselini boyut/konum ince ayarı
- [ ] Daha fazla jutsu / dost / boss çeşidi
- [ ] Ses efektleri
- [ ] Kalıcı yayın (Cloudflare Pages / Netlify — sabit URL)

---

## 🧠 SON OTURUM ÖZETİ

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
