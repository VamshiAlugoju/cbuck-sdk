import React, { createContext, useContext, useRef } from "react";
import { Device, types } from "mediasoup-client";

export type DeviceCore = {
  getDevice: () => Device;
  initializeDevice: (
    roomId: string,
    rtpCapabilities: types.RtpCapabilities
  ) => Promise<Device>;
  deviceRef: React.MutableRefObject<Device | null>;
};
