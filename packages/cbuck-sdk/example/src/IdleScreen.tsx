import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

interface IdleScreenProps {
  onStartCall: (recipientId: string) => void;
  onChat: () => void;
  userId: string;
  setRecipientId: (recipientId: string) => void;
  recipientId: string;
}

const IdleScreen: React.FC<IdleScreenProps> = ({
  onStartCall,
  onChat,
  userId,
  setRecipientId,
  recipientId,
}) => {
  const handleStartCall = () => {
    if (recipientId.trim()) {
      onStartCall(recipientId.trim());
    } else {
      // Maybe add validation alert or shake animation later
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.innerContainer}
      >
        <Text style={styles.title}>Welcome to ChatBucket</Text>
        <Text style={styles.title}> Your ID is: {userId} </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Recipient ID"
          placeholderTextColor="#888"
          value={recipientId}
          onChangeText={setRecipientId}
          autoCapitalize="none"
          keyboardType="default"
          returnKeyType="done"
          // optionally add onSubmitEditing={handleStartCall}
        />

        <TouchableOpacity
          style={[
            styles.button,
            recipientId.trim() ? styles.buttonActive : styles.buttonDisabled,
          ]}
          onPress={handleStartCall}
          disabled={!recipientId.trim()}
        >
          <Text style={styles.buttonText}>Start Call</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatButton} onPress={onChat}>
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // consistent with ongoing/outgoing screens
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#6774ff', // branding color from previous screens
    marginBottom: 42,
  },
  input: {
    width: '100%',
    height: 52,
    borderColor: '#e9ecef',
    borderWidth: 1.6,
    borderRadius: 28,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#222',
    marginBottom: 24,
    backgroundColor: '#fafbfc',
    shadowColor: '#6774ff',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  buttonActive: {
    backgroundColor: '#6774ff',
  },
  buttonDisabled: {
    backgroundColor: '#a3abd7',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatButton: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 28,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default IdleScreen;
