# Sohbet Geçmişi / Geliştirme Günlüğü — Shinobi Tap

Bu dosya, oyunun sıfırdan bugüne sohbet üzerinden gelişimini özetler.
(Kronolojik; en eski → en yeni. Tam mesaj dökümü değil, karar & iş özeti.)

---

## Başlangıç — Konsept
- Kullanıcı: "Tap Titans gibi tap oyunu, ama Naruto temalı, kombinasyonlarla düşmana hasar."
- Kararlar: **Web (HTML5+JS)** · oynanabilir prototip · combo mekaniği = **el işareti (seal) dizisi**.
- İlk sürüm: 12 el mührü, seal combo, düşman/can/stage/combo çarpanı.

## El işaretleri & dinamik tuş takımı
- Mührler kanji yerine **el şekli** ikonlarıyla gösterildi.
- Tuş takımı dinamik: sadece **açık jutsu'larda kullanılan** mührler görünür.
- Ryō (altın) ile jutsu açma (📜) sistemi eklendi.

## Tap Titans düzeni
- Ortada kahraman + önde düşman; saldırı animasyonları (öne atılış/sıçrayış).
- Referans görsele göre tam Tap Titans HUD'u: orman arka plan, üstte düşman adı+HP,
  altın, Lv/XP, 💀 kill sayacı; altta sekmeli geliştirme paneli.
- **Yuvarlak skill ikon bar'ı** (tıkla → jutsu seç → combo yap → hasar).

## Dostlar (ally) + mağaza
- "Petler" → **Dostlar (ally)**: elementsel yardımcılar, **otomatik hasar**.
- Mağazadan jutsu + dost + güç (tap hasarı, jutsu ustalığı) aç & yükselt.
- 5 sekme: SAVAŞ · JUTSU · DOST · GÜÇ · İSTAT.

## Pixel-art assetler
- `assets/` klasör yapısı + emoji fallback sistemi (dosya yoksa emoji).
- Kullanıcı RPG Maker tarzı 3×4 spritesheet'ler ekledi → tek kare kesme motoru.
- Dostlar gerçek karakter sprite'larıyla; düşman/boss havuzları gerçek görsellerle.

## Bölümler + arka plan + hero
- 6 bölüm (Orman, Mağara, Buz, Çöl, Volkan, Kale) — her 3 aşamada değişir.
- Hero uygun sprite + saldırı animasyonu; boyut ayarlandı.
- Karaktere uygun canlı kare animasyonları + element renkli efektler.

## Combo & özel vuruş
- 3 ardışık combo → skill orb ⚡ parlar → basınca **×4 özel vuruş** + skill renginde alev.
- Kombo göstergesi toprak alana taşındı; sıfırlama/başa dönme düzeltmeleri.
- Mühür sırası göstergesi de toprak alana; tuşlar **3 sol / 3 sağ**.

## Boss girişi + portallar
- 10. düşmanda: "BOSS GELİYOR" + portal animasyonu + **3-2-1 geri sayım** + çıkış efekti.
- Portal görseli: `assets/boss_portals/192x192/` spritesheet (15 kare).
- Boss süre limiti 30 sn; geçilemezse 10'luk seri başa döner.

## Profesyonel pixel-art sahneler
- CSS gradyan yerine **prosedürel SVG pixel-art** katmanlı sahneler
  (gökyüzü bantları + basamaklı dağlar + ağaç/yapı + sis/parçacık + parallax).

## Repo & hafıza (bu oturum)
- Git deposu + `origin = github.com/asilonfire/mobilsss`.
- `CLAUDE.md` kalıcı proje hafızası: her oturumda pull→çalış→güncelle→push akışı.
- Telefon testi: Cloudflare quick tunnel (geçici URL).

---

> Detaylı güncel durum ve sıradaki işler için **`CLAUDE.md`**'ye bak.
