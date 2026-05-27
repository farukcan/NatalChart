import {
  getSignFromDegrees,
  getDegreesInSign,
  ASPECT_TYPES,
} from './astrology';
import * as Astronomy from 'astronomy-engine';

export interface CalculationResult {
  bodies: Record<string, BodyPosition>;
  houses: Record<number, HousePosition>;
  aspects: AspectResult[];
  ascendant: number;
  midheaven: number;
}

export interface BodyPosition {
  name: string;
  longitude: number;
  sign: string;
  degreesInSign: number;
  house: number;
  retrograde: boolean;
}

export interface HousePosition {
  houseNumber: number;
  sign: string;
  cuspDegrees: number;
  cuspMinutes: number;
}

export interface AspectResult {
  body1: string;
  body2: string;
  type: string;
  degrees: number;
  orb: number;
  isApplying: boolean;
}

function calculateJulianDay(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): number {
  let y = year;
  let m = month;

  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  const jd =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    day +
    (hour + minute / 60) / 24.0 +
    b -
    1524.5;

  return jd;
}

const PLANET_BODIES: Record<string, Astronomy.Body> = {
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

function getGeocentricLongitude(
  body: Astronomy.Body,
  date: Date,
  precessionDeg: number,
): number {
  const geo = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(geo);
  return ((ecl.elon + precessionDeg) % 360 + 360) % 360;
}

function calculateGMST(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let gmst =
    280.46061837 +
    360.98564736629 * (jd - 2451545.0) +
    0.000387933 * T * T -
    (T * T * T) / 38710000.0;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  return gmst;
}

function calculateAscendantAndMC(
  jd: number,
  latitude: number,
  longitude: number,
): { ascendant: number; midheaven: number } {
  const gmst = calculateGMST(jd);
  let lst = (gmst + longitude) % 360;
  if (lst < 0) lst += 360;

  const T = (jd - 2451545.0) / 36525.0;
  const obliquity = 23.4392911 - 0.0130042 * T;

  const lstRad = (lst * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const oblRad = (obliquity * Math.PI) / 180;

  // Midheaven (MC)
  let mc =
    (Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(oblRad)) * 180) /
    Math.PI;
  if (mc < 0) mc += 360;

  // Ascendant (Duffett-Smith & Zwart, Practical Astronomy, p47)
  const ascNumerator = -Math.cos(lstRad);
  const ascDenominator =
    Math.sin(oblRad) * Math.tan(latRad) +
    Math.cos(oblRad) * Math.sin(lstRad);
  let asc = Math.atan(ascNumerator / ascDenominator) * (180 / Math.PI);
  if (ascDenominator < 0) {
    asc += 180;
  } else {
    asc += 360;
  }
  if (asc >= 180) {
    asc -= 180;
  } else {
    asc += 180;
  }
  asc = asc % 360;

  return { ascendant: asc, midheaven: mc };
}

function calculateHouses(
  ascendantDegrees: number,
  _latitude: number,
): Record<number, HousePosition> {
  const houses: Record<number, HousePosition> = {};

  for (let i = 1; i <= 12; i++) {
    const angle = (ascendantDegrees + (i - 1) * 30) % 360;
    const sign = getSignFromDegrees(angle);
    const degreesInSign = getDegreesInSign(angle);

    houses[i] = {
      houseNumber: i,
      sign,
      cuspDegrees: Math.floor(degreesInSign),
      cuspMinutes: Math.round((degreesInSign - Math.floor(degreesInSign)) * 60),
    };
  }

  return houses;
}

function getHouseForLongitude(
  longitude: number,
  ascendantDegrees: number,
): number {
  const normalized = (longitude - ascendantDegrees + 360) % 360;
  const houseIndex = Math.floor(normalized / 30) + 1;
  return houseIndex <= 12 ? houseIndex : houseIndex - 12;
}

function calculateAspects(
  bodies: Record<string, BodyPosition>,
): AspectResult[] {
  const aspects: AspectResult[] = [];
  const bodyNames = Object.keys(bodies);
  const mainBodies = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ];

  for (let i = 0; i < mainBodies.length; i++) {
    for (let j = i + 1; j < mainBodies.length; j++) {
      const body1Name = mainBodies[i];
      const body2Name = mainBodies[j];

      if (!bodies[body1Name] || !bodies[body2Name]) continue;

      const lng1 = bodies[body1Name].longitude;
      const lng2 = bodies[body2Name].longitude;

      let diff = Math.abs(lng1 - lng2);
      if (diff > 180) {
        diff = 360 - diff;
      }

      for (const [aspectName, aspectData] of Object.entries(ASPECT_TYPES)) {
        const orb = aspectData.orb;
        const targetDegrees = aspectData.degrees;

        let aspectDiff = Math.abs(diff - targetDegrees);
        if (aspectDiff <= orb) {
          aspects.push({
            body1: body1Name,
            body2: body2Name,
            type: aspectName,
            degrees: diff,
            orb: orb - aspectDiff,
            isApplying: false,
          });
          break;
        }
      }
    }
  }

  return aspects;
}

