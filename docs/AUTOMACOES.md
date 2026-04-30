# Sistema de Automações — Bolei Fantasy

Guia completo para iniciantes sobre como automatizar os eventos do jogo.

---

## O que são automações?

Automações são **funções que rodam sozinhas** no servidor, sem precisar que alguém aperte um botão.

Exemplo sem automação:
> "Alguém dropou um jogador → um admin precisaria abrir o painel e clicar em 'Iniciar leilão' manualmente."

Com automação:
> "Alguém dropou um jogador → o servidor detecta isso e inicia o leilão automaticamente, 1 segundo depois."

Existem dois tipos:

| Tipo | Quando roda | Exemplo |
|---|---|---|
| **Trigger** | Quando algo acontece no banco de dados | Jogador dropado → inicia leilão |
| **Cron** | Em horário fixo, tipo alarme | A cada hora → verifica leilões expirados |

---

## Firebase vs Supabase — qual usar?

| | Firebase | Supabase |
|---|---|---|
| **Facilidade** | ⭐⭐⭐⭐⭐ Mais fácil para iniciantes | ⭐⭐⭐⭐ Um pouco mais técnico |
| **Linguagem** | JavaScript/TypeScript | JavaScript/TypeScript (Deno) |
| **Triggers** | Firestore triggers | Database webhooks + Edge Functions |
| **Cron** | Cloud Scheduler (grátis no plano Blaze) | pg_cron (built-in) |
| **Custo** | Grátis até certo volume | Grátis até certo volume |
| **Integração** | Perfeito com React Native + Next.js | Ótimo com Next.js |

**Recomendação para iniciante: Firebase.**
É mais fácil de configurar, tem ótima documentação em português e funciona nativamente com React Native.

---

## Parte 1 — Firebase (recomendado)

### Configuração inicial

**Passo 1 — Instalar ferramentas**

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

Escolha: Functions → JavaScript → ESLint: Não → Install dependencies: Sim

**Passo 2 — Estrutura criada**

```
functions/
├── index.js      ← Aqui vai todo o código das automações
├── package.json
```

**Passo 3 — Instalar dependências extras**

```bash
cd functions
npm install axios
```

---

### Evento 1 — Jogador dropado → iniciar leilão

Quando alguém remove um jogador do time, o Firestore detecta a mudança e cria um leilão automaticamente.

```js
// functions/index.js
const functions = require('firebase-functions');
const admin     = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// ── Trigger: time atualizado ───────────────────────────────────────────────
exports.aoDroparJogador = functions.firestore
  .document('times/{timeId}')
  .onUpdate(async (change, context) => {
    const antes  = change.before.data();
    const depois = change.after.data();

    // Descobre quais jogadores saíram
    const jogadoresDropados = (antes.jogadores ?? []).filter(
      id => !(depois.jogadores ?? []).includes(id)
    );

    if (jogadoresDropados.length === 0) return null;

    // Para cada jogador dropado, cria um leilão de 12 horas
    const batch = db.batch();

    for (const jogadorId of jogadoresDropados) {
      const jogadorSnap = await db.collection('jogadores').doc(jogadorId).get();
      if (!jogadorSnap.exists) continue;

      const agora     = new Date();
      const termina   = new Date(agora.getTime() + 12 * 60 * 60 * 1000); // +12h

      const leilaoRef = db.collection('leiloes').doc();
      batch.set(leilaoRef, {
        jogadorId,
        jogador:         jogadorSnap.data(),
        lanceAtual:      0,
        maiorLancedor:   null,
        maiorLancedorId: null,
        numLances:       0,
        status:          'ativo',
        motivo:          'dropped',
        criadoEm:        admin.firestore.FieldValue.serverTimestamp(),
        terminaEm:       admin.firestore.Timestamp.fromDate(termina),
        timeOrigemId:    context.params.timeId,
      });

      // Marca o jogador como "em leilão"
      batch.update(db.collection('jogadores').doc(jogadorId), {
        status: 'em_leilao',
        leilaoId: leilaoRef.id,
      });
    }

    await batch.commit();
    console.log(`Leilões criados para: ${jogadoresDropados.join(', ')}`);
    return null;
  });
```

