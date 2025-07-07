import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { useSx, SxProp } from 'dripsy';

type Props = TouchableOpacityProps & {
    sx?: SxProp;
};

const Touchable = ({ sx: sxProp, style, ...props }: Props) => {
    const sx = useSx();

    return (
        <TouchableOpacity
            {...props}
            activeOpacity={0.7}
            style={[sx(sxProp || {}), style]}
        />
    );
};

export default Touchable;
