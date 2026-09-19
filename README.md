# Lina'nın Turuncu Günü

Lina için yapılmış, iPad'de (Safari) oynanan kişisel bir oyun. Tuzla sahilinde geçen bir gün: her durakta bir mini oyun, kazanılan yıldızlarla gardıroptan yeni saç aksesuarları ve elbiseler.

**Oyna:** https://yunusylmzr.github.io/lina/

## Duraklar
| Durak | Oyun | Kim var |
|---|---|---|
| Okul Yolu | Sahil boyunca koşu: dokun → zıpla, aşağı kaydır → kay; çanta eşyalarını topla | Hacer yolluyor |
| Piyano | Düşen notalar, 12 tuş, şarkı listesi | Serkan dans eder |
| Karalama Atölyesi | Kalem, fırça, sim, neon, damga; boyama şablonları; galeri | Hacer |
| AVM Turu | Anadolu Yakası AVM'lerinde (Viaport, Hilltown, Emaar, Akasya, Buyaka, Piazza) vitrinlerde gizli eşya avı | Eklediğin karakter ya da Hacer |
| Suşi Şefi | Siparişler: malzemeleri sırayla sürükle, sar, dilimle | Herkes sipariş verir |
| Aile Akşamı | Aynı iPad'de iki kişilik: refleks, sayma, suşi yakalama | Seçtiğin rakip |

## Oyuncular
Çekirdek kadro Lina, annesi Hacer ve babası Serkan. Giriş ekranındaki **Oyuncular** bölümünden en fazla üç kişi daha eklenir: isim, saç/ten/kıyafet rengi, gözlük ve sakal seçilir. Eklenen karakterler AVM turunda, suşi siparişlerinde ve aile akşamında oyuna girer.

## Serkan Dijital
Oyunun içindeki mağaza. Para yok, her şey toplanan yıldızlarla açılır: kıyafetler, saç aksesuarları, piyano için ek şarkılar ve atölye için damga paketleri.

## Teknik
- Saf HTML/CSS/JS, tek `canvas` + DOM paneller; harici kütüphane yok. Ses WebAudio ile sentezlenir.
- Lina'nın saçı Verlet zinciriyle simüle edilir (`js/art.js`).
- Kayıt `localStorage`'da (`lina-turuncu-gun-v1`).
- iPad'de **Paylaş → Ana Ekrana Ekle** ile tam ekran açılır.

Yerel çalıştırma: klasörde `python3 -m http.server 8765` ve tarayıcıda `http://localhost:8765`.
