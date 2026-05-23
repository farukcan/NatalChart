import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { saveChart } from '@/lib/storage';
import { calculateChart } from '@/lib/chartCalculations';
import { Calendar, Clock, MapPin } from 'lucide-react-native';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function NewChartScreen() {
  const router = useRouter();
  const [chartName, setChartName] = useState('');
  const [birthDateTime, setBirthDateTime] = useState(new Date(1990, 2, 15, 12, 0));
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);

  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<NominatimResult[]>([]);
  const [locationSearching, setLocationSearching] = useState(false);
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [timezoneOffset, setTimezoneOffset] = useState(0);
  const [timezoneLabel, setTimezoneLabel] = useState('');
  const [timezoneLoading, setTimezoneLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!locationQuery || locationQuery.length < 3 || location) {
      setLocationSuggestions([]);
      return;
    }
    const timer = setTimeout(() => searchLocation(locationQuery), 500);
    return () => clearTimeout(timer);
  }, [locationQuery, location]);

  useEffect(() => {
    if (!latitude || !longitude) return;
    fetchTimezone(latitude, longitude, birthDateTime);
  }, [latitude, longitude, birthDateTime]);

  const searchLocation = async (query: string) => {
    setLocationSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`;
      const response = await fetch(url, {
        headers: { 'User-Agent': 'NatalChartApp/1.0' },
      });
      const data: NominatimResult[] = await response.json();
      setLocationSuggestions(data);
    } catch {
      setLocationSuggestions([]);
    } finally {
      setLocationSearching(false);
    }
  };

  const fetchTimezone = async (lat: string, lng: string, dt: Date) => {
    setTimezoneLoading(true);
    try {
      const y = dt.getFullYear();
      const mo = String(dt.getMonth() + 1).padStart(2, '0');
      const d = String(dt.getDate()).padStart(2, '0');
      const h = String(dt.getHours()).padStart(2, '0');
      const mi = String(dt.getMinutes()).padStart(2, '0');
      const isoLocal = `${y}-${mo}-${d}T${h}:${mi}:00`;
      const url = `https://timezone-api.puhulab.com/timezone?lat=${lat}&lng=${lng}&dt=${encodeURIComponent(isoLocal)}`;
      const response = await fetch(url);
      const data = await response.json();
      setTimezoneOffset(data.utc_offset_hours);
      setTimezoneLabel(`${data.timezone} (${data.utc_offset})`);
    } catch {
      // Keep existing offset on failure
    } finally {
      setTimezoneLoading(false);
    }
  };

  const handleSelectLocation = (result: NominatimResult) => {
    const shortName = result.display_name.split(',').slice(0, 3).join(',').trim();
    setLocation(shortName);
    setLocationQuery(shortName);
    setLatitude(result.lat);
    setLongitude(result.lon);
    setLocationSuggestions([]);
  };

  const handleLocationQueryChange = (text: string) => {
    setLocationQuery(text);
    // Reset selection when user edits the field
    if (location && text !== location) {
      setLocation('');
      setLatitude('');
      setLongitude('');
    }
  };

  const formatDisplayDate = (d: Date): string => {
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const formatDisplayTime = (d: Date): string => {
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const getWebDateValue = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getWebTimeValue = (d: Date): string => {
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const handleWebDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [y, m, d] = e.target.value.split('-').map(Number);
    const updated = new Date(birthDateTime);
    updated.setFullYear(y, m - 1, d);
    setBirthDateTime(updated);
  };

  const handleWebTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [h, min] = e.target.value.split(':').map(Number);
    const updated = new Date(birthDateTime);
    updated.setHours(h, min);
    setBirthDateTime(updated);
  };

  const handlePickerChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setPickerMode(null);
    if (selected) setBirthDateTime(selected);
  };

  const validateInputs = (): boolean => {
    if (!chartName.trim()) {
      setError('Lütfen chart adı giriniz');
      return false;
    }
    if (!location || !latitude || !longitude) {
      setError('Lütfen listeden bir doğum yeri seçiniz');
      return false;
    }
    return true;
  };

  const handleCreateChart = async () => {
    if (!validateInputs()) return;

    setError(null);
    setLoading(true);

    try {
      const year = birthDateTime.getFullYear();
      const month = birthDateTime.getMonth() + 1;
      const day = birthDateTime.getDate();
      const hour = birthDateTime.getHours();
      const minute = birthDateTime.getMinutes();
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const tzOffset = timezoneOffset;

      await calculateChart(year, month, day, hour, minute, lat, lng);

      const chart = await saveChart({
        name: chartName,
        birth_date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        birth_time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        birth_location: location,
        latitude: lat,
        longitude: lng,
        timezone_offset: tzOffset,
      });

      router.push({ pathname: '/(tabs)/chart-detail', params: { chartId: chart.id } });
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
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
        <Text style={styles.label}>Doğum Tarihi</Text>
        {Platform.OS === 'web' ? (
          <View style={[styles.pickerButton, loading && styles.pickerButtonDisabled]}>
            <Calendar size={18} color="#2563eb" />
            {/* @ts-ignore */}
            <input
              type="date"
              value={getWebDateValue(birthDateTime)}
              min="1900-01-01"
              max={getWebDateValue(new Date())}
              onChange={handleWebDateChange}
              disabled={loading}
              style={webInputStyle}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.pickerButton, loading && styles.pickerButtonDisabled]}
            onPress={() => setPickerMode('date')}
            disabled={loading}
          >
            <Calendar size={18} color="#2563eb" />
            <Text style={styles.pickerButtonText}>{formatDisplayDate(birthDateTime)}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Doğum Saati</Text>
        {Platform.OS === 'web' ? (
          <View style={[styles.pickerButton, loading && styles.pickerButtonDisabled]}>
            <Clock size={18} color="#2563eb" />
            {/* @ts-ignore */}
            <input
              type="time"
              value={getWebTimeValue(birthDateTime)}
              onChange={handleWebTimeChange}
              disabled={loading}
              style={webInputStyle}
            />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.pickerButton, loading && styles.pickerButtonDisabled]}
            onPress={() => setPickerMode('time')}
            disabled={loading}
          >
            <Clock size={18} color="#2563eb" />
            <Text style={styles.pickerButtonText}>{formatDisplayTime(birthDateTime)}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Doğum Yeri</Text>
        <View style={styles.locationInputRow}>
          <MapPin size={18} color={location ? '#2563eb' : '#999'} style={styles.locationIcon} />
          <TextInput
            style={styles.locationInput}
            placeholder="Şehir veya ilçe ara..."
            placeholderTextColor="#999"
            value={locationQuery}
            onChangeText={handleLocationQueryChange}
            editable={!loading}
          />
          {locationSearching && <ActivityIndicator size="small" color="#2563eb" />}
        </View>

        {location ? (
          <View style={styles.locationSelected}>
            <Text style={styles.locationSelectedText}>{location}</Text>
            <Text style={styles.locationCoords}>
              {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}
            </Text>
          </View>
        ) : null}

        {locationSuggestions.length > 0 && (
          <View style={styles.suggestions}>
            {locationSuggestions.map((result) => (
              <TouchableOpacity
                key={result.place_id}
                style={styles.suggestionItem}
                onPress={() => handleSelectLocation(result)}
              >
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {result.display_name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {(timezoneLoading || timezoneLabel) ? (
        <View style={styles.timezoneRow}>
          {timezoneLoading ? (
            <>
              <ActivityIndicator size="small" color="#2563eb" />
              <Text style={styles.timezoneText}>Saat dilimi belirleniyor...</Text>
            </>
          ) : (
            <Text style={styles.timezoneText}>{timezoneLabel}</Text>
          )}
        </View>
      ) : null}

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

      {/* Android: native dialog picker */}
      {Platform.OS === 'android' && pickerMode !== null && (
        <DateTimePicker
          value={birthDateTime}
          mode={pickerMode}
          is24Hour={true}
          onChange={handlePickerChange}
          minimumDate={new Date(1900, 0, 1)}
          maximumDate={pickerMode === 'date' ? new Date() : undefined}
        />
      )}

      {/* iOS: modal with spinner picker */}
      {Platform.OS === 'ios' && pickerMode !== null && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {pickerMode === 'date' ? 'Doğum Tarihi' : 'Doğum Saati'}
                </Text>
                <TouchableOpacity onPress={() => setPickerMode(null)}>
                  <Text style={styles.modalDone}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={birthDateTime}
                mode={pickerMode}
                display="spinner"
                is24Hour={true}
                onChange={handlePickerChange}
                minimumDate={pickerMode === 'date' ? new Date(1900, 0, 1) : undefined}
                maximumDate={pickerMode === 'date' ? new Date() : undefined}
                locale="tr-TR"
              />
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
}

// Web-only: inline style object for HTML date/time inputs
const webInputStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: 15,
  color: '#1a1a1a',
  flex: 1,
  outline: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

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
  pickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pickerButtonDisabled: {
    opacity: 0.5,
  },
  pickerButtonText: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  locationInputRow: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationIcon: {
    flexShrink: 0,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    padding: 0,
  },
  locationSelected: {
    marginTop: 8,
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  locationSelectedText: {
    fontSize: 13,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  locationCoords: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  suggestions: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    fontSize: 13,
    color: '#1a1a1a',
    lineHeight: 18,
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
    marginTop: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
  },
  timezoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  timezoneText: {
    fontSize: 13,
    color: '#6b7280',
  },
});
