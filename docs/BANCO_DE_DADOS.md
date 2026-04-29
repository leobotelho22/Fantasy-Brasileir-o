# Banco de Dados — Fantasy Brasileirão
> Modelagem completa para Firebase (Firestore) com Snake Draft estilo Sleeper

---

## Por que Firestore?

O Firestore é um banco de dados **NoSQL orientado a documentos**. Em vez de tabelas com linhas e colunas (como Excel), ele usa **coleções** e **documentos** (como pastas e arquivos).

```
SQL (Supabase/PostgreSQL)       Firestore (Firebase)
─────────────────────────       ──────────────────────
Banco de dados          →       Projeto Firebase
Tabela                  →       Coleção (collection)
Linha                   →       Documento (document)
Coluna                  →       Campo (field)
JOIN entre tabelas      →       Subcoleção ou referência
```

**Vantagem chave:** o Firestore atualiza todos os celulares em tempo real quando um dado muda. Perfeito para o draft ao vivo e pontuação durante os jogos.

---

## Mapa Geral das Coleções

```
firestore/
│
├── users/              ← Contas dos técnicos
├── players/            ← Jogadores reais do Brasileirão
├── realClubs/          ← Times reais (Flamengo, Palmeiras...)
├── seasons/            ← Temporadas (2025, 2026...)
│   └── rounds/         ← Rodadas da temporada
│       └── matches/    ← Partidas de cada rodada
├── playerStats/        ← Estatísticas de cada jogador por rodada
├── leagues/            ← Ligas privadas e pública geral
│   └── members/        ← Membros de cada liga
├── fantasyTeams/       ← Times fantasy de cada técnico
│   └── roster/         ← Elenco atual do time
├── lineups/            ← Escalação de cada time por rodada
├── roundScores/        ← Pontuação de cada time por rodada
├── drafts/             ← Estado do snake draft por liga
│   └── picks/          ← Cada escolha feita no draft
└── trades/             ← Trocas de jogadores entre times (futuro)
```

---

## 1. Coleção: `users`

Armazena as contas de todos os técnicos cadastrados.

### Estrutura do documento

```
users/{userId}
├── name:          string      "João Silva"
├── email:         string      "joao@gmail.com"
├── photoUrl:      string      "https://..."
├── username:      string      "joaosilva_fc"    ← único no sistema
├── balance:       number      45.50             ← cartoletas disponíveis
├── patrimony:     number      112.30            ← saldo + valor do elenco
├── totalPoints:   number      387.5             ← pontos acumulados na temporada
├── createdAt:     timestamp
└── updatedAt:     timestamp
```

### Exemplo real

```json
{
  "userId": "usr_joao_abc123",
  "name": "João Silva",
  "email": "joao@gmail.com",
  "username": "joaofc",
  "balance": 45.50,
  "patrimony": 112.30,
  "totalPoints": 387.5,
  "createdAt": "2025-03-01T10:00:00Z"
}
```

---

## 2. Coleção: `players`

Todos os jogadores reais do Brasileirão Série A.

### Estrutura do documento

```
players/{playerId}
├── name:            string    "Gabriel Barbosa"
├── nickname:        string    "Gabigol"
├── clubId:          string    "flamengo"         ← referência a realClubs
├── clubName:        string    "Flamengo"         ← desnormalizado (evita JOIN)
├── clubBadgeUrl:    string    "https://..."
├── position:        string    "ATA"              ← GOL|ZAG|LAT|MEI|ATA
├── photoUrl:        string    "https://..."
├── shirtNumber:     number    99
├── price:           number    18.50              ← preço atual em cartoletas
├── priceVariation:  number    +1.20              ← variação da última rodada
├── averagePoints:   number    7.8                ← média por rodada
├── totalPoints:     number    94.5               ← acumulado na temporada
├── roundsPlayed:    number    12
├── status:          string    "available"        ← available|injured|suspended|doubtful
├── statusNote:      string    "Lesão no joelho"  ← (quando não disponível)
├── isDraftAvailable:boolean   true               ← false = já draftado em alguma liga
└── updatedAt:       timestamp
```

### Exemplo real

```json
{
  "playerId": "ply_gabigol",
  "name": "Gabriel Barbosa",
  "nickname": "Gabigol",
  "clubId": "flamengo",
  "clubName": "Flamengo",
  "position": "ATA",
  "price": 18.50,
  "priceVariation": +1.20,
  "averagePoints": 8.2,
  "totalPoints": 98.4,
  "status": "available"
}
```

---