export async function calculateChart(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  latitude: number,
  longitude: number,
  timezoneOffset: number = 0,
): Promise<CalculationResult> {
  // Convert local time to UTC
  let utcMinute = minute;
  let utcHour = hour - timezoneOffset;
  let utcDay = day;
  let utcMonth = month;
  let utcYear = year;

  // Handle hour overflow/underflow
  while (utcHour < 0) {
    utcHour += 24;
    utcDay -= 1;
  }
  while (utcHour >= 24) {
    utcHour -= 24;
    utcDay += 1;
  }

  // Handle day overflow/underflow
  const daysInMonth = new Date(utcYear, utcMonth, 0).getDate();
  if (utcDay < 1) {
    utcMonth -= 1;
    if (utcMonth < 1) {
      utcMonth = 12;
      utcYear -= 1;
    }
    utcDay += new Date(utcYear, utcMonth, 0).getDate();
  } else if (utcDay > daysInMonth) {
    utcDay -= daysInMonth;
    utcMonth += 1;
    if (utcMonth > 12) {
      utcMonth = 1;
      utcYear += 1;
    }
  }

  const jd = calculateJulianDay(utcYear, utcMonth, utcDay, utcHour, utcMinute);
  const utcDate = new Date(Date.UTC(utcYear, utcMonth - 1, utcDay, utcHour, utcMinute));

  // Precession correction: J2000 ecliptic → ecliptic of date
  const T = (jd - 2451545.0) / 36525.0;
  const precessionDeg = 1.3972 * T;

  // Sun (apparent ecliptic of date - already includes precession)
  const sunLng = Astronomy.SunPosition(utcDate).elon;

  // Moon (ecliptic of date)
  const moonPos = Astronomy.EclipticGeoMoon(utcDate);
  const moonLng = ((moonPos.lon % 360) + 360) % 360;

  // Planets (J2000 ecliptic + precession correction)
  const geoLongitudes: Record<string, number> = {};
  for (const [name, body] of Object.entries(PLANET_BODIES)) {
    geoLongitudes[name] = getGeocentricLongitude(body, utcDate, precessionDeg);
  }

  const { ascendant, midheaven } = calculateAscendantAndMC(
    jd,
    latitude,
    longitude,
  );

  const houses = calculateHouses(ascendant, latitude);

  const makeBody = (name: string, lng: number): BodyPosition => ({
    name,
    longitude: lng,
    sign: getSignFromDegrees(lng),
    degreesInSign: getDegreesInSign(lng),
    house: getHouseForLongitude(lng, ascendant),
    retrograde: false,
  });

  const bodies: Record<string, BodyPosition> = {
    Sun: makeBody('Sun', sunLng),
    Moon: makeBody('Moon', moonLng),
    Mercury: makeBody('Mercury', geoLongitudes['Mercury']),
    Venus: makeBody('Venus', geoLongitudes['Venus']),
    Mars: makeBody('Mars', geoLongitudes['Mars']),
    Jupiter: makeBody('Jupiter', geoLongitudes['Jupiter']),
    Saturn: makeBody('Saturn', geoLongitudes['Saturn']),
    Uranus: makeBody('Uranus', geoLongitudes['Uranus']),
    Neptune: makeBody('Neptune', geoLongitudes['Neptune']),
    Pluto: makeBody('Pluto', geoLongitudes['Pluto']),
  };

  const aspects = calculateAspects(bodies);

  return {
    bodies,
    houses,
    aspects,
    ascendant: ascendant % 360,
    midheaven: midheaven % 360,
  };
}
