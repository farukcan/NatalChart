export const ZODIAC_SIGNS = [
  'Koç',
  'Boğa',
  'İkizler',
  'Yengeç',
  'Aslan',
  'Başak',
  'Terazi',
  'Akrep',
  'Yay',
  'Oğlak',
  'Kova',
  'Balık',
];

export const ZODIAC_SIGNS_EN = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

export const ZODIAC_SYMBOLS = [
  '♈', // Koç
  '♉', // Boğa
  '♊', // İkizler
  '♋', // Yengeç
  '♌', // Aslan
  '♍', // Başak
  '♎', // Terazi
  '♏', // Akrep
  '♐', // Yay
  '♑', // Oğlak
  '♒', // Kova
  '♓', // Balık
];

export const PLANETARY_SYMBOLS = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  'North Node': '☊',
  'South Node': '☋',
  Chiron: '⚷',
  Lilith: '⚸',
};

export const HOUSE_NAMES = [
  'Benlik, Kimlik, Dış Görünüş',
  'Para, Mülk, Değerler',
  'İletişim, Akrabalar, Komşular',
  'Aile, Ev, Ebeveynler',
  'Yaratıcılık, Çocuklar, Romantizm',
  'İş, Sağlık, Günlük Rutinler',
  'Partnerlik, Evlilik, İşbirliği',
  'Kalıtım, Ölüm, Dönüşüm',
  'Eğitim, Seyahat, Felsefe',
  'Kariyer, Sosyal Statü, Otorite',
  'Arkadaşlar, Umutlar, Sosyal Gruplar',
  'Gizlilik, Ruhsal İş, Ayakkabılar',
];

export interface ChartBody {
  name: string;
  sign: string;
  degrees: number;
  minutes: number;
  seconds?: number;
  house: number;
  isRetrograde: boolean;
}

export interface ChartHouse {
  houseNumber: number;
  sign: string;
  cuspDegrees: number;
  cuspMinutes: number;
}

export interface ChartAspect {
  body1: string;
  body2: string;
  aspectType: string;
  aspectDegrees: number;
  orb: number;
  isApplying: boolean;
}

export function getSignIndex(sign: string): number {
  const index = ZODIAC_SIGNS_EN.indexOf(sign);
  return index >= 0 ? index : 0;
}

export function degreesToDMS(degrees: number): {
  degrees: number;
  minutes: number;
  seconds: number;
} {
  const d = Math.floor(degrees);
  const remaining = (degrees - d) * 60;
  const m = Math.floor(remaining);
  const s = Math.round((remaining - m) * 60);
  return { degrees: d, minutes: m, seconds: s };
}

export function dmsToDecimal(
  degrees: number,
  minutes: number,
  seconds: number = 0,
): number {
  return degrees + minutes / 60 + seconds / 3600;
}

export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

export function getSignFromDegrees(degrees: number): string {
  const normalized = normalizeAngle(degrees);
  const signIndex = Math.floor(normalized / 30);
  return ZODIAC_SIGNS_EN[signIndex];
}

export function getDegreesInSign(degrees: number): number {
  const normalized = normalizeAngle(degrees);
  return normalized % 30;
}

export const ASPECT_TYPES = {
  Conjunction: { degrees: 0, orb: 8 },
  Sextile: { degrees: 60, orb: 6 },
  Square: { degrees: 90, orb: 8 },
  Trine: { degrees: 120, orb: 8 },
  Opposition: { degrees: 180, orb: 8 },
};

export const ASPECT_TYPES_TR = {
  Conjunction: 'Konjünksiyon',
  Sextile: 'Sekstil',
  Square: 'Kare',
  Trine: 'Trigon',
  Opposition: 'Karşıt',
};

export const ASPECT_COLORS = {
  Conjunction: '#FF0000',
  Sextile: '#FFD700',
  Square: '#FF8C00',
  Trine: '#00AA00',
  Opposition: '#0000FF',
};