## 3. Coleção: `seasons` → subcoleção `rounds` → subcoleção `matches`

### `seasons/{seasonId}`

```
seasons/2025
├── year:       number    2025
├── name:       string    "Brasileirão Série A 2025"
├── status:     string    "active"          ← upcoming|active|finished
├── totalRounds:number    38
└── currentRound:number   15
```

### `seasons/{seasonId}/rounds/{roundId}`

```
rounds/round_15
├── number:     number      15
├── seasonId:   string      "2025"
├── status:     string      "live"          ← upcoming|open|live|finished
├── deadline:   timestamp                   ← prazo para escalar/transferir
├── startDate:  timestamp
└── endDate:    timestamp
```

### `seasons/{seasonId}/rounds/{roundId}/matches/{matchId}`

```
matches/match_fla_vs_pal
├── homeClubId:    string      "flamengo"
├── awayClubId:    string      "palmeiras"
├── homeClubName:  string      "Flamengo"
├── awayClubName:  string      "Palmeiras"
├── homeScore:     number      2
├── awayScore:     number      1
├── status:        string      "finished"   ← scheduled|live|finished
├── startTime:     timestamp
└── apiMatchId:    string      "123456"     ← ID na API-Football
```

---

## 4. Coleção: `playerStats`

Estatísticas de cada jogador em cada rodada. Esta coleção é **escrita apenas pelo servidor** (Cloud Functions) e lida pelo app.

### Chave do documento: `{roundId}_{playerId}`

```
playerStats/round15_ply_gabigol
├── playerId:      string      "ply_gabigol"
├── roundId:       string      "round_15"
├── matchId:       string      "match_fla_vs_pal"
├── clubId:        string      "flamengo"
├── position:      string      "ATA"
├── minutosJogados:number      90
├── points:        number      21.6          ← total calculado
│
├── scouts: {                               ← valores brutos da API
│     gol:                    2,
│     assistencia:            1,
│     finalizacaoNaTrave:     0,
│     finalizacaoDefendida:   3,
│     finalizacaoForA:        2,
│     faltaSofrida:           4,
│     penaltiSofrido:         0,
│     impedimento:            1,
│     penaltiPerdidoForA:     0,
│     penaltiPerdidoDefendido:0,
│     penaltiPerdidoTrave:    0,
│     jogoSemGol:             0,
│     defesa:                 0,
│     defesaPenalti:          0,
│     desarme:                0,
│     golContra:              0,
│     cartaoVermelho:         0,
│     cartaoAmarelo:          1,
│     golSofrido:             1,
│     faltaCometida:          1,
│     penaltiCometido:        0
│   }
│
└── updatedAt:     timestamp
```

### Cálculo automático de `points`

```
gol × 8 = 16.0
assistencia × 5 = 5.0
finalizacaoDefendida × 1.2 = 3.6
finalizacaoForA × 0.8 = 1.6
faltaSofrida × 0.5 = 2.0
impedimento × -0.1 = -0.1
cartaoAmarelo × -1 = -1.0
golSofrido × -1 = -1.0
faltaCometida × -0.3 = -0.3
─────────────────────────
TOTAL = 25.8
```

---

## 5. Coleção: `leagues`

Ligas privadas criadas pelos usuários (e a liga pública geral).

### `leagues/{leagueId}`

```
leagues/liga_amigos_xyz
├── name:          string      "Liga dos Brabos"
├── code:          string      "BRABOS"         ← código de 6 chars para convite
├── ownerId:       string      "usr_joao_abc123"
├── type:          string      "draft"          ← draft|classic
├── status:        string      "active"         ← setup|draft|active|finished
├── maxMembers:    number      10
├── isPublic:      boolean     false
├── createdAt:     timestamp
│
└── settings: {
      competitionFormat: "points",     ← points|head_to_head|playoffs
      draftType:         "snake",
      draftDate:         timestamp,
      timePerPick:       60,           ← segundos por escolha
      rosterSize:        15,           ← jogadores no elenco
      startersCount:     11,
      benchCount:        4
    }
```

### Subcoleção: `leagues/{leagueId}/members/{userId}`

```
members/usr_joao_abc123
├── userId:        string      "usr_joao_abc123"
├── teamId:        string      "team_abc"
├── joinedAt:      timestamp
├── draftPosition: number      3                ← posição no draft (1 = 1º a escolher)
├── role:          string      "owner"          ← owner|member
└── totalPoints:   number      387.5            ← pontos acumulados na liga
```

---

## 6. Coleção: `fantasyTeams`

