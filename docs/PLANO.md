# Plano de Construção — Fantasy Brasileirão

## Como usar este plano

- Cada fase tem objetivos claros e entregáveis concretos
- Não pule fases — cada uma depende da anterior
- Estime 1–3 horas de estudo/trabalho por dia
- Ao final de cada fase, você terá algo funcionando de verdade

---

## Fase 0 — Preparação do Ambiente (1–2 dias)

### Objetivo
Ter o computador configurado para programar.

### Passo a Passo

#### 1. Instale o Node.js
- Acesse: https://nodejs.org
- Baixe a versão "LTS" (a recomendada)
- Instale normalmente (next, next, finish)
- Verifique: abra o terminal e digite `node --version` (deve aparecer algo como `v20.x.x`)

#### 2. Instale o VS Code (editor de código)
- Acesse: https://code.visualstudio.com
- Baixe e instale
- Extensões recomendadas (instale dentro do VS Code):
  - `ES7 React/Redux/GraphQL/React-Native snippets`
  - `Tailwind CSS IntelliSense`
  - `Prettier - Code formatter`
  - `GitLens`
  - `Firebase`

#### 3. Crie uma conta no GitHub
- Acesse: https://github.com
- Crie sua conta gratuita
- Este repositório já está criado: `leobotelho22/fantasy-brasileir-o`

#### 4. Configure o Git no seu computador
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

#### 5. Clone o repositório
```bash
git clone https://github.com/leobotelho22/fantasy-brasileir-o
cd fantasy-brasileir-o
```

#### 6. Crie uma conta no Firebase
- Acesse: https://console.firebase.google.com
- Crie um projeto chamado "fantasy-brasileirao"
- Ative o plano Blaze (pay-as-you-go) — o plano gratuito não permite Cloud Functions
- Não se preocupe com custos: o uso inicial é gratuito dentro dos limites

#### 7. Instale o Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### 8. Instale o Expo CLI
```bash
npm install -g expo-cli eas-cli
```

### Entregável desta fase
- Terminal abre sem erros
- `node --version`, `firebase --version`, `expo --version` funcionam
- VS Code instalado com extensões

---

## Fase 1 — Aprendizado Fundamental (3–4 semanas)

### Objetivo
Aprender o suficiente de JavaScript e React para criar telas.

### O que estudar (nesta ordem)

#### Semana 1 — JavaScript Básico
Siga este roteiro no YouTube (Filipe Deschamps ou Rocketseat):
- [ ] O que são variáveis (`let`, `const`)
- [ ] Tipos de dados (string, number, boolean, array, objeto)
- [ ] Funções (`function`, arrow functions `=>`)
- [ ] Condicionais (`if`, `else`, operador ternário)
- [ ] Loops (`for`, `forEach`, `map`, `filter`)
- [ ] Promises e `async/await` (para chamadas de API)

**Exercício prático:** Crie um arquivo `pratica.js` e escreva:
```javascript
// Uma função que calcula os pontos de um jogador
function calcularPontos(gols, assistencias, cartoesAmarelos) {
  const pontosPorGol = 8;
  const pontosPorAssistencia = 5;
  const penalidadeCartao = -2;

  return (gols * pontosPorGol)
       + (assistencias * pontosPorAssistencia)
       + (cartoesAmarelos * penalidadeCartao);
}

console.log(calcularPontos(2, 1, 0)); // deve imprimir 21
```

#### Semana 2 — React Básico
- [ ] O que são componentes
- [ ] JSX (HTML dentro do JavaScript)
- [ ] Props (passando dados entre componentes)
- [ ] useState (dados que mudam)
- [ ] useEffect (ações quando algo muda)
- [ ] Listas e chaves (`key`)

**Exercício prático:** Crie um componente `CartaoJogador` que mostre:
- Nome do jogador
- Posição
- Preço
- Um botão "Comprar"

#### Semana 3 — TypeScript + Next.js
- [ ] O que são tipos em TypeScript
- [ ] Interfaces e tipos
- [ ] Criar uma página no Next.js
- [ ] Navegação entre páginas (Link, useRouter)
- [ ] Fetch de dados (chamadas de API)

#### Semana 4 — Firebase
- [ ] Conectar o projeto ao Firebase
- [ ] Criar e ler documentos no Firestore
- [ ] Autenticação com email e Google
- [ ] Regras de segurança básicas

### Recursos de Estudo

| Recurso | Conteúdo | Gratuito? |
|---|---|---|
| youtube.com/@rocketseat | React, Next.js, Node | Sim |
| youtube.com/@filipedeschamps | JavaScript, programação | Sim |
| react.dev/learn | React (oficial, em inglês) | Sim |
| nextjs.org/learn | Next.js (oficial) | Sim |
| firebase.google.com/docs | Firebase (oficial) | Sim |

---

## Fase 2 — MVP do Site Web (3–4 semanas)

### Objetivo
Ter uma versão básica funcionando no navegador.

### O que construir nesta fase

