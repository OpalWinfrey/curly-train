import { Alert, Platform, type AlertButton } from 'react-native';

// react-native-web's Alert.alert is a no-op, so on web fall back to the
// browser's native dialogs. With buttons, the first non-cancel button runs
// if the user confirms.
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  const action = buttons?.find(b => b.style !== 'cancel');
  if (buttons && buttons.length > 1 && action) {
    if (window.confirm(text)) action.onPress?.();
    else buttons.find(b => b.style === 'cancel')?.onPress?.();
  } else {
    window.alert(text);
    action?.onPress?.();
  }
}
