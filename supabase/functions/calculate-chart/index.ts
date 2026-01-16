import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChartRequest {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  timezone_offset: number;
}

interface PlanetPosition {
  name: string;
  longitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
}

function convertToJulianDay(year: number, month: number, day: number, hour: number, minute: number): number {
  const utHour = hour - 0;
  const utMin = minute;
  const utSec = 0;

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
    (utHour + utMin / 60 + utSec / 3600) / 24.0 +
    b -
    1524.5;

  return jd;
}

function getSunPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L0 = 280.46646 + T * (36000.76983 + T * 0.0003032);
  const e = 0.016708634 - T * (4.2037e-5 + T * 1.267e-7);
  const M = 357.52911 + T * (35999.05029 - T * 0.0001537);
  const Mrad = (M * Math.PI) / 180;

  const C = (1.914602 - T * (0.004817 + T * 0.000014)) * Math.sin(Mrad) + (0.019993 - T * 0.000101) * Math.sin(2 * Mrad);

  const sunLng = (L0 + C) % 360;
  return { longitude: sunLng < 0 ? sunLng + 360 : sunLng, latitude: 0 };
}

function getMoonPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const Lprime = 218.3164477 + T * (481267.88123421 - T * (0.0015786 + T * (1.0 / 538841.0 - T / 65194000.0)));
  const D = 297.8501921 + T * (445267.1114034 - T * (0.0018819 + T * (1.0 / 545868.0 - T / 113065000.0)));
  const Mprime = 134.9633964 + T * (477198.8675055 + T * (0.0087414 + T * (1.0 / 69699.0 - T / 14712000.0)));
  const F = 93.2720950 + T * (483202.0175233 - T * (0.0036539 + T * (-1.0 / 3526000.0 + T / 863310000.0)));

  const Drad = (D * Math.PI) / 180;
  const Mrad = (Mprime * Math.PI) / 180;
  const Frad = (F * Math.PI) / 180;

  let lng = Lprime + 6.28875 * Math.sin(Mrad) + 1.27402 * Math.sin(2 * Drad - Mrad);

  lng = lng % 360;
  return { longitude: lng < 0 ? lng + 360 : lng, latitude: 0 };
}

function getMercuryPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L = 252.25032 + T * (149472.6797 - T * 0.000539);
  const a = 0.387098;
  const e = 0.205635 + T * (-0.000069);
  const M = 74.96628 + T * (538101.49 - T * 0.000142);
  const Mrad = (M * Math.PI) / 180;
  const E = M + (180 / Math.PI) * e * Math.sin(Mrad);

  const longitude = (L + (180 / Math.PI) * 2 * e * Math.sin(Mrad)) % 360;
  return { longitude: longitude < 0 ? longitude + 360 : longitude, latitude: 0 };
}

function getVenusPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L = 181.97909 + T * (58517.8149 - T * 0.000041);
  const e = 0.006773 - T * 0.000002;
  const M = 131.60688 + T * (210877.403 - T * 0.000131);
  const Mrad = (M * Math.PI) / 180;

  const longitude = (L + (180 / Math.PI) * 2 * e * Math.sin(Mrad)) % 360;
  return { longitude: longitude < 0 ? longitude + 360 : longitude, latitude: 0 };
}

function getMarsPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L = 355.43333 + T * (19140.2993 + T * 0.000146);
  const e = 0.093405 + T * 0.000092;
  const M = 19.3871 + T * (11062.8611 + T * 0.000831);
  const Mrad = (M * Math.PI) / 180;

  const longitude = (L + (180 / Math.PI) * 2 * e * Math.sin(Mrad)) % 360;
  return { longitude: longitude < 0 ? longitude + 360 : longitude, latitude: 0 };
}

function getJupiterPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L = 34.35151 + T * (3034.9057 + T * 0.000211);
  const e = 0.048494 + T * (-0.000165);
  const M = 20.76069 + T * (1223.5110 + T * 0.000387);
  const Mrad = (M * Math.PI) / 180;

  const longitude = (L + (180 / Math.PI) * 2 * e * Math.sin(Mrad)) % 360;
  return { longitude: longitude < 0 ? longitude + 360 : longitude, latitude: 0 };
}

function getSaturnPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L = 50.07669 + T * (1222.4934 - T * 0.000537);
  const e = 0.055746 + T * (-0.000341);
  const M = 317.13108 + T * (846.0891 + T * 0.000235);
  const Mrad = (M * Math.PI) / 180;

  const longitude = (L + (180 / Math.PI) * 2 * e * Math.sin(Mrad)) % 360;
  return { longitude: longitude < 0 ? longitude + 360 : longitude, latitude: 0 };
}

function getUranusPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L = 314.05002 + T * (428.4643 - T * 0.000151);
  return { longitude: L % 360, latitude: 0 };
}

function getNeptunePosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L = 304.34866 + T * (218.2231 + T * 0.000196);
  return { longitude: L % 360, latitude: 0 };
}

function getPlutoPosition(jd: number) {
  const T = (jd - 2451545.0) / 36525.0;
  const L = 238.92881 + T * (145.1694 - T * 0.000051);
  return { longitude: L % 360, latitude: 0 };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: ChartRequest = await req.json();

    const jd = convertToJulianDay(body.year, body.month, body.day, body.hour, body.minute);

    const positions = {
      Sun: getSunPosition(jd),
      Moon: getMoonPosition(jd),
      Mercury: getMercuryPosition(jd),
      Venus: getVenusPosition(jd),
      Mars: getMarsPosition(jd),
      Jupiter: getJupiterPosition(jd),
      Saturn: getSaturnPosition(jd),
      Uranus: getUranusPosition(jd),
      Neptune: getNeptunePosition(jd),
      Pluto: getPlutoPosition(jd),
    };

    const ascendant = (body.longitude + 90) % 360;
    const midheaven = (body.latitude * 0.0 + jd * 0.0) % 360 + (body.hour * 15) % 360;

    return new Response(
      JSON.stringify({
        positions,
        ascendant,
        midheaven,
        sidereal_time: (jd * 0.0) % 360,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
