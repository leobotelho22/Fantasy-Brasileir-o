# Regras do Fantasy Brasileirão

## 1. Objetivo

Montar o melhor time possível com jogadores reais do Campeonato Brasileiro e acumular o maior número de pontos ao longo das rodadas.

---

## 2. Formação do Time

### 2.1 Número de Jogadores

Cada técnico (usuário) escala **12 jogadores** por rodada:

| Posição | Mínimo | Máximo | Titulares |
|---|---|---|---|
| Goleiro (GOL) | 1 | 1 | 1 |
| Zagueiro (ZAG) | 2 | 4 | 2–3 |
| Lateral (LAT) | 1 | 2 | 1–2 |
| Meia (MEI) | 2 | 4 | 2–4 |
| Atacante (ATA) | 1 | 3 | 1–3 |
| Técnico (TEC) | 1 | 1 | 1 |

**Total: 12 jogadores no elenco por rodada (11 titulares + 1 reserva obrigatório)**

### 2.2 Esquemas Táticos Permitidos

O usuário escolhe um dos esquemas abaixo para definir quantos de cada posição sobem como titulares:

- 4-4-2
- 4-3-3
- 3-5-2
- 3-4-3
- 5-3-2
- 4-5-1

### 2.3 Capitão

- O usuário escolhe 1 capitão entre os titulares.
- O capitão tem sua pontuação **dobrada** na rodada.
- O capitão deve ser definido antes do início da rodada (quando o prazo fecha).

---

## 3. Orçamento e Mercado de Jogadores

### 3.1 Orçamento Inicial

- Cada técnico começa com **C$ 100,00** (Cartoletas — a moeda do jogo).
- Esse valor é usado para montar o elenco inicial.

### 3.2 Preço dos Jogadores

Os jogadores têm preços baseados em popularidade e desempenho histórico:

| Faixa de Preço | Perfil do Jogador |
|---|---|
| C$ 2 – 5 | Reservas e jogadores de times pequenos |
| C$ 6 – 12 | Titulares regulares |
| C$ 13 – 20 | Estrelas e melhores do campeonato |
| C$ 21+ | Craque absoluto (ex: artilheiro da temporada) |

### 3.3 Variação de Preço

- Jogadores que pontuam bem **sobem de preço** nas próximas rodadas.
- Jogadores que não jogam ou pontuam mal **caem de preço**.
- A variação máxima por rodada é de ±C$ 5,00.

### 3.4 Transferências

- O técnico pode fazer até **5 transferências por rodada** (compras e vendas).
- Transferências extras custam C$ 3,00 cada.
- O prazo para transferências fecha **2 horas antes do 1º jogo da rodada**.

### 3.5 Patrimônio

Patrimônio = Saldo em carteira + Valor do elenco atual.

O patrimônio é exibido no perfil do técnico e pode ser usado como ranking secundário.

---

## 4. Sistema de Pontuação

### 4.1 Pontos Positivos

#### Goleiro e Zagueiro

| Evento | Pontos |
|---|---|
| Jogo disputado (≥ 60 min) | +5 |
| Jogo disputado (< 60 min) | +2 |
| Defesa difícil (great save) | +3 |
| Defesa de pênalti | +7 |
| Gol sofrido (por jogo) | -3 |
| Gol marcado | +9 |
| Assistência | +5 |
| Desarme vencido | +1,5 |
| Interceptação | +1 |
| Jogo sem sofrer gol (clean sheet) | +5 |

#### Lateral

| Evento | Pontos |
|---|---|
| Jogo disputado (≥ 60 min) | +5 |
| Jogo disputado (< 60 min) | +2 |
| Gol marcado | +9 |
| Assistência | +5 |
| Cruzamento certo | +1 |
| Desarme vencido | +1,5 |
| Jogo sem sofrer gol (clean sheet) | +3 |

#### Meia

