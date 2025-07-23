import React, { useRef, useEffect } from "react";
import { WebView } from "react-native-webview";
import { Config, StartCallParams } from "./index";
import { webViewRef } from "./comp.tsx";

export const init = (config: Config) => {
  console.log("INIT CALL:", config);
};

export const startCall = (params: StartCallParams) => {
  // Use ref to send JS or postMessage
  if (webViewRef.current) {
    webViewRef.current.postMessage(
      JSON.stringify({ type: "START_CALL", payload: params })
    );
  }
};
