import React, { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { View, Text } from 'dripsy';
import Button from '../components/Button';
import Input from '../components/Input';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert('Login error', error.message);
    else Alert.alert('Success', 'You are logged in!');
  };

  return (
    <View sx={{
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: 'background',
    }}>
      <Text sx={{ fontSize: 'heading', mb: 3, textAlign: 'center' }}>
        Log In
      </Text>
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Log In" onPress={handleLogin} />
      <View sx={{ height: 12 }} /> {/* Spacer */}
      <Button
        title="Sign Up"
        onPress={() => navigation.navigate('Signup')}
      />
    </View>
  );
}

export default LoginScreen