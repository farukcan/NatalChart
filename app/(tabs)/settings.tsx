import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useThemeControl } from '@/hooks/useTheme';
import { Colors } from '@/lib/theme';

export default function SettingsScreen() {
  const colors = useTheme();
  const { isDark, setScheme } = useThemeControl();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: 16 + insets.top },
      ]}
    >
      <Text style={styles.title}>Ayarlar</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Görünüm</Text>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={(v) => setScheme(v ? 'dark' : 'light')}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uygulama Hakkında</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Versiyon</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Geliştirildi</Text>
          <Text style={styles.infoValue}>Natal Chart Team</Text>
        </View>

        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Natal Chart Nedir?</Text>
          <Text style={styles.descriptionText}>
            Natal chart, kişinin doğum anındaki gökyüzünün haritasıdır. Bu
            harita, gezegenlerin ve gök cisimlerinin belirli konumlardaki
            bulunuşunu gösterir.
          </Text>
          <Text style={styles.descriptionText}>
            Astroloji, bu haritayı analiz ederek, insanların kişilik
            özellikleri, güçlü yönleri, zayıf noktaları ve yaşam yolunun
            kaynakları hakkında bilgi verir.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terimler</Text>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>Güneş Burcu</Text>
          <Text style={styles.termDescription}>
            Doğum anında Güneşin bulunduğu burçtur. Kişinin temel kimliğini,
            yaşam amacını ve yaratıcı enerjisini temsil eder.
          </Text>
        </View>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>Ay Burcu</Text>
          <Text style={styles.termDescription}>
            Doğum anında Ayın bulunduğu burçtur. Duygular, içsel dünya, algılama
            şekli ve rahat olduğu ortamları temsil eder.
          </Text>
        </View>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>Yükselen Burç (Ascendant)</Text>
          <Text style={styles.termDescription}>
            Doğum anında doğu ufkunda bulunan burçtur. Dış görünüş, ilk izlenim
            ve insanların sizi nasıl gördüğünü temsil eder.
          </Text>
        </View>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>Aspekt</Text>
          <Text style={styles.termDescription}>
            Gezegenlerin birbiriyle yaptığı açılardır. Farklı aspektler,
            gezegenlerin enerjilerinin nasıl etkileşime girdiğini gösterir.
          </Text>
        </View>

        <View style={styles.termBox}>
          <Text style={styles.termTitle}>Ev</Text>
          <Text style={styles.termDescription}>
            Natal harita 12 eve bölünür. Her ev, hayatın farklı alanlarını
            temsil eder (kariyer, ilişkiler, sağlık, vb).
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 Natal Chart. Tüm Hakları Saklıdır.
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
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
      marginBottom: 12,
    },
    infoBox: {
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: c.border,
    },
    infoLabel: {
      fontSize: 14,
      color: c.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    description: {
      backgroundColor: c.surfaceAlt,
      borderRadius: 12,
      padding: 12,
      borderLeftWidth: 4,
      borderLeftColor: c.primary,
    },
    descriptionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: 8,
    },
    descriptionText: {
      fontSize: 13,
      color: c.textSecondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    termBox: {
      backgroundColor: c.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: c.border,
    },
    termTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      marginBottom: 4,
    },
    termDescription: {
      fontSize: 13,
      color: c.textSecondary,
      lineHeight: 18,
    },
    footer: {
      alignItems: 'center',
      marginTop: 32,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    footerText: {
      fontSize: 12,
      color: c.textMuted,
    },
  });
}
