# Bolei Web — Como rodar e publicar

Guia completo para iniciantes.

---

## O que é o app

**Bolei** é um app de fantasy futebol para o navegador (desktop + celular). Feito com **Next.js** e **Tailwind CSS**.

---

## Pré-requisitos

### 1. Instale o Node.js

Acesse **https://nodejs.org** e baixe a versão **LTS**. Instale normalmente, como qualquer outro programa.

Para verificar se instalou corretamente, abra o terminal e digite:
```
node --version
```
Deve aparecer algo como `v20.0.0`.

### 2. Abra o terminal

- **Windows:** Tecle `Win + R`, digite `cmd`, pressione Enter
- **Mac:** Tecle `Cmd + Espaço`, escreva `Terminal`, pressione Enter

---

## Como rodar localmente

### Passo 1 — Entrar na pasta do projeto

```bash
cd Fantasy-Brasileirão/apps/bolei-web
```

> Adapte o caminho conforme onde você salvou o projeto.

### Passo 2 — Instalar dependências (só na primeira vez)

```bash
npm install
```

Aguarde. Pode demorar 1-2 minutos. Mensagens em amarelo são normais.

### Passo 3 — Iniciar o servidor

```bash
npm run dev
```

Você verá:
```
▲ Next.js 14.2.5
- Local: http://localhost:3000
```

### Passo 4 — Abrir no navegador

Acesse **http://localhost:3000** no Chrome, Firefox ou Safari.

O app abre na tela de login. Crie uma conta (qualquer nome/email/senha com 6+ caracteres) e explore!

> Para parar o servidor: pressione `Ctrl + C` no terminal.

---

## Estrutura do projeto

```
apps/bolei-web/
├── package.json              ← Dependências
├── next.config.js            ← Config do Next.js
├── tailwind.config.js        ← Cores e tema
├── src/
│   ├── app/                  ← Páginas (App Router do Next.js)
│   │   ├── layout.js         ← HTML base (título, favicon)
│   │   ├── page.js           ← Redireciona para /dashboard ou /login
│   │   ├── login/page.js     ← Tela de login/cadastro
│   │   ├── dashboard/        ← Dashboard principal
│   │   ├── meu-time/         ← Gerenciar seu elenco
│   │   ├── mercado/          ← Leilões + Agentes Livres
│   │   ├── draft/            ← Snake Draft
│   │   ├── trades/           ← Propostas de troca
│   │   └── ranking/          ← Classificação da liga
│   ├── components/           ← Peças reutilizáveis
│   │   ├── AppLayout.jsx     ← Sidebar + navegação
│   │   ├── AuctionCard.jsx   ← Card de leilão
│   │   ├── PlayerRow.jsx     ← Linha de jogador
│   │   ├── Badge.jsx         ← Posição/status
│   │   ├── Button.jsx        ← Botões
│   │   ├── CoinBalance.jsx   ← Saldo de moedas
│   │   └── CountdownTimer.jsx← Timer ao vivo
│   ├── store/useStore.js     ← Estado global (Zustand)
│   └── data/mock.js          ← Dados falsos (30 jogadores)
```

---

## Funcionalidades do app

| Tela       | O que faz |
|------------|-----------|
| **Login**  | Entrar ou criar conta com bônus de 1.000 moedas |
| **Dashboard** | Pontuação da rodada, ranking, time preview, leilões em destaque |
| **Meu Time** | Ver todos os 23 jogadores, definir capitão (2× pts), ordenar por pts/média/posição |
| **Mercado → Leilões** | Ver leilões ativos, dar lance escolhendo quanto pagar — e **qual jogador liberar** se o time estiver cheio |
| **Mercado → Agentes Livres** | Ver jogadores disponíveis, iniciar leilão de 12h |
| **Draft** | Snake draft: ver jogadores disponíveis por posição, pegar o escolhido, ver board completo |
| **Trades** | Ver propostas recebidas/enviadas, aceitar ou recusar |
| **Ranking** | Pódio visual dos 3 primeiros + tabela completa com vitórias e diferença de pontos |

### Regra especial do Mercado — Time cheio
Quando seu time tem **23 jogadores**, ao dar um lance num leilão aparece um seletor:
> _"Seu time está cheio. Escolha um jogador para liberar a vaga."_

Você escolhe quem sai e confirma o lance. Se você já estava ganhando aquele leilão, a vaga não precisa ser aberta de novo.

---

## Como publicar grátis na internet

Use a **Vercel** — a plataforma oficial do Next.js. É gratuita para projetos pessoais.

### Passo 1 — Crie conta na Vercel

Acesse **https://vercel.com** e clique em **Sign up**. Use sua conta do GitHub (mais fácil).

### Passo 2 — Suba o código para o GitHub

Se ainda não tiver o projeto no GitHub:

```bash
# Na pasta raiz do projeto Fantasy-Brasileirão
git init
git add .
git commit -m "Bolei Web - primeiro commit"
```

Crie um repositório em **https://github.com/new** e siga as instruções.

### Passo 3 — Importe na Vercel

1. No painel da Vercel, clique em **Add New → Project**
2. Conecte sua conta do GitHub
3. Selecione o repositório
4. Em **Root Directory**, escreva `apps/bolei-web`
5. Clique em **Deploy**

Pronto! Em ~1 minuto seu app estará online num endereço como `bolei-web.vercel.app`.

### Atualizações futuras

Toda vez que você fizer `git push`, a Vercel republica automaticamente.

---

## Próximos passos (para o futuro)

| Funcionalidade | Como fazer |
|---|---|
| **Dados reais** | Integrar com Sofascore API (docs em `docs/DADOS_REAIS.md`) |
| **Banco de dados** | Firebase Firestore (docs em `docs/BANCO_DE_DADOS.md`) |
| **Login real** | Firebase Authentication — troca o `login()` do Zustand |
| **Notificações** | Firebase Cloud Messaging — avisar quando perder um leilão |
| **App mobile** | O app React Native está em `apps/mobile/` |

---

## Dicas de desenvolvimento

| Situação | Solução |
|---|---|
| Mudei o código mas não atualizou | O Next.js atualiza automaticamente. Se não atualizou, recarregue a página. |
| Erro vermelho no terminal | Leia a mensagem — geralmente indica a linha exata do erro. |
| Moedas/dados resetam ao recarregar | Normal por enquanto (sem banco de dados). |
| Quero mudar as cores | Edite `tailwind.config.js` e `src/app/globals.css`. |
| Quero adicionar jogadores | Edite `src/data/mock.js` — siga o mesmo padrão dos existentes. |
