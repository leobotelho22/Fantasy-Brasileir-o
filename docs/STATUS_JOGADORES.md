# Status de Jogadores — Guia Completo

Este documento explica o modelo de dados de status, como a interface exibe cada estado, e como integrar com APIs externas quando você quiser dados reais.

---

## 1. Modelo de dados

Cada jogador tem um campo `status` com um destes quatro valores:

| Valor       | Significado            | Cor na interface |
|-------------|------------------------|-----------------|
| `probable`  | Titular provável       | Verde           |
| `bench`     | No banco de reservas   | Amarelo         |
| `injured`   | Lesionado              | Vermelho        |
| `suspended` | Suspenso               | Laranja/amarelo |

**Exemplo no código (`src/data/mock.js`):**
```js
{ id: 'p1', nick: 'Cássio', pos: 'GOL', club: 'Corinthians', pts: 14.2, avg: 12.1, status: 'probable' }
{ id: 'p3', nick: 'Santos', pos: 'GOL', club: 'Flamengo',    pts:  9.3, avg:  8.7, status: 'injured'  }
```

---

## 2. Onde o status aparece na interface

| Tela        | Como aparece                                              |
|-------------|-----------------------------------------------------------|
| Meu Time    | Coluna "Status" com ponto colorido + texto (Provável, Banco, etc.) |
| Meu Time    | Banner de alerta se houver jogadores lesionados/suspensos no time |
| Mercado     | Pill colorido ao lado do nome em agentes livres           |
| Draft       | Ponto colorido ao lado do nome na lista de disponíveis    |
| Dashboard   | Herdado do PlayerRow quando mostrado no preview do time   |

---

## 3. Componente `PlayerStatusBadge`

Criado em `src/components/PlayerStatusBadge.jsx`. Tem três variantes:

```jsx
// Ponto colorido pequeno (Draft, espaços apertados)
<PlayerStatusBadge status={player.status} variant="dot" />

// Ponto + texto (Meu Time, coluna de status)
<PlayerStatusBadge status={player.status} variant="badge" />

// Pill completo (Mercado, PlayerRow)
<PlayerStatusBadge status={player.status} variant="full" />
```

---

## 4. Como funciona a atualização no store

O `useStore` tem dois campos novos em `src/store/useStore.js`:

```js
// Tabela de overrides: player ID → novo status
playerStatuses: {},

// Atualiza um ou mais jogadores de uma vez
updatePlayerStatuses: (updates) =>
  set(state => ({ playerStatuses: { ...state.playerStatuses, ...updates } })),

// Lê o status final (override tem prioridade sobre o mock)
getPlayerStatus: (playerId) => { ... }
```

**Como usar:**
```js
const store = useStore.getState();

// Atualizar um jogador
store.updatePlayerStatuses({ p3: 'probable' }); // Santos voltou!

// Atualizar vários de uma vez (ex: resultado de chamada de API)
store.updatePlayerStatuses({
  p15: 'probable',  // Hulk confirmado
  p18: 'bench',     // Cano no banco
  p27: 'injured',   // Alex Sandro ainda lesionado
});
```

---

## 5. Fonte de dados — Começando simples (MVP)

### Opção A: Dados mockados (você já tem isso)

Edite `src/data/mock.js` e mude o `status` de cada jogador manualmente. Simples, sem custo, perfeito para começar.

### Opção B: API-Football (recomendado para iniciantes)

Site: https://www.api-football.com/

- **Plano gratuito**: 100 chamadas/dia — suficiente para MVP
- **O que retorna**: escalações prováveis, lesões, suspensões

**Passo a passo:**
1. Crie conta grátis em api-football.com
2. Copie sua API Key no painel
3. Instale o pacote: `npm install axios` (ou use `fetch` nativo)
4. Crie o arquivo `src/lib/fetchStatuses.js`:

```js
// src/lib/fetchStatuses.js

const API_KEY = 'SUA_API_KEY_AQUI'; // coloque no .env depois!
const BRASILEIRAO_ID = 71; // ID do Brasileirão Série A na API

export async function fetchPlayerStatuses(round) {
  // Busca as escalações prováveis da rodada
  const url = `https://v3.football.api-sports.io/fixtures/lineups?league=${BRASILEIRAO_ID}&season=2025&round=${round}`;

  const response = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY }
  });

  const data = await response.json();

  // Converte o formato da API para o nosso formato
  const statuses = {};

  for (const fixture of data.response) {
    for (const team of fixture) {
      // Titulares → 'probable'
      for (const player of team.startXI ?? []) {
        statuses[player.player.id] = 'probable';
      }
      // Banco → 'bench'
      for (const player of team.substitutes ?? []) {
        statuses[player.player.id] = 'bench';
      }
    }
  }

  return statuses;
}
```

5. Chame essa função antes de mostrar a tela (ex: no `useEffect` da página):

```js
// Em qualquer page.js que precise dos status atualizados:
import { useEffect } from 'react';
import useStore from '@/store/useStore';
import { fetchPlayerStatuses } from '@/lib/fetchStatuses';

