import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Home, MapPin } from 'lucide-react-native';

import { addZone, getMyProfile, upsertMyProfile } from '@/api/donors';
import { ApiError } from '@/api/client';
import type { BloodGroup, DonorZone } from '@/api/types';
import { BloodGroupPicker } from '@/components/BloodGroupPicker';
import { Button, Card, TextField } from '@/components/ui';
import { useAuth } from '@/auth/AuthContext';
import { colors, fontFamily, fontSize, radius, spacing } from '@/theme';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({ queryKey: ['donor-profile'], queryFn: getMyProfile });

  const [bloodGroup, setBloodGroup] = useState<BloodGroup | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [available, setAvailable] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profileQuery.data) {
      setBloodGroup(profileQuery.data.blood_group);
      setDateOfBirth(profileQuery.data.date_of_birth);
      setWeightKg(String(profileQuery.data.weight_kg));
      setAvailable(profileQuery.data.available);
    }
  }, [profileQuery.data]);

  const saveProfile = useMutation({
    mutationFn: () => {
      if (!bloodGroup) throw new Error('Pick a blood group');
      const weight = Number(weightKg);
      if (!weight || weight <= 0) throw new Error('Enter a valid weight');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) throw new Error('Date of birth must be YYYY-MM-DD');

      return upsertMyProfile({ blood_group: bloodGroup, date_of_birth: dateOfBirth, weight_kg: weight, available });
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['donor-profile'], profile);
      setFormError(null);
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : 'Something went wrong'),
  });

  // Backend has no GET /donors/me/zones endpoint yet, so this only reflects zones added this session.
  const [zones, setZones] = useState<DonorZone[]>([]);
  const [zoneLabel, setZoneLabel] = useState('');
  const [zoneRadiusKm, setZoneRadiusKm] = useState('5');
  const [zoneError, setZoneError] = useState<string | null>(null);

  const addZoneMutation = useMutation({
    mutationFn: async () => {
      if (!zoneLabel.trim()) throw new Error('Give this zone a label');

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') throw new Error('Location permission is required');

      const position = await Location.getCurrentPositionAsync({});
      const radius = Number(zoneRadiusKm) || 5;

      return addZone({
        label: zoneLabel.trim(),
        point: { latitude: position.coords.latitude, longitude: position.coords.longitude },
        radius_km: radius,
      });
    },
    onSuccess: (zone) => {
      setZones((prev) => [...prev, zone]);
      setZoneLabel('');
      setZoneRadiusKm('5');
      setZoneError(null);
    },
    onError: (err) =>
      setZoneError(err instanceof ApiError || err instanceof Error ? err.message : 'Something went wrong'),
  });

  if (profileQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.rose[600]} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Card style={styles.card}>
          <SectionHeading title="Blood group" />
          <BloodGroupPicker value={bloodGroup} onChange={setBloodGroup} />
        </Card>

        <Card style={styles.card}>
          <SectionHeading title="Details" />
          <TextField label="Date of birth" placeholder="1995-01-30" value={dateOfBirth} onChangeText={setDateOfBirth} />
          <TextField
            label="Weight (kg)"
            placeholder="68"
            keyboardType="numeric"
            value={weightKg}
            onChangeText={setWeightKg}
          />

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Available to donate</Text>
            <Switch
              value={available}
              onValueChange={setAvailable}
              trackColor={{ true: colors.rose[400], false: colors.stone[200] }}
              thumbColor={colors.white}
            />
          </View>

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button loading={saveProfile.isPending} onPress={() => saveProfile.mutate()}>
            {profileQuery.data ? 'Save changes' : 'Create profile'}
          </Button>
        </Card>

        <Card style={styles.card}>
          <SectionHeading title="Zones" />

          {zones.length > 0 && (
            <View style={styles.zoneList}>
              {zones.map((zone) => (
                <View key={zone.id} style={styles.zoneRow}>
                  <View style={styles.zoneIcon}>
                    {zone.label.toLowerCase().includes('home') ? (
                      <Home size={16} color={colors.rose[600]} />
                    ) : (
                      <MapPin size={16} color={colors.rose[600]} />
                    )}
                  </View>
                  <Text style={styles.zoneLabel}>{zone.label}</Text>
                  <Text style={styles.zoneRadius}>{zone.radius_km} km</Text>
                </View>
              ))}
            </View>
          )}

          <TextField placeholder="Label (e.g. Home)" value={zoneLabel} onChangeText={setZoneLabel} />
          <TextField placeholder="Radius km" keyboardType="numeric" value={zoneRadiusKm} onChangeText={setZoneRadiusKm} />

          {zoneError && <Text style={styles.error}>{zoneError}</Text>}

          <Button variant="secondary" loading={addZoneMutation.isPending} onPress={() => addZoneMutation.mutate()}>
            Use current location
          </Button>
        </Card>

        <Button variant="ghost" onPress={() => signOut()}>
          Sign out
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeading({ title }: { title: string }) {
  return <Text style={styles.heading}>{title}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.stone[50],
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: spacing[5],
    gap: spacing[4],
  },
  card: {
    gap: spacing[3],
  },
  heading: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    color: colors.stone[800],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.stone[700],
  },
  error: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.rose[600],
  },
  zoneList: {
    gap: spacing[2],
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.stone[100],
  },
  zoneIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.rose[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneLabel: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    color: colors.stone[800],
  },
  zoneRadius: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.sm,
    color: colors.stone[500],
  },
});
