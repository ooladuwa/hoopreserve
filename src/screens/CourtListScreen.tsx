import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import { supabase } from '../lib/supabase';

type Court = {
  id: string;
  name: string;
  location: string;
  surface: string;
  is_indoor: boolean;
};
const CourtListScreen = () => {
  const [courts, setCourts] = useState<Court[]>([]);

  useEffect(() => {
    const fetchCourts = async () => {
      const { data, error } = await supabase.from('courts').select('*');
      if (error) {
        console.error(error);
        return;
      }
      setCourts(data);
    };

    fetchCourts();
  }, []);

  const handleBookCourt = async (courtId: string) => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    // no user found show alert
    if (!user) { 
        alert('Please login to book a court');
        return;
    }
    // define booking object
    const booking = {
        user_id: user.id,
        court_id: courtId,
        date: new Date().toISOString().slice(0, 10),
        time_slot: '10am - 11am',
    }
    // insert booking into database
    const { data, error } = await supabase.from('bookings').insert(booking);
    if (error) {
        console.error(error);
        alert('Error booking court');
        return;
    }
    alert('Court booked successfully');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Courts</Text>
      <FlatList
        data={courts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.location}</Text>
            <Text>Surface: {item.surface}</Text>
            <Text>{item.is_indoor ? 'Indoor' : 'Outdoor'}</Text>
            <Button title="Book this court" onPress={() => handleBookCourt(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 10 },
  card: {
    borderWidth: 1, borderRadius: 10, padding: 15, marginBottom: 10,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
});

export default CourtListScreen;