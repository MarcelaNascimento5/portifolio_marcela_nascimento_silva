import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { Trainer } from '@/types/trainer';

interface TrainerCardProps {
  trainer: Trainer;
  onPress: () => void;
  horizontal?: boolean;
}

export function TrainerCard({ trainer, onPress, horizontal = false }: TrainerCardProps) {
  const colors = useColors();

  if (horizontal) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.horizontalCard,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && { opacity: 0.85 },
        ]}
      >
        <Image source={{ uri: trainer.avatar }} style={styles.horizontalAvatar} />
        <View style={styles.horizontalInfo}>
          <Text style={[styles.trainerName, { color: colors.foreground }]} numberOfLines={1}>
            {trainer.name}
          </Text>
          <Text style={[styles.specialty, { color: colors.primary }]} numberOfLines={1}>
            {trainer.specialty[0]}
          </Text>
          <View style={styles.ratingRow}>
            <IconSymbol name="star.fill" size={12} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.muted }]}>
              {trainer.rating.toFixed(1)}
            </Text>
          </View>
        </View>
        {!trainer.available && (
          <View style={[styles.unavailableBadge, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.unavailableText, { color: colors.error }]}>Ocupado</Text>
          </View>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Image source={{ uri: trainer.avatar }} style={styles.avatar} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.trainerName, { color: colors.foreground }]} numberOfLines={1}>
            {trainer.name}
          </Text>
          {trainer.available ? (
            <View style={[styles.availableDot, { backgroundColor: colors.success }]} />
          ) : (
            <View style={[styles.availableDot, { backgroundColor: colors.muted }]} />
          )}
        </View>
        <View style={styles.specialtyRow}>
          {trainer.specialty.slice(0, 2).map((s) => (
            <View key={s} style={[styles.specialtyTag, { backgroundColor: colors.primary + '15' }]}>
              <Text style={[styles.specialtyTagText, { color: colors.primary }]}>{s}</Text>
            </View>
          ))}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.ratingRow}>
            <IconSymbol name="star.fill" size={14} color="#F59E0B" />
            <Text style={[styles.ratingText, { color: colors.foreground }]}>
              {trainer.rating.toFixed(1)}
            </Text>
          </View>
          <Text style={[styles.studentsText, { color: colors.muted }]}>
            {trainer.totalStudents} alunos
          </Text>
          <Text style={[styles.priceText, { color: colors.primary }]}>
            R$ {trainer.pricePerSession}/aula
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E5E7EB',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trainerName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  specialtyRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  specialtyTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  specialtyTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  specialty: {
    fontSize: 13,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  studentsText: {
    fontSize: 12,
  },
  priceText: {
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 'auto',
  },
  // Horizontal card styles
  horizontalCard: {
    width: 140,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  horizontalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E7EB',
    marginBottom: 8,
  },
  horizontalInfo: {
    alignItems: 'center',
    gap: 3,
  },
  unavailableBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
