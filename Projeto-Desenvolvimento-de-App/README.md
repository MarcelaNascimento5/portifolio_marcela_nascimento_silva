# FitCoach — Aulas Remotas com Personal Trainers

> **Conecte-se ao seu personal trainer favorito em segundos, de qualquer lugar, via videochamada ao vivo.**

---

## Proposta de Valor

O **FitCoach** resolve um problema real: a dificuldade de acessar orientação profissional de educação física de forma acessível, flexível e imediata. Com o app, alunos podem:

- Explorar perfis detalhados de personal trainers certificados
- Iniciar uma videochamada ao vivo com o trainer escolhido em um clique
- Usar a funcionalidade de **seleção aleatória** para testar uma aula experimental sem compromisso
- Acompanhar o histórico de sessões realizadas

A integração com o **Jitsi Meet** (plataforma open-source de videoconferência) garante chamadas de alta qualidade sem necessidade de contas externas ou pagamentos adicionais.

---

## Capturas de Tela

| Tela Inicial | Lista de Trainers | Perfil do Trainer |
|:---:|:---:|:---:|
| Dashboard com acesso rápido | Busca e filtros por especialidade | Bio, avaliações e CTA |

| Seleção Aleatória | Videochamada | Histórico |
|:---:|:---:|:---:|
| Animação de sorteio | Jitsi Meet integrado | Sessões realizadas |

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Finalidade |
|---|---|---|
| **React Native** | 0.81 | Framework mobile multiplataforma |
| **Expo SDK** | 54 | Ferramentas e APIs nativas |
| **Expo Router** | 6 | Navegação baseada em arquivos |
| **TypeScript** | 5.9 | Tipagem estática |
| **NativeWind** | 4 | Estilização com Tailwind CSS |
| **react-native-webview** | latest | Integração com Jitsi Meet |
| **Jitsi Meet** | Web SDK | Videochamadas em tempo real |
| **AsyncStorage** | 2.2 | Persistência local de dados |
| **expo-linear-gradient** | latest | Gradientes visuais |
| **expo-keep-awake** | 15.0 | Tela ativa durante chamadas |
| **expo-haptics** | 15.0 | Feedback tátil |

---

## Arquitetura do Projeto

```
fitcoach-app/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx        ← Tab Bar (Início, Trainers, Minhas Aulas)
│   │   ├── index.tsx          ← Tela Home / Dashboard
│   │   ├── trainers.tsx       ← Lista de Trainers com busca e filtros
│   │   └── sessions.tsx       ← Histórico de sessões
│   ├── trainer/
│   │   └── [id].tsx           ← Perfil detalhado do trainer
│   ├── video-call.tsx         ← Videochamada via Jitsi Meet (WebView)
│   ├── random-trainer.tsx     ← Seleção aleatória com animação
│   └── _layout.tsx            ← Root layout com Stack Navigator
├── components/
│   ├── trainer-card.tsx       ← Card reutilizável de trainer
│   ├── screen-container.tsx   ← Container com SafeArea
│   └── ui/
│       └── icon-symbol.tsx    ← Mapeamento de ícones (SF → Material)
├── data/
│   └── trainers.ts            ← Dados mock de 6 personal trainers
├── hooks/
│   ├── use-sessions.ts        ← Gerenciamento de histórico (AsyncStorage)
│   └── use-colors.ts          ← Hook de tema dinâmico
├── types/
│   └── trainer.ts             ← Interfaces TypeScript do domínio
└── assets/
    └── images/
        ├── icon.png           ← Ícone do app
        └── qr-code.png        ← QR Code para teste no Expo Go
```

---

## Funcionalidades Implementadas

- **Tela Home** com saudação, card de aula rápida e trainers em destaque
- **Lista de Trainers** com busca por nome/especialidade e filtros por categoria
- **Perfil do Trainer** com bio, certificações, avaliações e botão de iniciar aula
- **Videochamada Jitsi Meet** via WebView com sala única por sessão
- **Seleção Aleatória** com animação de sorteio entre trainers disponíveis
- **Histórico de Sessões** persistido localmente com AsyncStorage
- **Tema Claro/Escuro** automático baseado nas configurações do sistema
- **Feedback Háptico** em ações principais

