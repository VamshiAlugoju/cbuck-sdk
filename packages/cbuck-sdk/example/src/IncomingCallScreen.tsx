import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

interface IncomingCallProps {
  callerName: string;
  callerNumber: string;
  onAccept: () => void;
  onReject: () => void;
  onMessage: () => void;
  profileImageUri: string;
}

const IncomingCallScreen: React.FC<IncomingCallProps> = ({
  callerName,
  callerNumber,
  onAccept,
  onReject,
  onMessage,
  profileImageUri,
}) => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.timeText}>03:17</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.iconBar}>
          <Text style={{ marginRight: 4 }}>🔋</Text>
          <Text style={{ marginRight: 4 }}>📶</Text>
        </View>
      </View>

      <Text style={styles.title}>Incoming call</Text>

      <View style={styles.profileSection}>
        <Image
          source={{ uri: profileImageUri }}
          style={styles.profileImage}
          resizeMode="cover"
        />
        <Text style={styles.name}>{callerName}</Text>
        <Text style={styles.number}>{callerNumber}</Text>
      </View>

      <View style={styles.statusContainer}>
        {/* <Text style={styles.statusText}>Connecting...</Text> */}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity onPress={onReject} style={styles.rejectButton}>
          <Text style={styles.buttonIcon}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAccept} style={styles.acceptButton}>
          <Text style={styles.buttonIcon}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onMessage} style={styles.smsButton}>
          <Text style={styles.buttonIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.poweredBy}>Powered by</Text>
        <Text style={styles.appBrand}>ChatBucket</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafbfc',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  iconBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    marginVertical: 8,
    fontSize: 18,
    fontWeight: '400',
    color: '#222',
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  profileImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#f2f2f2',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginTop: 4,
  },
  number: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    marginBottom: 8,
    letterSpacing: 1,
  },
  statusContainer: {
    marginVertical: 16,
  },
  statusText: {
    fontSize: 15,
    color: '#5d5d5d',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  rejectButton: {
    backgroundColor: '#e63946',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  acceptButton: {
    backgroundColor: '#34d747',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  smsButton: {
    backgroundColor: '#e9ecef',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonIcon: {
    fontSize: 24,
    color: 'white',
    // Override the icon color for sms button
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  poweredBy: {
    fontSize: 13,
    color: '#888',
  },
  appBrand: {
    fontSize: 14,
    color: '#6774ff',
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});

export default IncomingCallScreen;

// <IncomingCallScreen
//   callerName="Philippe Troussier"
//   callerNumber="84898XXX"
//   onAccept={() => {/* Accept logic */}}
//   onReject={() => {/* Reject logic */}}
//   onMessage={() => {/* Message logic */}}
//   profileImageUri="https://example.com/photo.jpg" // Update to actual source
// />
