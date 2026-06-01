# 🎨 Pixel Art Asset Rehberi — Shinobi Tap

Dosyaları **aşağıdaki tam isimlerle** ilgili klasöre bırak. Kod bu yolları otomatik
kullanır. Bir dosya **yoksa**, oyun o öğe için **emoji'ye geri düşer** (yani eksik
asset oyunu bozmaz; sen ekledikçe gerçek görsel görünür).

- Biçim: **PNG** (şeffaf arka plan), pixel art.
- `image-rendering: pixelated` aktif → küçük pixel art'lar net/keskin görünür.
- Kare (1:1) öneririm; kod kareye sığdırır (`object-fit: contain`).

---

## 📁 Klasör → dosya listesi

### `hero/`  (kahraman — ~64×64 px)
- `ninja.png`

### `pets/`  (element petleri — ~32×32 px)
- `fire.png`   · 🦊 Ateş Tilkisi (Katon)
- `water.png`  · 🐸 Su Kurbağası (Suiton)
- `wind.png`   · 🦅 Rüzgâr Şahini (Fūton)
- `bolt.png`   · 🐺 Yıldırım Kurdu (Raiton)
- `earth.png`  · 🐢 Toprak Kaplumbağası (Doton)

### `jutsu/`  (skill ikonları — ~32×32 px, yuvarlak görünür)
- `katon.png` · `chidori.png` · `kage_bunshin.png` · `suiton.png` · `rasengan.png` · `rasenshuriken.png`

### `enemies/`  (normal düşmanlar — ~64×64 px)
- `bandit.png` · `ninja.png` · `snake.png` · `mask.png` · `goblin.png`
- `spider.png` · `shadow.png` · `bat.png` · `flower.png`

### `bosses/`  (her 10. düşman — ~80×80 px)
- `zabuza.png` · `orochimaru.png` · `kyubi.png` · `gaara.png`

### `bg/`  (arka plan — geniş, ~480×360 px veya daha büyük)
- `forest.png`   (yoksa CSS orman gradyanı kullanılır)

### `seals/`  (opsiyonel — 12 el işareti, ~48×48 px)
- Şimdilik el işaretleri SVG çiziliyor. İstersen buraya PNG koyabiliriz;
  bağlamak için söylemen yeterli.

---

## ➕ Yeni öğe eklersen
Yeni jutsu/pet/düşman eklersek, `game.js` içindeki ilgili dizide `img:"assets/..."`
alanını verip dosyayı buraya koymak yeterli.
