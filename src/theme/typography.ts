// Typography tokens — Manrope (display/headline) + Inter (body/label)
import { Platform } from 'react-native';

export const FontFamily = {
  headline: Platform.select({ web: 'Manrope', default: 'Manrope' }),
  headlineBold: Platform.select({ web: 'Manrope', default: 'Manrope-Bold' }),
  headlineExtraBold: Platform.select({ web: 'Manrope', default: 'Manrope-ExtraBold' }),
  body: Platform.select({ web: 'Inter', default: 'Inter' }),
  bodyMedium: Platform.select({ web: 'Inter', default: 'Inter-Medium' }),
  bodySemiBold: Platform.select({ web: 'Inter', default: 'Inter-SemiBold' }),
  label: Platform.select({ web: 'Inter', default: 'Inter' }),
} as const;

export const FontSize = {
  displayLg: 56,   // Hero stats (3.5rem)
  displayMd: 45,
  displaySm: 36,
  headlineLg: 32,
  headlineMd: 28,
  headlineSm: 24,  // Section headers (1.5rem)
  titleLg: 22,
  titleMd: 18,
  titleSm: 16,     // Member names (1rem)
  bodyLg: 16,      // Interactive text minimum
  bodyMd: 14,
  bodySm: 13,
  labelLg: 14,
  labelMd: 12,     // Metadata labels (0.75rem)
  labelSm: 11,     // Small labels
  labelXs: 10,     // Tiny labels / tracking
} as const;

export const LetterSpacing = {
  tight: -0.5,
  tighter: -1,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 1.6,    // Labels uppercase
} as const;

export const LineHeight = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// Pre-built text style presets
export const TextStyles = {
  displayLg: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: FontSize.displayLg,
    letterSpacing: LetterSpacing.tighter,
    lineHeight: FontSize.displayLg * LineHeight.tight,
  },
  displaySm: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: FontSize.displaySm,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.displaySm * LineHeight.tight,
  },
  headlineLg: {
    fontFamily: FontFamily.headlineExtraBold,
    fontSize: FontSize.headlineLg,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.headlineLg * LineHeight.snug,
  },
  headlineMd: {
    fontFamily: FontFamily.headlineBold,
    fontSize: FontSize.headlineMd,
    letterSpacing: LetterSpacing.tight,
    lineHeight: FontSize.headlineMd * LineHeight.snug,
  },
  headlineSm: {
    fontFamily: FontFamily.headlineBold,
    fontSize: FontSize.headlineSm,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.headlineSm * LineHeight.snug,
  },
  titleLg: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.titleLg,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.titleLg * LineHeight.normal,
  },
  titleMd: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.titleMd,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.titleMd * LineHeight.normal,
  },
  titleSm: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.titleSm,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.titleSm * LineHeight.normal,
  },
  bodyLg: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyLg,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.bodyLg * LineHeight.relaxed,
  },
  bodyMd: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodyMd,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.bodyMd * LineHeight.relaxed,
  },
  bodySm: {
    fontFamily: FontFamily.body,
    fontSize: FontSize.bodySm,
    letterSpacing: LetterSpacing.normal,
    lineHeight: FontSize.bodySm * LineHeight.normal,
  },
  labelLg: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelLg,
    letterSpacing: LetterSpacing.wide,
    lineHeight: FontSize.labelLg * LineHeight.normal,
  },
  labelMd: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelMd,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
    lineHeight: FontSize.labelMd * LineHeight.normal,
  },
  labelSm: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelSm,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
    lineHeight: FontSize.labelSm * LineHeight.normal,
  },
  labelXs: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.labelXs,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
    lineHeight: FontSize.labelXs * LineHeight.normal,
  },
} as const;
