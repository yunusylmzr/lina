# Lina'nın Turuncu Günü

Lina için yapılmış, iPad'de (Safari) oynanan kişisel bir oyun. Tuzla sahilinde geçen bir gün: her durakta bir mini oyun, kazanılan yıldızlarla gardıroptan yeni saç aksesuarları ve elbiseler.

**Oyna:** https://yunusylmzr.github.io/lina/

## Duraklar
| Durak | Oyun | Kim var |
|---|---|---|
| Okul Yolu | Sahil boyunca koşu: dokun → zıpla, aşağı kaydır → kay; çanta eşyalarını topla | Hacer yolluyor |
| Piyano | Düşen notalar, 12 tuş, 4 şarkı | Serkan dans eder |
| Karalama Atölyesi | Kalem, fırça, sim, neon, damga; boyama şablonları; galeri | Betül |
| AVM Turu | Anadolu Yakası AVM'lerinde (Viaport, Hilltown, Emaar, Akasya, Buyaka, Piazza) vitrinlerde gizli eşya avı | Mehmet Doruk |
| Suşi Şefi | Aile siparişleri: malzemeleri sırayla sürükle, sar, dilimle | Yunus, Serkan, Hacer, Betül, Mehmet Doruk |
| Aile Akşamı | Aynı iPad'de iki kişilik: refleks, sayma, suşi yakalama | Seçtiğin rakip |

## Teknik
- Saf HTML/CSS/JS, tek `canvas` + DOM paneller; harici kütüphane yok. Ses WebAudio ile sentezlenir.
- Lina'nın saçı Verlet zinciriyle simüle edilir (`js/art.js`).
- Kayıt `localStorage`'da (`lina-turuncu-gun-v1`).
- iPad'de **Paylaş → Ana Ekrana Ekle** ile tam ekran açılır.

Yerel çalıştırma: klasörde `python3 -m http.server 8765` ve tarayıcıda `http://localhost:8765`.
