import React, { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import { View, Text } from 'dripsy';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';

type Props = {
    route: { params: { courtId: string } };
};

const BookCourtScreen = ({ route }: Props) => {
    const { courtId } = route.params;

    const [courtName, setCourtName] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    const [startTime, setStartTime] = useState<Date>(new Date());
    const [endTime, setEndTime] = useState<Date>(new Date(new Date().getTime() + 60 * 60 * 1000)); // 1 hour later

    useEffect(() => {
        supabase
            .from('courts')
            .select('name')
            .eq('id', courtId)
            .single()
            .then(({ data, error }) => {
                if (error) console.error(error);
                else if (data) setCourtName(data.name);
            });
    }, [courtId]);

    const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
            // Reset start/end times when date changes
            setStartTime(selectedDate);
            setEndTime(new Date(selectedDate.getTime() + 60 * 60 * 1000));
        }
    };

    const onChangeStartTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowStartTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setStartTime(selectedTime);
            if (selectedTime >= endTime) {
                setEndTime(new Date(selectedTime.getTime() + 60 * 60 * 1000));
            }
        }
    };

    const onChangeEndTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowEndTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            if (selectedTime <= startTime) {
                Alert.alert('Error', 'End time must be after start time');
                return;
            }
            setEndTime(selectedTime);
        }
    };

    // Check for overlapping bookings
    const checkAvailability = async (courtId: string, start: Date, end: Date) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('court_id', courtId)
            .or(
                `and(start_time,lt.${end.toISOString()}),and(end_time,gt.${start.toISOString()})`
            );

        if (error) {
            console.error('Error checking availability', error);
            return false;
        }
        return data?.length === 0;
    };

    const handleBooking = async () => {
        const startDateTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            startTime.getHours(),
            startTime.getMinutes()
        );
        const endDateTime = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            endTime.getHours(),
            endTime.getMinutes()
        );

        if (endDateTime <= startDateTime) {
            Alert.alert('Error', 'End time must be after start time');
            return;
        }

        const user = await supabase.auth.getUser();
        if (!user.data.user) {
            Alert.alert('Error', 'User not logged in');
            return;
        }

        const available = await checkAvailability(courtId, startDateTime, endDateTime);
        if (!available) {
            Alert.alert('Unavailable', 'This court is already booked during that time.');
            return;
        }

        const { error } = await supabase.from('bookings').insert([
            {
                user_id: user.data.user.id,
                court_id: courtId,
                start_time: startDateTime.toISOString(),
                end_time: endDateTime.toISOString(),
            },
        ]);

        if (error) {
            if (error.message.includes('no_overlapping_bookings')) {
                Alert.alert('Unavailable', 'This court is already booked during that time.');
            } else {
                Alert.alert('Booking Failed', error.message);
            }
        } else {
            Alert.alert('Success', 'Court booked successfully!');
            // Optionally navigate or reset state here
        }
    };

    return (
        <View sx={{ flex: 1, p: 3, backgroundColor: 'background', justifyContent: 'center' }}>
            <Text sx={{ fontSize: 'heading', mb: 4 }}>Book {courtName}</Text>

            <Button title={`Select Date: ${date.toDateString()}`} onPress={() => setShowDatePicker(true)} />

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                    minimumDate={new Date()}
                />
            )}

            <Button
                title={`Select Start Time: ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                onPress={() => setShowStartTimePicker(true)}
                sx={{ mt: 3 }}
            />

            {showStartTimePicker && (
                <DateTimePicker
                    value={startTime}
                    mode="time"
                    display="default"
                    onChange={onChangeStartTime}
                />
            )}

            <Button
                title={`Select End Time: ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                onPress={() => setShowEndTimePicker(true)}
                sx={{ mt: 3 }}
            />

            {showEndTimePicker && (
                <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="default"
                    onChange={onChangeEndTime}
                    minimumDate={startTime}
                />
            )}

            <Button title="Book Court" onPress={handleBooking} sx={{ mt: 5 }} />
        </View>
    );
}
export default BookCourtScreen;