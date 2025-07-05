import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';

type Booking = {
  id: string;
  court_id: string;
  date: string;
  time_slot: string;
};

export default function MyBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const fetchBookings = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    if (!user) {
      Alert.alert('You must be logged in.');
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error(error);
      Alert.alert('Error loading bookings.');
    } else {
      setBookings(data);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (error) {
      Alert.alert('Error canceling booking.');
    } else {
      Alert.alert('Booking canceled.');
      fetchBookings(); // reload bookings
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🗓 My Bookings</Text>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Court ID: {item.court_id}</Text>
            <Text>Date: {item.date}</Text>
            <Text>Time: {item.time_slot}</Text>
            <Button title="Cancel" onPress={() => cancelBooking(item.id)} />
          </View>
        )}
        ListEmptyComponent={<Text>No bookings yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  card: {
    borderWidth: 1, padding: 10, marginBottom: 10, borderRadius: 8,
  },
});
