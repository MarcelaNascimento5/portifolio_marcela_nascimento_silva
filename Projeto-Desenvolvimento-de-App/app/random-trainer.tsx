import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { TRAINERS } from '@/data/trainers';
import { Trainer } from '@/types/trainer';

type Phase = 'idle' | 'spinning' | 'revealed';

export default function RandomTrainerScreen() {
  const colors = useColors();
  const [phase, setPhase] = useState<Phase>('idle');
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [displayedTrainer, setDisplayedTrainer] = useState<Trainer | null>(null);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableTrainers = TRAINERS.filter((t) => t.available);

  const getRandomTrainer = () => {
    const idx = Math.floor(Math.random() * availableTrainers.length);
    return availableTrainers[idx];
  };

  const startSpin = () => {
    setPhase('spinning');
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);

    // Cycle through trainers rapidly
    let count = 0;
    const maxCycles = 18;
    intervalRef.current = setInterval(() => {
      setDisplayedTrainer(getRandomTrainer());
      count++;
      if (count >= maxCycles) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        const winner = getRandomTrainer();
        setSelectedTrainer(winner);
        setDisplayedTrainer(winner);
        setPhase('revealed');
        // Animate reveal
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 120);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStartSession = () => {
    if (!selectedTrainer) return;
    const roomId = `fitcoach-random-${selectedTrainer.id}-${Date.now()}`;
    router.push({
      pathname: '/video-call',
      params: {
        roomId,
        trainerId: selectedTrainer.id,
        trainerName: selectedTrainer.name,
      },
    } as any);
  };

  const handleRespin = () => {
    setPhase('idle');
    setSelectedTrainer(null);
    setDisplayedTrainer(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <IconSymbol
        key={i}
        name={i < Math.floor(rating) ? 'star.fill' : 'star'}
        size={14}
        color={i < Math.floor(rating) ? '#F59E0B' : 'rgba(255,255,255,0.3)'}
      />
    ));
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']} containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Aula Aleatória</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Instruction */}
        <View style={styles.instructionContainer}>
          <Text style={[styles.instructionTitle, { color: colors.foreground }]}>
            {phase === 'idle' && 'Deixa a gente escolher!'}
            {phase === 'spinning' && 'Sorteando...'}
            {phase === 'revealed' && 'Seu Personal é...'}
          </Text>
          <Text style={[styles.instructionSubtitle, { color: colors.muted }]}>
            {phase === 'idle' && 'Toque em "Sortear" para encontrar um personal disponível agora'}
            {phase === 'spinning' && 'Encontrando o melhor personal para você'}
            {phase === 'revealed' && 'Pronto para começar sua aula?'}
          </Text>
        </View>

        {/* Trainer Display */}
        <View style={styles.trainerDisplayContainer}>
          {phase === 'idle' ? (
            <LinearGradient
              colors={[colors.primary + '20', colors.primary + '05']}
              style={styles.idleCard}
            >
              <View style={[styles.idleIconContainer, { backgroundColor: colors.primary + '20' }]}>
                <IconSymbol name="shuffle" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.idleText, { color: colors.muted }]}>
                {availableTrainers.length} trainers disponíveis
              </Text>
            </LinearGradient>
          ) : (
            <Animated.View
              style={[
                styles.trainerCard,
                phase === 'revealed' && {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              {displayedTrainer && (
                <LinearGradient
                  colors={['#1A1A2E', '#2D2D4A']}
                  style={styles.trainerCardInner}
                >
                  <Image
                    source={{ uri: displayedTrainer.avatar }}
                    style={[
                      styles.trainerAvatar,
                      phase === 'spinning' && styles.trainerAvatarSpinning,
                    ]}
                  />
                  <Text style={styles.trainerCardName}>{displayedTrainer.name}</Text>
                  <Text style={styles.trainerCardSpecialty}>
                    {displayedTrainer.specialty[0]}
                  </Text>
                  {phase === 'revealed' && (
                    <>
                      <View style={styles.trainerCardStars}>
                        {renderStars(displayedTrainer.rating)}
                        <Text style={styles.trainerCardRating}>
                          {displayedTrainer.rating.toFixed(1)}
                        </Text>
                      </View>
                      <Text style={styles.trainerCardStudents}>
                        {displayedTrainer.totalStudents} alunos treinados
                      </Text>
                    </>
                  )}
                  {phase === 'spinning' && (
                    <View style={styles.spinningIndicator}>
                      <Text style={styles.spinningDots}>●●●</Text>
                    </View>
                  )}
                </LinearGradient>
              )}
            </Animated.View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {phase === 'idle' && (
            <Pressable
              onPress={startSpin}
              style={({ pressed }) => [
                styles.spinButton,
                { backgroundColor: colors.primary },
                pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
              ]}
            >
              <IconSymbol name="shuffle" size={22} color="#FFFFFF" />
              <Text style={styles.spinButtonText}>Sortear Personal</Text>
            </Pressable>
          )}

          {phase === 'spinning' && (
            <View style={[styles.spinningButton, { backgroundColor: colors.muted }]}>
              <Text style={styles.spinButtonText}>Sorteando...</Text>
            </View>
          )}

          {phase === 'revealed' && selectedTrainer && (
            <>
              <Pressable
                onPress={handleStartSession}
                style={({ pressed }) => [
                  styles.startButton,
                  { backgroundColor: colors.primary },
                  pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                ]}
              >
                <IconSymbol name="video.fill" size={20} color="#FFFFFF" />
                <Text style={styles.startButtonText}>
                  Iniciar Aula com {selectedTrainer.name.split(' ')[0]}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleRespin}
                style={({ pressed }) => [
                  styles.respinButton,
                  { borderColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <IconSymbol name="shuffle" size={18} color={colors.muted} />
                <Text style={[styles.respinButtonText, { color: colors.muted }]}>
                  Sortear Novamente
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push({ pathname: '/trainer/[id]', params: { id: selectedTrainer.id } } as any)
                }
                style={styles.viewProfileBtn}
              >
                <Text style={[styles.viewProfileText, { color: colors.primary }]}>
                  Ver perfil completo
                </Text>
                <IconSymbol name="chevron.right" size={14} color={colors.primary} />
              </Pressable>
            </>
          )}
        </View>

        {/* Available Trainers Count */}
        {phase === 'idle' && (
          <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <IconSymbol name="bolt.fill" size={16} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.muted }]}>
              Aula rápida: conecte-se em segundos com um personal disponível agora
            </Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  instructionContainer: {
    alignItems: 'center',
    gap: 6,
  },
  instructionTitle: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  instructionSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  trainerDisplayContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  idleCard: {
    width: 240,
    height: 240,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  idleIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  trainerCard: {
    width: 260,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  trainerCardInner: {
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  trainerAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  trainerAvatarSpinning: {
    opacity: 0.7,
  },
  trainerCardName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  trainerCardSpecialty: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '600',
  },
  trainerCardStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trainerCardRating: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  trainerCardStudents: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  spinningIndicator: {
    marginTop: 4,
  },
  spinningDots: {
    color: '#FF6B35',
    fontSize: 18,
    letterSpacing: 4,
  },
  actionsContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  spinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  spinningButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  respinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  respinButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  viewProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
