import React from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';

const BasketballIcon = ({ size = 64, color = '#F15A24' }) => (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        {/* Outer circle */}
        <Circle cx="32" cy="32" r="30" stroke={color} strokeWidth="4" fill="#F7931E" />
        {/* Vertical lines */}
        <Line x1="32" y1="2" x2="32" y2="62" stroke={color} strokeWidth="3" />
        <Line x1="14" y1="10" x2="50" y2="54" stroke={color} strokeWidth="3" />
        <Line x1="14" y1="54" x2="50" y2="10" stroke={color} strokeWidth="3" />
        {/* Curves */}
        <Path
            d="M2 32a30 30 0 0 1 60 0"
            stroke={color}
            strokeWidth="3"
            fill="none"
        />
        <Path
            d="M2 32a30 30 0 0 0 60 0"
            stroke={color}
            strokeWidth="3"
            fill="none"
        />
    </Svg>
);

export default BasketballIcon;
