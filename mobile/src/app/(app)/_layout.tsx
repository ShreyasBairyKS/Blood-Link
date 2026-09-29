import { Tabs } from 'expo-router';
import { Home, User } from 'lucide-react-native';

import { colors, fontFamily } from '@/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleStyle: { fontFamily: fontFamily.semibold, color: colors.stone[900] },
        tabBarActiveTintColor: colors.rose[600],
        tabBarInactiveTintColor: colors.stone[400],
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 12 },
        tabBarStyle: { borderTopColor: colors.stone[200] },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tabs>
  );
}
