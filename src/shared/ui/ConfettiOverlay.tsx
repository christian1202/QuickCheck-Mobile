import React, { useEffect } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CONFETTI_COLORS = ['#FFC107', '#E91E63', '#00BCD4', '#8BC34A', '#9C27B0', '#FF5722'];
const NUM_PARTICLES = 40;

interface ParticleProps {
  index: number;
}

const Particle: React.FC<ParticleProps> = ({ index }) => {
  const isCircle = index % 2 === 0;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const size = 8 + Math.random() * 8;
  const startX = Math.random() * SCREEN_WIDTH;
  
  // Randomize destination and rotation
  const endY = SCREEN_HEIGHT + 100;
  const endX = startX + (Math.random() - 0.5) * 200;
  const duration = 1500 + Math.random() * 1500;
  const delay = Math.random() * 500;
  
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value > 0.8 ? 1 - (progress.value - 0.8) * 5 : 1,
      transform: [
        { translateX: startX + (endX - startX) * progress.value },
        { translateY: -50 + endY * progress.value },
        { rotate: `${progress.value * 360 * 2}deg` }
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : 2,
        },
        animatedStyle,
      ]}
    />
  );
};

interface ConfettiOverlayProps {
  play: boolean;
  onAnimationEnd?: () => void;
}

export const ConfettiOverlay: React.FC<ConfettiOverlayProps> = ({ play, onAnimationEnd }) => {
  if (!play) return null;

  // We can just trigger onAnimationEnd after a timeout of max duration
  useEffect(() => {
    if (play && onAnimationEnd) {
      const timer = setTimeout(() => {
        onAnimationEnd();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [play]);

  return (
    <Animated.View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: NUM_PARTICLES }).map((_, i) => (
        <Particle key={i} index={i} />
      ))}
    </Animated.View>
  );
};