| Evento | Pontos |
|---|---|
| Jogo disputado (≥ 60 min) | +5 |
| Jogo disputado (< 60 min) | +2 |
| Gol marcado | +8 |
| Assistência | +6 |
| Finalização na trave | +2 |
| Finalização certa (no gol) | +1 |
| Desarme vencido | +1,5 |
| Passe decisivo (chance criada) | +1 |

#### Atacante

| Evento | Pontos |
|---|---|
| Jogo disputado (≥ 60 min) | +5 |
| Jogo disputado (< 60 min) | +2 |
| Gol marcado | +8 |
| Assistência | +5 |
| Finalização na trave | +2 |
| Finalização certa (no gol) | +1 |
| Hat-trick (3+ gols) | +5 bônus |

#### Técnico

| Evento | Pontos |
|---|---|
| Vitória do time | +6 |
| Empate | +1 |
| Derrota | -2 |
| Gol sofrido a cada 2 gols | -1 |

### 4.2 Pontos Negativos (todas as posições)

| Evento | Pontos |
|---|---|
| Cartão amarelo | -2 |
| Cartão vermelho | -5 |
| Gol contra | -5 |
| Pênalti cometido | -3 |
| Pênalti perdido | -3 |
| Falta sofrida que gerou pênalti contra | -1 |

### 4.3 Cálculo Final da Rodada

```
Pontuação do Time = Soma dos pontos dos 11 titulares
                  + (pontos do capitão repetidos uma vez)
                  + bônus de esquema (veja abaixo)
```

### 4.4 Bônus de Esquema (opcional, fase 2)

Se todos os jogadores de uma posição ficam acima de 0 pontos:
- Defesa completa (GOL + ZAG + LAT todos positivos): +2 pontos
- Meio-campo dominante (todos os meias acima de 7 pontos): +2 pontos
- Ataque eficiente (todos os atacantes marcaram gol): +3 pontos

---

## 5. Rodadas

### 5.1 Calendário

- O campeonato segue as **38 rodadas do Brasileirão Série A**.
- Cada rodada dura normalmente de quinta a quarta-feira.
- Rodadas duplas (quando um time joga 2x na semana) contam os pontos dos dois jogos.

### 5.2 Prazo de Escalação

- O técnico pode alterar o time até **2 horas antes do 1º jogo da rodada**.
- Após o prazo, o elenco está bloqueado para aquela rodada.

### 5.3 Jogador Não Escalado

- Se o técnico não escalar o time antes do prazo, o sistema escala automaticamente o time da rodada anterior.

---

## 6. Ligas

### 6.1 Liga Pública (Geral)

- Todo técnico compete automaticamente no ranking geral da temporada.
- Ranking por pontuação acumulada nas 38 rodadas.

### 6.2 Ligas Privadas

- Qualquer técnico pode criar uma liga privada e convidar amigos.
- Cada liga tem um **código de convite** de 6 caracteres.
- Limite: até **20 participantes** por liga privada.
- O criador da liga é o administrador e pode expulsar membros.

### 6.3 Mini-ligas de Rodada

- Além do ranking geral, cada rodada tem um mini-ranking.
- O técnico que pontuar mais na rodada dentro de uma liga ganha **1 ponto de liga**.
- No final da temporada, o técnico com mais pontos de liga é o campeão.

### 6.4 Tipos de Competição dentro de uma Liga

| Formato | Descrição |
|---|---|
| Pontos corridos | Soma total de pontos nas 38 rodadas |
| Confronto direto | Técnicos se enfrentam 1x1 a cada rodada (como futebol de verdade) |
| Playoffs | Top 4 da fase de grupos avançam para eliminatórias |

---

## 7. Premiações (sugestão para versão com monetização futura)

- Campeão da temporada: troféu digital + badge exclusivo
- Top 3 de cada rodada: emblemas de destaque
- Maior patrimônio da temporada: badge especial

---

## 8. Regras de Desempate

Em caso de empate de pontos:

1. Maior pontuação do capitão na rodada
2. Maior número de gols marcados no elenco
3. Menor número de cartões no elenco
4. Desempate pelo maior patrimônio acumulado
