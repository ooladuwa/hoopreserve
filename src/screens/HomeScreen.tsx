import React from 'react';
import { View, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <Button title="View Courts" onPress={() => navigation.navigate('Courts')} />
      <Button title="My Bookings" onPress={() => navigation.navigate('My Bookings')} />
      <Button title="Log Out" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
});