```
MVP Web
├── Página de Login / Cadastro     ← Semana 1
├── Dashboard (home do técnico)    ← Semana 2
├── Mercado de jogadores           ← Semana 3
└── Meu Time (escalação)           ← Semana 4
```

### Semana 1 — Autenticação

#### 1. Configure o Next.js
```bash
cd apps/web
npx create-next-app@latest . --typescript --tailwind --eslint --app
```

#### 2. Instale as dependências do Firebase
```bash
npm install firebase
```

#### 3. Crie o arquivo de configuração Firebase
Crie `src/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Cole aqui as configurações do seu projeto Firebase
  // (encontradas em: Console Firebase > Configurações > Geral)
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

#### 4. Crie a página de login
Crie `src/app/login/page.tsx`:
```typescript
'use client';

import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      setError('Email ou senha incorretos');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-900">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl w-96">
        <h1 className="text-2xl font-bold text-center mb-6">Fantasy Brasileirão</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border p-3 rounded mb-4"
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border p-3 rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
```

### Semana 2 — Dashboard

O dashboard mostrará:
- Nome do técnico
- Pontuação da rodada atual
- Saldo em cartoletas
- Posição no ranking

### Semana 3 — Mercado de Jogadores

O mercado terá:
- Lista paginada de jogadores (busca + filtros)
- Card de cada jogador (nome, clube, posição, preço, pontos na última rodada)
- Botão comprar/vender
- Atualização do saldo após transação

### Semana 4 — Escalação

A tela de escalação terá:
- Campo de futebol visual
- Slots para cada posição
- Drag-and-drop para posicionar jogadores (ou clique simples)
- Seleção de capitão
- Botão "Salvar escalação"
- Contador regressivo até o prazo

### Como testar e publicar

```bash
# Testar localmente
npm run dev
# Abre em http://localhost:3000

# Publicar no Vercel
npx vercel
# Siga as instruções → site publicado em segundos
```

### Entregável desta fase
- Site publicado e acessível por qualquer pessoa via URL do Vercel
- Login funcionando
- É possível ver e comprar jogadores
- É possível escalar o time

---

## Fase 3 — Backend e Pontuação Real (2–3 semanas)

### Objetivo
Integrar dados reais do Brasileirão e calcular pontos automaticamente.

### Semana 1 — API de Estatísticas

#### 1. Crie conta na API-Football
- Acesse: https://www.api-football.com
- Crie conta gratuita (100 req/dia)
- Guarde sua chave de API

#### 2. Crie a Cloud Function para buscar dados
```bash
cd backend/functions
npm init -y
npm install firebase-admin firebase-functions axios
```

Crie `src/updateScores.ts`:
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

admin.initializeApp();

// Roda a cada 5 minutos durante os jogos
export const updateLiveScores = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    const response = await axios.get(
      'https://v3.football.api-sports.io/fixtures?league=71&season=2025&live=all',
      { headers: { 'x-apisports-key': functions.config().apifootball.key } }
    );

    const jogos = response.data.response;

    for (const jogo of jogos) {
      await processarJogo(jogo);
    }
  });

async function processarJogo(jogo: any) {
  // Para cada jogador no jogo, calcular pontos
  // e salvar no Firestore
}
```

### Semana 2 — Cálculo de Pontuação

Implemente a função `calcularPontos` que usa as regras do arquivo REGRAS.md:

```typescript
interface EstatisticasJogador {
  minutosJogados: number;
  gols: number;
  assistencias: number;
  cartoesAmarelos: number;
  cartoesVermelhos: number;
  golsContra: number;
  penaltisPerdidos: number;
  defesasDificeis?: number;    // goleiro
  golsSofridos?: number;       // goleiro/zagueiro
  desarmes?: number;
  interceptacoes?: number;
}

function calcularPontos(posicao: string, stats: EstatisticasJogador): number {
  let pontos = 0;

  // Participação
  if (stats.minutosJogados >= 60) pontos += 5;
  else if (stats.minutosJogados > 0) pontos += 2;

  // Gols (variam por posição)
  const pontosPorGol = ['GOL', 'ZAG'].includes(posicao) ? 9
    : posicao === 'LAT' ? 9
    : 8; // MEI e ATA
  pontos += stats.gols * pontosPorGol;

  // Assistências
  const pontosPorAssistencia = posicao === 'MEI' ? 6 : 5;
  pontos += stats.assistencias * pontosPorAssistencia;

  // Penalidades
  pontos += stats.cartoesAmarelos * -2;
  pontos += stats.cartoesVermelhos * -5;
  pontos += stats.golsContra * -5;
  pontos += stats.penaltisPerdidos * -3;

  // Bônus de goleiro
  if (posicao === 'GOL' && stats.defesasDificeis) {
    pontos += stats.defesasDificeis * 3;
  }

  return pontos;
}
```

### Semana 3 — Rankings e Ligas

Implemente a Cloud Function que, após fechar cada rodada:
1. Calcula pontuação de cada técnico
2. Atualiza o ranking geral
3. Atualiza o ranking de cada liga privada

