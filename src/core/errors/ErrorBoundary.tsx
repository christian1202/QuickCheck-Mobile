// ============================================================
// QuickCheck — Error Boundary
// ============================================================
// Catches unhandled errors in the React component tree.
// Prevents full app crashes — shows a fallback UI instead.
// Logs all caught errors through the structured logger.
//
// Usage:
//   <ErrorBoundary>
//     <App />
//   </ErrorBoundary>
// ============================================================

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { logger } from '../logging/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error(
      'ErrorBoundary',
      'Unhandled render error caught by boundary',
      error,
      { componentStack: errorInfo.componentStack },
    );

    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    logger.info('ErrorBoundary', 'Error boundary reset by user');
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

// ─── Default Fallback UI ────────────────────────────────────

interface DefaultErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, onReset }) => {
  const errorMessage = error?.message ?? 'An unexpected error occurred.';

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{errorMessage}</Text>
      {__DEV__ && error?.stack && (
        <View style={styles.stackContainer}>
          <Text style={styles.stackText} numberOfLines={10}>
            {error.stack}
          </Text>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={onReset} activeOpacity={0.7}>
        <Text style={styles.buttonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Manrope-Bold',
    fontSize: 22,
    color: '#1A1A2E',
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Inter',
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  stackContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    width: '100%',
    maxHeight: 150,
  },
  stackText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#999',
    lineHeight: 16,
  },
  button: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 15,
    color: '#FFF',
  },
});