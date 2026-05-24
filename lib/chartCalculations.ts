import {
  ZODIAC_SIGNS_EN,
  getSignFromDegrees,
  getDegreesInSign,
  ASPECT_TYPES,
} from './astrology';

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

function getSunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + T * (36000.76983 + T * 0.0003032);
  const e = 0.016708634 - T * (4.2037e-5 + T * 1.267e-7);
  const M = 357.52911 + T * (35999.05029 - T * 0.0001537);
  const Mrad = (M * Math.PI) / 180;

  const C =
    (1.914602 - T * (0.004817 + T * 0.000014)) * Math.sin(Mrad) +
    (0.019993 - T * 0.000101) * Math.sin(2 * Mrad);

  let lng = L0 + C;
  lng = lng % 360;
  return lng < 0 ? lng + 360 : lng;
}

function getMoonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  const Lprime =
    218.3164477 +
    T *
      (481267.88123421 -
        T * (0.0015786 + T * (1.0 / 538841.0 - T / 65194000.0)));
  const D =
    297.8501921 +
    T *
      (445267.1114034 -
        T * (0.0018819 + T * (1.0 / 545868.0 - T / 113065000.0)));
  const Mprime =
    134.9633964 +
    T *
      (477198.8675055 + T * (0.0087414 + T * (1.0 / 69699.0 - T / 14712000.0)));

  const Drad = (D * Math.PI) / 180;
  const Mrad = (Mprime * Math.PI) / 180;

  let lng =
    Lprime + 6.28875 * Math.sin(Mrad) + 1.27402 * Math.sin(2 * Drad - Mrad);

  lng = lng % 360;
  return lng < 0 ? lng + 360 : lng;
}

function getPlanetLongitude(
  jd: number,
  coefficients: {
    L: number;
    lRate: number;
    e: number;
    M: number;
    mRate: number;
  },
): number {
  const T = (jd - 2451545.0) / 36525.0;
  const L = coefficients.L + coefficients.lRate * T;
  const M = coefficients.M + coefficients.mRate * T;
  const e = coefficients.e;

  const Mrad = (M * Math.PI) / 180;
  const lng = L + (180 / Math.PI) * 2 * e * Math.sin(Mrad);

  let result = lng % 360;
  return result < 0 ? result + 360 : result;
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
): Promise<CalculationResult> {
  const jd = calculateJulianDay(year, month, day, hour, minute);

  const sunLng = getSunLongitude(jd);
  const moonLng = getMoonLongitude(jd);
  const mercuryLng = getPlanetLongitude(jd, {
    L: 252.25032,
    lRate: 149472.6797,
    e: 0.205635,
    M: 74.96628,
    mRate: 538101.49,
  });
  const venusLng = getPlanetLongitude(jd, {
    L: 181.97909,
    lRate: 58517.8149,
    e: 0.006773,
    M: 131.60688,
    mRate: 210877.403,
  });
  const marsLng = getPlanetLongitude(jd, {
    L: 355.43333,
    lRate: 19140.2993,
    e: 0.093405,
    M: 19.3871,
    mRate: 11062.8611,
  });
  const jupiterLng = getPlanetLongitude(jd, {
    L: 34.35151,
    lRate: 3034.9057,
    e: 0.048494,
    M: 20.76069,
    mRate: 1223.511,
  });
  const saturnLng = getPlanetLongitude(jd, {
    L: 50.07669,
    lRate: 1222.4934,
    e: 0.055746,
    M: 317.13108,
    mRate: 846.0891,
  });
  const uranusLng = 314.05002 + ((jd - 2451545.0) / 36525.0) * 428.4643;
  const neptuneLng = 304.34866 + ((jd - 2451545.0) / 36525.0) * 218.2231;
  const plutoLng = 238.92881 + ((jd - 2451545.0) / 36525.0) * 145.1694;

  const ascendant = (longitude + hour * 15 + minute * 0.25) % 360;
  const midheaven = (ascendant + 90) % 360;

  const houses = calculateHouses(ascendant, latitude);

  const bodies: Record<string, BodyPosition> = {
    Sun: {
      name: 'Sun',
      longitude: sunLng,
      sign: getSignFromDegrees(sunLng),
      degreesInSign: getDegreesInSign(sunLng),
      house: getHouseForLongitude(sunLng, ascendant),
      retrograde: false,
    },
    Moon: {
      name: 'Moon',
      longitude: moonLng,
      sign: getSignFromDegrees(moonLng),
      degreesInSign: getDegreesInSign(moonLng),
      house: getHouseForLongitude(moonLng, ascendant),
      retrograde: false,
    },
    Mercury: {
      name: 'Mercury',
      longitude: mercuryLng,
      sign: getSignFromDegrees(mercuryLng),
      degreesInSign: getDegreesInSign(mercuryLng),
      house: getHouseForLongitude(mercuryLng, ascendant),
      retrograde: false,
    },
    Venus: {
      name: 'Venus',
      longitude: venusLng,
      sign: getSignFromDegrees(venusLng),
      degreesInSign: getDegreesInSign(venusLng),
      house: getHouseForLongitude(venusLng, ascendant),
      retrograde: false,
    },
    Mars: {
      name: 'Mars',
      longitude: marsLng,
      sign: getSignFromDegrees(marsLng),
      degreesInSign: getDegreesInSign(marsLng),
      house: getHouseForLongitude(marsLng, ascendant),
      retrograde: false,
    },
    Jupiter: {
      name: 'Jupiter',
      longitude: jupiterLng,
      sign: getSignFromDegrees(jupiterLng),
      degreesInSign: getDegreesInSign(jupiterLng),
      house: getHouseForLongitude(jupiterLng, ascendant),
      retrograde: false,
    },
    Saturn: {
      name: 'Saturn',
      longitude: saturnLng,
      sign: getSignFromDegrees(saturnLng),
      degreesInSign: getDegreesInSign(saturnLng),
      house: getHouseForLongitude(saturnLng, ascendant),
      retrograde: false,
    },
    Uranus: {
      name: 'Uranus',
      longitude: uranusLng % 360,
      sign: getSignFromDegrees(uranusLng),
      degreesInSign: getDegreesInSign(uranusLng),
      house: getHouseForLongitude(uranusLng, ascendant),
      retrograde: false,
    },
    Neptune: {
      name: 'Neptune',
      longitude: neptuneLng % 360,
      sign: getSignFromDegrees(neptuneLng),
      degreesInSign: getDegreesInSign(neptuneLng),
      house: getHouseForLongitude(neptuneLng, ascendant),
      retrograde: false,
    },
    Pluto: {
      name: 'Pluto',
      longitude: plutoLng % 360,
      sign: getSignFromDegrees(plutoLng),
      degreesInSign: getDegreesInSign(plutoLng),
      house: getHouseForLongitude(plutoLng, ascendant),
      retrograde: false,
    },
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
