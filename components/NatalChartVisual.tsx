import React, { ReactElement } from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, Line, G } from 'react-native-svg';
import { ZODIAC_SIGNS, ZODIAC_SYMBOLS, PLANETARY_SYMBOLS } from '@/lib/astrology';
import { CalculationResult, BodyPosition } from '@/lib/chartCalculations';

interface NatalChartVisualProps {
  chartData: CalculationResult;
}

export function NatalChartVisual({ chartData }: NatalChartVisualProps) {
  const size = Math.min(Dimensions.get('window').width - 40, 400);
  const center = size / 2;
  const radius = size / 2 - 20;

  const degreesToRadians = (degrees: number): number => {
    return ((degrees - 90) * Math.PI) / 180;
  };

  const polarToCartesian = (angle: number, distance: number): { x: number; y: number } => {
    return {
      x: center + distance * Math.cos(angle),
      y: center + distance * Math.sin(angle),
    };
  };

  const drawZodiacCircle = (): ReactElement[] => {
    const signRadius = radius - 30;
    const elements: ReactElement[] = [];

    for (let i = 0; i < 12; i++) {
      const startDegrees = i * 30;
      const startAngle = degreesToRadians(startDegrees);

      const zodiacSymbolPos = polarToCartesian(degreesToRadians(startDegrees + 15), signRadius + 20);

      elements.push(
        <Line
          key={`sign-line-${i}`}
          x1={center}
          y1={center}
          x2={polarToCartesian(startAngle, radius).x}
          y2={polarToCartesian(startAngle, radius).y}
          stroke="#d1d5db"
          strokeWidth="1"
        />
      );

      elements.push(
        <SvgText
          key={`zodiac-${i}`}
          x={zodiacSymbolPos.x}
          y={zodiacSymbolPos.y - 6}
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
          fill="#4b5563"
        >
          {ZODIAC_SYMBOLS[i]}
        </SvgText>
      );
    }

    return elements;
  };

  const drawHouseLines = (): ReactElement[] => {
    const elements: ReactElement[] = [];
    const houseRadius = radius - 50;

    for (let i = 1; i <= 12; i++) {
      const houseData = chartData.houses[i];
      if (!houseData) continue;

      const totalDegrees = (i - 1) * 30;
      const angle = degreesToRadians(totalDegrees);

      const innerPos = polarToCartesian(angle, houseRadius - 20);
      const outerPos = polarToCartesian(angle, radius - 10);

      elements.push(
        <Line
          key={`house-line-${i}`}
          x1={innerPos.x}
          y1={innerPos.y}
          x2={outerPos.x}
          y2={outerPos.y}
          stroke="#9ca3af"
          strokeWidth="1"
          opacity={0.5}
        />
      );

      const labelPos = polarToCartesian(angle, houseRadius - 35);
      elements.push(
        <SvgText
          key={`house-label-${i}`}
          x={labelPos.x}
          y={labelPos.y - 4}
          fontSize="12"
          textAnchor="middle"
          fill="#6b7280"
        >
          {i}
        </SvgText>
      );
    }

    return elements;
  };

  const drawPlanets = (): ReactElement[] => {
    const elements: ReactElement[] = [];
    const planetRadius = radius - 80;

    const mainBodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    mainBodies.forEach((bodyName) => {
      const body = chartData.bodies[bodyName];
      if (!body) return;

      const angle = degreesToRadians(body.longitude);
      const pos = polarToCartesian(angle, planetRadius);

      const symbol = PLANETARY_SYMBOLS[bodyName as keyof typeof PLANETARY_SYMBOLS] || '●';
      const color = getPlanetColor(bodyName);

      elements.push(
        <SvgText
          key={`planet-${bodyName}`}
          x={pos.x}
          y={pos.y - 6}
          fontSize="20"
          textAnchor="middle"
          fill={color}
          fontWeight="bold"
        >
          {symbol}
        </SvgText>
      );
    });

    return elements;
  };

  const drawAspectLines = (): ReactElement[] => {
    const elements: ReactElement[] = [];
    const planetRadius = radius - 80;
    const mainBodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

    chartData.aspects.forEach((aspect, index) => {
      if (!mainBodies.includes(aspect.body1) || !mainBodies.includes(aspect.body2)) return;

      const body1 = chartData.bodies[aspect.body1];
      const body2 = chartData.bodies[aspect.body2];

      if (!body1 || !body2) return;

      const angle1 = degreesToRadians(body1.longitude);
      const angle2 = degreesToRadians(body2.longitude);

      const pos1 = polarToCartesian(angle1, planetRadius);
      const pos2 = polarToCartesian(angle2, planetRadius);

      const color = getAspectColor(aspect.type);

      elements.push(
        <Line
          key={`aspect-${index}`}
          x1={pos1.x}
          y1={pos1.y}
          x2={pos2.x}
          y2={pos2.y}
          stroke={color}
          strokeWidth="1"
          opacity={0.6}
        />
      );
    });

    return elements;
  };

  const getPlanetColor = (planet: string): string => {
    const colors: Record<string, string> = {
      Sun: '#FDB813',
      Moon: '#F5F5DC',
      Mercury: '#8B7355',
      Venus: '#2ECC71',
      Mars: '#E74C3C',
      Jupiter: '#E67E22',
      Saturn: '#95A5A6',
      Uranus: '#3498DB',
      Neptune: '#9B59B6',
      Pluto: '#34495E',
    };
    return colors[planet] || '#000000';
  };

  const getAspectColor = (aspectType: string): string => {
    const colors: Record<string, string> = {
      Conjunction: '#FF0000',
      Sextile: '#FFD700',
      Square: '#FF8C00',
      Trine: '#00AA00',
      Opposition: '#0000FF',
    };
    return colors[aspectType] || '#999999';
  };

  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle cx={center} cy={center} r={radius + 10} fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />

        {/* Outer circle */}
        <Circle cx={center} cy={center} r={radius} fill="none" stroke="#9ca3af" strokeWidth="2" />

        {/* Inner circles */}
        <Circle cx={center} cy={center} r={radius - 50} fill="none" stroke="#d1d5db" strokeWidth="1" />

        {/* Zodiac circle */}
        {drawZodiacCircle()}

        {/* House lines */}
        {drawHouseLines()}

        {/* Aspect lines */}
        {drawAspectLines()}

        {/* Planets */}
        {drawPlanets()}

        {/* Center point */}
        <Circle cx={center} cy={center} r="3" fill="#1a1a1a" />
      </Svg>
    </View>
  );
}
