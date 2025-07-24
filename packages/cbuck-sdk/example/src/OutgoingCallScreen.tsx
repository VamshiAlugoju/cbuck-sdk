import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

interface OutgoingCallProps {
  recipientName: string;
  recipientNumber: string;
  onMute: () => void;
  onSpeaker: () => void;
  onHangup: () => void;
  profileImageUri: string;
}

const OutgoingCallScreen: React.FC<OutgoingCallProps> = ({
  recipientName,
  recipientNumber,
  onMute,
  onSpeaker,
  onHangup,
  profileImageUri,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTime}>03:17</Text>
        <View style={{ flex: 1 }} />
        <View style={styles.statusIcons}>
          <Text style={{ marginRight: 6 }}>📶</Text>
          <Text>🔋</Text>
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>Outgoing call</Text>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image source={{ uri: profileImageUri }} style={styles.profileImage} />
        <Text style={styles.nameText}>{recipientName}</Text>
        <Text style={styles.numberText}>{recipientNumber}</Text>
      </View>

      {/* Connecting Text */}
      <View style={styles.connectingContainer}>
        <Text style={styles.connectingText}>Connecting...</Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.controlButton} onPress={onMute}>
          <Text style={styles.controlIcon}>🔇</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.hangupButton} onPress={onHangup}>
          <Text style={styles.hangupIcon}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={onSpeaker}>
          <Text style={styles.controlIcon}>🔊</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by</Text>
        <Text style={styles.brandText}>ChatBucket</Text>
      </View>
    </SafeAreaView>
  );
};

export default OutgoingCallScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    alignItems: 'stretch',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  headerTime: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 2,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  title: {
    marginTop: 14,
    fontSize: 18,
    color: '#181818',
    textAlign: 'center',
    fontWeight: '500',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 22,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#eee',
    marginBottom: 8,
  },
  nameText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  numberText: {
    fontSize: 14,
    color: '#888',
    marginTop: 3,
    letterSpacing: 0.75,
  },
  connectingContainer: {
    alignItems: 'center',
    marginVertical: 18,
  },
  connectingText: {
    fontSize: 15,
    color: '#5d5d5d',
    fontWeight: '500',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  controlButton: {
    backgroundColor: '#e9ecef',
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  controlIcon: {
    fontSize: 22,
    color: '#333',
  },
  hangupButton: {
    backgroundColor: '#e63946',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  hangupIcon: {
    fontSize: 28,
    color: '#fff',
    transform: [{ rotate: '135deg' }],
  },
  footer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#888',
  },
  brandText: {
    fontSize: 14,
    color: '#6774ff',
    fontWeight: '600',
    letterSpacing: 1.2,
  },
});
