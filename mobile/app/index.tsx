import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  ActivityIndicator, 
  SafeAreaView, 
  Text, 
  TouchableOpacity,
  StatusBar,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { RefreshCcw, WifiOff } from 'lucide-react-native';

// ── CONFIG ──
// Use your local IP to connect from a physical device (Expo Go)
// For Simulator, 'http://localhost:5173' works.
const DEV_URL = 'http://192.168.1.218:5173'; 

export default function WebContainer() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleReload = () => {
    setError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.bg} />
      
      <View style={styles.content}>
        <WebView
          ref={webViewRef}
          source={{ uri: DEV_URL }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setError(true)}
          // Enable common web features
          onMessage={(event) => {
            const rawData = event.nativeEvent.data;
            // Immediate log to terminal so we see anything coming in
            console.log(">>> [WEBVIEW EVENT]:", rawData);
            
            try {
              const data = JSON.parse(rawData);
              if (data.type === 'LOG') {
                console.log(`\x1b[36m[BROWSER LOG]\x1b[0m ${data.message}`);
              }
            } catch (e) {
              // Ignore parse errors for non-JSON messages
            }
          }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={true}
          pullToRefreshEnabled={true}
          keyboardDisplayRequiresUserAction={false}
        />

        {/* Loading Overlay */}
        {loading && !error && (
          <View style={styles.centerOverlay}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Connecting to FiNSHEET...</Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.centerOverlay}>
            <WifiOff size={48} color={Colors.light.textTertiary} />
            <Text style={styles.errorTitle}>Cannot connect to server</Text>
            <Text style={styles.errorSub}>
              Make sure your Vite server is running at:{"\n"}
              <Text style={{ fontWeight: 'bold' }}>{DEV_URL}</Text>
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleReload}>
              <RefreshCcw size={20} color="white" />
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.bg,
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
