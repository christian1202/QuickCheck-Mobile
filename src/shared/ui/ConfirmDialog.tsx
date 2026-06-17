import React, { useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, Layout } from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';

export interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  danger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = 'warning',
  danger = false,
}) => {
  const { theme } = useTheme();
  const { colors, spacing, radius } = theme;

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }]}
        >
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View
              entering={ZoomIn.duration(250).springify().damping(18).stiffness(200)}
              exiting={ZoomOut.duration(200)}
              layout={Layout.springify()}
              style={{
                width: '85%',
                backgroundColor: colors.surface,
                borderRadius: radius['2xl'],
                padding: spacing.xl,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,
                elevation: 10,
              }}
            >
              {/* Icon Container */}
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: danger ? colors.errorContainer : colors.secondaryContainer,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: spacing.lg,
              }}>
                <MaterialIcons 
                  name={icon} 
                  size={32} 
                  color={danger ? colors.error : colors.secondary} 
                />
              </View>

              {/* Text Content */}
              <Text style={{
                fontFamily: 'Manrope-Bold',
                fontSize: 20,
                color: colors.onSurface,
                textAlign: 'center',
                marginBottom: spacing.sm,
              }}>
                {title}
              </Text>
              <Text style={{
                fontFamily: 'Inter',
                fontSize: 14,
                color: colors.onSurfaceVariant,
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: spacing['2xl'],
              }}>
                {message}
              </Text>

              {/* Buttons */}
              <View style={{ flexDirection: 'row', gap: spacing.md, width: '100%' }}>
                <TouchableOpacity
                  onPress={onCancel}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.md,
                    borderRadius: radius.full,
                    backgroundColor: colors.surfaceContainerHighest,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: colors.onSurface }}>
                    {cancelText}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={onConfirm}
                  style={{
                    flex: 1,
                    paddingVertical: spacing.md,
                    borderRadius: radius.full,
                    backgroundColor: danger ? colors.error : colors.primary,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: 'Inter-SemiBold', fontSize: 15, color: danger ? colors.onError : colors.onPrimary }}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
