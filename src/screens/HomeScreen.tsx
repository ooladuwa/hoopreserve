import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { View, Text } from 'dripsy';
import Button from '../components/Button';

type RootStackParamList = {
  Home: undefined;
  Courts: undefined;
  My_Bookings: undefined;
  Book_Court: { courtId: string };
  Login: undefined;
  Signup: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      alert('Logout failed');
    } else {
      // Optionally navigate to login screen or clear any state
      console.log('Logged out');
    }
  };

  return (
    <View sx={{
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'background',
    }}>
      <Text sx={{ fontSize: 'heading', mb: 4, textAlign: 'center' }}>
        Welcome to Hoop Reserve!
      </Text>
      <View sx={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'background',
      }}>
        <Button title="View Courts" onPress={() => navigation.navigate('Courts')} />
        <View sx={{ height: 16 }} /> {/* Spacer */}
        <Button title="My Bookings" onPress={() => navigation.navigate('My_Bookings')} />
        <View sx={{ height: 16 }} /> {/* Spacer */}
        <Button title="Log Out" onPress={() => handleLogout()} />
      </View>
    </View >
  );
}

export default HomeScreen;