O time fantasy de cada técnico em cada liga.

### `fantasyTeams/{teamId}`

```
fantasyTeams/team_abc
├── name:          string      "Os Brabos FC"
├── logoUrl:       string      "https://..."
├── ownerId:       string      "usr_joao_abc123"
├── leagueId:      string      "liga_amigos_xyz"
├── totalPoints:   number      387.5
├── currentRoundPoints: number 54.2
├── rosterValue:   number      89.50            ← valor total do elenco em cartoletas
└── createdAt:     timestamp
```

### Subcoleção: `fantasyTeams/{teamId}/roster/{playerId}`

Elenco atual do time (os jogadores que ele possui).

```
roster/ply_gabigol
├── playerId:    string      "ply_gabigol"
├── playerName:  string      "Gabigol"          ← desnormalizado
├── position:    string      "ATA"
├── acquiredAt:  timestamp
├── acquiredVia: string      "draft"            ← draft|trade|waiver
├── draftRound:  number      2                  ← em qual rodada do draft
└── draftPick:   number      14                 ← pick geral número 14
```

---

## 7. Coleção: `lineups`

A escalação de cada time em cada rodada. Registrada antes do prazo.

### Chave: `{leagueId}_{teamId}_{roundId}`

```
lineups/liga_xyz_team_abc_round15
├── teamId:       string      "team_abc"
├── leagueId:     string      "liga_amigos_xyz"
├── roundId:      string      "round_15"
├── scheme:       string      "4-3-3"
├── captainId:    string      "ply_gabigol"
├── isLocked:     boolean     true              ← true após o prazo
├── lockedAt:     timestamp
│
├── starters: [                                 ← 11 titulares
│     "ply_everson",
│     "ply_leo_zag",
│     "ply_gus_gomez",
│     "ply_marcos_rocha",
│     "ply_piquerez",
│     "ply_raphael_veiga",
│     "ply_ze_rafael",
│     "ply_anibal_moreno",
│     "ply_dudu",
│     "ply_flaco_lopez",
│     "ply_gabigol"
│   ]
│
└── bench: [                                    ← reservas
      "ply_estevao",
      "ply_abel_ruiz",
      "ply_rony",
      "ply_murilo_zag"
    ]
```

---

## 8. Coleção: `roundScores`

Pontuação de cada time em cada rodada. Calculada pelo servidor ao fim da rodada.

### Chave: `{leagueId}_{roundId}_{teamId}`

```
roundScores/liga_xyz_round15_team_abc
├── teamId:       string      "team_abc"
├── leagueId:     string      "liga_amigos_xyz"
├── roundId:      string      "round_15"
├── totalPoints:  number      87.5
├── captainBonus: number      12.0             ← pontos extras do capitão
├── rank:         number      2                ← posição nesta rodada dentro da liga
│
└── breakdown: [                               ← detalhamento por jogador
      {
        "playerId":  "ply_gabigol",
        "name":      "Gabigol",
        "position":  "ATA",
        "isCaptain": true,
        "basePoints": 21.6,
        "totalPoints": 43.2,    ← 21.6 × 2 (capitão)
        "isStarter": true
      },
      {
        "playerId":  "ply_everson",
        "name":      "Everson",
        "position":  "GOL",
        "isCaptain": false,
        "basePoints": 19.0,
        "totalPoints": 19.0,
        "isStarter": true
      }
    ]
```

---

## 9. Snake Draft — Coleções `drafts` e `drafts/{id}/picks`

Esta é a funcionalidade mais complexa. Funciona exatamente como o **Sleeper Fantasy**.

### Como funciona o Snake Draft

```
Exemplo com 4 times:
  Time A (posição 1)
  Time B (posição 2)
  Time C (posição 3)
  Time D (posição 4)

Rodada 1 (ordem crescente): A → B → C → D
Rodada 2 (ordem inversa):   D → C → B → A    ← "snake" (cobra)
Rodada 3 (ordem crescente): A → B → C → D
Rodada 4 (ordem inversa):   D → C → B → A
...e assim por diante

Pick 1:  Time A escolhe → Gabigol
Pick 2:  Time B escolhe → Hulk
Pick 3:  Time C escolhe → Pedro
Pick 4:  Time D escolhe → Raphael Veiga
Pick 5:  Time D escolhe → (rodada 2 começa — D vai primeiro)
Pick 6:  Time C escolhe
Pick 7:  Time B escolhe
Pick 8:  Time A escolhe
...
```

### `drafts/{leagueId}`

