import React, { useState, useEffect, useRef } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { Colors } from '@/lib/theme';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export default function NewChartScreen() {
  const router = useRouter();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);
  const [chartName, setChartName] = useState('');
  const [birthDateTime, setBirthDateTime] = useState(new Date(1990, 2, 15, 12, 0));
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  // iOS spinner: use ref so onChange doesn't trigger re-renders (which reset the spinner)
  const iosPickerRef = useRef<Date>(new Date(1990, 2, 15, 12, 0));

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
    if (Platform.OS === 'android') {
      setPickerMode(null);
      if (selected) {
        if (pickerMode === 'time') {
          // Only apply hours/minutes to avoid date clobbering
          const updated = new Date(birthDateTime);
          updated.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
          setBirthDateTime(updated);
        } else {
          const updated = new Date(selected);
          updated.setHours(birthDateTime.getHours(), birthDateTime.getMinutes(), 0, 0);
          setBirthDateTime(updated);
        }
      }
    } else {
      // iOS spinner: write to ref only — no state update, no re-render, spinner stays stable
      if (selected) iosPickerRef.current = selected;
    }
  };

  const handleIOSDone = () => {
    const picked = iosPickerRef.current;
    if (pickerMode === 'time') {
      // Only apply hours/minutes — ref uses today's date to avoid historical timezone issues
      const updated = new Date(birthDateTime);
      updated.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
      setBirthDateTime(updated);
    } else {
      // Only apply date — preserve existing time
      const updated = new Date(picked);
      updated.setHours(birthDateTime.getHours(), birthDateTime.getMinutes(), 0, 0);
      setBirthDateTime(updated);
    }
    setPickerMode(null);
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

  // Web-only: inline style for HTML date/time inputs
  const webInputStyle = {
    border: 'none',
    background: 'transparent',
    fontSize: 15,
    color: colors.text,
    flex: 1,
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, { paddingTop: 16 + insets.top }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Yeni Natal Chart Oluştur</Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.section}>
        <Text style={styles.label}>Chart Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="örn: Benim Doğum Haritam"
          placeholderTextColor={colors.textMuted}
          value={chartName}
          onChangeText={setChartName}
          editable={!loading}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Doğum Tarihi</Text>
        {Platform.OS === 'web' ? (
          <View style={[styles.pickerButton, loading && styles.pickerButtonDisabled]}>
            <Calendar size={18} color={colors.primary} />
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
            onPress={() => { iosPickerRef.current = birthDateTime; setPickerMode('date'); }}
            disabled={loading}
          >
            <Calendar size={18} color={colors.primary} />
            <Text style={styles.pickerButtonText}>{formatDisplayDate(birthDateTime)}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Doğum Saati</Text>
        {Platform.OS === 'web' ? (
          <View style={[styles.pickerButton, loading && styles.pickerButtonDisabled]}>
            <Clock size={18} color={colors.primary} />
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
            onPress={() => {
              // Use today's date to avoid historical timezone conversion issues on iOS
              const v = new Date();
              v.setHours(birthDateTime.getHours(), birthDateTime.getMinutes(), 0, 0);
              iosPickerRef.current = v;
              setPickerMode('time');
            }}
            disabled={loading}
          >
            <Clock size={18} color={colors.primary} />
            <Text style={styles.pickerButtonText}>{formatDisplayTime(birthDateTime)}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Doğum Yeri</Text>
        <View style={styles.locationInputRow}>
          <MapPin size={18} color={location ? colors.primary : colors.textMuted} style={styles.locationIcon} />
          <TextInput
            style={styles.locationInput}
            placeholder="Şehir veya ilçe ara..."
            placeholderTextColor={colors.textMuted}
            value={locationQuery}
            onChangeText={handleLocationQueryChange}
            editable={!loading}
          />
          {locationSearching && <ActivityIndicator size="small" color={colors.primary} />}
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
              <ActivityIndicator size="small" color={colors.primary} />
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
                <TouchableOpacity onPress={handleIOSDone}>
                  <Text style={styles.modalDone}>Tamam</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={iosPickerRef.current}
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
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
      marginBottom: 24,
    },
    section: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      padding: 12,
      fontSize: 15,
      color: c.text,
    },
    pickerButton: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
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
      color: c.text,
    },
    locationInputRow: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
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
      color: c.text,
      padding: 0,
    },
    locationSelected: {
      marginTop: 8,
      backgroundColor: c.surfaceAlt,
      borderRadius: 10,
      padding: 10,
      borderLeftWidth: 3,
      borderLeftColor: c.primary,
    },
    locationSelectedText: {
      fontSize: 13,
      color: c.text,
      fontWeight: '500',
    },
    locationCoords: {
      fontSize: 11,
      color: c.textSecondary,
      marginTop: 2,
    },
    suggestions: {
      marginTop: 4,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      overflow: 'hidden',
    },
    suggestionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.borderSubtle,
    },
    suggestionText: {
      fontSize: 13,
      color: c.text,
      lineHeight: 18,
    },
    errorText: {
      backgroundColor: c.errorBg,
      color: c.errorText,
      padding: 12,
      borderRadius: 10,
      marginBottom: 16,
      fontSize: 14,
    },
    button: {
      backgroundColor: c.primary,
      padding: 14,
      borderRadius: 10,
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
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    modalDone: {
      fontSize: 16,
      fontWeight: '600',
      color: c.primary,
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
      color: c.textSecondary,
    },
  });
}
