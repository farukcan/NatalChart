import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { NatalChartVisual } from '@/components/NatalChartVisual';
import { CalculationResult } from '@/lib/chartCalculations';
import { ASPECT_TYPES_TR } from '@/lib/astrology';
import { calculateChart } from '@/lib/chartCalculations';
import { ChevronLeft } from 'lucide-react-native';

interface ChartRecord {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  birth_time: string;
  birth_location: string;
  latitude: number;
  longitude: number;
  timezone_offset: number;
}

export default function ChartDetailScreen() {
  const { chartId } = useLocalSearchParams();
  const router = useRouter();
  const [chart, setChart] = useState<ChartRecord | null>(null);
  const [chartData, setChartData] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);

  const loadChart = async () => {
    try {
      if (!chartId) {
        setError('Chart ID bulunamadı');
        setLoading(false);
        return;
      }

      const { data: chartData, error: chartError } = await supabase
        .from('natal_charts')
        .select('*')
        .eq('id', chartId)
        .maybeSingle();

      if (chartError || !chartData) {
        setError('Chart yüklenemedi');
        setLoading(false);
        return;
      }

      setChart(chartData);

      const [year, month, day] = chartData.birth_date.split('-').map(Number);
      const [hour, minute] = chartData.birth_time.split(':').map(Number);

      const data = await calculateChart(year, month, day, hour, minute, chartData.latitude, chartData.longitude);
      setChartData(data);
    } catch (err) {
      setError('Bir hata oluştu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (error || !chart || !chartData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Chart yüklenemedi'}</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const sunSign = chartData.bodies.Sun?.sign || '';
  const moonSign = chartData.bodies.Moon?.sign || '';
  const ascendant = chartData.bodies.Sun ? chartData.bodies.Sun.sign : '';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color="#2563eb" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{chart.name}</Text>
          <Text style={styles.subtitle}>{chart.birth_location}</Text>
        </View>
      </View>

      <View style={styles.chartInfo}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Doğum Tarihi</Text>
          <Text style={styles.infoValue}>{chart.birth_date}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Doğum Saati</Text>
          <Text style={styles.infoValue}>{chart.birth_time}</Text>
        </View>
      </View>

      <NatalChartVisual chartData={chartData} />

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Temel Bilgiler</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Güneş Burcu:</Text>
          <Text style={styles.summaryValue}>{sunSign}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Ay Burcu:</Text>
          <Text style={styles.summaryValue}>{moonSign}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Yükselen (Ascendant):</Text>
          <Text style={styles.summaryValue}>{ascendant}</Text>
        </View>
      </View>

      <View style={styles.interpretationCard}>
        <Text style={styles.interpretationTitle}>Kişilik Özeti</Text>
        <Text style={styles.interpretationText}>
          {sunSign} Güneşi ile doğmuş olmanız, Sizin temel kimlik ve yaşam amacınızı temsil eder. {moonSign} Ayı ile, duygularınız ve içsel dünyanız yönetilir. {ascendant} Yükselen burçu ise, başkalarının sizi nasıl gördüğünü ve ilk izlenimleri belirler.
        </Text>
      </View>

      <View style={styles.bodiesCard}>
        <Text style={styles.bodiesTitle}>Gezegen Pozisyonları</Text>
        {Object.entries(chartData.bodies).map(([_, body]) => (
          <View key={body.name} style={styles.bodyRow}>
            <View style={styles.bodyInfo}>
              <Text style={styles.bodyName}>{body.name}</Text>
              <Text style={styles.bodySign}>
                {body.sign} {Math.floor(body.degreesInSign)}°
              </Text>
            </View>
            <Text style={styles.bodyHouse}>Ev {body.house}</Text>
          </View>
        ))}
      </View>

      <View style={styles.aspectsCard}>
        <Text style={styles.aspectsTitle}>Majör Aspektler ({chartData.aspects.length})</Text>
        {chartData.aspects.length > 0 ? (
          chartData.aspects.slice(0, 10).map((aspect, index) => (
            <View key={index} style={styles.aspectRow}>
              <Text style={styles.aspectBodies}>
                {aspect.body1} {ASPECT_TYPES_TR[aspect.type as keyof typeof ASPECT_TYPES_TR]} {aspect.body2}
              </Text>
              <Text style={styles.aspectOrb}>{aspect.orb.toFixed(1)}° orb</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noAspects}>Majör aspekt bulunamadı</Text>
        )}
      </View>

      <View style={styles.housesCard}>
        <Text style={styles.housesTitle}>Evler</Text>
        {Object.entries(chartData.houses).map(([_, house]) => (
          <View key={house.houseNumber} style={styles.houseRow}>
            <Text style={styles.houseNumber}>Ev {house.houseNumber}</Text>
            <Text style={styles.houseCusp}>{house.sign}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 8,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  chartInfo: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  interpretationCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  interpretationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  interpretationText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  bodiesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  bodiesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  bodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bodyInfo: {
    flex: 1,
  },
  bodyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  bodySign: {
    fontSize: 12,
    color: '#666',
  },
  bodyHouse: {
    fontSize: 12,
    color: '#666',
  },
  aspectsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  aspectsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  aspectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  aspectBodies: {
    fontSize: 14,
    color: '#1a1a1a',
    flex: 1,
  },
  aspectOrb: {
    fontSize: 12,
    color: '#666',
  },
  noAspects: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 12,
  },
  housesCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  housesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  houseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  houseNumber: {
    fontSize: 14,
    color: '#666',
  },
  houseCusp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  errorText: {
    fontSize: 16,
    color: '#c33',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
