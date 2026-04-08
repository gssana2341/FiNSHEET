import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
  NativeModules,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { RefreshCcw, WifiOff } from 'lucide-react-native';
import { pdfService } from '@/services/PdfService';

// ── CONFIG ──
const DEV_URL = 'http://192.168.1.218:5173'; 

export default function WebContainer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleReload = () => {
    setError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0f172a' }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        translucent={true} 
        backgroundColor="transparent"
      />
      <SafeAreaView style={styles.content} edges={['top']}>
        <WebView
          ref={webViewRef}
          source={{ uri: DEV_URL }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => {
            setLoading(false);
            const hasRenderer = !!NativeModules.PdfToImage;
            webViewRef.current?.postMessage(JSON.stringify({
              type: 'NATIVE_HEALTH_CHECK',
              payload: { hasRenderer }
            }));
          }}
          onError={() => setError(true)}
          onMessage={async (event) => {
            const rawData = event.nativeEvent.data;
            try {
              const data = JSON.parse(rawData);
              switch (data.type) {
                case 'LOG':
                  console.log(`\x1b[36m[BROWSER LOG]\x1b[0m ${data.message || 'null'}`);
                  break;
                case 'SET_THEME':
                  setIsDarkMode(data.payload.isDark);
                  break;
                case 'PICK_PDF': {
                  console.log('[Native] Picking PDF...');
                  const pdf = await pdfService.pickAndStorePdf();
                  if (pdf) {
                    webViewRef.current?.postMessage(JSON.stringify({
                      type: 'PDF_PICKED',
                      payload: pdf
                    }));
                    try {
                      const base64Data = await FileSystem.readAsStringAsync(pdf.uri, { encoding: 'base64' });
                      webViewRef.current?.postMessage(JSON.stringify({
                        type: 'PDF_DATA_SYNC',
                        payload: { id: pdf.id, base64: base64Data }
                      }));
                    } catch (readErr) {
                      console.error('[Native] Failed to read PDF for sync:', readErr);
                    }
                  }
                  break;
                }
                case 'REQUEST_PAGE': {
                  const { requestId, id, pageIndex, scale } = data.payload;
                  try {
                    const base64 = await pdfService.getPageImage(id, pageIndex, scale);
                    if (base64) {
                      webViewRef.current?.postMessage(JSON.stringify({
                        type: 'PAGE_RESPONSE',
                        payload: { requestId, base64, width: 595, height: 842 }
                      }));
                    }
                  } catch (err) {
                    console.error('[Native] Rendering error:', err);
                  }
                  break;
                }
                default:
                  console.log(">>> [WEBVIEW EVENT]:", data);
              }
            } catch (e) {
              console.log(">>> [WEBVIEW EVENT (Raw)]:", rawData);
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
          keyboardDisplayRequiresUserAction={false}
        />

        {loading && !error && (
          <View style={[styles.centerOverlay, isDarkMode && { backgroundColor: '#0f172a' }]}>
            <ActivityIndicator size="large" color={isDarkMode ? '#ffffff' : Colors.light.primary} />
            <Text style={[styles.loadingText, isDarkMode && { color: '#94a3b8' }]}>Connecting to FiNSHEET...</Text>
          </View>
        )}

        {error && (
          <View style={[styles.centerOverlay, isDarkMode && { backgroundColor: '#0f172a' }]}>
            <WifiOff size={48} color={isDarkMode ? '#f8fafc' : Colors.light.textTertiary} />
            <Text style={[styles.errorTitle, isDarkMode && { color: '#f8fafc' }]}>Cannot connect to server</Text>
            <Text style={[styles.errorSub, isDarkMode && { color: '#94a3b8' }]}>
              Make sure your Vite server is running at:{"\n"}
              <Text style={{ fontWeight: 'bold' }}>{DEV_URL}</Text>
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleReload}>
              <RefreshCcw size={20} color="white" />
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f0e9',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  centerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.light.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    zIndex: 10,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.light.textSecondary,
    fontSize: FontSize.bodySm,
  },
  errorTitle: {
    fontSize: FontSize.h2,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.lg,
    color: Colors.light.text,
  },
  errorSub: {
    fontSize: FontSize.bodySm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    alignItems: 'center',
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontWeight: FontWeight.bold,
    fontSize: FontSize.body,
  }
});
