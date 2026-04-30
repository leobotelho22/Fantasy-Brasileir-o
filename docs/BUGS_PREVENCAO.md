# Prevenção de Bugs de Integridade de Dados

Este documento explica os três principais bugs de integridade que precisamos evitar, e como o Bolei os previne em cada camada (client-side, server-side).

---

## Bug 1 — Mais de 23 jogadores em um time

### O problema

Sem uma verificação de limite, duas ações simultâneas (ex: aceitar um trade e vencer um leilão ao mesmo tempo) podem adicionar jogadores acima do máximo de 23, corrompendo o estado do time.

### Como prevenimos

**Client-side (`src/lib/guards.js`):**
```js
export function canAddPlayer(team, player) {
  if ((team.players ?? []).length >= MAX_SQUAD)
    return `Time cheio (${MAX_SQUAD}/${MAX_SQUAD}). Libere um jogador primeiro.`;
  return null;
}
```

Essa função é chamada em **toda ação que adiciona um jogador**:
- `makeDraftPick` — antes de registrar o pick
- `placeBid` — quando o usuário não está ganhando o leilão ainda
- `acceptTrade` — calcula `playersAfterRemoval + incoming` antes de aceitar

**Backend (Firestore):**
```js
// Cloud Function ao finalizar leilão
transaction.runTransaction(async (tx) => {
  const teamRef  = db.doc(`teams/${winnerTeamId}`);
  const teamSnap = await tx.get(teamRef);
  const players  = teamSnap.data().players ?? [];

  if (players.length >= 23) throw new Error('Time cheio');

  tx.update(teamRef, { players: [...players, playerId] });
  tx.update(auctionRef, { status: 'finished', winnerId: winnerTeamId });
});
```

**Backend (Supabase):**
```sql
CREATE OR REPLACE FUNCTION check_squad_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT count(*) FROM team_players WHERE team_id = NEW.team_id) >= 23 THEN
    RAISE EXCEPTION 'Time cheio: máximo de 23 jogadores.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_squad_limit
  BEFORE INSERT ON team_players
  FOR EACH ROW EXECUTE FUNCTION check_squad_limit();
```

---

## Bug 2 — Jogador reservado sendo usado em outra ação

### O problema

Se o usuário envia um trade oferecendo o jogador X e, ao mesmo tempo, tenta liberar X num leilão ou em outro trade, X pode sair do time sem o primeiro trade ser cancelado — gerando inconsistência (trade referenciando jogador que não existe mais no elenco).

### Como prevenimos

**Client-side (`src/store/useStore.js`):**

O store mantém um array `reservedPlayerIds` com os IDs de todos os jogadores que estão comprometidos em propostas pendentes enviadas pelo usuário.

```js
reservedPlayerIds: TRADES
  .filter(t => t.fromTeamId === 'team_me' && t.status === 'pending')
  .flatMap(t => t.requestedPlayers ?? []),
```

A cada ação que libera um jogador, `canDropPlayer` é chamado:
```js
export function canDropPlayer(team, playerId, reservedIds = []) {
  if (reservedIds.includes(playerId))
    return 'Jogador reservado em proposta de trade pendente. Cancele a proposta primeiro.';
  return null;
}
```

Isso é verificado em:
- **Mercado** — seletor de "jogador a liberar" no modal de lance desabilita jogadores reservados com ícone de cadeado
- **Trades** — `proposeTrade` bloqueia se o jogador já está reservado
- **useStore.placeBid** — valida `dropPlayerId` antes de executar

Quando um trade é cancelado (`rejectTrade`), os jogadores são automaticamente liberados:
```js
newReserved = newReserved.filter(id => !(trade.requestedPlayers ?? []).includes(id));
```

**Backend (Firestore):**
```js
// Antes de aprovar qualquer ação que remove um jogador, verifique trades pendentes
const pendingTrades = await db.collection('trades')
  .where('fromTeamId', '==', teamId)
  .where('status', '==', 'pending')
  .get();

const reservedIds = pendingTrades.docs
  .flatMap(d => d.data().requestedPlayers ?? []);

if (reservedIds.includes(playerId))
  throw new Error('Jogador reservado em trade pendente.');
```

