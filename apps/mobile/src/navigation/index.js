import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import LoginScreen    from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MyTeamScreen   from '../screens/MyTeamScreen';
import DraftScreen    from '../screens/DraftScreen';
import MarketScreen   from '../screens/MarketScreen';
import TradesScreen   from '../screens/TradesScreen';
import LeaguesScreen  from '../screens/LeaguesScreen';

import useStore from '../store/useStore';

const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Abas principais ───────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.cardBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor:   colors.green,
        tabBarInactiveTintColor: colors.textSub,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home:    'home',
            'Meu Time': 'shirt',
            Draft:   'layers',
            Mercado: 'storefront',
            Trades:  'swap-horizontal',
            Liga:    'trophy',
          };
          return <Ionicons name={icons[route.name] ?? 'ellipse'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"      component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Meu Time"  component={MyTeamScreen} />
      <Tab.Screen name="Draft"     component={DraftScreen} />
      <Tab.Screen name="Mercado"   component={MarketScreen} />
      <Tab.Screen name="Trades"    component={TradesScreen} />
      <Tab.Screen name="Liga"      component={LeaguesScreen} />
    </Tab.Navigator>
  );
}

// ── Root: Login → Tabs ────────────────────────────────────────────────────
export default function AppNavigator() {
  const isLoggedIn = useStore(s => s.isLoggedIn);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn
          ? <Stack.Screen name="Main" component={MainTabs} />
          : <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}
