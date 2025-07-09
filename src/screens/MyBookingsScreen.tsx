import React, { useEffect, useState, useCallback } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { View, Text } from 'dripsy';
import { supabase } from '../lib/supabase';
import Touchable from '../components/Touchable';
import { Booking } from '../navigation/types';
import ScrollView from '../components/ScrollView';
import { format } from 'date-fns';

const MyBookingsScreen = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);

    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      Alert.alert('Error', 'User not logged in');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        start_time,
        end_time,
        court:court_id (
          id,
          name,
          gym:gym_id (
            name
          )
        )
      `)
      .eq('user_id', user.data.user.id)
      .order('start_time', { ascending: true });

    if (error) {
      Alert.alert('Error fetching bookings', error.message);
    } else if (data) {
      console.log(JSON.stringify(data, null, 2));
      setBookings(data);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No' },
        {
          text: 'Yes',
          onPress: async () => {
            const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
            if (error) {
              Alert.alert('Error', error.message);
            } else {
              Alert.alert('Cancelled', 'Booking cancelled');
              fetchBookings();
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <ScrollView
      sx={{ flex: 1, p: 3, backgroundColor: 'background' }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchBookings} />}
    >
      <Text sx={{ fontSize: 'heading', mb: 3 }}>My Bookings</Text>

      {bookings.length === 0 ? (
        <Text sx={{ fontSize: 'body', color: 'muted' }}>No upcoming bookings.</Text>
      ) : (
        bookings.map((booking) => {
          const start = new Date(booking.start_time);
          const end = new Date(booking.end_time);
          return (
            <Touchable
              key={booking.id}
              sx={{
                mb: 3,
                p: 3,
                borderWidth: 1,
                borderColor: 'muted',
                borderRadius: 'default',
                backgroundColor: 'muted',
              }}
              onPress={() => cancelBooking(booking.id)}
            >
              <Text sx={{ fontWeight: 'bold', fontSize: 'subheading' }}>
                {booking.court.name} @ {booking.court.gym.name}
              </Text>
              <Text sx={{ fontSize: 12, mt: 2, mb: 2 }}>
                {format(start, 'MM/dd/yyyy')} {format(start, 'hh:mm a')} -{' '}
                {format(end, 'hh:mm a')}
              </Text>
              <Text sx={{ fontSize: 12, color: 'error' }}>
                (Tap to cancel)
              </Text>
            </Touchable>
          );
        })
      )}
    </ScrollView>
  );
};

export default MyBookingsScreen;
