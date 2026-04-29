# Arquitetura do Fantasy Brasileirão

## Visão Geral

O app é dividido em 3 partes principais que se comunicam entre si:

```
┌─────────────────────────────────────────────────────────┐
│                     USUÁRIO FINAL                        │
│           (celular ou navegador de internet)             │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┴──────────────┐
          │                             │
   ┌──────▼──────┐             ┌────────▼───────┐
   │  App Mobile │             │   Site (Web)   │
   │  (Expo /    │             │   (Next.js)    │
   │ React Native│             │                │
   └──────┬──────┘             └────────┬───────┘
          │                             │
          └──────────────┬──────────────┘
                         │
              ┌──────────▼──────────┐
              │      FIREBASE       │
              │  (Backend completo) │
              │                     │
              │  - Auth (login)     │
              │  - Firestore (banco)│
              │  - Functions (lógica│
              │  - Storage (fotos)  │
              └──────────┬──────────┘
                         │
              ┌──────────▼──────────┐
              │  API DE ESTATÍSTICAS│
              │  (dados reais dos   │
              │   jogos)            │
              └─────────────────────┘
```

---

## 1. Frontend (o que o usuário vê)

### 1.1 App Mobile (React Native + Expo)

**O que é:** O aplicativo que o usuário instala no celular (Android e iOS).

**Telas principais:**

```
App Mobile
├── Autenticação
│   ├── Tela de Login (email/Google/Facebook)
│   └── Tela de Cadastro
│
├── Home (Dashboard)
│   ├── Pontuação da rodada atual
│   ├── Posição no ranking da liga
│   └── Alertas (prazo de escalação, etc.)
│
├── Meu Time
│   ├── Visualização do elenco no campo
│   ├── Seleção de esquema tático
│   ├── Definição de capitão
│   └── Gestão de titulares e reservas
│
├── Mercado
│   ├── Busca de jogadores
│   ├── Filtro por posição / time / preço
│   ├── Detalhes do jogador (histórico de pontos)
│   └── Comprar / Vender
│
├── Ligas
│   ├── Ranking geral
│   ├── Minhas ligas privadas
│   ├── Criar liga
│   └── Entrar em liga (por código)
│
├── Rodadas
│   ├── Histórico de rodadas
│   └── Pontuação detalhada por rodada
│
└── Perfil
    ├── Dados do técnico
    ├── Patrimônio
    └── Conquistas / Badges
```

### 1.2 Site Web (Next.js)

**O que é:** A versão para computador, acessada pelo navegador.

**Diferenças do mobile:**
- Layout maior, com mais informações visíveis ao mesmo tempo
- Ideal para gestão do time (mais confortável no PC)
- Mesmo banco de dados — alterações no celular aparecem no PC e vice-versa

---

## 2. Backend (Firebase — o cérebro do sistema)

O Firebase é uma plataforma do Google que oferece tudo que precisamos sem montar um servidor do zero.

### 2.1 Firebase Authentication (Login)

**O que faz:** Gerencia contas de usuário de forma segura.

**Métodos de login:**
- Email e senha
- Google (login com conta Google)
- Facebook (futuro)

**Fluxo de login:**
```
Usuário digita email/senha
       ↓
Firebase verifica as credenciais
       ↓
Firebase retorna um "token" (chave de acesso)
       ↓
App usa esse token para todas as requisições seguintes
```

### 2.2 Firestore (Banco de Dados)

**O que é:** Banco de dados em tempo real. Quando um jogador marca um gol, todos os usuários veem a pontuação atualizar instantaneamente.

**Estrutura do banco (coleções e documentos):**

```
firestore/
│
├── users/                          ← Coleção de usuários
│   └── {userId}/
│       ├── name: "João Silva"
│       ├── email: "joao@gmail.com"
│       ├── balance: 45.50          ← Saldo em cartoletas
│       ├── patrimony: 112.30       ← Patrimônio total
│       └── createdAt: timestamp
│
├── teams/                          ← Times dos técnicos
│   └── {userId}/
│       ├── name: "Os Brabos FC"
│       ├── scheme: "4-3-3"
│       ├── captain: "player_123"
│       └── players: [              ← Lista de jogadores escalados
│           { playerId: "p1", position: "starter" },
│           { playerId: "p2", position: "bench" },
│           ...
│         ]
│
├── players/                        ← Jogadores reais do Brasileirão
│   └── {playerId}/
│       ├── name: "Gabigol"
│       ├── club: "Flamengo"
│       ├── position: "ATA"
│       ├── price: 18.50
│       ├── priceVariation: +1.20
│       ├── photo: "url_da_foto"
│       └── status: "available"     ← ou "injured", "suspended"
│
├── rounds/                         ← Rodadas do campeonato
│   └── {roundId}/
│       ├── number: 15
│       ├── status: "open"          ← "open", "live", "finished"
│       ├── deadline: timestamp
│       └── matches: [...]
│
├── scores/                         ← Pontuações por rodada
│   └── {roundId}/
│       └── {userId}/
│           ├── total: 87.5
│           ├── captainBonus: 12.0
│           └── breakdown: [        ← Detalhe por jogador
│               { playerId: "p1", points: 15.5, events: [...] }
│             ]
│
├── leagues/                        ← Ligas privadas
│   └── {leagueId}/
│       ├── name: "Liga dos Amigos"
│       ├── code: "ABC123"
│       ├── ownerId: "userId_1"
│       ├── type: "points"          ← ou "head_to_head", "playoffs"
│       └── members: ["userId_1", "userId_2", ...]
│
└── marketHistory/                  ← Histórico do mercado
    └── {playerId}/
        └── {roundId}/
            ├── price: 18.50
            └── variation: +1.20
```

