import React, { useRef, useEffect } from "react";
import { WebView } from "react-native-webview";

let webViewRef: React.RefObject<WebView<{}> | null>;

// Initialize the WebView ref at the module/global level
webViewRef = React.createRef<WebView<{}>>();

export const CallManager = () => {
  return (
    <WebView
      ref={webViewRef}
      source={{ uri: "https://example.com" }}
      style={{ width: 0, height: 0, opacity: 0 }} // keep it hidden
      javaScriptEnabled={true}
      domStorageEnabled={true}
      originWhitelist={["*"]}
      onMessage={(event) => {
        const data = event.nativeEvent.data;
        console.log("Message from WebView:", data);
      }}
    />
  );
};

export { webViewRef };
