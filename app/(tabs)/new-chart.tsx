import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { calculateChart } from '@/lib/chartCalculations';

export default function NewChartScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [chartName, setChartName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [timezoneOffset, setTimezoneOffset] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateInputs = (): boolean => {
    if (!chartName.trim()) {
      setError('Lütfen chart adı giriniz');
      return false;
    }
    if (!birthDate.trim()) {
      setError('Lütfen doğum tarihini giriniz (GG.AA.YYYY)');
      return false;
    }
    if (!birthTime.trim()) {
      setError('Lütfen doğum saatini giriniz (SS:DD)');
      return false;
    }
    if (!location.trim()) {
      setError('Lütfen doğum yerini giriniz');
      return false;
    }
    if (!latitude || !longitude) {
      setError('Lütfen konum koordinatlarını giriniz');
      return false;
    }

    const dateRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    const timeRegex = /^(\d{2}):(\d{2})$/;

    if (!dateRegex.test(birthDate)) {
      setError('Tarih formatı: GG.AA.YYYY');
      return false;
    }

    if (!timeRegex.test(birthTime)) {
      setError('Saat formatı: SS:DD');
      return false;
    }

    return true;
  };

  const handleCreateChart = async () => {
    if (!validateInputs()) {
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const [day, month, year] = birthDate.split('.').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const tzOffset = parseInt(timezoneOffset);

      const chartData = await calculateChart(year, month, day, hour, minute, lat, lng);

      const { data: insertedChart, error: chartError } = await supabase
        .from('natal_charts')
        .insert([
          {
            user_id: session?.user.id,
            name: chartName,
            birth_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
            birth_time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
            birth_location: location,
            latitude: lat,
            longitude: lng,
            timezone_offset: tzOffset,
          },
        ])
        .select();

      if (chartError || !insertedChart || insertedChart.length === 0) {
        setError('Chart kaydedilemedi');
        setLoading(false);
        return;
      }

      const chartId = insertedChart[0].id;

      const bodiesData = Object.entries(chartData.bodies).map(([_, body]) => ({
        chart_id: chartId,
        name: body.name,
        sign: body.sign,
        degrees: Math.floor(body.degreesInSign),
        minutes: Math.round((body.degreesInSign - Math.floor(body.degreesInSign)) * 60),
        house: body.house,
        is_retrograde: body.retrograde,
      }));

      const { error: bodiesError } = await supabase.from('chart_bodies').insert(bodiesData);

      if (bodiesError) {
        setError('Gezegen verileri kaydedilemedi');
        setLoading(false);
        return;
      }

      const housesData = Object.entries(chartData.houses).map(([_, house]) => ({
        chart_id: chartId,
        house_number: house.houseNumber,
        sign: house.sign,
        cusp_degrees: house.cuspDegrees,
        cusp_minutes: house.cuspMinutes,
      }));

      const { error: housesError } = await supabase.from('chart_houses').insert(housesData);

      if (housesError) {
        setError('Ev verileri kaydedilemedi');
        setLoading(false);
        return;
      }

      const aspectsData = chartData.aspects.map((aspect) => ({
        chart_id: chartId,
        body1: aspect.body1,
        body2: aspect.body2,
        aspect_type: aspect.type,
        aspect_degrees: aspect.degrees,
        orb: aspect.orb,
        is_applying: aspect.isApplying,
      }));

      if (aspectsData.length > 0) {
        const { error: aspectsError } = await supabase.from('chart_aspects').insert(aspectsData);

        if (aspectsError) {
          setError('Aspekt verileri kaydedilemedi');
          setLoading(false);
          return;
        }
      }

      router.push({
        pathname: '/(tabs)/chart-detail',
        params: { chartId },
      });
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Yeni Natal Chart Oluştur</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.section}>
        <Text style={styles.label}>Chart Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="örn: Benim Doğum Haritam"
          placeholderTextColor="#999"
          value={chartName}
          onChangeText={setChartName}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Doğum Tarihi (GG.AA.YYYY)</Text>
        <TextInput
          style={styles.input}
          placeholder="15.03.1990"
          placeholderTextColor="#999"
          value={birthDate}
          onChangeText={setBirthDate}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Doğum Saati (SS:DD)</Text>
        <TextInput
          style={styles.input}
          placeholder="14:30"
          placeholderTextColor="#999"
          value={birthTime}
          onChangeText={setBirthTime}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Doğum Yeri (Şehir, Ülke)</Text>
        <TextInput
          style={styles.input}
          placeholder="İstanbul, Türkiye"
          placeholderTextColor="#999"
          value={location}
          onChangeText={setLocation}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Enlem (Latitude)</Text>
        <TextInput
          style={styles.input}
          placeholder="41.0082"
          placeholderTextColor="#999"
          value={latitude}
          onChangeText={setLatitude}
          editable={!loading}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Boylam (Longitude)</Text>
        <TextInput
          style={styles.input}
          placeholder="28.9784"
          placeholderTextColor="#999"
          value={longitude}
          onChangeText={setLongitude}
          editable={!loading}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Saat Dilimi Ofseti (saat)</Text>
        <TextInput
          style={styles.input}
          placeholder="3"
          placeholderTextColor="#999"
          value={timezoneOffset}
          onChangeText={setTimezoneOffset}
          editable={!loading}
          keyboardType="decimal-pad"
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreateChart}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Chart Oluştur</Text>
        )}
      </TouchableOpacity>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Koordinat Bulma Rehberi</Text>
        <Text style={styles.infoText}>
          Enlem ve boylam koordinatlarını Google Haritalar'dan kolayca bulabilirsiniz. Doğum yerinin adresini aratıp, konuma sağ tıklayıp koordinatları kopyalayabilirsiniz.
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
    paddingTop: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 24,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1a1a1a',
  },
  errorText: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
});
