import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { CallBridge, Client } from 'sdk-call';
import type { CallDetails, IMessage } from 'sdk-call';
import IncomingCallScreen from './IncomingCallScreen';
import OngoingCallScreen from './OngoingCall';
import OutgoingCallScreen from './OutgoingCallScreen';
import IdleScreen from './IdleScreen';
import ChatScreen from './ChatScreen';

export default function App() {
  const [user, setUser] = useState({
    apiKey: 'your-api-key',
    uniqueId: Math.floor(Math.random() * 1000).toString(),
  });

  const [mode, setMode] = useState<'normal' | 'call' | 'chat'>('normal');

  const [messages, setMessages] = useState<IMessage[]>([]);

  const [recipientId, setRecipientId] = useState('');

  const [callState, setCallState] = useState({
    ...Client.callState,
    state: 'outgoing',
  });
  function handleCallStateChange(state: CallDetails) {
    setCallState(state);
  }

  function handleIncomingCall(payload: any) {}

  function handleReceiveMessage(message: any) {
    setMessages((prev) => [...prev, message]);
  }

  function handleCallAnswered(payload: any) {
    setCallState((prev) => {
      return {
        ...prev,
        state: 'ongoing',
      };
    });
  }

  useEffect(() => {
    // if (Client.isValidated) {
    //   return;
    // }

    Client.onIncomingCall(handleIncomingCall);
    Client.onCallStateChange(handleCallStateChange);
    Client.onCallAnswered(handleCallAnswered);
    Client.onReceiveMessage(handleReceiveMessage);
    console.log('user called init');
    setTimeout(() => {
      Client.init(user);
    }, 1000);

    console.log('user called init ========= after');

    return () => {
      Client.cleanUp();
    };
  }, [user]);

  console.log('callState', callState);

  return (
    <View style={styles.container}>
      <CallBridge />
      {(mode === 'call' || mode === 'normal') && (
        <View style={{ flex: 1 }}>
          {callState.state === 'incoming' && (
            <IncomingCallScreen
              callerName="Philippe Troussier"
              callerNumber="84898XXX"
              onAccept={() => {
                Client.acceptCall();
              }}
              onReject={() => {
                Client.rejectCall();
              }}
              onMessage={() => {
                // none
              }}
              profileImageUri="https://picsum.photos/200/300" // Update to actual source
            />
          )}
          {callState.state === 'ongoing' && (
            <OngoingCallScreen
              participantName="Philippe Troussier"
              participantNumber="84898XXX"
              onMute={() => {
                // handle it
              }}
              onSpeaker={() => {
                // handle it
              }}
              onHangup={() => {
                Client.endCall();
              }}
              profileImageUri="https://picsum.photos/200/300" // Update to actual source
              callDuration="03:17"
            />
          )}
          {callState.state === 'outgoing' && (
            <OutgoingCallScreen
              recipientName="Philippe Troussier"
              recipientNumber="84898XXX"
              onMute={() => {
                /* Mute logic */
              }}
              onSpeaker={() => {
                /* Speaker logic */
              }}
              onHangup={() => {
                /* Hangup logic */
                Client.endCall();
              }}
              profileImageUri="https://picsum.photos/200/300" // Update to actual source
            />
          )}
          {callState.state === 'idle' && (
            <IdleScreen
              recipientId={recipientId}
              setRecipientId={setRecipientId}
              onStartCall={(recipientId: string) => {
                Client.startCall({
                  recipientId: recipientId,
                  callType: 'audio',
                });
              }}
              onChat={() => {
                setMode('chat');
              }}
              userId={user.uniqueId}
            />
          )}
        </View>
      )}
      {mode === 'chat' && (
        <View style={{ flex: 1 }}>
          <ChatScreen
            currentUserId={user.uniqueId}
            chatPartnerId={recipientId}
            messages={messages}
            onSend={(message: string) => {
              const id = Math.floor(Math.random() * 100000000).toString();
              Client.sendMessage({
                text: message,
                receiverId: recipientId,
                senderId: user.uniqueId,
                id: id,
              });
              setMessages((prev) => [
                ...prev,
                {
                  id: id,
                  senderId: user.uniqueId,
                  receiverId: recipientId,
                  text: message,
                },
              ]);
            }}
            onBack={() => {
              setMode('normal');
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: 'white',
  },
});

// return (
//   <View style={styles.container}>
//     <CallBridge />

//     <TouchableOpacity
//       style={{
//         backgroundColor: 'blue',
//         padding: 10,
//         alignItems: 'center',
//         marginTop: 20,
//       }}
//       onPress={() => {
//         Client.init(user);
//       }}
//     >
//       <Text>Init</Text>
//     </TouchableOpacity>
//     <Text style={{ marginTop: 20 }}>uniqueId : {user.uniqueId}</Text>
//     <TextInput
//       placeholder="Enter other userId"
//       value={recipientId}
//       onChangeText={(text) => setRecipientId(text)}
//     />
//     <TouchableOpacity
//       style={{
//         backgroundColor: 'green',
//         padding: 10,
//         alignItems: 'center',
//         marginTop: 20,
//       }}
//       onPress={() => {
//         Client.startCall({
//           recipientId: recipientId,
//           callType: 'audio',
//         });
//       }}
//     >
//       <Text>Start Call</Text>
//     </TouchableOpacity>
//     {showIncomingCall && (
//       <View style={{ marginTop: 20 }}>
//         <Text>Call State : {callState.state}</Text>
//         <TouchableOpacity
//           style={{
//             marginTop: 20,
//             backgroundColor: 'green',
//             padding: 10,
//             alignItems: 'center',
//           }}
//           onPress={() => {
//             setShowIncomingCall(false);
//             Client.acceptCall();
//           }}
//         >
//           <Text>Accept Call</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={{
//             marginTop: 20,
//             backgroundColor: 'red',
//             padding: 10,
//             alignItems: 'center',
//           }}
//           onPress={() => {
//             setShowIncomingCall(false);
//             Client.rejectCall();
//           }}
//         >
//           <Text>Reject Call</Text>
//         </TouchableOpacity>
//       </View>
//     )}
//     {callState.state === 'ongoing' && (
//       <View style={{ marginTop: 20 }}>
//         <Text>Call State : {callState.state}</Text>
//         <TouchableOpacity
//           style={{
//             marginTop: 20,
//             backgroundColor: 'red',
//             padding: 10,
//             alignItems: 'center',
//           }}
//           onPress={() => Client.endCall()}
//         >
//           <Text>End Call</Text>
//         </TouchableOpacity>
//       </View>
//     )}
//     <TextInput
//       placeholder="Enter message"
//       value={selfMessage}
//       onChangeText={(text) => setSelfMessage(text)}
//       style={{
//         marginTop: 20,
//       }}
//     />
//     <TouchableOpacity
//       style={{
//         marginTop: 20,
//         backgroundColor: 'orange',
//         padding: 10,
//         alignItems: 'center',
//       }}
//       onPress={() => {
//         if (selfMessage.trim() !== '' && recipientId.trim() !== '') {
//           Client.sendMessage({
//             text: selfMessage,
//             receiverId: recipientId,
//             senderId: user.uniqueId,
//           });
//           setSelfMessage('');
//         }
//       }}
//     >
//       <Text>Send Message</Text>
//     </TouchableOpacity>
//   </View>
// );
