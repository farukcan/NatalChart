import { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { getAllCharts, deleteChart, StoredChart } from '@/lib/storage';
import { Trash2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/lib/theme';

export default function ChartsScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [charts, setCharts] = useState<StoredChart[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadCharts();
    }, []),
  );

  const loadCharts = async () => {
    try {
      setLoading(true);
      const data = await getAllCharts();
      setCharts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCharts();
    setRefreshing(false);
  };

  const handleDeleteChart = async (chartId: string) => {
    try {
      await deleteChart(chartId);
      setCharts(charts.filter((c) => c.id !== chartId));
    } catch (err) {
      alert('Bir hata oluştu');
    }
  };

  const handleViewChart = (chartId: string) => {
    router.push({
      pathname: '/(tabs)/chart-detail',
      params: { chartId },
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: 16 + insets.top },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={styles.title}>Kayıtlı Chartlarım</Text>

      {charts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chart Bulunamadı</Text>
          <Text style={styles.emptyText}>
            Henüz bir natal chart oluşturmadınız. Yeni bir chart oluşturmaya
            başlayın!
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() => router.push('/(tabs)/new-chart')}
          >
            <Text style={styles.emptyButtonText}>Yeni Chart Oluştur</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          {charts.map((chart) => (
            <TouchableOpacity
              key={chart.id}
              style={styles.chartCard}
              onPress={() => handleViewChart(chart.id)}
            >
              <View style={styles.chartContent}>
                <Text style={styles.chartName}>{chart.name}</Text>
                <Text style={styles.chartLocation}>{chart.birth_location}</Text>
                <Text style={styles.chartDate}>
                  {chart.birth_date} • {chart.birth_time}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => {
                  Alert.alert(
                    'Silme Onayı',
                    'Bu chartı silmek istediğinize emin misiniz?',
                    [
                      { text: 'İptal', style: 'cancel' },
                      {
                        text: 'Sil',
                        style: 'destructive',
                        onPress: () => handleDeleteChart(chart.id),
                      },
                    ],
                  );
                }}
              >
                <Trash2 size={20} color={colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
      paddingTop: 16,
      paddingBottom: 32,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: c.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
      marginBottom: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: c.textSecondary,
      textAlign: 'center',
      marginBottom: 24,
      maxWidth: 280,
    },
    emptyButton: {
      backgroundColor: c.primary,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
    },
    emptyButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    chartCard: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: c.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    chartContent: {
      flex: 1,
    },
    chartName: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
    },
    chartLocation: {
      fontSize: 14,
      color: c.textSecondary,
      marginBottom: 4,
    },
    chartDate: {
      fontSize: 12,
      color: c.textMuted,
    },
    deleteButton: {
      padding: 8,
      marginLeft: 8,
    },
  });
}
