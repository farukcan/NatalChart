const light = {
  background: '#f5f5f8',
  surface: '#ffffff',
  surfaceAlt: '#eef5ff',
  border: '#e2e5eb',
  borderSubtle: '#f0f0f4',
  text: '#111827',
  textSecondary: '#6b7280',
  textMuted: '#9ca3af',
  primary: '#2563eb',
  error: '#dc2626',
  errorBg: '#fef2f2',
  errorText: '#b91c1c',
  tabBar: '#ffffff',
  tabBarBorder: '#e2e5eb',
  tabBarActive: '#2563eb',
  tabBarInactive: '#9ca3af',
  // SVG chart
  chartBg: '#ffffff',
  chartBorder: '#e5e7eb',
  chartStroke: '#9ca3af',
  chartSubStroke: '#d1d5db',
  chartText: '#4b5563',
  chartTextMuted: '#6b7280',
  chartCenter: '#1a1a1a',
};

const dark = {
  background: '#0a0a14',
  surface: '#131320',
  surfaceAlt: '#0f1a35',
  border: '#26263a',
  borderSubtle: '#1a1a28',
  text: '#e8e8f4',
  textSecondary: '#9090b0',
  textMuted: '#565670',
  primary: '#6b9fff',
  error: '#f87171',
  errorBg: '#2a1010',
  errorText: '#fca5a5',
  tabBar: '#0f0f1c',
  tabBarBorder: '#26263a',
  tabBarActive: '#6b9fff',
  tabBarInactive: '#565670',
  // SVG chart
  chartBg: '#131320',
  chartBorder: '#26263a',
  chartStroke: '#35355a',
  chartSubStroke: '#26263a',
  chartText: '#7070a0',
  chartTextMuted: '#565670',
  chartCenter: '#e8e8f4',
};

export type Colors = typeof light;
export const lightColors: Colors = light;
export const darkColors: Colors = dark;