---

### Evento 2 — Jogador novo na liga → iniciar leilão

Quando um novo jogador é adicionado à coleção `jogadores` (via sincronização com Sofascore), se não pertencer a nenhum time, inicia leilão automaticamente.

```js
// functions/index.js (adicionar abaixo do anterior)

exports.aoAdicionarJogador = functions.firestore
  .document('jogadores/{jogadorId}')
  .onCreate(async (snap, context) => {
    const jogador = snap.data();

    // Só cria leilão se for agente livre
    if (jogador.timeId) {
      console.log(`${jogador.nick} já tem time, pulando leilão.`);
      return null;
    }

    const agora   = new Date();
    const termina = new Date(agora.getTime() + 12 * 60 * 60 * 1000);

    await db.collection('leiloes').add({
      jogadorId:       context.params.jogadorId,
      jogador,
      lanceAtual:      0,
      maiorLancedor:   null,
      maiorLancedorId: null,
      numLances:       0,
      status:          'ativo',
      motivo:          'novo_jogador',
      criadoEm:        admin.firestore.FieldValue.serverTimestamp(),
      terminaEm:       admin.firestore.Timestamp.fromDate(termina),
    });

    console.log(`Leilão criado para novo jogador: ${jogador.nick}`);
    return null;
  });
```

---

### Evento 3 — Jogo real termina → leilão para agentes livres

Após o jogo, jogadores que são agentes livres (sem time na liga) entram em leilão automaticamente.

```js
// functions/index.js (adicionar abaixo)

// Chamada pelo webhook do Sofascore ou manualmente após o jogo
exports.aoTerminarJogo = functions.firestore
  .document('partidas/{partidaId}')
  .onUpdate(async (change, context) => {
    const antes  = change.before.data();
    const depois = change.after.data();

    // Só age quando o jogo mudar para "encerrado"
    if (antes.status === depois.status) return null;
    if (depois.status !== 'encerrado') return null;

    console.log(`Partida ${context.params.partidaId} encerrada.`);

    // Busca jogadores desta partida que são agentes livres
    const jogadoresSnap = await db.collection('jogadores')
      .where('clubeId', 'in', [depois.clubeCasaId, depois.clubeVisitanteId])
      .where('timeId', '==', null)  // agente livre
      .where('status', '==', 'disponivel')
      .get();

    if (jogadoresSnap.empty) return null;

    const batch  = db.batch();
    const agora  = new Date();
    const termina = new Date(agora.getTime() + 12 * 60 * 60 * 1000);

    for (const doc of jogadoresSnap.docs) {
      // Evita criar leilão duplicado
      const leilaoExistente = await db.collection('leiloes')
        .where('jogadorId', '==', doc.id)
        .where('status', '==', 'ativo')
        .limit(1)
        .get();

      if (!leilaoExistente.empty) continue;

      const leilaoRef = db.collection('leiloes').doc();
      batch.set(leilaoRef, {
        jogadorId:       doc.id,
        jogador:         doc.data(),
        lanceAtual:      0,
        maiorLancedor:   null,
        maiorLancedorId: null,
        numLances:       0,
        status:          'ativo',
        motivo:          'pos_jogo',
        criadoEm:        admin.firestore.FieldValue.serverTimestamp(),
        terminaEm:       admin.firestore.Timestamp.fromDate(termina),
      });
    }

    await batch.commit();
    return null;
  });
```

---

### Evento 4 — Finalizar leilões após 12h (CRON)

Roda a cada hora. Verifica leilões expirados, transfere o jogador para o vencedor e debita as moedas.

