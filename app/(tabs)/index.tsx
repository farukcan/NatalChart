import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleNewChart = () => {
    router.push('/(tabs)/new-chart');
  };

  const handleViewCharts = () => {
    router.push('/(tabs)/charts');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hoş Geldiniz</Text>
        <Text style={styles.subtitle}>Astrolojik Natal Haritanızı Keşfedin</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Yeni Natal Chart</Text>
        <Text style={styles.cardDescription}>Doğum tarihi, saati ve konum bilgilerinizi girerek kişisel natal haritanızı oluşturun.</Text>
        <TouchableOpacity style={styles.cardButton} onPress={handleNewChart}>
          <Text style={styles.cardButtonText}>Başla</Text>
          <ArrowRight size={20} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Kayıtlı Chartlarınız</Text>
        <Text style={styles.cardDescription}>Daha önce oluşturduğunuz natal haritaları görüntüleyin, detaylarını inceleyip yorumlamaları okuyun.</Text>
        <TouchableOpacity style={styles.cardButton} onPress={handleViewCharts}>
          <Text style={styles.cardButtonText}>Görüntüle</Text>
          <ArrowRight size={20} color="#2563eb" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  cardButtonText: {
    color: '#2563eb',
    fontWeight: '600',
    fontSize: 15,
  },
  infoSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
});
