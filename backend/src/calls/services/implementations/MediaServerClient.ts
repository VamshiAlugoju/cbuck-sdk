import { Injectable } from '@nestjs/common';

import axios, { AxiosInstance } from 'axios';

@Injectable()
class MediaServerClient {
  private readonly axiosClient: AxiosInstance;

  constructor() {
    this.axiosClient = axios.create({
      baseURL: process.env.MEDIA_SERVER_BASE_URL,
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(process.env.MEDIA_SERVER_BASE_URL);
  }

  async getRTPCapabilities(
    initiatorId: string,
    callId: string,
    participantId: string,
    roomId: string,
  ) {
    console.log(process.env.MEDIA_SERVER_BASE_URL);

    const res = await this.axiosClient.post('/mediaserver/start_call', {
      userId: initiatorId,
      callId,
      participantId,
      roomId,
    });

    return res.data;
  }

  async handleAnswerCall(
    roomId: string,
    userId: string,
    participantId: string,
  ) {
    const res = await this.axiosClient.post('/mediaserver/answer_call', {
      roomId,
      userId,
      participantId,
    });

    return res.data;
  }

  async endCall(roomId: string) {
    const res = await this.axiosClient.post('/mediaserver/close_room', {
      roomId,
    });
    return res.data;
  }

  async leaveCall(roomId: string, participantId: string) {
    const res = await this.axiosClient.post('/mediaserver/clear_participant', {
      roomId,
      participantId,
    });
    return res.data;
  }

  async createProducerTransport(roomId: string, participantId: string) {
    const res = await axios.post(
      process.env.MEDIA_SERVER_BASE_URL +
      '/mediaserver/create_producer_transport',
      {
        roomId,
        participantId,
      },
    );

    return res.data;
  }

  async createConsumerTransport(roomId: string, participantId: string) {
    const res = await axios.post(
      process.env.MEDIA_SERVER_BASE_URL +
      '/mediaserver/create_consumer_transport',
      {
        roomId,
        participantId,
      },
    );

    return res.data;
  }

  async connectProducerTransport(
    roomId: string,
    participantId: string,
    dtlsParameters: any, // TODO: Replace 'any' with DTLSParameters type if available
  ) {
    const res = await axios.post(
      process.env.MEDIA_SERVER_BASE_URL +
      '/mediaserver/connect_producer_transport',
      {
        roomId,
        participantId,
        dtlsParameters,
      },
    );

    return res.data;
  }

  async connectConsumerTransport(
    roomId: string,
    participantId: string,
    dtlsParameters: any, // TODO: Replace 'any' with DTLSParameters type if available
  ) {
    const res = await axios.post(
      process.env.MEDIA_SERVER_BASE_URL +
      '/mediaserver/connect_consumer_transport',
      {
        roomId,
        participantId,
        dtlsParameters,
      },
    );

    return res.data;
  }

  async produce(
    roomId: string,
    participantId: string,
    kind: 'audio' | 'video',
    rtpParameters: any,
    appData?: any,
  ) {
    const res = await axios.post(
      process.env.MEDIA_SERVER_BASE_URL + '/mediaserver/produce',
      {
        roomId,
        participantId,
        kind,
        rtpParameters,
        appData,
      },
    );

    return res.data;
  }

  async consume(
    roomId: string,
    participantId: string,
    producerId: string,
    producerClientId: string,
    rtpCapabilities: any,
  ) {
    const res = await axios.post(
      process.env.MEDIA_SERVER_BASE_URL + '/mediaserver/consume',
      {
        roomId,
        participantId,
        producerId,
        producerClientId,
        rtpCapabilities,
      },
    );

    return res.data;
  }

  async unpauseConsumer(roomId: string, consumerId: string) {
    const res = await axios.post(
      process.env.MEDIA_SERVER_BASE_URL + '/mediaserver/unpause_consumer',
      {
        roomId,
        consumerId,
      },
    );
    return res.data;
  }

  async removeParticipant(roomId: string, participantId: string) {
    const res = await this.axiosClient.post('/mediaserver/clear_participant', {
      roomId,
      participantId,
    });

    return;
  }
  async closeRoom(roomId: string) {
    const res = await this.axiosClient.post('/mediaserver/close_room', {
      roomId,
    });
    return res;
  }

  async createMediaServerRoom(
    initiatorId: string,
    callId: string,
    roomId: string,
  ) {
    const res = await this.axiosClient.post('/mediaserver/create_room', {
      userId: initiatorId,
      callId,
      roomId,
    });

    return res.data;
  }

  async consumeData(roomId: string, participantId: string) {
    const res = await this.axiosClient.post(`/mediaserver/ConsumeData`, {
      roomId,
      participantId,
    });

    return res.data;
  }

  async cloneParticipant(
    roomId: string,
    participant_id: string,
    old_participant_id: string,
  ) {
    const res = await this.axiosClient.post(`/mediaserver/clone_participant`, {
      roomId,
      participant_id,
      old_participant_id,
    });

    return res.data;
  }
  async stopScreenSharing(roomId: string, participantId: string) {
    const res = await this.axiosClient.post(`/mediaserver/stop_screensharing`, {
      roomId,
      participantId,
    });

    return res.data;
  }

  async translate(roomId: string, producerId: string, targetLang: string, initiatedUser: string) {
    const res = await this.axiosClient.post(`/mediaserver/translate`, {
      roomId,
      producerId,
      targetLang,
      initiatedUser
    })
    return res.data
  }
}

export default MediaServerClient;
