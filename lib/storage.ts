import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredChart {
  id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  latitude: number;
  longitude: number;
  timezone_offset: number;
  created_at: string;
}

const CHARTS_KEY = 'natal_charts';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function getAllCharts(): Promise<StoredChart[]> {
  const raw = await AsyncStorage.getItem(CHARTS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as StoredChart[];
}

export async function saveChart(input: Omit<StoredChart, 'id' | 'created_at'>): Promise<StoredChart> {
  const charts = await getAllCharts();
  const chart: StoredChart = {
    ...input,
    id: generateId(),
    created_at: new Date().toISOString(),
  };
  charts.unshift(chart);
  await AsyncStorage.setItem(CHARTS_KEY, JSON.stringify(charts));
  return chart;
}

export async function getChartById(id: string): Promise<StoredChart | null> {
  const charts = await getAllCharts();
  return charts.find((c) => c.id === id) ?? null;
}

export async function deleteChart(id: string): Promise<void> {
  const charts = await getAllCharts();
  const filtered = charts.filter((c) => c.id !== id);
  await AsyncStorage.setItem(CHARTS_KEY, JSON.stringify(filtered));
}
