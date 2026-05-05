import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { TrainerCard } from '@/components/trainer-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { TRAINERS, SPECIALTIES } from '@/data/trainers';

export default function TrainersScreen() {
  const colors = useColors();
  const [search, setSearch] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('Todos');

  const filteredTrainers = useMemo(() => {
    return TRAINERS.filter((t) => {
      const matchesSearch =
        search.trim() === '' ||
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.specialty.some((s) => s.toLowerCase().includes(search.toLowerCase()));
      const matchesSpecialty =
        selectedSpecialty === 'Todos' || t.specialty.includes(selectedSpecialty as any);
      return matchesSearch && matchesSpecialty;
    });
  }, [search, selectedSpecialty]);

  return (
    <ScreenContainer edges={['top', 'left', 'right']} containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Personal Trainers</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {filteredTrainers.length} profissionais disponíveis
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.muted} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Buscar por nome ou especialidade..."
            placeholderTextColor={colors.muted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Specialty Filters */}
      <View style={[styles.filtersWrapper, { backgroundColor: colors.surface }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {SPECIALTIES.map((specialty) => (
            <Pressable
              key={specialty}
              onPress={() => setSelectedSpecialty(specialty)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedSpecialty === specialty ? colors.primary : colors.background,
                  borderColor:
                    selectedSpecialty === specialty ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color:
                      selectedSpecialty === specialty ? '#FFFFFF' : colors.muted,
                  },
                ]}
              >
                {specialty}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Trainers List */}
      <FlatList
        data={filteredTrainers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TrainerCard
            trainer={item}
              onPress={() => router.push({ pathname: '/trainer/[id]', params: { id: item.id } } as any)}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <IconSymbol name="magnifyingglass" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Nenhum trainer encontrado
            </Text>
          </View>
        }
      />

      {/* FAB - Random Trainer */}
      <Pressable
        onPress={() => router.push('/random-trainer' as any)}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary },
          pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
        ]}
      >
        <IconSymbol name="shuffle" size={22} color="#FFFFFF" />
        <Text style={styles.fabText}>Sortear Trainer</Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filtersWrapper: {
    paddingBottom: 12,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
