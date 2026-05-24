import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/lib/theme';

export default function HomeScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  const handleNewChart = () => {
    router.push('/(tabs)/new-chart');
  };

  const handleViewCharts = () => {
    router.push('/(tabs)/charts');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.contentContainer, { paddingTop: 24 + insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>Astrolojik Natal Haritanızı Keşfedin</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Yeni Natal Chart</Text>
        <Text style={styles.cardDescription}>Doğum tarihi, saati ve konum bilgilerinizi girerek kişisel natal haritanızı oluşturun.</Text>
        <TouchableOpacity style={styles.cardButton} onPress={handleNewChart}>
          <Text style={styles.cardButtonText}>Başla</Text>
          <ArrowRight size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kayıtlı Chartlarınız</Text>
        <Text style={styles.cardDescription}>Daha önce oluşturduğunuz natal haritaları görüntüleyin, detaylarını inceleyip yorumlamaları okuyun.</Text>
        <TouchableOpacity style={styles.cardButton} onPress={handleViewCharts}>
          <Text style={styles.cardButtonText}>Görüntüle</Text>
          <ArrowRight size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Natal Chart Nedir?</Text>
        <Text style={styles.infoText}>
          Natal chart (doğum haritası), doğum anında gökyüzünün haritasıdır. Gezegenlerin ve yıldızların konumları temel alınarak, kişinin kişilik özellikleri, güçlü yönleri, zayıf noktaları ve yaşam yolunun kaynakları hakkında bilgi verir.
        </Text>
        <Text style={styles.infoText}>
          Astroloji, insanların hayatlarını daha iyi anlamalarına ve kendi potansiyellerini keşfetmelerine yardımcı olan antik bir bilim dalıdır.
        </Text>
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
      paddingTop: 24,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 32,
    },
    greeting: {
      fontSize: 28,
      fontWeight: '700',
      color: c.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: c.textSecondary,
    },
    card: {
      backgroundColor: c.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.border,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    cardDescription: {
      fontSize: 14,
      color: c.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    cardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.borderSubtle,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 10,
    },
    cardButtonText: {
      color: c.primary,
      fontWeight: '600',
      fontSize: 15,
    },
    infoSection: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 16,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: c.primary,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    infoText: {
      fontSize: 14,
      color: c.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
  });
}
