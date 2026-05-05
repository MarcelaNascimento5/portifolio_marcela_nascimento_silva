import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useSessions } from '@/hooks/use-sessions';
import { Session } from '@/types/trainer';

function SessionItem({ session, colors }: { session: Session; colors: any }) {
  const date = new Date(session.date);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={[styles.sessionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Image source={{ uri: session.trainerAvatar }} style={styles.trainerAvatar} />
      <View style={styles.sessionInfo}>
        <Text style={[styles.trainerName, { color: colors.foreground }]}>{session.trainerName}</Text>
        <Text style={[styles.specialtyText, { color: colors.primary }]}>{session.specialty}</Text>
        <View style={styles.sessionMeta}>
          <View style={styles.metaItem}>
            <IconSymbol name="calendar" size={12} color={colors.muted} />
            <Text style={[styles.metaText, { color: colors.muted }]}>{formattedDate}</Text>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol name="clock" size={12} color={colors.muted} />
            <Text style={[styles.metaText, { color: colors.muted }]}>{formattedTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <IconSymbol name="video.fill" size={12} color={colors.muted} />
            <Text style={[styles.metaText, { color: colors.muted }]}>{session.duration} min</Text>
          </View>
        </View>
      </View>
      <View style={[styles.completedBadge, { backgroundColor: colors.success + '20' }]}>
        <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
        <Text style={[styles.completedText, { color: colors.success }]}>Concluída</Text>
      </View>
    </View>
  );
}

export default function SessionsScreen() {
  const colors = useColors();
  const { sessions, loading, clearSessions } = useSessions();

  const handleClearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Deseja remover todo o histórico de aulas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpar', style: 'destructive', onPress: clearSessions },
      ]
    );
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Minhas Aulas</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {sessions.length} {sessions.length === 1 ? 'sessão realizada' : 'sessões realizadas'}
          </Text>
        </View>
        {sessions.length > 0 && (
          <Pressable onPress={handleClearHistory}>
            <Text style={[styles.clearText, { color: colors.error }]}>Limpar</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.muted }]}>Carregando...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
            <IconSymbol name="video.fill" size={40} color={colors.muted} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Nenhuma aula ainda
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Suas aulas realizadas aparecerão aqui após as videochamadas
          </Text>
          <Pressable
            onPress={() => router.push('/random-trainer' as any)}
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
          >
            <IconSymbol name="bolt.fill" size={16} color="#FFF" />
            <Text style={styles.startBtnText}>Começar Agora</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SessionItem session={item} colors={colors} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  trainerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E5E7EB',
  },
  sessionInfo: {
    flex: 1,
    gap: 3,
  },
  trainerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  completedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 13,
    borderRadius: 14,
    gap: 8,
    marginTop: 8,
  },
  startBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 16,
  },
});