```js
// functions/index.js (adicionar abaixo)
// ATENÇÃO: requer plano Blaze (pague conforme uso) para Cloud Scheduler

exports.finalizarLeiloes = functions.pubsub
  .schedule('every 1 hours')        // roda de hora em hora
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    const agora = admin.firestore.Timestamp.now();

    // Busca leilões ativos que já expiraram
    const leiloesSnap = await db.collection('leiloes')
      .where('status', '==', 'ativo')
      .where('terminaEm', '<=', agora)
      .get();

    if (leiloesSnap.empty) {
      console.log('Nenhum leilão para finalizar.');
      return null;
    }

    console.log(`Finalizando ${leiloesSnap.size} leilão(ões)...`);

    for (const doc of leiloesSnap.docs) {
      const leilao = doc.data();

      // Executa tudo numa transação para garantir consistência
      await db.runTransaction(async tx => {
        const leilaoRef = db.collection('leiloes').doc(doc.id);

        if (leilao.maiorLancedorId) {
          // Tem vencedor — transfere o jogador
          const timeRef = db.collection('times').doc(leilao.maiorLancedorId);
          const timeSnap = await tx.get(timeRef);

          if (timeSnap.exists) {
            const jogadores = timeSnap.data().jogadores ?? [];

            if (jogadores.length < 23) {
              // Adiciona jogador ao time
              tx.update(timeRef, {
                jogadores: admin.firestore.FieldValue.arrayUnion(leilao.jogadorId),
              });

              // Debita moedas (já foram descontadas no lance, mas confirma)
              console.log(`✅ ${leilao.jogador?.nick} → ${timeSnap.data().nome} por ${leilao.lanceAtual} moedas`);
            } else {
              // Time cheio — devolve as moedas
              tx.update(timeRef, {
                moedas: admin.firestore.FieldValue.increment(leilao.lanceAtual),
              });
              console.log(`⚠️ Time ${timeSnap.data().nome} cheio — moedas devolvidas`);
            }
          }
        } else {
          // Sem lances — jogador vira agente livre de novo
          tx.update(db.collection('jogadores').doc(leilao.jogadorId), {
            status: 'disponivel',
            leilaoId: null,
          });
          console.log(`ℹ️ ${leilao.jogador?.nick} sem lances, voltou para agentes livres`);
        }

        // Marca leilão como encerrado
        tx.update(leilaoRef, { status: 'encerrado' });
      });
    }

    return null;
  });
```

---

### Evento 5 — Atualizar pontuação (CRON)

Roda a cada 5 minutos durante rodadas ao vivo, chamando a API do Sofascore.

