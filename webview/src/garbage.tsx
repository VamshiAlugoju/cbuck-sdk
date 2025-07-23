// // function RenderComponent({
// //     participant,
// //     callState,
// //   }: {
// //     participant: Participant;
// //     callState: CallDetails;
// //   }) {
// //     const audioConsumer = participant.audioConsumer;
// //     const videoConsumer = participant.videoConsumer;

// //     const videoRef = useRef<HTMLVideoElement>(null);
// //     const audioRef = useRef<HTMLAudioElement>(null);

// //     useEffect(() => {
// //       if (videoConsumer && videoRef.current) {
// //         const stream = new MediaStream();
// //         stream.addTrack(videoConsumer.track);
// //         videoRef.current.srcObject = stream;
// //         videoRef.current.play();
// //       }
// //       if (audioConsumer && audioRef.current) {
// //         const stream = new MediaStream();
// //         stream.addTrack(audioConsumer.track);
// //         audioRef.current.srcObject = stream;
// //       }
// //     }, [videoConsumer, audioConsumer]);

// //     const VideoComponent = () => {
// //       return (
// //         <video
// //           className="w-full h-full min-w-[300px] min-h-[300px] bg-black "
// //           ref={videoRef}
// //           autoPlay
// //           playsInline
// //           style={{ width: 400, height: 300 }}
// //         />
// //       );
// //     };

// //     return (
// //       <div key={participant.participantId} className="p-4">
// //         <VideoComponent />
// //         <audio ref={audioRef} autoPlay hidden />
// //         <button onClick={() => audioConsumer?.pause()}>mute</button>
// //         <button onClick={() => audioConsumer?.resume()}>unmute</button>
// //         <button onClick={() => videoConsumer?.pause()}>pause</button>
// //         <button onClick={() => videoConsumer?.resume()}>resume</button>
// //       </div>
// //     );
// //   }

// function initialiseCallSockets(socket: Socket) {
//   socket.on(incomingCallEvents.INCOMING_CALL, (data) => {
//     console.log(data);
//   });
// }

// function initialiseMediaSockets(socket: Socket) {}
