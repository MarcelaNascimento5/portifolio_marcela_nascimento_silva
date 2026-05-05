import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { WebView } from 'react-native-webview';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { TRAINERS } from '@/data/trainers';
import { useSessions } from '@/hooks/use-sessions';

export default function VideoCallScreen() {
  const { roomId, trainerId, trainerName } = useLocalSearchParams<{
    roomId: string;
    trainerId: string;
    trainerName: string;
  }>();
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addSession } = useSessions();
  const startTime = useRef(Date.now());

  // Keep screen awake during call
  useKeepAwake();

  const trainer = TRAINERS.find((t) => t.id === trainerId);

  // Jitsi Meet URL — using the public meet.jit.si server
  const jitsiUrl = `https://meet.jit.si/${roomId}`;

  // HTML injection to configure Jitsi Meet options
  const jitsiConfig = `
    window.addEventListener('load', function() {
      // Auto-configure display name
      try {
        var domain = 'meet.jit.si';
        var options = {
          roomName: '${roomId}',
          width: '100%',
          height: '100%',
          parentNode: document.querySelector('#meet'),
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            prejoinPageEnabled: false,
            enableWelcomePage: false,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup', 'chat', 'tileview'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_REMOTE_DISPLAY_NAME: '${trainerName || 'Personal Trainer'}',
          },
          userInfo: {
            displayName: 'Aluno FitCoach'
          }
        };
      } catch(e) {}
    });
  `;

  const handleEndCall = () => {
    Alert.alert(
      'Encerrar Aula',
      'Deseja encerrar a videochamada com o personal trainer?',
      [
        { text: 'Continuar', style: 'cancel' },
        {
          text: 'Encerrar',
          style: 'destructive',
          onPress: async () => {
            // Save session to history
            const duration = Math.round((Date.now() - startTime.current) / 60000);
            if (trainer) {
              await addSession({
                id: `session-${Date.now()}`,
                trainerId: trainer.id,
                trainerName: trainer.name,
                trainerAvatar: trainer.avatar,
                date: new Date().toISOString(),
                duration: Math.max(duration, 1),
                specialty: trainer.specialty[0],
                roomId: roomId || '',
              });
            }
            router.back();
          },
        },
      ]
    );
  };

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style="light" />
        <View style={styles.webFallback}>
          <IconSymbol name="video.fill" size={48} color={colors.primary} />
          <Text style={[styles.webFallbackTitle, { color: colors.foreground }]}>
            Videochamada Jitsi Meet
          </Text>
          <Text style={[styles.webFallbackText, { color: colors.muted }]}>
            Sala: {roomId}
          </Text>
          <Text style={[styles.webFallbackText, { color: colors.muted }]}>
            Trainer: {trainerName}
          </Text>
          <Pressable
            onPress={() => {
              const url = `https://meet.jit.si/${roomId}`;
              // On web, open in new tab
              if (typeof window !== 'undefined') {
                window.open(url, '_blank');
              }
            }}
            style={[styles.openJitsiBtn, { backgroundColor: colors.primary }]}
          >
            <IconSymbol name="video.fill" size={18} color="#FFF" />
            <Text style={styles.openJitsiBtnText}>Abrir no Jitsi Meet</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={[styles.backBtnText, { color: colors.muted }]}>Voltar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#000000' }]}>
      <StatusBar style="light" />

      {/* Header overlay */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <View style={[styles.liveBadge, { backgroundColor: '#EF4444' }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>AO VIVO</Text>
          </View>
          <Text style={styles.trainerNameHeader} numberOfLines={1}>
            {trainerName || 'Personal Trainer'}
          </Text>
        </View>
        <Pressable
          onPress={handleEndCall}
          style={({ pressed }) => [
            styles.endCallBtn,
            pressed && { opacity: 0.8 },
          ]}
        >
          <IconSymbol name="phone.down.fill" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* WebView with Jitsi Meet */}
      {error ? (
        <View style={styles.errorContainer}>
          <IconSymbol name="xmark.circle.fill" size={48} color={colors.error} />
          <Text style={[styles.errorText, { color: '#FFFFFF' }]}>
            Não foi possível conectar à sala.
          </Text>
          <Text style={[styles.errorSubtext, { color: 'rgba(255,255,255,0.6)' }]}>
            Verifique sua conexão e tente novamente.
          </Text>
          <Pressable
            onPress={() => { setError(false); setLoading(true); }}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.retryBtnText}>Tentar Novamente</Text>
          </Pressable>
          <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={[styles.cancelBtnText, { color: 'rgba(255,255,255,0.7)' }]}>Cancelar</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          source={{ uri: jitsiUrl }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
          injectedJavaScript={jitsiConfig}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6B35" />
              <Text style={styles.loadingText}>Conectando à sala...</Text>
              <Text style={styles.loadingSubtext}>
                Aguarde enquanto preparamos sua aula com {trainerName}
              </Text>
            </View>
          )}
        />
      )}

      {loading && !error && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B35" />
          <Text style={styles.loadingText}>Conectando à sala...</Text>
          <Text style={styles.loadingSubtext}>
            Aguarde enquanto preparamos sua aula com {trainerName}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  trainerNameHeader: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  endCallBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 5,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelBtnText: {
    fontSize: 14,
  },
  // Web fallback
  webFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  webFallbackTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  webFallbackText: {
    fontSize: 14,
    textAlign: 'center',
  },
  openJitsiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  openJitsiBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    paddingVertical: 10,
  },
  backBtnText: {
    fontSize: 14,
  },
});