### Entregável desta fase
- Pontuação atualiza automaticamente durante os jogos
- Rankings funcionando
- Histórico de rodadas acessível

---

## Fase 4 — App Mobile (4–6 semanas)

### Objetivo
Ter o app funcionando no Android e iOS.

### Semana 1 — Configuração do Expo

```bash
cd apps/mobile
npx create-expo-app . --template blank-typescript
npm install nativewind
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install firebase
```

### Semanas 2–4 — Telas do App

As telas do mobile são muito similares ao web. A diferença é que em vez de `<div>` você usa `<View>`, em vez de `<p>` usa `<Text>`, etc.

| Web (Next.js) | Mobile (React Native) |
|---|---|
| `<div>` | `<View>` |
| `<p>`, `<span>` | `<Text>` |
| `<img>` | `<Image>` |
| `<button>` | `<TouchableOpacity>` |
| `<input>` | `<TextInput>` |
| CSS classes | StyleSheet ou NativeWind |

### Semanas 5–6 — Push Notifications e Publicação

```bash
# Instalar expo-notifications
npx expo install expo-notifications expo-device

# Build para Android (APK para teste)
eas build --platform android --profile preview

# Build para produção (Google Play e App Store)
eas build --platform all --profile production
```

### Entregável desta fase
- App testável pelo Expo Go (sem precisar publicar na loja)
- Build de produção gerado

---

## Fase 5 — Polimento e Lançamento (2–3 semanas)

### Checklist antes de lançar

#### Funcionalidades
- [ ] Login e cadastro funcionando
- [ ] Mercado de jogadores com busca e filtros
- [ ] Escalação com prazo automático
- [ ] Pontuação calculada automaticamente
- [ ] Ligas privadas com código de convite
- [ ] Rankings geral e por liga
- [ ] Histórico de rodadas
- [ ] Push notifications

#### Qualidade
- [ ] App funciona sem erros visíveis no console
- [ ] Telas funcionam em telas pequenas (iPhone SE) e grandes (iPad)
- [ ] Loading states (carregando...) em todas as chamadas de dados
- [ ] Mensagens de erro amigáveis
- [ ] Sem dados de teste em produção

#### Segurança
- [ ] Regras do Firestore configuradas (ninguém edita dados de outros)
- [ ] Chave da API-Football não está exposta no frontend
- [ ] Validação de prazo no backend (não no frontend apenas)

#### Performance
- [ ] Imagens dos jogadores otimizadas
- [ ] Paginação no mercado de jogadores (não carregar todos de uma vez)

### Como publicar o app

#### Android (Google Play)
1. Crie conta de desenvolvedor: play.google.com/console (~$25 taxa única)
2. Gere o build: `eas build --platform android --profile production`
3. Faça upload do arquivo .aab gerado
4. Preencha as informações do app (descrição, screenshots, classificação etária)
5. Envie para revisão (1–3 dias)

#### iOS (App Store)
1. Conta Apple Developer: ~$99/ano
2. Gere o build: `eas build --platform ios --profile production`
3. Suba para o App Store Connect
4. Envie para revisão (1–7 dias)

### Site Web
```bash
# Já está no ar desde a Fase 2
# Para atualizar: basta fazer git push e o Vercel atualiza automaticamente
git add .
git commit -m "versão 1.0"
git push
```

---

## Cronograma Resumido

| Fase | O que você constrói | Tempo estimado |
|---|---|---|
| 0 — Preparação | Ambiente configurado | 1–2 dias |
| 1 — Aprendizado | JavaScript, React, Firebase | 3–4 semanas |
| 2 — MVP Web | Site funcional básico | 3–4 semanas |
| 3 — Backend | Pontuação automática real | 2–3 semanas |
| 4 — Mobile | App no celular | 4–6 semanas |
| 5 — Lançamento | App publicado nas lojas | 2–3 semanas |

**Total: 3–5 meses** (com dedicação de 1–2 horas por dia)

---

## Dicas para Não Desistir

1. **Comece pelo menor passo possível.** Não tente construir tudo de uma vez. Uma tela por vez.

2. **Use o ChatGPT e o Claude como assistentes de código.** Cole o erro que apareceu no terminal e peça para explicar o que aconteceu.

3. **Commit frequentemente.** A cada tela que funcionar, faça um `git commit`. Assim você pode voltar se algo quebrar.

4. **Não copie código sem entender.** Leia linha por linha, mesmo que demore mais. Você vai depurar muito menos depois.

5. **Entre na comunidade.** Rocketseat Discord, Reddit r/brdev, e grupos de React no Telegram — há muita gente disposta a ajudar.

6. **Celebre os marcos.** Quando a tela de login funcionar pela primeira vez, isso é uma conquista real. Não subestime o progresso.

---

## Próximos Passos Imediatos

Execute estes 3 passos hoje:

1. Instale o Node.js e o VS Code (30 min)
2. Crie as contas no GitHub e Firebase (15 min)
3. Assista a um vídeo de introdução ao React no YouTube (45 min — Rocketseat tem um excelente)

Tudo começa por aqui.
