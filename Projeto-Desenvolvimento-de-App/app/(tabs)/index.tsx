import React from 'react';
import {
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { TrainerCard } from '@/components/trainer-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { TRAINERS } from '@/data/trainers';

export default function HomeScreen() {
  const colors = useColors();
  const featuredTrainers = TRAINERS.filter((t) => t.available).slice(0, 4);

  return (
    <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-background">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.greeting, { color: colors.muted }]}>Bom dia! 👋</Text>
            <Text style={[styles.userName, { color: colors.foreground }]}>Pronto para treinar?</Text>
          </View>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary + '20' }]}>
            <IconSymbol name="person.fill" size={24} color={colors.primary} />
          </View>
        </View>

        {/* Quick Start Card */}
        <View style={styles.quickStartContainer}>
          <Pressable
           onPress={() => router.push('/random-trainer')}
            style={({ pressed }) => [pressed && { opacity: 0.9 }]}
          >
            <LinearGradient
              colors={['#FF6B35', '#FF8C5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickStartCard}
            >
              <View style={styles.quickStartContent}>
                <View>
                  <Text style={styles.quickStartLabel}>Aula Rápida</Text>
                  <Text style={styles.quickStartTitle}>Treinar Agora</Text>
                  <Text style={styles.quickStartSubtitle}>
                    Conectamos você com um personal disponível
                  </Text>
                </View>
                <View style={styles.quickStartIcon}>
                  <IconSymbol name="bolt.fill" size={32} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.quickStartFooter}>
                <IconSymbol name="shuffle" size={16} color="rgba(255,255,255,0.8)" />
                <Text style={styles.quickStartFooterText}>Seleção aleatória de personal</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="dumbbell.fill" size={20} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.foreground }]}>6</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Trainers</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="video.fill" size={20} color="#4ECDC4" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>Ao Vivo</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Videochamada</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="star.fill" size={20} color="#F59E0B" />
            <Text style={[styles.statValue, { color: colors.foreground }]}>4.9</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Avaliação</Text>
          </View>
        </View>

        {/* Featured Trainers */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Trainers em Destaque
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/trainers')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todos</Text>
          </Pressable>
        </View>

        <FlatList
          data={featuredTrainers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TrainerCard
              trainer={item}
              horizontal
              onPress={() => router.push({ pathname: '/trainer/[id]', params: { id: item.id } })}
            />
          )}
        />

        {/* How It Works */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Como Funciona</Text>
        </View>

        <View style={styles.howItWorksContainer}>
          {[
            { icon: 'person.2.fill' as const, title: 'Escolha seu Personal', desc: 'Explore perfis e especialidades' },
            { icon: 'video.fill' as const, title: 'Inicie a Videochamada', desc: 'Conexão via Jitsi Meet' },
            { icon: 'dumbbell.fill' as const, title: 'Treine ao Vivo', desc: 'Orientação em tempo real' },
          ].map((step, index) => (
            <View key={index} style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.stepIcon, { backgroundColor: colors.primary + '15' }]}>
                <IconSymbol name={step.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepTitle, { color: colors.foreground }]}>{step.title}</Text>
                <Text style={[styles.stepDesc, { color: colors.muted }]}>{step.desc}</Text>
              </View>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStartContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  quickStartCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  quickStartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  quickStartLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickStartTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  quickStartSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
    maxWidth: 200,
  },
  quickStartIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStartFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  quickStartFooterText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 4,
    paddingBottom: 4,
  },
  howItWorksContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
