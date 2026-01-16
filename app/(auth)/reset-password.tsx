import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function ResetPasswordScreen() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Lütfen e-postanızı giriniz');
      return;
    }

    setError(null);
    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError('Şifre sıfırlama e-postası gönderilemedi');
    } else {
      setSuccess(true);
      setEmail('');
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Şifre Sıfırla</Text>
        <Text style={styles.subtitle}>E-postanıza sıfırlama bağlantısı göndereceğiz</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {success && (
          <Text style={styles.successText}>E-postanızı kontrol ediniz</Text>
        )}

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          editable={!loading && !success}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TouchableOpacity
          style={[styles.button, (loading || success) && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={loading || success}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sıfırla</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Giriş Ekranına Dön</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  errorText: {
    backgroundColor: '#fee',
    color: '#c33',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  successText: {
    backgroundColor: '#efe',
    color: '#3c3',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  linkText: {
    color: '#2563eb',
    fontSize: 14,
    fontWeight: '600',
  },
});