```
drafts/liga_amigos_xyz
├── leagueId:      string      "liga_amigos_xyz"
├── status:        string      "active"         ← waiting|active|paused|completed
├── draftType:     string      "snake"
├── numTeams:      number      6
├── totalRounds:   number      15               ← picks por time (tamanho do elenco)
├── totalPicks:    number      90               ← numTeams × totalRounds
├── timePerPick:   number      60               ← segundos por escolha
│
├── currentPick:   number      14               ← pick geral atual (1 a totalPicks)
├── currentRound:  number      3                ← rodada do draft (1 a totalRounds)
├── currentTeamId: string      "team_abc"       ← quem deve escolher agora
├── pickDeadline:  timestamp                    ← quando o timer expira
│
├── draftOrder:    [                            ← ordem das posições (embaralhada no início)
│     "team_abc",   ← posição 1
│     "team_def",   ← posição 2
│     "team_ghi",   ← posição 3
│     "team_jkl",   ← posição 4
│     "team_mno",   ← posição 5
│     "team_pqr"    ← posição 6
│   ]
│
├── startedAt:     timestamp
└── completedAt:   timestamp   (null enquanto ativo)
```

### Subcoleção: `drafts/{leagueId}/picks/{pickNumber}`

```
picks/14
├── pickNumber:    number      14               ← pick geral (1 a totalPicks)
├── round:         number      3                ← rodada do draft
├── pickInRound:   number      2                ← posição nesta rodada (1 a numTeams)
├── teamId:        string      "team_abc"
├── teamName:      string      "Os Brabos FC"
├── playerId:      string      "ply_gabigol"
├── playerName:    string      "Gabigol"
├── playerPosition:string      "ATA"
├── isAutoPick:    boolean     false            ← true se o timer expirou
└── pickedAt:      timestamp
```

---

## 10. Diagrama de Relações

```
users ──────────────── fantasyTeams
  │                         │
  │                         ├── roster (subcoleção)
  │                         │       └── referência → players
  │                         │
  │                    lineups (por rodada)
  │                         │
  └── leagues ──────── members (subcoleção)
        │                   └── referência → users
        │
        └── drafts
              └── picks (subcoleção)
                    └── referência → players

players ──── playerStats (por rodada)
               └── referência → rounds/matches

seasons
  └── rounds
        └── matches
```

---

## Firebase vs Supabase — Comparação

| Critério | Firebase (Firestore) | Supabase (PostgreSQL) |
|---|---|---|
| Tipo | NoSQL — documentos | SQL — tabelas relacionais |
| Tempo real | Nativo (`.onSnapshot`) | Sim (via Realtime) |
| Curva de aprendizado | Baixa | Média |
| Joins | Não tem (você desnormaliza) | Sim (JOIN nativo) |
| Escalabilidade | Automática | Manual (ou gerenciada) |
| Custo inicial | Gratuito (Spark) | Gratuito (até 500MB) |
| Melhor para | Apps em tempo real, protótipos | Apps com dados muito relacionais |
| **Recomendação para este projeto** | ✓ **Melhor opção** | Alternativa válida |

### Por que escolhemos Firestore

O draft ao vivo e a atualização de pontuação em tempo real são os diferenciais deste app. O Firestore faz isso nativamente com `.onSnapshot()`:

```javascript
// Toda vez que o draft mudar, o app atualiza automaticamente
const draftRef = doc(db, 'drafts', leagueId);
onSnapshot(draftRef, (snapshot) => {
  const draft = snapshot.data();
  atualizarTelaDosDraft(draft);  // UI atualiza em tempo real para todos
});
```

---

## Regras de Segurança (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Usuário só lê/edita o próprio perfil
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Jogadores — qualquer usuário logado pode ler, só o servidor escreve
    match /players/{playerId} {
      allow read: if request.auth != null;
      allow write: if false;  // apenas Cloud Functions
    }

    // Escalação — só o dono do time pode editar, e apenas antes do prazo
    match /lineups/{lineupId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == getTeamOwner(lineupId)
                   && request.time < getRoundDeadline(lineupId);
    }

    // Pontuações — só o servidor escreve
    match /roundScores/{scoreId} {
      allow read: if request.auth != null;
      allow write: if false;  // apenas Cloud Functions
    }

    // Draft — só o time da vez pode fazer o pick
    match /drafts/{leagueId}/picks/{pickId} {
      allow read: if request.auth != null;
      allow create: if isCurrentDraftTurn(leagueId, request.auth.uid);
    }
  }
}
```
