import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../lib/authContext';
import { UserStateProvider } from '../data/userState';
import { Colors } from '../components/tokens';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <View style={eb.wrap}>
          <Text style={eb.icon}>⚠</Text>
          <Text style={eb.title}>Something went wrong</Text>
          <Text style={eb.msg}>{this.state.error.message}</Text>
          <Pressable onPress={() => this.setState({ error: null })} style={eb.btn}>
            <Text style={eb.btnText}>Go back</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}
const eb = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  icon: { fontSize: 40, color: Colors.warning },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text1 },
  msg: { fontSize: 12, color: Colors.text3, textAlign: 'center' },
  btn: { marginTop: 8, backgroundColor: Colors.accent, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={[icon_s.wrap, focused && icon_s.wrapActive]}>
      <Text style={[icon_s.icon, focused && icon_s.iconActive]}>{icon}</Text>
    </View>
  );
}
const icon_s = StyleSheet.create({
  wrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  wrapActive: { backgroundColor: 'rgba(139,92,246,0.15)' },
  icon: { fontSize: 18, color: Colors.text3 },
  iconActive: { color: Colors.accent },
});

function AppContent() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <UserStateProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: Colors.accent,
          tabBarInactiveTintColor: Colors.text3,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ focused }) => <TabIcon icon="⌕" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="vault"
          options={{
            title: 'My Vault',
            tabBarIcon: ({ focused }) => <TabIcon icon="◈" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }) => <TabIcon icon="◉" focused={focused} />,
          }}
        />
        {/* Hidden routes */}
        <Tabs.Screen name="(auth)" options={{ href: null }} />
        <Tabs.Screen name="product/[id]" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        <Tabs.Screen name="add-product" options={{ href: null, tabBarStyle: { display: 'none' } }} />
        {/* Old routes hidden (kept as files until cleaned up) */}
        <Tabs.Screen name="collection" options={{ href: null }} />
        <Tabs.Screen name="watchlist" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </UserStateProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}
