import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import CourtListScreen from './src/screens/CourtListScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import BookCourtScreen from './src/screens/BookCourtScreen';
import { supabase } from './src/lib/supabase';
import { DripsyProvider } from 'dripsy'
import theme from './theme'
import GymListScreen from './src/screens/GymListScreen';
import { RootStackParamList } from './src/navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <DripsyProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Gyms" component={GymListScreen} />
              <Stack.Screen name="Courts" component={CourtListScreen} />
              <Stack.Screen name="My Bookings" component={MyBookingsScreen} />
              <Stack.Screen name="Book Court" component={BookCourtScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </DripsyProvider>
  );
}

export default App;