```js
// functions/index.js (adicionar abaixo)
const axios = require('axios');

const SOFASCORE_BASE = 'https://api.sofascore.com/api/v1';

exports.atualizarPontuacao = functions.pubsub
  .schedule('every 5 minutes')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {

    // Verifica se existe rodada ao vivo
    const rodadaSnap = await db.collection('config').doc('rodadaAtual').get();
    const rodada = rodadaSnap.data();

    if (!rodada || rodada.status !== 'ao_vivo') {
      console.log('Sem rodada ao vivo. Pulando atualização.');
      return null;
    }

    console.log(`Atualizando rodada ${rodada.numero}...`);

    // Busca partidas ao vivo do Brasileirão (ID 325)
    const { data } = await axios.get(
      `${SOFASCORE_BASE}/sport/football/scheduled-events/today`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const partidasAoVivo = (data.events ?? []).filter(e =>
      e.tournament?.uniqueTournament?.id === 325 &&
      e.status?.type === 'inprogress'
    );

    if (partidasAoVivo.length === 0) {
      console.log('Nenhuma partida ao vivo no Brasileirão.');
      return null;
    }

    const batch = db.batch();

    for (const partida of partidasAoVivo) {
      try {
        // Busca estatísticas dos jogadores da partida
        const { data: statsData } = await axios.get(
          `${SOFASCORE_BASE}/event/${partida.id}/lineups`,
          { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );

        const todosJogadores = [
          ...(statsData.home?.players ?? []),
          ...(statsData.away?.players ?? []),
        ];

        for (const entry of todosJogadores) {
          const stats = entry.statistics;
          if (!stats) continue;

          // Calcula pontuação usando as regras do Cartola
          const pts = calcularPontuacao(entry.player?.position, stats);

          const jogadorRef = db.collection('jogadores')
            .doc(String(entry.player?.id));

          batch.set(jogadorRef, {
            ptsRodada: pts,
            statsRodada: stats,
            ultimaAtualizacao: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }

      } catch (err) {
        console.error(`Erro na partida ${partida.id}:`, err.message);
      }
    }

    await batch.commit();

    // Recalcula pontos de todos os times
    await recalcularTimes();

    console.log('Pontuação atualizada com sucesso!');
    return null;
  });

// ── Helpers ────────────────────────────────────────────────────────────────

function calcularPontuacao(posicao, stats) {
  let pts = 0;

  // Scouts de ataque (todos os jogadores de campo)
  pts += (stats.goals         ?? 0) * 8;
  pts += (stats.goalAssist    ?? 0) * 5;
  pts += (stats.onTargetScoringAttempt ?? 0) * 1.2;
  pts += (stats.savedShotsFromInsideTheBox ?? 0) * 0.8;
  pts += (stats.wasFouled     ?? 0) * 0.5;
  pts -= (stats.yellowCards   ?? 0) * 1;
  pts -= (stats.redCards      ?? 0) * 3;
  pts -= (stats.fouls         ?? 0) * 0.3;

  // Scouts exclusivos do goleiro
  if (posicao === 'G') {
    pts += (stats.savedShotsFromInsideTheBox ?? 0) * 1.3;  // defesa
    pts += (stats.penaltySave ?? 0) * 7;                   // defesa de pênalti
    pts -= (stats.goalsConceded ?? 0) * 1;                 // gol sofrido
  }

  return Math.round(pts * 10) / 10; // arredonda para 1 casa decimal
}

async function recalcularTimes() {
  const timesSnap = await db.collection('times').get();
  const batch = db.batch();

  for (const timeDoc of timesSnap.docs) {
    const time = timeDoc.data();
    const jogadorIds = time.jogadores ?? [];

    let totalPts = 0;
    const capitaoId = time.capitao;

    for (const jogadorId of jogadorIds) {
      const jogadorSnap = await db.collection('jogadores').doc(jogadorId).get();
      if (!jogadorSnap.exists) continue;
      const pts = jogadorSnap.data().ptsRodada ?? 0;
      totalPts += (jogadorId === capitaoId) ? pts * 2 : pts;
    }

    batch.update(timeDoc.ref, {
      ptsRodada: Math.round(totalPts * 10) / 10,
    });
  }

  await batch.commit();
}
```

---

### Publicar as funções no Firebase

```bash
# Na pasta functions/
firebase deploy --only functions

# Para ver os logs em tempo real:
firebase functions:log
```

---

## Parte 2 — Supabase (alternativa)

Se preferir usar Supabase (banco PostgreSQL + funções em JavaScript):

### Configuração

```bash
npm install -g supabase
supabase init
supabase start
```

### Cron — finalizar leilões (pg_cron no SQL)

O Supabase tem um agendador de tarefas direto no banco de dados, sem precisar de código extra:

```sql
-- No SQL Editor do painel Supabase

-- Habilitar extensão de cron
create extension if not exists pg_cron;

-- Rodar a cada hora: finalizar leilões expirados
select cron.schedule(
  'finalizar-leiloes',      -- nome do job
  '0 * * * *',              -- a cada hora (formato cron)
  $$
    -- Transfere jogador para o vencedor
    update leiloes
    set status = 'encerrado'
    where status = 'ativo'
      and termina_em <= now();

    -- Adiciona jogador ao time vencedor
    insert into time_jogadores (time_id, jogador_id)
    select maior_lancedor_id, jogador_id
    from leiloes
    where status = 'encerrado'
      and maior_lancedor_id is not null
      and finalizado_em is null;

    -- Marca como finalizado
    update leiloes
    set finalizado_em = now()
    where status = 'encerrado'
      and finalizado_em is null;
  $$
);

-- Rodar a cada 5 min: lembrete de leilão expirando em breve
select cron.schedule(
  'notificar-leilao-expirando',
  '*/5 * * * *',
  $$ select notificar_leiloes_expirando(); $$
);
```

### Trigger — jogador dropado (SQL)

