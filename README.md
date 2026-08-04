# NatalChart

<p align="center">
  <img src="assets/images/logo.svg" alt="NatalChart logo" width="480" />
</p>

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.10-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

Mobil doğum haritası hesaplama ve görselleştirme uygulaması. Astrolojik hesaplamalar yaparak gezegen pozisyonlarını, evleri ve açları hesaplar ve SVG ile görselleştirir.

<img width="399" height="774" alt="image" src="https://github.com/user-attachments/assets/59bfbe1e-e7e7-4cae-81d4-2f74abb08a4b" />


## 🌟 Özellikler

- **Doğum Haritası Hesaplama**: Güneş, Ay, Merkür, Venüs, Mars, Jüpiter, Satürn, Uranüs, Neptün ve Plüton'un pozisyonları
- **Ev Sistemi**: Placidus ev sistemi ile 12 ev hesaplama
- **Açılar**: Gezegenler arası konjünksiyon, sekstil, kare, trigon ve karşıt açıları
- **SVG Görselleştirme**: Responsive ve etkileşimli doğum haritası grafiği
- **Lokal Depolama**: Haritalar cihazda AsyncStorage ile saklanır, hesap gerekmez
- **Çoklu Platform**: iOS, Android ve Web desteği
- **Türkçe Destek**: Burç isimleri ve arayüz Türkçe

## 🚀 Teknoloji Altyapısı

- **Frontend**: React Native + Expo
- **Depolama**: AsyncStorage (local, hesap gerekmez)
- **Routing**: Expo Router (File-based routing)
- **Styling**: NativeWind (Tailwind CSS)
- **Icons**: Lucide React Native
- **Charts**: React Native SVG
- **Astrolojik Hesaplamalar**: Özel algoritmalar (Julian Day, Kepler yasaları)

## 📱 Uygulama Ekranları

### Ana Sayfa (`/`)

- Hoş geldin ekranı ve hızlı erişim

### Yeni Chart (`/new-chart`)

- Doğum tarihi, saati ve yeri girişi
- GPS ile konum alma özelliği

### Chart Detayı (`/chart-detail`)

- Seçilen chart'ın detaylı görünümü
- Gezegen pozisyonları tablosu
- Ev dağılımı
- Açılar listesi

### Charts (`/charts`)

- Kaydedilmiş tüm doğum haritalarının listesi
- Chart düzenleme/silme işlemleri

### Ayarlar (`/settings`)

- Uygulama tercihleri

## 🗄️ Lokal Depolama

Tüm veriler cihazda `AsyncStorage` ile saklanır. `StoredChart` veri yapısı:

| Alan              | Tip    | Açıklama                 |
| ----------------- | ------ | ------------------------ |
| `id`              | string | Benzersiz kimlik         |
| `name`            | string | Haritanın adı            |
| `birth_date`      | string | Doğum tarihi (ISO)       |
| `birth_time`      | string | Doğum saati              |
| `birth_location`  | string | Doğum yeri adı           |
| `latitude`        | number | Enlem                    |
| `longitude`       | number | Boylam                   |
| `timezone_offset` | number | UTC farkı (saat)         |
| `created_at`      | string | Oluşturulma zamanı (ISO) |

## 🔧 Kurulum ve Çalıştırma

### Ön Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/farukcan/NatalChart.git
cd NatalChart
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Uygulamayı Çalıştırın

```bash
# Development server
npm run dev

# Web için
npm run build:web

# TypeScript kontrolü
npm run typecheck

# Linting
npm run lint
```

## 🧮 Astrolojik Hesaplamalar

### Temel Algoritmalar

- **Julian Day**: Tarih-saat'i astronomik gün numarasına çevirme
- **Gezegen Pozisyonları**: Güneş sistemi cisimlerinin ekliptik boylam hesaplaması
- **Ev Sistemi**: Placidus metodu ile astrologik ev hesaplama
- **Açılar**: Gezegenler arası açısal ilişkilerin analizi

### Desteklenen Hesaplamalar

#### Gezegenler

- ☉ Güneş
- ☽ Ay
- ☿ Merkür
- ♀ Venüs
- ♂ Mars
- ♃ Jüpiter
- ♄ Satürn
- ♅ Uranüs
- ♆ Neptün
- ♇ Plüton

#### Burçlar

- ♈ Koç, ♉ Boğa, ♊ İkizler, ♋ Yengeç
- ♌ Aslan, ♍ Başak, ♎ Terazi, ♏ Akrep
- ♐ Yay, ♑ Oğlak, ♒ Kova, ♓ Balık

#### Açılar

- Konjünksiyon (0°)
- Sekstil (60°)
- Kare (90°)
- Trigon (120°)
- Karşıt (180°)

## 📁 Proje Yapısı

```
NatalChart/
├── app/                    # Expo Router sayfaları
│   ├── (tabs)/            # Ana uygulama sekmeleri
│   └── _layout.tsx        # Ana layout
├── components/            # Yeniden kullanılabilir bileşenler
├── hooks/                 # Özel React hook'ları
├── lib/                   # Yardımcı fonksiyonlar
│   ├── astrology.ts       # Astrolojik sabitler ve fonksiyonlar
│   ├── chartCalculations.ts # Hesaplama algoritmaları
│   └── storage.ts         # AsyncStorage CRUD işlemleri
├── assets/                # Statik dosyalar (icon/logo dahil)
└── scripts/               # Araç scriptleri (branding üretimi)
```

## 🎨 Marka / Icon Üretimi

Icon, favicon, splash, adaptive icon ve logo prosedürel olarak üretilir:

```bash
npm run generate:branding
```

Çıktılar `assets/images/` altına yazılır ve `app.json` üzerinden Expo'ya bağlanır (`icon`, `splash`, `android.adaptiveIcon`, `web.favicon`).

## 🔐 Güvenlik

- **Lokal Veri**: Tüm veriler yalnızca cihazda saklanır, sunucuya gönderilmez
- **Hesap Yok**: Kullanıcı kaydı veya kimlik doğrulama gerekmez
- **Input Validation**: Güvenli veri girişi

## 🎨 Tasarım İlkeleri

- **Minimalist UI**: Temiz ve kullanıcı dostu arayüz
- **Responsive Design**: Tüm ekran boyutlarına uyumlu
- **Dark/Light Mode**: Sistem temasına uyumlu
- **Türkçe Yerelleştirme**: Kültürel uyumluluk

## 🚀 Dağıtım

### Expo Application Services (EAS)

```bash
# EAS CLI'yi yükleyin
npm install -g eas-cli

# Build konfigürasyonu
eas build:configure

# Production build
eas build --platform ios
eas build --platform android
```

### Web Dağıtımı

```bash
npm run build:web
```

## 🤝 Katkıda Bulunma

Katkılar memnuniyetle karşılanır! Detaylar için [CONTRIBUTING.md](CONTRIBUTING.md) dosyasına bakın.

## 📄 Lisans

Bu proje [GNU General Public License v3.0](LICENSE) lisansı altında yayınlanmıştır.

## 🙏 Teşekkürler

- [Expo](https://expo.dev/) - React Native framework
- [React Native SVG](https://github.com/react-native-svg/react-native-svg) - SVG rendering
- Astrolojik hesaplamalar için astronomik algoritmalara

---

**Not**: Bu uygulama eğitim amaçlı geliştirilmiştir. Astrolojik yorumlar kişisel görüş olarak değerlendirilmelidir.
