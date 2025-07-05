import React, { useEffect, useState } from 'react';
import { FlatList, Alert, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { TIME_SLOTS } from '../constants/timeSlots';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text } from 'dripsy';
import Button from '../components/Button';

const BookCourtScreen = ({ route, navigation }: any) => {
    const { courtId } = route.params;
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    const formattedDate = selectedDate.toISOString().slice(0, 10);

    useEffect(() => {
        const fetchBookedSlots = async () => {
            const { data, error } = await supabase
                .from('bookings')
                .select('time_slot')
                .eq('court_id', courtId)
                .eq('date', formattedDate);

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
                date: formattedDate,
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
            <View sx={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderRadius: 8,
                borderColor: '#ccc',
                alignItems: 'center',
            }}>
                <Text sx={{ fontSize: 16 }}>{item}</Text>
                <Button
                    title={isBooked ? 'Booked' : 'Book'}
                    onPress={() => handleBook(item)}
                    disabled={isBooked}
                />
            </View>
        );
    };

    if (loading) return <Text sx={{ marginTop: 50, textAlign: 'center' }}>Loading time slots...</Text>;

    return (
        <View sx={{ flex: 1, padding: 20 }}>
            <Text sx={{ fontSize: 24, marginBottom: 10 }}>🕒 Pick a Time Slot</Text>
            <Button
                title={`Change Date (${selectedDate.toDateString()})`}
                onPress={() => setShowDatePicker(true)}
            />

            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                        setShowDatePicker(false);
                        if (date) setSelectedDate(date);
                    }}
                />
            )}
            <FlatList
                data={TIME_SLOTS}
                keyExtractor={(item) => item}
                renderItem={renderSlot}
            />
        </View>
    );
}

export default BookCourtScreen;
