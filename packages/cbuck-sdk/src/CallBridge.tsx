import { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import Client from './CallClient';
import { View } from 'react-native';
import { useState } from 'react';

export const CallBridge = () => {
  const [uri, setUri] = useState('https://example.com');

  const webviewRef = useRef<WebView>(null);

  function handleMessage(incomingPayload: any) {
    try {
      Client.handleWebViewMessage(incomingPayload);
    } catch (error) {
      console.error('Error handling = message:', error);
    }
  }

  async function getWebViewUrl() {
    // todo : get url from backend
    return 'https://fa16ee244dcc.ngrok-free.app/';
  }

  async function initializeWebview() {
    try {
      const url = await getWebViewUrl();
      setUri(url);
    } catch (error) {
      console.error('Error initializing webview:', error);
    }
  }

  useEffect(() => {
    initializeWebview();
  }, []);

  return (
    <View style={{ width: '100%', height: 0, overflow: 'hidden' }}>
      <WebView
        style={{
          width: '100%',
        }}
        ref={(ref) => {
          Client.setWebViewRef(ref);
          webviewRef.current = ref;
        }}
        mixedContentMode="always"
        mediaPlaybackRequiresUserAction={false} // Allow autoplay
        allowsInlineMediaPlayback={true} // iOS inline playback
        javaScriptEnabled={true}
        domStorageEnabled={true}
        allowsFullscreenVideo={true}
        originWhitelist={['*']}
        // source={{ uri: 'http://10.10.0.214:5173' }}
        source={{ uri: uri }}
        // source={{ uri: 'https://3effe2006e71.ngrok-free.app/' }}
        // source={{ uri: 'https://google.com' }}
        useWebView2={true}
        onMessage={({ nativeEvent }) => {
          try {
            // for console logs
            const { type, args }: { type: keyof Console; args: any[] } =
              JSON.parse(nativeEvent.data);

            if (typeof console[type] === 'function') {
              (console[type] as (...args: any[]) => void)(
                '🌐 WebView:',
                ...args
              );
            } else {
              handleMessage(nativeEvent.data);
            }
          } catch (e) {
            handleMessage(nativeEvent.data);
          }
        }}
        injectedJavaScript={`
             (function() {
               ['log', 'warn', 'error', 'info', 'debug'].forEach(function (level) {
                 const original = console[level];
                 console[level] = function (...args) {
                   try {
                     window.ReactNativeWebView.postMessage(JSON.stringify({ type: level, args }));
                   } catch (_) {}
                   original.apply(console, args);
                 };
               });
             })();
             true;
           `}
      />
    </View>
  );
};
