import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'dripsy';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';
import Touchable from '../components/Touchable';
import { RootStackParamList, Gym } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const GymListScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [gyms, setGyms] = useState<Gym[]>([]);

    useEffect(() => {
        supabase.from('gyms').select('*').then(({ data, error }) => {
            if (error) console.error(error);
            else if (data) setGyms(data);
        });
    }, []);

    return (
        <ScrollView sx={{ flex: 1, p: 3, backgroundColor: 'background' }}>
            <Text sx={{ fontSize: 'heading', mb: 3 }}>Choose a Gym</Text>

            {gyms.map((gym) => (
                <Touchable
                    key={gym.id}
                    onPress={() => navigation.navigate('Courts', { gymId: gym.id })}
                    sx={{
                        mb: 3,
                        p: 3,
                        borderWidth: 1,
                        borderColor: 'muted',
                        borderRadius: 'default',
                        backgroundColor: 'muted',
                    }}
                >
                    <Text sx={{ fontSize: 'subheading', fontWeight: 'bold' }}>{gym.name}</Text>
                    <Text sx={{ fontSize: 'body', color: 'text' }}>{gym.address}</Text>
                </Touchable>
            ))}
        </ScrollView>
    );
};

export default GymListScreen;