---

## Instruções de Instalação

### Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) v18 ou superior
- [pnpm](https://pnpm.io/) v9 ou superior (`npm install -g pnpm`)
- [Expo Go](https://expo.dev/go) no seu dispositivo Android/iOS (para teste)
- Git

### Passo a Passo

**1. Clone o repositório**

```bash
git clone https://github.com/seu-usuario/fitcoach-app.git
cd fitcoach-app
```

**2. Instale as dependências**

```bash
pnpm install
```

**3. Inicie o servidor de desenvolvimento**

```bash
pnpm dev
```

**4. Abra no dispositivo**

Escaneie o QR Code exibido no terminal com o aplicativo **Expo Go** (Android) ou a câmera do iPhone (iOS).

### Executar no Android (emulador)

```bash
pnpm android
```

### Executar no iOS (simulador — requer macOS)

```bash
pnpm ios
```

---

## Integração Jitsi Meet

O aplicativo utiliza o **Jitsi Meet** através de uma WebView que carrega a URL pública `https://meet.jit.si/{roomId}`, onde `roomId` é gerado dinamicamente para cada sessão:

```typescript
// Formato do roomId
const roomId = `fitcoach-${trainerId}-${Date.now()}`;

// URL da sala
const jitsiUrl = `https://meet.jit.si/${roomId}`;
```

Cada sessão gera uma sala única e temporária. Não é necessário criar conta no Jitsi Meet — o acesso é completamente público e gratuito.

---

## Preview do Aplicativo

### URL de Pré-visualização (Web)

```
https://8081-iy16w67gumbr6l0jmro35-a5518ff9.us2.manus.computer
```

### QR Code para Expo Go

Escaneie o QR Code abaixo com o aplicativo **Expo Go** para testar o app diretamente no seu dispositivo Android:

![QR Code FitCoach](./assets/images/qr-code.png)

> **Como usar:** Baixe o [Expo Go](https://expo.dev/go) na Play Store → Abra o app → Toque em "Scan QR Code" → Escaneie o código acima.

---

## Estrutura de Dados dos Trainers

```typescript
interface Trainer {
  id: string;
  name: string;
  specialty: string[];     // Ex: ['Musculação', 'Funcional']
  bio: string;
  rating: number;          // 0.0 - 5.0
  totalStudents: number;
  totalSessions: number;
  pricePerSession: number; // R$
  avatar: string;          // URL da foto
  coverImage: string;      // URL da imagem de capa
  experience: number;      // Anos de experiência
  certifications: string[];
  reviews: Review[];
  available: boolean;      // Disponível para aulas agora
}
```

---

## Trainers Disponíveis (Mock)

| Nome | Especialidades | Avaliação | Experiência |
|---|---|---|---|
| Carlos Mendes | Musculação, Funcional | ⭐ 4.9 | 8 anos |
| Fernanda Oliveira | Yoga, Pilates | ⭐ 4.8 | 6 anos |
| Rafael Santos | Crossfit, Funcional | ⭐ 4.7 | 5 anos |
| Beatriz Costa | Cardio, Corrida | ⭐ 4.9 | 7 anos |
| Diego Martins | Musculação, Crossfit | ⭐ 4.8 | 10 anos |
| Larissa Pereira | Pilates, Yoga | ⭐ 5.0 | 9 anos |

---

## Gerado com Manus AI

Este projeto foi estruturado e desenvolvido com o auxílio da **Manus AI**, uma plataforma de agentes de IA autônomos. A arquitetura, os componentes, a integração com Jitsi Meet e o design do aplicativo foram gerados e otimizados pela Manus AI para seguir as melhores práticas de desenvolvimento React Native / Expo.

---

## Licença

MIT License — sinta-se livre para usar, modificar e distribuir este projeto.

---

*Desenvolvido com ❤️ usando Manus AI + Expo + React Native + Jitsi Meet*
