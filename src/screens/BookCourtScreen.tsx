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
import GotNextPosition from '../components/GotNextPosition';

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
    console.log('Court ID:', courtId);

    const navigation = useNavigation<NavigationProp>();
    const [courtName, setCourtName] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [startTime, setStartTime] = useState<Date>(snapToHour(new Date()));
    const [endTime, setEndTime] = useState<Date>(addOneHour(snapToHour(new Date())));
    const [pickerMode, setPickerMode] = useState<'date' | 'start' | 'end' | null>(null);
    const [hasActiveQueue, setHasActiveQueue] = useState(false);
    const [queueId, setQueueId] = useState<string | null>(null);
    const [isBookedSoon, setIsBookedSoon] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) => {
            if (error || !data.user) {
                console.log('User not authenticated:', error);
            } else {
                console.log('Authenticated user ID:', data.user.id);
            }
        });
    }, []);


    useEffect(() => {
        supabase.auth.getSession().then(({ data, error }) => {
            if (data?.session?.user) {
                console.log('User loaded:', data.session.user.id);
            } else {
                console.log('No session found.');
            }
        });
    });

    // fetch court id
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

    // fetch booking and queue status
    useEffect(() => {
        console.log('Checking active queue and booking status in useEffect');
        checkActiveQueue();
        checkBookingStatus();
    }, [isBookedSoon, hasActiveQueue]);

    // fetch user id
    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
                error,
            } = await supabase.auth.getUser();

            if (error || !user) {
                console.error('Error fetching user:', error);
                return;
            }

            setUserId(user.id);
        };

        getUser();
    }, []);

    const checkActiveQueue = async () => {
        const { data, error } = await supabase
            .from('got_next_queues')
            .select('id')
            .eq('court_id', courtId) // make sure you have the court.id from props/route
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            console.error('Error checking active queue', error);
            return;
        }

        if (data) {
            setHasActiveQueue(true);
            console.log('Active queue found:', data);

            setQueueId(data.id);
        } else {
            setHasActiveQueue(false);
            console.log('No active queue found for court');

            setQueueId(null);
        }
    };

    const handleJoinQueue = async () => {
        // check if court id and user id are valid
        if (!courtId || !userId) {
            Alert.alert('Error', 'Court or user information is missing.');
            return;
        }

        try {
            setLoading(true);

            // Step 1: Check for active queue
            let { data: queue, error: queueError } = await supabase
                .from('got_next_queues')
                .select('*')
                .eq('court_id', courtId)
                .eq('is_active', true)
                .limit(1)
                .single();

            if (queueError && queueError.code !== 'PGRST116') { // PGRST116 = no rows
                throw queueError;
            }

            // Step 2: Create queue if not exists
            if (!queue) {
                const now = new Date().toISOString();
                const { data: newQueue, error: createError } = await supabase
                    .from('got_next_queues')
                    .insert([{ court_id: courtId, start_time: now, is_active: true, user_id: userId }])
                    .select()
                    .single();

                if (createError) throw createError;

                queue = newQueue;
            }

            // Step 3: Add user to got_next_players
            const { error: playerError } = await supabase.from('got_next_players').insert({
                queue_id: queue.id,
                user_id: userId,
                joined_at: new Date().toISOString(),
                notified: false,
            });

            if (playerError) throw playerError;

            Alert.alert('Success', 'You have joined the Got Next queue!');

            // Refresh state/UI
            await checkActiveQueue();
            setJoined(true);
        } catch (error) {
            console.error('Error joining queue:', error);
            Alert.alert('Error', 'Failed to join the queue.');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveQueue = async () => {
        if (!queueId || !userId) {
            Alert.alert('Error', 'Queue or user information is missing.');
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase
                .from('got_next_players')
                .delete()
                .eq('queue_id', queueId)
                .eq('user_id', userId);

            if (error) throw error;
            Alert.alert('Success', 'You have left the Got Next queue.');

            // Refresh state/UI
            setJoined(false);
            await checkActiveQueue();
        } catch (error) {
            console.error('Error leaving queue:', error);
            Alert.alert('Error', 'Failed to leave the queue.');
        } finally {
            setLoading(false);
        }
    };

    const checkBookingStatus = async () => {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        const { data, error } = await supabase
            .from('bookings')
            .select('id')
            .eq('court_id', courtId)
            .lt('start_time', twoHoursFromNow.toISOString())
            .gt('end_time', now.toISOString())
            .limit(1);

        if (error) {
            console.error('Error checking booking status', error);
            return;
        }
        setIsBookedSoon(!!data?.length);
        console.log('Bookings in next 2 hours:', data);
        console.log('Is booked soon:', !!data?.length);

    };

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

            <View sx={{ backgroundColor: 'background', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                {!isBookedSoon && !hasActiveQueue && (
                    <Button title="Join Got Next Queue" onPress={handleJoinQueue} disabled={!userId} />
                )}

                {/* {!isBookedSoon && hasActiveQueue && (
                    <Button title="View Got Next Queue" onPress={() => console.log(navigation.navigate('GotNextQueue', { queueId }))} />
                )} */}

                {!isBookedSoon && hasActiveQueue && joined && (
                    <Button title="Leave Got Next Queue" onPress={handleLeaveQueue} sx={{ color: "error" }} />
                )}

                {hasActiveQueue && joined && (
                    <GotNextPosition courtId={courtId} />
                )}

            </View>

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
