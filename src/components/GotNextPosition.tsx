import React, { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { supabase } from '../lib/supabase';
import { View, Text } from 'dripsy';

interface GotNextPositionProps {
    courtId: string;
}

const GotNextPosition: React.FC<GotNextPositionProps> = ({ courtId }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [position, setPosition] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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

    const fetchPosition = async () => {
        if (!courtId || !userId) {
            setError('Missing court or user information');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data: queue, error: queueError } = await supabase
                .from('got_next_queues')
                .select('id')
                .eq('court_id', courtId)
                .eq('is_active', true)
                .limit(1)
                .single();

            if (queueError || !queue) {
                setPosition(null);
                return;
            }

            const { data: players, error: playerError } = await supabase
                .from('got_next_players')
                .select('user_id')
                .eq('queue_id', queue.id)
                .order('joined_at', { ascending: true });

            if (playerError || !players) {
                setError('Could not load queue players');
                return;
            }

            const index = players.findIndex(p => p.user_id === userId);
            setPosition(index >= 0 ? index + 1 : null);
        } catch {
            setError('Unexpected error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosition();
        const interval = setInterval(fetchPosition, 30000);
        return () => clearInterval(interval);
    }, [courtId, userId]);

    if (loading) return <ActivityIndicator size="small" />;
    if (error) return <Text sx={{ color: 'red' }}>{error}</Text>;
    if (position === null) return <Text>You are not currently in the queue.</Text>;

    return (
        <View>
            <Text>You are number {position} in the Got Next queue.</Text>
        </View>
    );
};

export default GotNextPosition;
