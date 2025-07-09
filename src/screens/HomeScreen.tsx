import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import { View, Text } from 'dripsy';
import Button from '../components/Button';
import BasketballIcon from '../images/BasketballIcon';
import BouncingBasketball from '../images/BouncingBasketball';
import { RootStackParamList } from '../navigation/types';
import { TouchableOpacity } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error.message);
      alert('Logout failed');
    } else {
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
      <View sx={{ justifyContent: 'center', alignItems: 'center' }}>
        {/* <BasketballIcon size={200} /> */}
        <BouncingBasketball size={200} />
      </View>
      <View sx={{
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: 'background',
      }}>
        <Button title="View Gyms" onPress={() => navigation.navigate('Gyms')} />
        <View sx={{ height: 16 }} /> {/* Spacer */}
        <Button title="My Bookings" onPress={() => navigation.navigate('My Bookings')} />
        <View sx={{ height: 16 }} /> {/* Spacer */}
        <View sx={{
          flex: 1,
          justifyContent: 'center',
          padding: 20,
          backgroundColor: 'background',
        }}></View>
        <TouchableOpacity onPress={() => handleLogout()}>
          <Text sx={{ color: 'error', fontSize: 16, textAlign: 'center' }}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View >
  );
}

export default HomeScreen;