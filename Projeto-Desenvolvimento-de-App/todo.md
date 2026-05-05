# FitCoach — TODO

## Setup & Branding
- [x] Gerar logo do aplicativo FitCoach
- [x] Atualizar theme.config.js com cores da marca
- [x] Atualizar app.config.ts com nome e logo
- [x] Adicionar ícones necessários no icon-symbol.tsx

## Dados e Tipos
- [x] Criar types/trainer.ts com interfaces de dados
- [x] Criar data/trainers.ts com dados mock de personal trainers
- [x] Criar data/specialties.ts com lista de especialidades (incluído em trainers.ts)

## Telas Principais
- [x] Tela Home com saudação, card de aula rápida e trainers em destaque
- [x] Tela Trainers com lista, busca e filtros por especialidade
- [x] Tela Trainer Profile com bio, avaliações e botão de iniciar aula
- [x] Tela Video Call com WebView do Jitsi Meet
- [x] Tela Random Trainer com animação de sorteio
- [x] Tela My Sessions com histórico de aulas

## Navegação
- [x] Configurar Tab Bar com 3 abas: Home, Trainers, Minhas Aulas
- [x] Configurar Stack Navigator para telas de detalhe (Trainer Profile, Video Call)
- [x] Configurar rota para Random Trainer

## Integração Jitsi Meet
- [x] Instalar react-native-webview
- [x] Criar componente JitsiMeetView com WebView
- [x] Gerar roomId único para cada sessão
- [x] Implementar controles de chamada (encerrar com confirmação)

## Features Adicionais
- [x] Filtros de especialidade na tela de Trainers
- [x] Animação de sorteio na tela Random Trainer
- [x] Expo Keep Awake durante videochamada
- [x] Histórico de sessões com AsyncStorage

## README e Documentação
- [x] Criar README.md profissional com todas as seções exigidas
- [x] Gerar QR Code do app
- [x] Adicionar capturas de tela ao README (tabela descritiva)

## Entrega
- [x] Checkpoint final
- [x] Verificar todos os fluxos de navegação
