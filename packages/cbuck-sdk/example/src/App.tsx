import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { CallBridge, Client } from 'sdk-call';
import type { CallDetails } from 'sdk-call';

export default function App() {
  const [user, setUser] = useState({
    apiKey: 'your-api-key',
    uniqueId: Math.floor(Math.random() * 1000).toString(),
  });

  const [showIncomingCall, setShowIncomingCall] = useState(false);

  const [recipientId, setRecipientId] = useState('');

  const [callState, setCallState] = useState(Client.callState);
  function handleCallStateChange(state: CallDetails) {
    setCallState(state);
  }

  function handleIncomingCall(payload: any) {
    setShowIncomingCall(true);
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

    Client.init(user);
    Client.onIncomingCall(handleIncomingCall);
    Client.onCallStateChange(handleCallStateChange);
    Client.onCallAnswered(handleCallAnswered);

    return () => {
      Client.cleanUp();
    };
  }, [user]);

  return (
    <View style={styles.container}>
      <CallBridge />

      <TouchableOpacity
        style={{
          backgroundColor: 'blue',
          padding: 10,
          alignItems: 'center',
          marginTop: 20,
        }}
        onPress={() => {
          Client.init(user);
        }}
      >
        <Text>Init</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 20 }}>uniqueId : {user.uniqueId}</Text>
      <TextInput
        placeholder="Enter other userId"
        value={recipientId}
        onChangeText={(text) => setRecipientId(text)}
      />
      <TouchableOpacity
        style={{
          backgroundColor: 'green',
          padding: 10,
          alignItems: 'center',
          marginTop: 20,
        }}
        onPress={() => {
          Client.startCall({
            recipientId: recipientId,
            callType: 'audio',
          });
        }}
      >
        <Text>Start Call</Text>
      </TouchableOpacity>
      {showIncomingCall && (
        <View style={{ marginTop: 20 }}>
          <Text>Call State : {callState.state}</Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: 'green',
              padding: 10,
              alignItems: 'center',
            }}
            onPress={() => {
              setShowIncomingCall(false);
              Client.acceptCall();
            }}
          >
            <Text>Accept Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: 'red',
              padding: 10,
              alignItems: 'center',
            }}
            onPress={() => {
              setShowIncomingCall(false);
              Client.rejectCall();
            }}
          >
            <Text>Reject Call</Text>
          </TouchableOpacity>
        </View>
      )}
      {callState.state === 'ongoing' && (
        <View style={{ marginTop: 20 }}>
          <Text>Call State : {callState.state}</Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: 'red',
              padding: 10,
              alignItems: 'center',
            }}
            onPress={() => Client.endCall()}
          >
            <Text>End Call</Text>
          </TouchableOpacity>
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
