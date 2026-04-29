# Tabela de Pontuação — Fantasy Brasileirão
> Scouts oficiais do **Cartola FC** — Brasileirão Série A

---

## Regra geral

Todos os jogadores de campo (ZAG, LAT, MEI, ATA) usam **a mesma tabela**.
Apenas o **GOL** tem scouts exclusivos e uma exceção (FF não vale para goleiros).

---

## Scouts de Ataque

Valem para **todos os jogadores** (GOL, ZAG, LAT, MEI, ATA).

| Sigla | Evento | Pontos |
|:---:|---|:---:|
| **G** | Gol | **+8** |
| **A** | Assistência | **+5** |
| **FT** | Finalização na Trave | **+3** |
| **FD** | Finalização Defendida | **+1.2** |
| **FF** | Finalização para Fora ¹ | **+0.8** |
| **FS** | Falta Sofrida | **+0.5** |
| **PS** | Pênalti Sofrido | **+1** |
| **I** | Impedimento | **-0.1** |
| **PP** | Pênalti Perdido — para fora | **-3.2** |
| **PP** | Pênalti Perdido — defendido pelo goleiro | **-2.8** |
| **PP** | Pênalti Perdido — na trave (após defesa) ² | **-1** |

> ¹ **FF não vale para goleiros.**
>
> ² Quando a bola bate na trave **após uma defesa do goleiro**, o evento conta
> simultaneamente como FT (+3) e PP na trave (-1) → saldo líquido de **+2 pontos**.

---

## Scouts de Defesa

Valem para **todos os jogadores** (GOL, ZAG, LAT, MEI, ATA), exceto onde indicado.

| Sigla | Evento | Pontos | Quem pontua |
|:---:|---|:---:|---|
| **SG** | Jogo sem sofrer gol | **+5** | Todos |
| **DD** | Defesa ¹ | **+1.3** | Só GOL |
| **DP** | Defesa de Pênalti ¹ | **+7** | Só GOL |
| **GS** | Gol Sofrido ¹ | **-1** | Só GOL |
| **DS** | Desarme | **+1.5** | Todos |
| **GC** | Gol Contra | **-3** | Todos |
| **CV** | Cartão Vermelho | **-3** | Todos |
| **CA** | Cartão Amarelo | **-1** | Todos |
| **FC** | Falta Cometida | **-0.3** | Todos |
| **PC** | Pênalti Cometido | **-1** | Todos |

> ¹ **Scouts exclusivos do Goleiro (GOL).** Jogadores de campo não perdem ponto por gol sofrido.

---

## Técnico (TEC)

O técnico tem regras próprias, independentes da tabela acima.

| Evento | Pontos |
|---|:---:|
| Vitória | **+5** |
| Empate | **+1** |
| Derrota | **-1** |
| Gol marcado pelo time | **+0.5** |
| Gol sofrido | **-0.5** |
| Cartão amarelo (qualquer jogador do time) | **-0.5** |
| Cartão vermelho (qualquer jogador do time) | **-2** |

> Apenas um resultado por jogo (vitória, empate ou derrota).

---

## Capitão

- Qualquer titular pode ser capitão antes do prazo da rodada.
- A pontuação do capitão é **dobrada** — positiva e negativa.

```
Exemplo: capitão com 1G + 1CA
  Gol:           +8
  Cartão amarelo: -1
  Subtotal:       +7
  × 2 (capitão): +14
```

---

## Tabela Resumida por Posição

```
Scout   │ GOL  │ ZAG  │ LAT  │ MEI  │ ATA
────────┼──────┼──────┼──────┼──────┼──────
G       │  +8  │  +8  │  +8  │  +8  │  +8
A       │  +5  │  +5  │  +5  │  +5  │  +5
FT      │  +3  │  +3  │  +3  │  +3  │  +3
FD      │ +1.2 │ +1.2 │ +1.2 │ +1.2 │ +1.2
FF      │  —   │ +0.8 │ +0.8 │ +0.8 │ +0.8
FS      │ +0.5 │ +0.5 │ +0.5 │ +0.5 │ +0.5
PS      │  +1  │  +1  │  +1  │  +1  │  +1
I       │ -0.1 │ -0.1 │ -0.1 │ -0.1 │ -0.1
PP fora │ -3.2 │ -3.2 │ -3.2 │ -3.2 │ -3.2
PP def  │ -2.8 │ -2.8 │ -2.8 │ -2.8 │ -2.8
PP trave│  -1  │  -1  │  -1  │  -1  │  -1
────────┼──────┼──────┼──────┼──────┼──────
SG      │  +5  │  +5  │  +5  │  +5  │  +5
DD ★    │ +1.3 │  —   │  —   │  —   │  —
DP ★    │  +7  │  —   │  —   │  —   │  —
GS ★    │  -1  │  —   │  —   │  —   │  —
DS      │ +1.5 │ +1.5 │ +1.5 │ +1.5 │ +1.5
GC      │  -3  │  -3  │  -3  │  -3  │  -3
CV      │  -3  │  -3  │  -3  │  -3  │  -3
CA      │  -1  │  -1  │  -1  │  -1  │  -1
FC      │ -0.3 │ -0.3 │ -0.3 │ -0.3 │ -0.3
PC      │  -1  │  -1  │  -1  │  -1  │  -1

★ = exclusivo do Goleiro (campo não perde ponto por GS)
```

---

## Exemplos de Cálculo

### Atacante com 2 gols, 1 assistência e 1 cartão amarelo
```
G  × 2 =  2 × 8.0  = +16.0
A  × 1 =  1 × 5.0  =  +5.0
CA × 1 =  1 × -1.0 =  -1.0
─────────────────────────────
TOTAL                = +20.0
```

### Goleiro com 4 defesas e jogo sem gol
```
DD × 4 =  4 × 1.3  =  +5.2
SG × 1 =  1 × 5.0  =  +5.0
─────────────────────────────
TOTAL                = +10.2
```

### Atacante perde pênalti na trave (após defesa)
```
PP trave × 1 = 1 × -1.0 = -1.0
FT       × 1 = 1 ×  3.0 = +3.0   ← trave após defesa conta como FT
─────────────────────────────────
TOTAL                    = +2.0
```

### Capitão com 1 gol e 1 falta cometida
```
G  × 1 =  1 × 8.0  =  +8.0
FC × 1 =  1 × -0.3 =  -0.3
Subtotal            =  +7.7
× 2 (capitão)       = +15.4
```
