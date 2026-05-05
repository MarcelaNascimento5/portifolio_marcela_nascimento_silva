# FitCoach — Design Document

## Brand Identity

- **App Name:** FitCoach
- **Tagline:** Treinos ao vivo com seu personal, onde você estiver.
- **Primary Color:** `#FF6B35` (laranja energético — representa movimento, energia, saúde)
- **Secondary Color:** `#1A1A2E` (azul escuro profundo — seriedade, confiança)
- **Accent Color:** `#4ECDC4` (teal — tecnologia, inovação)
- **Background Light:** `#F8F9FA`
- **Background Dark:** `#0D0D1A`
- **Surface Light:** `#FFFFFF`
- **Surface Dark:** `#1A1A2E`
- **Typography:** System font (SF Pro / Roboto) com pesos 400, 600, 700

---

## Screen List

1. **Splash / Onboarding** — Tela de boas-vindas com logo e CTA
2. **Home** — Dashboard do aluno com acesso rápido a aula aleatória e trainers em destaque
3. **Trainers** — Lista completa de personal trainers com filtros por especialidade
4. **Trainer Profile** — Perfil detalhado do trainer com bio, especialidades, avaliações e botão de iniciar aula
5. **Video Call** — Tela de videochamada integrada com Jitsi Meet via WebView
6. **Random Trainer** — Tela de seleção aleatória com animação de "sorteio"
7. **My Sessions** — Histórico de aulas do aluno (tab)

---

## Primary Content and Functionality

### Home Screen
- Header com saudação personalizada e avatar do aluno
- Card de destaque "Aula Rápida" — inicia seleção aleatória de trainer
- Seção "Trainers em Destaque" — cards horizontais com foto, nome e especialidade
- Seção "Próximas Aulas" — lista de aulas agendadas
- Bottom Tab Bar: Home | Trainers | Sessões | Perfil

### Trainers Screen
- SearchBar para buscar trainers por nome
- Chips de filtro por especialidade: Musculação, Yoga, Funcional, Cardio, Pilates
- FlatList de cards de trainers com foto, nome, avaliação (estrelas), especialidade e preço/aula
- Botão flutuante "Sortear Trainer" (FAB)

### Trainer Profile Screen
- Foto de capa + avatar circular
- Nome, especialidade, avaliação média e número de alunos
- Bio / descrição profissional
- Tags de especialidades
- Seção de avaliações (reviews) de alunos
- Botão primário "Iniciar Aula Agora" → navega para Video Call
- Botão secundário "Agendar" (UI apenas)

### Video Call Screen
- WebView carregando meet.jit.si/{roomId}
- Overlay de loading enquanto sala carrega
- Botão "Encerrar Aula" com confirmação
- Exibe nome do trainer no topo
- Mantém tela acordada durante a chamada (expo-keep-awake)

### Random Trainer Screen
- Animação de "roleta" ou "embaralhamento" de cards de trainers
- Após 2-3s, revela o trainer sorteado
- Botão "Iniciar Aula com [Nome]"
- Botão "Sortear Novamente"

---

## Key User Flows

### Fluxo 1: Aula com Trainer Escolhido
Home → Trainers → Trainer Profile → Iniciar Aula → Video Call → Encerrar

### Fluxo 2: Aula Aleatória
Home (botão "Aula Rápida") → Random Trainer (animação) → Trainer Sorteado → Iniciar Aula → Video Call

### Fluxo 3: Explorar Trainers
Home → Trainers → Filtrar por especialidade → Ver perfil → Voltar → Escolher outro

---

## Layout Principles

- **Portrait only** (9:16)
- **One-handed usage**: CTAs primários sempre na metade inferior da tela
- **Cards com sombra suave** para hierarquia visual
- **Bottom Tab Bar** sempre visível (exceto na tela de videochamada — fullscreen)
- **Gradientes sutis** nos headers para profundidade
- **Imagens de trainers** com aspect ratio 1:1 (avatar) ou 16:9 (capa de perfil)