```sql
-- Função que roda quando time é atualizado
create or replace function ao_dropar_jogador()
returns trigger as $$
declare
  jogador_dropado text;
begin
  -- Encontra jogadores que saíram
  for jogador_dropado in
    select unnest(old.jogadores)
    except
    select unnest(new.jogadores)
  loop
    -- Cria leilão de 12h
    insert into leiloes (jogador_id, lance_atual, status, termina_em, motivo)
    values (
      jogador_dropado,
      0,
      'ativo',
      now() + interval '12 hours',
      'dropped'
    );
  end loop;

  return new;
end;
$$ language plpgsql;

-- Conecta o trigger à tabela times
create trigger trigger_dropar_jogador
  after update on times
  for each row
  when (old.jogadores <> new.jogadores)
  execute function ao_dropar_jogador();
```

### Edge Function — atualizar pontuação

```bash
supabase functions new atualizar-pontuacao
```

```typescript
// supabase/functions/atualizar-pontuacao/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async () => {
  // Busca partidas ao vivo do Brasileirão
  const resp = await fetch(
    'https://api.sofascore.com/api/v1/sport/football/scheduled-events/today',
    { headers: { 'User-Agent': 'Mozilla/5.0' } }
  );
  const data = await resp.json();

  const partidas = (data.events ?? []).filter((e: any) =>
    e.tournament?.uniqueTournament?.id === 325 &&
    e.status?.type === 'inprogress'
  );

  for (const partida of partidas) {
    const lineupResp = await fetch(
      `https://api.sofascore.com/api/v1/event/${partida.id}/lineups`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );
    const lineupData = await lineupResp.json();

    const todos = [
      ...(lineupData.home?.players ?? []),
      ...(lineupData.away?.players ?? []),
    ];

    for (const entry of todos) {
      const pts = calcularPontuacao(entry.player?.position, entry.statistics ?? {});
      await supabase
        .from('jogadores')
        .update({ pts_rodada: pts, stats_rodada: entry.statistics })
        .eq('sofascore_id', entry.player?.id);
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

function calcularPontuacao(pos: string, stats: any): number {
  let pts = 0;
  pts += (stats.goals ?? 0) * 8;
  pts += (stats.goalAssist ?? 0) * 5;
  pts += (stats.onTargetScoringAttempt ?? 0) * 1.2;
  pts -= (stats.yellowCards ?? 0) * 1;
  pts -= (stats.redCards ?? 0) * 3;
  if (pos === 'G') {
    pts += (stats.savedShotsFromInsideTheBox ?? 0) * 1.3;
    pts -= (stats.goalsConceded ?? 0) * 1;
  }
  return Math.round(pts * 10) / 10;
}
```

```bash
# Publicar a função
supabase functions deploy atualizar-pontuacao

# Agendar via cron (painel Supabase ou pg_cron):
# */5 * * * * → curl https://sua-url.supabase.co/functions/v1/atualizar-pontuacao
```

---

## Resumo visual — qual usar

```
Você quer a forma mais simples?
         │
         ▼
   Já usa Firebase?
   ┌─────┴──────┐
  SIM          NÃO
   │             │
   ▼             ▼
Firebase     Supabase
Cloud Fn     Edge Fn
+ Triggers   + pg_cron
+ Scheduler  + Triggers SQL
```

## Tabela de automações implementadas

| Evento | Firebase | Supabase | Tipo |
|---|---|---|---|
| Jogador dropado | `aoDroparJogador` | Trigger SQL | Trigger |
| Jogador novo | `aoAdicionarJogador` | Trigger SQL | Trigger |
| Jogo termina → agente livre | `aoTerminarJogo` | Trigger SQL | Trigger |
| Finalizar leilões (1h) | `finalizarLeiloes` | pg_cron SQL | Cron |
| Atualizar pontuação (5min) | `atualizarPontuacao` | Edge Function | Cron |

## Próximos passos

1. **Escolha Firebase ou Supabase** — para iniciante, Firebase
2. **Configure o projeto** com `firebase init functions`
3. **Copie os exemplos** de código deste arquivo para `functions/index.js`
4. **Teste localmente** com `firebase emulators:start`
5. **Publique** com `firebase deploy --only functions`
6. **Veja os logs** com `firebase functions:log`
