import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Droplets } from 'lucide-react-native';

import { EmptyState } from '@/components/ui';
import { colors } from '@/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <View style={styles.container}>
        <EmptyState
          icon={Droplets}
          title="No active requests"
          description="You'll see blood requests near you here once hospital matching goes live."
        />
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
  },
});