### 2.3 Firebase Cloud Functions (Lógica do Jogo)

**O que são:** Funções que rodam automaticamente no servidor quando algo acontece.

**Funções necessárias:**

| Função | Quando roda | O que faz |
|---|---|---|
| `updatePlayerScores` | Ao fim de cada jogo | Importa as estatísticas do jogo e calcula pontos de cada jogador |
| `closeRound` | No prazo de fechamento | Bloqueia escalações e registra o time de cada técnico |
| `calculateRoundScores` | Após todos os jogos da rodada | Soma pontuação de cada técnico |
| `updatePlayerPrices` | Após fechar a rodada | Atualiza preços dos jogadores com base no desempenho |
| `updateRankings` | Após calcular pontuações | Atualiza rankings das ligas |
| `sendNotifications` | Diversos eventos | Envia push notifications (prazo, pontuação, etc.) |

### 2.4 Firebase Storage

**O que faz:** Armazena arquivos como fotos de jogadores e escudos de times.

---

## 3. API de Estatísticas (dados reais dos jogos)

**O problema:** Precisamos de dados reais — quem fez gol, assistência, cartão, etc.

**Opções de API:**

### Opção A — API-Football (recomendada para começar)
- Site: api-football.com
- Cobre o Brasileirão Série A
- Plano gratuito: 100 requisições/dia (suficiente para MVP)
- Plano pago: ~$10/mês para produção

### Opção B — Sofascore (via web scraping)
- Gratuito, mas mais instável
- Requer cuidado com termos de uso

### Como funciona na prática:

```
Jogo acontece no mundo real
        ↓
API-Football atualiza os dados (a cada ~2 min durante o jogo)
        ↓
Nossa Cloud Function roda a cada 5 min durante rodadas "live"
        ↓
Busca os dados da API
        ↓
Calcula pontos de cada jogador
        ↓
Salva no Firestore
        ↓
App dos usuários atualiza em tempo real (Firebase Realtime)
```

---

## 4. Fluxo de Dados Completo

### Exemplo: Gabigol marca um gol

```
1. Gabigol marca gol no Maracanã (mundo real)
2. API-Football registra o gol
3. Nossa Cloud Function detecta o gol (polling a cada 5 min)
4. Calcula: Gabigol += 8 pontos (gol de atacante)
5. Salva no Firestore: players/gabigol/rounds/15/points = 8
6. Todos os técnicos com Gabigol veem +8 pts no app (tempo real)
7. Técnicos com Gabigol como capitão veem +16 pts
```

---

## 5. Segurança

### Regras do Firestore

O Firestore tem um sistema de regras que impede trapaças:

```javascript
// Exemplo de regra: usuário só pode editar o próprio time
match /teams/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId
               && request.time < roundDeadline;
}
```

**Regras importantes:**
- Usuário só edita o próprio time
- Não é possível editar o time após o prazo da rodada
- Pontuações são escritas apenas pelas Cloud Functions (não pelo usuário)
- Saldo não pode ficar negativo

---

## 6. Notificações Push

Usamos o **Firebase Cloud Messaging (FCM)** para enviar notificações:

| Evento | Notificação |
|---|---|
| 2h antes do prazo | "Faltam 2 horas para fechar a rodada!" |
| Gol do capitão | "Seu capitão marcou! +16 pts" |
| Rodada encerrada | "Rodada 15 encerrada. Você fez 87 pontos!" |
| Subida no ranking | "Você subiu para a 3ª posição na liga!" |
| Convite para liga | "João te convidou para a Liga dos Amigos" |

---

## 7. Escalabilidade

O Firebase cresce automaticamente conforme o número de usuários aumenta. Para referência:

| Fase | Usuários | Custo estimado Firebase |
|---|---|---|
| MVP / Teste | Até 1.000 | Gratuito (Spark Plan) |
| Crescimento | Até 10.000 | ~$25–50/mês (Blaze Plan) |
| Escala | 100.000+ | ~$200–500/mês |