**Backend (Supabase):**
```sql
CREATE OR REPLACE FUNCTION check_player_reserved()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM trade_players tp
    JOIN trades t ON tp.trade_id = t.id
    WHERE tp.player_id = NEW.player_id
      AND t.from_team_id = NEW.from_team_id
      AND t.status = 'pending'
  ) THEN
    RAISE EXCEPTION 'Jogador reservado em trade pendente.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## Bug 3 — Dois usuários ganhando o mesmo leilão

### O problema

Em um sistema multi-usuário, se dois usuários fazem o lance vencedor quase ao mesmo tempo, sem atomicidade ambos podem acreditar que ganharam e o jogador acaba sendo adicionado a dois times.

### Como prevenimos no cliente (single-user demo)

O cliente valida que o leilão ainda está ativo e que o usuário tem saldo suficiente antes de registrar qualquer lance:

```js
export function canBid(auction, amount, userCoins, alreadyWinning) {
  if (new Date(auction.endsAt) <= new Date()) return 'Leilão já encerrado.';
  // ...
}
```

### Como prevenir no backend (produção)

A única solução correta para leilões concorrentes é **transação atômica** no banco de dados.

**Firestore (Cloud Functions):**
```js
exports.finalizarLeilao = functions.pubsub.schedule('every 5 minutes').onRun(async () => {
  const now = new Date();
  const expirados = await db.collection('auctions')
    .where('status', '==', 'active')
    .where('endsAt', '<=', now.toISOString())
    .get();

  const promises = expirados.docs.map(doc =>
    db.runTransaction(async (tx) => {
      const auctionSnap = await tx.get(doc.ref);
      const auction     = auctionSnap.data();

      // Re-verificação dentro da transação (leitura + escrita atômica)
      if (auction.status !== 'active') return; // já finalizado por outra instância

      const winnerId = auction.highBidderTeamId;
      if (!winnerId) {
        tx.update(doc.ref, { status: 'finished', winnerId: null });
        return;
      }

      const teamRef  = db.doc(`teams/${winnerId}`);
      const teamSnap = await tx.get(teamRef);
      const players  = teamSnap.data().players ?? [];

      if (players.length >= 23) {
        // Time cheio: leilão vai para o segundo colocado ou encerra sem vencedor
        tx.update(doc.ref, { status: 'finished', winnerId: null, note: 'time_cheio' });
        return;
      }

      // Atualização atômica: apenas um processo chega aqui para o mesmo leilão
      tx.update(doc.ref, { status: 'finished', winnerId });
      tx.update(teamRef, { players: [...players, auction.playerId] });
    })
  );

  await Promise.all(promises);
});
```

**Supabase (SQL SELECT FOR UPDATE):**
```sql
BEGIN;

SELECT * FROM auctions
WHERE id = $1 AND status = 'active'
FOR UPDATE; -- bloqueia a linha para outras transações simultâneas

-- Se chegou aqui, somos os únicos a processar este leilão
UPDATE auctions SET status = 'finished', winner_team_id = $2 WHERE id = $1;
INSERT INTO team_players (team_id, player_id) VALUES ($2, $3);

COMMIT;
```

O `FOR UPDATE` garante que apenas **uma** transação processa o leilão por vez — qualquer outra que tente rodar ao mesmo tempo vai aguardar o `COMMIT` anterior antes de continuar, e então verá `status = 'finished'` e abortará.

---

## Resumo das Camadas de Proteção

| Bug                        | Client (guards.js) | Store (reservedPlayerIds) | Backend (transação) |
|----------------------------|--------------------|---------------------------|---------------------|
| Time com >23 jogadores     | `canAddPlayer`     | verificado em toda ação   | trigger SQL / Firestore tx |
| Jogador reservado liberado | `canDropPlayer`    | `reservedPlayerIds[]`     | query trades pendentes |
| Dois vencedores no leilão  | `canBid` (endsAt)  | —                         | `SELECT FOR UPDATE` / `runTransaction` |

> **Regra de ouro:** O cliente previne erros acidentais e melhora a UX. O backend é a única fonte de verdade — nunca confie só no cliente para garantir integridade de dados em um sistema real com múltiplos usuários.
