import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { TIME_SLOTS } from '../constants/timeSlots';

export default function BookCourtScreen({ route, navigation }: any) {
    const { courtId } = route.params;
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    useEffect(() => {
        const fetchBookedSlots = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('time_slot')
                .eq('court_id', courtId)
                .eq('date', today);

            if (error) {
                console.error(error);
                Alert.alert('Error loading booked times');
                return;
            }

            const slots = data.map((b) => b.time_slot);
            setBookedSlots(slots);
            setLoading(false);
        };

        fetchBookedSlots();
    }, []);

    const handleBook = async (slot: string) => {
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (!user) {
            Alert.alert('You must be logged in to book.');
            return;
        }

        const { error } = await supabase.from('bookings').insert([
            {
                user_id: user.id,
                court_id: courtId,
                date: today,
                time_slot: slot,
            },
        ]);

        if (error) {
            console.error(error);
            Alert.alert('Booking failed: ' + error.message);
        } else {
            Alert.alert('✅ Booking confirmed!');
            navigation.goBack();
        }
    };

    const renderSlot = ({ item }: { item: string }) => {
        const isBooked = bookedSlots.includes(item);
        return (
            <View style={styles.slotRow}>
                <Text style={styles.slotText}>{item}</Text>
                <Button
                    title={isBooked ? 'Booked' : 'Book'}
                    onPress={() => handleBook(item)}
                    disabled={isBooked}
                />
            </View>
        );
    };

    if (loading) return <Text style={styles.loading}>Loading time slots...</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🕒 Pick a Time Slot</Text>
            <FlatList
                data={TIME_SLOTS}
                keyExtractor={(item) => item}
                renderItem={renderSlot}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 24, marginBottom: 10 },
    loading: { marginTop: 50, textAlign: 'center' },
    slotRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
        alignItems: 'center',
    },
    slotText: { fontSize: 16 },
});
