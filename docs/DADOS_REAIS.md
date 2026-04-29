# Dados Reais — Fantasy Brasileirão
> Como buscar scouts e elencos reais do Brasileirão Série A usando o Sofascore

---

## Por que o Sofascore?

O Sofascore é a fonte mais completa e detalhada de scouts para o Brasileirão Série A.
Ele fornece exatamente os eventos que precisamos: gols, assistências, defesas,
desarmes, faltas, cartões, finalizações — tudo por jogador, por partida.

**Importante:** o Sofascore não tem uma API oficial pública. Nós usamos a
mesma API que o site e o app deles utilizam internamente (não documentada).
Isso significa:
- Funciona muito bem para projetos pessoais e MVP
- Pode mudar sem aviso prévio (URLs podem quebrar)
- Não é para uso comercial em escala (veja os termos de uso do Sofascore)
- Para produção com muitos usuários, migre para uma API oficial paga

---

## IDs fixos do Sofascore

O Sofascore identifica tudo por IDs numéricos. Os IDs do Brasileirão não mudam:

| O que é | ID | Como usar |
|---|---|---|
| Brasileirão Série A (torneio) | **325** | fixo, nunca muda |
| Temporada 2024 | **57478** | muda a cada ano |
| Temporada 2025 | buscar dinamicamente | veja `buscarTemporadaAtual()` |

---

## Endpoints principais

Todos partem da base: `https://api.sofascore.com/api/v1`

| Endpoint | O que retorna |
|---|---|
| `/unique-tournament/325/seasons` | Lista de temporadas do Brasileirão |
| `/unique-tournament/325/season/{id}/events/round/{round}` | Partidas de uma rodada |
| `/event/{eventId}/lineups` | Escalação + scouts de cada jogador |
| `/event/{eventId}` | Detalhes da partida (placar, status) |
| `/sport/football/events/live` | Todas as partidas ao vivo agora |
| `/team/{teamId}/players` | Elenco completo de um time |
| `/player/{playerId}/unique-tournament/325/season/{seasonId}/statistics/overall` | Stats acumuladas do jogador na temporada |

---

## Fluxo de dados

```
SOFASCORE (fonte)
      │
      ▼
sofascore.js          ← busca os dados brutos (HTTP)
      │
      ▼
mapper.js             ← converte para o formato dos nossos scouts
      │
      ▼
calculator.js         ← calcula pontuação com base nos scouts
      │
      ▼
Firestore             ← salva resultado no banco de dados
      │
      ▼
App (celular/web)     ← exibe pontuação em tempo real
```

---

## Frequência de atualização recomendada

| Situação | Frequência | Motivo |
|---|---|---|
| Antes da rodada (sem jogos) | 1x por dia | Apenas mudanças de elenco/status |
| Jogos happening (ao vivo) | A cada 60 segundos | Sofascore atualiza ~1 min |
| Logo após o jogo terminar | 1x extra imediata | Garantir dados finais |
| Madrugada/intervalo entre rodadas | Não rodar | Economizar cota |

---

## Mapeamento: Sofascore → Nossos Scouts

| Campo Sofascore | Nosso Scout | Posição |
|---|---|---|
| `goals` | `gol` | Todos |
| `goalAssist` | `assistencia` | Todos |
| `onTargetScoringAttempt` - `goals` | `finalizacaoDefendida` | Todos |
| `blockedScoringAttempt` | `finalizacaoForA` (parcial) | Todos |
| `missedBalls` | `finalizacaoForA` (parcial) | Todos |
| `hitWoodwork` | `finalizacaoNaTrave` | Todos |
| `wasFouled` | `faltaSofrida` | Todos |
| `penaltyWon` | `penaltiSofrido` | Todos |
| `offsideGiven` | `impedimento` | Todos |
| `ownGoals` | `golContra` | Todos |
| `yellowCards` | `cartaoAmarelo` | Todos |
| `redCards` | `cartaoVermelho` | Todos |
| `foulsCommitted` | `faltaCometida` | Todos |
| `penaltyConceded` | `penaltiCometido` | Todos |
| `tackles` | `desarme` | Todos |
| `saves` | `defesa` (DD) | Só GOL |
| `penaltySave` | `defesaPenalti` (DP) | Só GOL |
| `goalsConceded` | `golSofrido` (GS) | Só GOL |
| calculado pelo placar | `jogoSemGol` (SG) | Todos |
| eventos da partida | `penaltiPerdido*` (3 variantes) | Todos |

> **Atenção:** pênalti perdido (PP) requer consulta ao endpoint de incidentes
> da partida (`/event/{id}/incidents`) para distinguir entre para fora,
> defendido e na trave.

---

## Alternativas ao Sofascore

Se o Sofascore quebrar ou for bloqueado, use estas alternativas:

| API | Gratuita? | Qualidade | Link |
|---|---|---|---|
| **API-Football** | 100 req/dia | Excelente | api-football.com |
| **football-data.org** | Sim (limitado) | Boa (sem scouts detalhados) | football-data.org |
| **RapidAPI Sports** | Freemium | Boa | rapidapi.com |
| **ESPN API** (não oficial) | Sim | Média | — |

Para MVP, o Sofascore é a melhor opção gratuita com os scouts que precisamos.
Para produção, use API-Football (~$10/mês no plano Basic).
