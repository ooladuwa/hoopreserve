import React, { useEffect, useState } from 'react';
import { View, Text } from 'dripsy';
import { supabase } from '../lib/supabase';
import ScrollView from '../components/ScrollView';
import Touchable from '../components/Touchable';

type Court = {
  id: string;
  name: string;
  surface_type?: string;
  indoor?: boolean;
  notes?: string;
};

const CourtListScreen = ({ route, navigation }: any) => {
  const { gymId } = route.params;
  const [courts, setCourts] = useState<Court[]>([]);

  useEffect(() => {
    supabase
      .from('courts')
      .select('*')
      .eq('gym_id', gymId)
      .then(({ data, error }) => {
        if (error) console.error(error);
        else if (data) setCourts(data);
      });
  }, [gymId]);

  return (
    <ScrollView sx={{ flex: 1, p: 3, backgroundColor: 'background' }}>
      <Text sx={{ fontSize: 'heading', mb: 3 }}>Available Courts</Text>

      {courts.map((court) => (
        <Touchable
          key={court.id}
          onPress={() => navigation.navigate('Book Court', { courtId: court.id })}
          sx={{
            mb: 3,
            p: 3,
            borderWidth: 1,
            borderColor: 'muted',
            borderRadius: 'default',
            backgroundColor: 'muted',
          }}
        >
          <Text sx={{ fontSize: 'subheading', fontWeight: 'bold' }}>{court.name}</Text>
          <Text sx={{ fontSize: 'body' }}>
            {court.surface_type} · {court.indoor ? 'Indoor' : 'Outdoor'}
          </Text>
          {court.notes && <Text sx={{ fontSize: 12 }}>{court.notes}</Text>}
        </Touchable>
      ))}
    </ScrollView>
  );
}

export default CourtListScreen; 