import React from 'react';
import { TouchableOpacity, GestureResponderEvent } from 'react-native';
import { View, Text, useSx } from 'dripsy';

type ButtonProps = {
    title: string;
    onPress: (event: GestureResponderEvent) => void;
    disabled?: boolean;
};

export default function Button({ title, onPress, disabled = false }: ButtonProps) {
    const sx = useSx();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.7}
            style={sx({
                backgroundColor: disabled ? 'muted' : 'primary',
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 'default',
                alignItems: 'center',
                opacity: disabled ? 0.6 : 1,
            })}
        >
            <Text
                sx={{
                    color: 'background',
                    fontSize: 'body',
                    fontWeight: 'bold',
                }}
            >
                {title}
            </Text>
        </TouchableOpacity>
    );
}
