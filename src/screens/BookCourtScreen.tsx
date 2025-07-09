import React, { useState, useEffect, useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { View, Text } from 'dripsy';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import Button from '../components/Button';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type Props = {
    route: { params: { courtId: string } };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;


// Utility functions
const snapToHour = (date: Date) => {
    const snapped = new Date(date);
    snapped.setMinutes(0, 0, 0);
    return snapped;
};

const addOneHour = (date: Date) => {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 1);
    return newDate;
};

const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const BookCourtScreen = ({ route }: Props) => {
    const { courtId } = route.params;
    const [courtName, setCourtName] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [startTime, setStartTime] = useState<Date>(snapToHour(new Date()));
    const [endTime, setEndTime] = useState<Date>(addOneHour(snapToHour(new Date())));
    const navigation = useNavigation<NavigationProp>();

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

    const onChangeDate = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            const snapped = snapToHour(selectedDate);
            setDate(snapped);
            setStartTime(snapped);
            setEndTime(addOneHour(snapped));
        }
    }, []);

    const onChangeStartTime = useCallback((event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowStartTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            const snappedStart = snapToHour(selectedTime);
            const snappedEnd = addOneHour(snappedStart);
            setStartTime(snappedStart);
            setEndTime(snappedEnd);
        }
    }, []);

    const onChangeEndTime = useCallback((event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowEndTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            const snappedEnd = snapToHour(selectedTime);

            const maxEndTime = new Date(startTime.getTime());
            maxEndTime.setHours(maxEndTime.getHours() + 2);

            if (snappedEnd <= startTime) {
                Alert.alert('Error', 'End time must be after start time');
                return;
            }

            if (snappedEnd > maxEndTime) {
                Alert.alert('Error', 'Bookings cannot exceed 2 hours');
                return;
            }

            setEndTime(snappedEnd);
        }
    }, [startTime]);


    const checkAvailability = async (courtId: string, start: Date, end: Date) => {
        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('court_id', courtId)
            .lt('start_time', end.toISOString())
            .gt('end_time', start.toISOString());

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

        const durationInHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
        if (durationInHours > 2) {
            Alert.alert('Error', 'Bookings cannot exceed 2 hours');
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
            navigation.navigate('My Bookings');
        }
    };

    // ✅ JSX render goes here — not inside handleBooking
    return (
        <View sx={{ flex: 1, p: 3, backgroundColor: 'background', justifyContent: 'center' }}>
            <Text sx={{ fontSize: 'heading', mb: 4, textAlign: 'center' }}>Book {courtName}</Text>

            <Button title={`Select Date: ${format(date, 'EEE, MMM d, yyyy')}`} onPress={() => setShowDatePicker(true)} />

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
                title={`Select Start Time: ${formatTime(startTime)}`}
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
                title={`Select End Time: ${formatTime(endTime)}`}
                onPress={() => setShowEndTimePicker(true)}
                sx={{ mt: 3 }}
            />

            {showEndTimePicker && (
                <DateTimePicker
                    value={endTime}
                    mode="time"
                    display="default"
                    onChange={onChangeEndTime}
                />
            )}

            <View sx={{ backgroundColor: 'background', justifyContent: 'flex-end', flex: 1 }}>
                <Text sx={{ mt: 2, mb: 1, textAlign: 'center' }}>
                    Duration: {(endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)} hour(s)
                </Text>

                <Button title="Book Court" onPress={handleBooking} sx={{ mb: 25 }} />
            </View>
        </View>
    );
};

export default BookCourtScreen;