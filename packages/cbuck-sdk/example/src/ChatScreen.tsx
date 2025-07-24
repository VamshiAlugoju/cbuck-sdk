import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import type { IMessage } from 'sdk-call';

interface ChatScreenProps {
  currentUserId: string;
  chatPartnerId: string;
  messages: IMessage[];
  onSend: (message: string) => void;
  onBack: () => void;
}

// Message bubble component
const MessageBubble: React.FC<{
  message: IMessage;
  isSentByCurrentUser: boolean;
}> = ({ message, isSentByCurrentUser }) => {
  console.log('message', message);
  return (
    <View
      style={[
        styles.messageContainer,
        isSentByCurrentUser ? styles.bubbleRight : styles.bubbleLeft,
      ]}
    >
      <Text style={isSentByCurrentUser ? styles.textRight : styles.textLeft}>
        {message.text}
      </Text>
    </View>
  );
};

const ChatScreen: React.FC<ChatScreenProps> = ({
  currentUserId,
  chatPartnerId,
  messages,
  onSend,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Scroll to bottom when new message added
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    onSend(inputText.trim());
    setInputText('');
    Keyboard.dismiss();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={90}
      >
        {/* // header  */}
        <View style={{}}>
          <TouchableOpacity
            onPress={() => {
              onBack();
            }}
          >
            <Text style={{ fontSize: 50 }}>{'<-'}</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          ref={flatListRef}
          style={styles.messagesList}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isSentByCurrentUser={item.senderId === currentUserId}
            />
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16 }}
          showsVerticalScrollIndicator={false}
          inverted={false} // Keep messages bottom to top naturally
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type a message"
            placeholderTextColor="#aaa"
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            multiline
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  messagesList: {
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginVertical: 6,
  },
  bubbleLeft: {
    backgroundColor: '#e9ecef',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  bubbleRight: {
    backgroundColor: '#6774ff',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  textLeft: {
    color: '#222',
    fontSize: 15,
    lineHeight: 20,
  },
  textRight: {
    color: '#fff',
    fontSize: 15,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fafbfc',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: '#222',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginRight: 12,
  },
  sendButton: {
    backgroundColor: '#6774ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  sendButtonDisabled: {
    backgroundColor: '#a3abd7',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ChatScreen;
