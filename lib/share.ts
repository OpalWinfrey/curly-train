import { Platform, Share } from 'react-native';
import { showAlert } from './alert';

// Share.share rejects on browsers without the Web Share API (most desktop
// browsers), so fall back to copying the text to the clipboard there.
export async function shareOrCopy(content: { title?: string; message: string; url?: string }) {
  try {
    await Share.share(content);
  } catch (err) {
    if (Platform.OS !== 'web') throw err;
    if (err instanceof Error && err.name === 'AbortError') return; // user dismissed the share sheet
    const text = content.url && !content.message.includes(content.url)
      ? `${content.message}\n${content.url}`
      : content.message;
    try {
      await navigator.clipboard.writeText(text);
      showAlert('Copied to clipboard');
    } catch {
      showAlert('Sharing is not supported in this browser');
    }
  }
}
