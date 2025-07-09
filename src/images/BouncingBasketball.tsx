import React, { useEffect } from 'react';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { View } from 'react-native';
import BasketballIcon from './BasketballIcon';

const AnimatedView = Animated.createAnimatedComponent(View);

const BouncingBasketball = ({ size = 100 }) => {
    const bounce = useSharedValue(0);

    useEffect(() => {
        bounce.value = withRepeat(
            withSequence(
                withTiming(-10, { duration: 300 }),
                withTiming(0, { duration: 300 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bounce.value }],
    }));

    return (
        <AnimatedView style={animatedStyle}>
            <BasketballIcon size={size} />
        </AnimatedView>
    );
};

export default BouncingBasketball;
