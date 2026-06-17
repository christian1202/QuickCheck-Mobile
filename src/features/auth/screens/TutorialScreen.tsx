import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../shared/theme';
import { Button } from '../../../shared/ui';
import { useAuth } from '../hooks/useAuth';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: 1,
    title: 'Add Members & Events',
    description: 'Keep your entire congregation organized directly on your device.',
    icon: 'people-alt' as const,
  },
  {
    id: 2,
    title: 'Track Attendance Fast',
    description: 'Lightning-fast check-ins so you can focus on what matters.',
    icon: 'fact-check' as const,
  },
  {
    id: 3,
    title: 'Secure Google Backup',
    description: 'Never lose your data. Automatically syncs to Google Sheets.',
    icon: 'cloud-done' as const,
  },
];

export const TutorialScreen: React.FC = () => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;
  const { loginWithGoogle, isLoading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err.message !== 'Google Sign-In was cancelled.') {
        Alert.alert('Sign-In Failed', err.message || 'An error occurred.');
      }
    }
  };

  const handleScroll = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };

  const nextSlide = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: true });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {SLIDES.map((slide, index) => (
          <View
            key={slide.id}
            style={{
              width,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: spacing['2xl'],
            }}
          >
            <View style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: colors.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing['3xl'],
            }}>
              <MaterialIcons name={slide.icon} size={60} color={colors.primary} />
            </View>
            <Text style={{
              fontFamily: 'Manrope-Bold',
              fontSize: 28,
              color: colors.onSurface,
              textAlign: 'center',
              marginBottom: spacing.md,
            }}>
              {slide.title}
            </Text>
            <Text style={{
              fontFamily: 'Inter',
              fontSize: 16,
              color: colors.onSurfaceVariant,
              textAlign: 'center',
              lineHeight: 24,
            }}>
              {slide.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Pagination & Actions */}
      <View style={{ padding: spacing['2xl'], paddingBottom: spacing['4xl'] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: spacing['3xl'], gap: 8 }}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? colors.primary : colors.outlineVariant,
              }}
            />
          ))}
        </View>

        {currentIndex === SLIDES.length - 1 ? (
          <Button
            title="Sign in with Google"
            onPress={handleLogin}
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading}
            icon={<MaterialIcons name="login" size={20} color={colors.white} />}
          />
        ) : (
          <Button
            title="Next"
            onPress={nextSlide}
            variant="secondary"
            size="lg"
            fullWidth
          />
        )}
      </View>
    </SafeAreaView>
  );
};
