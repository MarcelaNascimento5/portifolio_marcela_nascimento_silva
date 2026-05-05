import React from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { TRAINERS } from '@/data/trainers';

export default function TrainerProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const trainer = TRAINERS.find((t) => t.id === id);

  if (!trainer) {
    return (
      <ScreenContainer>
        <View style={styles.notFound}>
          <Text style={{ color: colors.foreground, fontSize: 16 }}>Trainer não encontrado</Text>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
            <Text style={{ color: '#FFF', fontWeight: '700' }}>Voltar</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const handleStartSession = () => {
    const roomId = `fitcoach-${trainer.id}-${Date.now()}`;
    router.push({
      pathname: '/video-call',
      params: { roomId, trainerId: trainer.id, trainerName: trainer.name },
    } as any);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <IconSymbol
        key={i}
        name={i < Math.floor(rating) ? 'star.fill' : 'star'}
        size={14}
        color={i < Math.floor(rating) ? '#F59E0B' : colors.border}
      />
    ));
  };

  return (
    <ScreenContainer edges={['left', 'right', 'bottom']} containerClassName="bg-background">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image source={{ uri: trainer.coverImage }} style={styles.coverImage} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.coverGradient}
          />
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
          >
            <IconSymbol name="arrow.left" size={22} color="#FFFFFF" />
          </Pressable>
          {trainer.available ? (
            <View style={[styles.availableBadge, { backgroundColor: colors.success }]}>
              <View style={styles.availableDot} />
              <Text style={styles.availableBadgeText}>Disponível</Text>
            </View>
          ) : (
            <View style={[styles.availableBadge, { backgroundColor: colors.muted }]}>
              <Text style={styles.availableBadgeText}>Ocupado</Text>
            </View>
          )}
        </View>

        {/* Avatar + Name */}
        <View style={[styles.profileHeader, { backgroundColor: colors.surface }]}>
          <Image source={{ uri: trainer.avatar }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={[styles.trainerName, { color: colors.foreground }]}>{trainer.name}</Text>
            <View style={styles.ratingRow}>
              {renderStars(trainer.rating)}
              <Text style={[styles.ratingValue, { color: colors.foreground }]}>
                {trainer.rating.toFixed(1)}
              </Text>
              <Text style={[styles.ratingCount, { color: colors.muted }]}>
                ({trainer.reviews.length} avaliações)
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Alunos', value: trainer.totalStudents.toString(), icon: 'person.2.fill' as const },
            { label: 'Sessões', value: trainer.totalSessions.toString(), icon: 'video.fill' as const },
            { label: 'Experiência', value: `${trainer.experience} anos`, icon: 'trophy.fill' as const },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <IconSymbol name={stat.icon} size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Specialties */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Especialidades</Text>
          <View style={styles.specialtiesRow}>
            {trainer.specialty.map((s) => (
              <View key={s} style={[styles.specialtyTag, { backgroundColor: colors.primary + '15' }]}>
                <IconSymbol name="dumbbell.fill" size={14} color={colors.primary} />
                <Text style={[styles.specialtyTagText, { color: colors.primary }]}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Sobre</Text>
          <Text style={[styles.bioText, { color: colors.muted }]}>{trainer.bio}</Text>
        </View>

        {/* Certifications */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Certificações</Text>
          {trainer.certifications.map((cert) => (
            <View key={cert} style={styles.certRow}>
              <IconSymbol name="checkmark.circle.fill" size={16} color={colors.success} />
              <Text style={[styles.certText, { color: colors.foreground }]}>{cert}</Text>
            </View>
          ))}
        </View>

        {/* Reviews */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Avaliações dos Alunos</Text>
          {trainer.reviews.map((review) => (
            <View key={review.id} style={[styles.reviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.reviewHeader}>
                <View style={[styles.reviewAvatar, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.reviewAvatarText, { color: colors.primary }]}>
                    {review.studentName.charAt(0)}
                  </Text>
                </View>
                <View style={styles.reviewInfo}>
                  <Text style={[styles.reviewName, { color: colors.foreground }]}>{review.studentName}</Text>
                  <View style={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.muted }]}>
                  {new Date(review.date).toLocaleDateString('pt-BR')}
                </Text>
              </View>
              <Text style={[styles.reviewComment, { color: colors.muted }]}>{review.comment}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View>
          <Text style={[styles.priceLabel, { color: colors.muted }]}>Valor por aula</Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>
            R$ {trainer.pricePerSession}
          </Text>
        </View>
        <Pressable
          onPress={handleStartSession}
          disabled={!trainer.available}
          style={({ pressed }) => [
            styles.startButton,
            { backgroundColor: trainer.available ? colors.primary : colors.muted },
            pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
          ]}
        >
          <IconSymbol name="video.fill" size={18} color="#FFFFFF" />
          <Text style={styles.startButtonText}>
            {trainer.available ? 'Iniciar Aula Agora' : 'Trainer Ocupado'}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  coverContainer: {
    height: 220,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  coverGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  availableBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
    marginTop: -30,
    borderRadius: 0,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  trainerName: {
    fontSize: 22,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 4,
  },
  ratingCount: {
    fontSize: 12,
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
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  specialtyTagText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
  },
  certRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  certText: {
    fontSize: 14,
    fontWeight: '500',
  },
  reviewCard: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: {
    fontSize: 16,
    fontWeight: '800',
  },
  reviewInfo: {
    flex: 1,
    gap: 3,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '700',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    paddingBottom: 28,
  },
  priceLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
