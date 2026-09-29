import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Droplet } from 'lucide-react-native';

import { requestOtp } from '@/api/auth';
import { ApiError } from '@/api/client';
import { Button, TextField } from '@/components/ui';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function PhoneEntryScreen() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => requestOtp(phone),
    onSuccess: () => {
      router.push({ pathname: '/verify', params: { phone } });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <Droplet size={28} color={colors.white} fill={colors.white} strokeWidth={0} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>Welcome to Blood Link</Text>
          <Text style={styles.subtitle}>Enter your phone number to sign in or create an account</Text>
        </View>

        <View style={styles.form}>
          <TextField
            placeholder="+91XXXXXXXXXX"
            keyboardType="phone-pad"
            autoComplete="tel"
            value={phone}
            onChangeText={setPhone}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            disabled={!phone}
            loading={mutation.isPending}
            onPress={() => {
              setError(null);
              mutation.mutate();
            }}
          >
            Send code
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.stone[50],
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    gap: spacing[8],
  },
  logo: {
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.rose[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    gap: spacing[2],
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['2xl'],
    color: colors.stone[900],
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.stone[500],
    textAlign: 'center',
  },
  form: {
    gap: spacing[3],
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.rose[600],
  },
});
