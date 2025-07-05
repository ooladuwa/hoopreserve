import React from 'react';
import { TextInput as RNTextInput, TextInputProps } from 'react-native';
import { useSx } from 'dripsy';

const Input = (props: TextInputProps) => {
    const sx = useSx();

    return (
        <RNTextInput
            {...props}
            placeholderTextColor="#999"
            style={sx({
                borderWidth: 1,
                borderColor: 'muted',
                borderRadius: 'default',
                padding: 12,
                fontSize: 'body',
                marginBottom: 16,
                color: 'text',
                backgroundColor: 'background',
            })}
        />
    );
};

export default Input;
