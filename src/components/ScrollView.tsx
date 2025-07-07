import React from 'react';
import {
    ScrollView as RNScrollView,
    ScrollViewProps as RNScrollViewProps,
} from 'react-native';
import { useSx, SxProp } from 'dripsy';

type Props = RNScrollViewProps & {
    sx?: SxProp;
};

const ScrollView = ({ sx: sxProp, style, children, ...props }: Props) => {
    const sx = useSx();

    return (
        <RNScrollView
            {...props}
            contentContainerStyle={[sx(sxProp || {}), style]}
        >
            {children}
        </RNScrollView>
    );
};

export default ScrollView;
