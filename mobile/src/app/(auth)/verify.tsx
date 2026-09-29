import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { MessageSquareText } from 'lucide-react-native';

import { verifyOtp } from '@/api/auth';
import { ApiError } from '@/api/client';
import { useAuth } from '@/auth/AuthContext';
import { Button, OtpInput } from '@/components/ui';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function VerifyOtpScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => verifyOtp(phone, code),
    onSuccess: (tokens) => {
      signIn({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token });
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logo}>
          <MessageSquareText size={26} color={colors.rose[600]} strokeWidth={1.75} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.title}>Enter the code</Text>
          <Text style={styles.subtitle}>We sent a 6-digit code to {phone}</Text>
        </View>

        <View style={styles.form}>
          <OtpInput value={code} onChange={setCode} />

          {error && <Text style={styles.error}>{error}</Text>}

          <Button
            disabled={code.length < 6}
            loading={mutation.isPending}
            onPress={() => {
              setError(null);
              mutation.mutate();
            }}
          >
            Verify
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
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.rose[50],
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
    gap: spacing[4],
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.rose[600],
    textAlign: 'center',
  },
});
