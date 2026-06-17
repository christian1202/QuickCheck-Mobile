import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Toast, ToastProps, ToastType } from '../../shared/ui/Toast';

interface ToastContextValue {
  showToast: (title: string, message?: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastProps | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((title: string, message?: string, type: ToastType = 'info') => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const id = Date.now().toString();
    setToast({ id, title, message, type });

    // Auto-dismiss after 3.5 seconds
    timeoutRef.current = setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Overlay */}
      {toast && (
        <View style={{
          position: 'absolute',
          top: insets.top,
          left: 0,
          right: 0,
          zIndex: 9999,
          elevation: 9999,
          pointerEvents: 'none',
        }}>
          <Toast key={toast.id} {...toast} />
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
