import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getChartById, StoredChart } from '@/lib/storage';
import { NatalChartVisual } from '@/components/NatalChartVisual';
import { CalculationResult, calculateChart } from '@/lib/chartCalculations';
import { ASPECT_TYPES_TR } from '@/lib/astrology';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/lib/theme';

export default function ChartDetailScreen() {
  const { chartId } = useLocalSearchParams();
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [chart, setChart] = useState<StoredChart | null>(null);
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

      const stored = await getChartById(chartId as string);

      if (!stored) {
        setError('Chart yüklenemedi');
        setLoading(false);
        return;
      }

      setChart(stored);

      const [year, month, day] = stored.birth_date.split('-').map(Number);
      const [hour, minute] = stored.birth_time.split(':').map(Number);

      const data = await calculateChart(
        year,
        month,
        day,
        hour,
        minute,
        stored.latitude,
        stored.longitude,
      );
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
        <ActivityIndicator size="large" color={colors.primary} />
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: 12 + insets.top },
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={24} color={colors.primary} />
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
          {sunSign} Güneşi ile doğmuş olmanız, Sizin temel kimlik ve yaşam
          amacınızı temsil eder. {moonSign} Ayı ile, duygularınız ve içsel
          dünyanız yönetilir. {ascendant} Yükselen burçu ise, başkalarının sizi
          nasıl gördüğünü ve ilk izlenimleri belirler.
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
        <Text style={styles.aspectsTitle}>
          Majör Aspektler ({chartData.aspects.length})
        </Text>
        {chartData.aspects.length > 0 ? (
          chartData.aspects.slice(0, 10).map((aspect, index) => (
            <View key={index} style={styles.aspectRow}>
              <Text style={styles.aspectBodies}>
                {aspect.body1}{' '}
                {ASPECT_TYPES_TR[aspect.type as keyof typeof ASPECT_TYPES_TR]}{' '}
                {aspect.body2}
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

function createStyles(c: Colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
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
      backgroundColor: c.background,
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
      color: c.text,
    },
    subtitle: {
      fontSize: 14,
      color: c.textSecondary,
      marginTop: 2,
    },
    chartInfo: {
      flexDirection: 'row',
      marginBottom: 16,
      gap: 12,
    },
    infoItem: {
      flex: 1,
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: c.border,
    },
    infoLabel: {
      fontSize: 12,
      color: c.textSecondary,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    summaryCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    summaryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    summaryLabel: {
      fontSize: 14,
      color: c.textSecondary,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '600',
      color: c.primary,
    },
    interpretationCard: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderLeftWidth: 4,
      borderLeftColor: c.primary,
    },
    interpretationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    interpretationText: {
      fontSize: 14,
      color: c.textSecondary,
      lineHeight: 20,
    },
    bodiesCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    bodiesTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    bodyRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    bodyInfo: {
      flex: 1,
    },
    bodyName: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: 2,
    },
    bodySign: {
      fontSize: 12,
      color: c.textSecondary,
    },
    bodyHouse: {
      fontSize: 12,
      color: c.textSecondary,
    },
    aspectsCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    aspectsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    aspectRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    aspectBodies: {
      fontSize: 14,
      color: c.text,
      flex: 1,
    },
    aspectOrb: {
      fontSize: 12,
      color: c.textSecondary,
    },
    noAspects: {
      fontSize: 14,
      color: c.textMuted,
      textAlign: 'center',
      paddingVertical: 12,
    },
    housesCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    housesTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    houseRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    houseNumber: {
      fontSize: 14,
      color: c.textSecondary,
    },
    houseCusp: {
      fontSize: 14,
      fontWeight: '600',
      color: c.primary,
    },
    errorText: {
      fontSize: 16,
      color: c.error,
      marginBottom: 16,
    },
    button: {
      backgroundColor: c.primary,
      paddingVertical: 10,
      paddingHorizontal: 24,
      borderRadius: 10,
    },
    buttonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });
}
