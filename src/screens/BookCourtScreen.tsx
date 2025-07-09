import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { View, Text } from 'dripsy';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
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

const BookCourtScreen = ({ route }: Props) => {
    const { courtId } = route.params;
    const navigation = useNavigation<NavigationProp>();
    const [courtName, setCourtName] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState<Date>(snapToHour(new Date()));
    const [endTime, setEndTime] = useState<Date>(addOneHour(snapToHour(new Date())));
    const [pickerMode, setPickerMode] = useState<'date' | 'start' | 'end' | null>(null);

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

    const handleConfirm = (selectedDate: Date) => {
        const snapped = snapToHour(selectedDate);
        if (pickerMode === 'date') {
            setDate(snapped);
            setStartTime(snapped);
            setEndTime(addOneHour(snapped));
        } else if (pickerMode === 'start') {
            setStartTime(snapped);
            setEndTime(addOneHour(snapped));
        } else if (pickerMode === 'end') {
            const maxEnd = new Date(startTime.getTime());
            maxEnd.setHours(maxEnd.getHours() + 2);
            if (snapped <= startTime) {
                Alert.alert('Error', 'End time must be after start time');
                return;
            }
            if (snapped > maxEnd) {
                Alert.alert('Error', 'Bookings cannot exceed 2 hours');
                return;
            }
            setEndTime(snapped);
        }
        setPickerMode(null);
    };

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
            Alert.alert('Booking Failed', error.message);
        } else {
            Alert.alert('Success', 'Court booked successfully!');
            navigation.navigate('My Bookings');
        }
    };

    return (
        <View sx={{ flex: 1, p: 3, backgroundColor: 'background', justifyContent: 'center' }}>
            <Text sx={{ fontSize: 'heading', mb: 4, textAlign: 'center' }}>Book {courtName}</Text>

            <Button title={`Select Date: ${format(date, 'MM/dd/yyyy')}`} onPress={() => setPickerMode('date')} />
            <Button title={`Select Start Time: ${format(startTime, 'hh:mm a')}`} onPress={() => setPickerMode('start')} sx={{ mt: 3 }} />
            <Button title={`Select End Time: ${format(endTime, 'hh:mm a')}`} onPress={() => setPickerMode('end')} sx={{ mt: 3 }} />

            <DateTimePickerModal
                isVisible={pickerMode !== null}
                mode={pickerMode === 'date' ? 'date' : 'time'}
                date={pickerMode === 'date' ? date : pickerMode === 'start' ? startTime : endTime}
                onConfirm={handleConfirm}
                onCancel={() => setPickerMode(null)}
                minimumDate={pickerMode === 'date' ? new Date() : undefined}
            />

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
