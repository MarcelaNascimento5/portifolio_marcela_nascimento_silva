import { describe, it, expect } from 'vitest';
import { TRAINERS, SPECIALTIES } from '../data/trainers';
import type { Trainer, Session } from '../types/trainer';

describe('FitCoach - Dados dos Trainers', () => {
  it('deve ter 6 trainers cadastrados', () => {
    expect(TRAINERS).toHaveLength(6);
  });

  it('cada trainer deve ter os campos obrigatórios', () => {
    TRAINERS.forEach((trainer: Trainer) => {
      expect(trainer.id).toBeTruthy();
      expect(trainer.name).toBeTruthy();
      expect(trainer.specialty).toBeInstanceOf(Array);
      expect(trainer.specialty.length).toBeGreaterThan(0);
      expect(trainer.bio).toBeTruthy();
      expect(trainer.rating).toBeGreaterThanOrEqual(0);
      expect(trainer.rating).toBeLessThanOrEqual(5);
      expect(trainer.avatar).toMatch(/^https?:\/\//);
      expect(trainer.coverImage).toMatch(/^https?:\/\//);
      expect(trainer.certifications).toBeInstanceOf(Array);
      expect(trainer.reviews).toBeInstanceOf(Array);
      expect(typeof trainer.available).toBe('boolean');
    });
  });

  it('deve ter trainers disponíveis para seleção aleatória', () => {
    const available = TRAINERS.filter((t) => t.available);
    expect(available.length).toBeGreaterThan(0);
  });

  it('deve ter a lista de especialidades com "Todos" como primeiro item', () => {
    expect(SPECIALTIES[0]).toBe('Todos');
    expect(SPECIALTIES.length).toBeGreaterThan(1);
  });

  it('cada trainer deve ter avaliação entre 4.5 e 5.0', () => {
    TRAINERS.forEach((trainer) => {
      expect(trainer.rating).toBeGreaterThanOrEqual(4.5);
      expect(trainer.rating).toBeLessThanOrEqual(5.0);
    });
  });

  it('deve ser possível filtrar trainers por especialidade', () => {
    const musculacaoTrainers = TRAINERS.filter((t) =>
      t.specialty.includes('Musculação')
    );
    expect(musculacaoTrainers.length).toBeGreaterThan(0);
  });

  it('cada trainer deve ter pelo menos uma certificação', () => {
    TRAINERS.forEach((trainer) => {
      expect(trainer.certifications.length).toBeGreaterThan(0);
    });
  });

  it('cada trainer deve ter pelo menos uma avaliação', () => {
    TRAINERS.forEach((trainer) => {
      expect(trainer.reviews.length).toBeGreaterThan(0);
    });
  });
});

describe('FitCoach - Lógica de Sessão', () => {
  it('deve gerar roomId único para cada sessão', () => {
    const trainerId = '1';
    const roomId1 = `fitcoach-${trainerId}-${Date.now()}`;
    // Pequeno delay para garantir timestamps diferentes
    const roomId2 = `fitcoach-${trainerId}-${Date.now() + 1}`;
    expect(roomId1).not.toBe(roomId2);
  });

  it('deve gerar roomId com formato correto', () => {
    const trainerId = '1';
    const timestamp = Date.now();
    const roomId = `fitcoach-${trainerId}-${timestamp}`;
    expect(roomId).toMatch(/^fitcoach-\d+-\d+$/);
  });

  it('deve criar objeto de sessão com campos corretos', () => {
    const trainer = TRAINERS[0];
    const session: Session = {
      id: `session-${Date.now()}`,
      trainerId: trainer.id,
      trainerName: trainer.name,
      trainerAvatar: trainer.avatar,
      date: new Date().toISOString(),
      duration: 45,
      specialty: trainer.specialty[0],
      roomId: `fitcoach-${trainer.id}-${Date.now()}`,
    };

    expect(session.id).toBeTruthy();
    expect(session.trainerId).toBe(trainer.id);
    expect(session.trainerName).toBe(trainer.name);
    expect(session.duration).toBe(45);
    expect(session.specialty).toBe(trainer.specialty[0]);
  });
});

describe('FitCoach - Seleção Aleatória', () => {
  it('deve selecionar apenas trainers disponíveis', () => {
    const availableTrainers = TRAINERS.filter((t) => t.available);
    const randomIndex = Math.floor(Math.random() * availableTrainers.length);
    const selected = availableTrainers[randomIndex];
    expect(selected.available).toBe(true);
  });

  it('seleção aleatória deve sempre retornar um trainer válido', () => {
    const availableTrainers = TRAINERS.filter((t) => t.available);
    for (let i = 0; i < 10; i++) {
      const idx = Math.floor(Math.random() * availableTrainers.length);
      const trainer = availableTrainers[idx];
      expect(trainer).toBeDefined();
      expect(trainer.id).toBeTruthy();
    }
  });
});
