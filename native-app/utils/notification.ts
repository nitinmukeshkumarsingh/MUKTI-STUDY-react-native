import Toast from 'react-native-toast-message';

export const notify = {
  success: (message: string, description?: string) => {
    Toast.show({
      type: 'success',
      text1: message,
      text2: description,
    });
  },
  error: (message: string, description?: string) => {
    Toast.show({
      type: 'error',
      text1: message,
      text2: description,
    });
  },
  info: (message: string, description?: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: description,
    });
  },
  warning: (message: string, description?: string) => {
    Toast.show({
      type: 'info',
      text1: message,
      text2: description,
    });
  },
  custom: (message: string, options?: any) => {
    Toast.show({
      type: 'info',
      text1: message,
      ...options
    });
  }
};
