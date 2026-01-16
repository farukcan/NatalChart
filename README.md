# NatalChart

[![React Native](https://img.shields.io/badge/React%20Native-0.81.4-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~54.0.10-black.svg)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-~5.9.2-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.58.0-green.svg)](https://supabase.com/)

Mobil doğum haritası hesaplama ve görselleştirme uygulaması. Astrolojik hesaplamalar yaparak gezegen pozisyonlarını, evleri ve açları hesaplar ve SVG ile görselleştirir.

## 🌟 Özellikler

- **Doğum Haritası Hesaplama**: Güneş, Ay, Merkür, Venüs, Mars, Jüpiter, Satürn, Uranüs, Neptün ve Plüton'un pozisyonları
- **Ev Sistemi**: Placidus ev sistemi ile 12 ev hesaplama
- **Açılar**: Gezegenler arası konjünksiyon, sekstil, kare, trigon ve karşıt açıları
- **SVG Görselleştirme**: Responsive ve etkileşimli doğum haritası grafiği
- **Kullanıcı Yönetimi**: Supabase ile güvenli kimlik doğrulama
- **Çoklu Platform**: iOS, Android ve Web desteği
- **Türkçe Destek**: Burç isimleri ve arayüz Türkçe

## 🚀 Teknoloji Altyapısı

- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: Expo Router (File-based routing)
- **State Management**: React Context API
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
- Harita entegrasyonu (planlanan)

### Chart Detayı (`/chart-detail`)
- Seçilen chart'ın detaylı görünümü
- Gezegen pozisyonları tablosu
- Ev dağılımı
- Açılar listesi

### Charts (`/charts`)
- Kaydedilmiş tüm doğum haritalarının listesi
- Chart düzenleme/silme işlemleri

### Ayarlar (`/settings`)
- Profil yönetimi
- Uygulama tercihleri
- Hesap ayarları

## 🗄️ Veritabanı Yapısı

### `natal_charts`
Kullanıcıların doğum haritalarını saklar:
- Temel doğum bilgileri (tarih, saat, konum)
- Coğrafi koordinatlar ve timezone bilgisi

### `chart_bodies`
Gezegen pozisyonlarını saklar:
- Güneş sistemi cisimleri (Güneş, Ay, gezegenler)
- Burç ve derece bilgileri
- Ev pozisyonları
- Retrograd durumu

### `chart_aspects`
Gezegenler arası açıları saklar:
- Açının türü (konjünksiyon, sekstil, vb.)
- Derece ve orb bilgileri
- Uygulama durumu

### `chart_houses`
Astrologik ev bilgilerini saklar:
- 12 evin burç dağılımı
- Ev cusp dereceleri

## 🔧 Kurulum ve Çalıştırma

### Ön Gereksinimler

- Node.js 18+
- npm veya yarn
- Expo CLI
- Supabase hesabı

### 1. Repoyu Klonlayın

```bash
git clone https://github.com/farukcan/NatalChart.git
cd NatalChart
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Supabase Kurulumu

```bash
# Supabase CLI'yi yükleyin
npm install -g supabase

# Supabase projesi başlatın
supabase init

# Migration'ları çalıştırın
supabase db push
```

### 4. Environment Variables

`.env` dosyasını oluşturun:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Uygulamayı Çalıştırın

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
│   ├── (auth)/            # Kimlik doğrulama ekranları
│   ├── (tabs)/            # Ana uygulama sekmeleri
│   └── _layout.tsx        # Ana layout
├── components/            # Yeniden kullanılabilir bileşenler
├── contexts/              # React Context'ler
├── hooks/                 # Özel React hook'ları
├── lib/                   # Yardımcı fonksiyonlar
│   ├── astrology.ts       # Astrolojik sabitler ve fonksiyonlar
│   ├── chartCalculations.ts # Hesaplama algoritmaları
│   └── supabase.ts        # Supabase konfigürasyonu
├── supabase/              # Backend konfigürasyonu
│   ├── functions/         # Edge functions
│   └── migrations/        # Veritabanı şeması
└── assets/                # Statik dosyalar
```

## 🔐 Güvenlik

- **Row Level Security (RLS)**: Supabase ile kullanıcı bazlı veri erişimi
- **JWT Authentication**: Güvenli oturum yönetimi
- **Environment Variables**: Hassas bilgilerin korunması
- **Input Validation**: Güvenli veri girişi

## 🎨 Tasarım İlkeleri

- **Minimalist UI**: Temiz ve kullanıcı dostu arayüz
- **Responsive Design**: Tüm ekran boyutlarına uyumlu
- **Accessibility**: Erişilebilirlik standartlarına uygun
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
# Web build
npm run build:web

# Static export için
expo export --platform web
```

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🙏 Teşekkürler

- [Supabase](https://supabase.com/) - Backend as a Service
- [Expo](https://expo.dev/) - React Native framework
- [React Native SVG](https://github.com/react-native-svg/react-native-svg) - SVG rendering
- Astrolojik hesaplamalar için astronomik algoritmalara

---

**Not**: Bu uygulama eğitim amaçlı geliştirilmiştir. Astrolojik yorumlar kişisel görüş olarak değerlendirilmelidir.
