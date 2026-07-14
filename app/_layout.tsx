import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Pressable } from 'react-native';
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

function TabIcon({ icon, focused }: { icon: string; focused: boolean }): React.JSX.Element {
  return (
    <View style={[iconStyles.wrap, focused && iconStyles.wrapActive]}>
      <Text style={[iconStyles.icon, focused && iconStyles.iconActive]}>{icon}</Text>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  wrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  wrapActive: { backgroundColor: 'rgba(139,92,246,0.15)' },
  icon: { fontSize: 18, color: Colors.text3 },
  iconActive: { color: Colors.accent },
});

export default function RootLayout() {
  return (
    <ErrorBoundary>
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
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon icon="⌂" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon icon="⌕" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="collection"
          options={{
            title: 'Collection',
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon icon="◈" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="watchlist"
          options={{
            title: 'Watchlist',
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon icon="◎" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused }: { focused: boolean }) => <TabIcon icon="◉" focused={focused} />,
          }}
        />
        {/* Hidden from tab bar */}
        <Tabs.Screen
          name="product/[id]"
          options={{ href: null, tabBarStyle: { display: 'none' } }}
        />
        <Tabs.Screen
          name="add-product"
          options={{ href: null, tabBarStyle: { display: 'none' } }}
        />
      </Tabs>
    </UserStateProvider>
    </ErrorBoundary>
  );
}
