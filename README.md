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
| Oda Toplama | Dağınık eşyaları doğru kutuya sürükle, anne gelmeden bitir; yatağın altı da sayılır | Hacer |
| Aile Akşamı | Aynı iPad'de iki kişilik: refleks, sayma, suşi yakalama, toplama yarışı | Seçtiğin rakip |

## Oyuncular
Çekirdek kadro Lina, annesi Hacer ve babası Serkan. Haritanın altındaki **Ayarlar**'dan en fazla üç kişi daha eklenir: isim, saç/ten/kıyafet rengi, gözlük ve sakal seçilir. Eklenen karakterler AVM turunda, suşi siparişlerinde ve aile akşamında oyuna girer.

## Günlük ve sırlar
Haritanın altındaki **Günlük**'te iki sekme var. *Bugün* günün ilerlemesini gösterir. *Sırlar* şifreli bir gizli günlüktür: dört haneli bir şifre girilir (hepsi çalışır), içinde hazır sayfalar vardır ve Lina kendi sayfalarını yazıp silebilir.

Oyun sırasında aileden mesaj bildirimleri düşer: Hacer'den yemek çağrısı, Serkan'dan turnuva daveti, eklediğin karakterlerden not. Haritada ve mağazada görünür, dokununca kapanır.

## Serkan Dijital
Oyunun içindeki mağaza. Para yok, her şey toplanan yıldızlarla açılır: kıyafetler, saç aksesuarları, piyano için ek şarkılar, atölye için damga paketleri ve Oda Toplama'ya süre ekleyen ekstralar.

## Baştan başlamak
Haritanın altındaki **Ayarlar** panelinde **Baştan başla** düğmesi var. İki seçenek sunar: *İlerlemeyi sil* yıldızları, bölüm yıldızlarını, en iyi skorları, gün sayısını ve mağazadan açılanları sıfırlar, eklenen karakterleri ve resim galerisini korur; *Her şeyi sil* onları da temizler.

## Teknik
- Saf HTML/CSS/JS, tek `canvas` + DOM paneller; harici kütüphane yok. Ses WebAudio ile sentezlenir.
- Lina'nın saçı Verlet zinciriyle simüle edilir (`js/art.js`).
- Kayıt `localStorage`'da (`lina-turuncu-gun-v1`).
- Arka plan siluetindeki binalar kaydırmada kimliğini korur, bazılarının çatısında Lina'ya özel tabelalar vardır (LİNA TOWERS, TURUNCU KULE…).
- iPad'de **Paylaş → Ana Ekrana Ekle** ile tam ekran açılır.

Yayına yeni sürüm gönderirken önce `./bump.sh` çalıştır: `index.html` içindeki js ve css adreslerine sürüm etiketi basar, böylece tarayıcılar eski dosyayı önbellekten vermez.

Yerel çalıştırma: klasörde `python3 -m http.server 8765` ve tarayıcıda `http://localhost:8765`.