export default function MercadoPage() {
  const { updatePlayerStatuses, round } = useStore();

  useEffect(() => {
    fetchPlayerStatuses(round.number)
      .then(statuses => updatePlayerStatuses(statuses))
      .catch(err => console.error('Erro ao buscar status:', err));
  }, [round.number]);

  // ... resto do componente
}
```

### Opção C: SofaScore (mais dados, mais complexo)

Site: https://www.sofascore.com/

Não tem API pública oficial, mas existe uma API não-oficial muito usada:
```
https://api.sofascore.com/api/v1/event/{matchId}/lineups
```

> ⚠️ APIs não-oficiais podem parar de funcionar a qualquer momento. Para produção, prefira API-Football ou Football-Data.

### Opção D: Football-Data (europeu, sem Brasileirão)

Site: https://www.football-data.org/

Tem plano gratuito, mas **não cobre o Brasileirão**. Útil apenas se você expandir para ligas europeias.

---

## 6. Atualização automática com cron

### Em produção com Firebase Cloud Functions:

```js
// functions/index.js

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore } = require('firebase-admin/firestore');
const { fetchPlayerStatuses } = require('./lib/fetchStatuses');

// Roda toda quinta-feira às 18h (dois dias antes dos jogos do fim de semana)
exports.atualizarStatusJogadores = onSchedule('0 18 * * 4', async () => {
  const db = getFirestore();
  const roundSnap = await db.doc('config/currentRound').get();
  const round = roundSnap.data().number;

  const statuses = await fetchPlayerStatuses(round);

  // Atualiza todos os jogadores em batch
  const batch = db.batch();
  for (const [playerId, status] of Object.entries(statuses)) {
    const ref = db.doc(`players/${playerId}`);
    batch.set(ref, { status }, { merge: true });
  }
  await batch.commit();

  console.log(`Status de ${Object.keys(statuses).length} jogadores atualizado.`);
});
```

### Com Supabase Edge Functions:

```typescript
// supabase/functions/atualizar-status/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Busca status da API
  const response = await fetch('https://v3.football.api-sports.io/fixtures/lineups?...', {
    headers: { 'x-apisports-key': Deno.env.get('API_FOOTBALL_KEY')! }
  });
  const data = await response.json();

  // Processa e salva no banco
  const updates = processStatuses(data);
  for (const [id, status] of Object.entries(updates)) {
    await supabase.from('players').update({ status }).eq('api_id', id);
  }

  return new Response('OK');
});
```

Agende no painel do Supabase: **Database → Extensions → pg_cron**:
```sql
SELECT cron.schedule(
  'atualizar-status-jogadores',
  '0 18 * * 4',  -- toda quinta às 18h
  $$
  SELECT net.http_post(
    url := 'https://SEU_PROJETO.supabase.co/functions/v1/atualizar-status',
    headers := '{"Authorization": "Bearer SEU_TOKEN"}'
  );
  $$
);
```

---

## 7. Resumo do fluxo completo

```
Toda quinta-feira às 18h
         ↓
Cron Job dispara (Firebase / Supabase)
         ↓
Chama API-Football → pega escalações prováveis da próxima rodada
         ↓
Salva no banco: players.status = 'probable' / 'bench' / 'injured' / 'suspended'
         ↓
Usuário abre o app → página chama updatePlayerStatuses() com dados do banco
         ↓
Interface exibe status atualizado em Meu Time, Mercado e Draft
```

---

## 8. Custo

| Serviço       | Plano gratuito            | Custo para MVP |
|---------------|---------------------------|----------------|
| API-Football  | 100 chamadas/dia          | R$ 0           |
| Firebase      | Spark (gratuito) até certo limite | R$ 0  |
| Supabase      | Free tier 500MB DB        | R$ 0           |
| Vercel        | Hobby plan (ilimitado)    | R$ 0           |

Para o MVP, o custo total é **R$ 0**.
