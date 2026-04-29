# Tecnologias Escolhidas

## Por que essas tecnologias?

A escolha priorizou 3 critérios:
1. **Curva de aprendizado baixa** — você consegue aprender sem experiência prévia
2. **Uma linguagem só** — tudo em JavaScript/TypeScript (frontend, backend, mobile)
3. **Ecossistema maduro** — muita documentação, tutoriais e comunidade em português

---

## Linguagem Base: JavaScript / TypeScript

**O que é:**
- JavaScript é a linguagem mais popular do mundo
- TypeScript é JavaScript com "etiquetas de tipo" — ajuda a evitar erros antes mesmo de rodar o código

**Por que usar TypeScript e não JavaScript puro:**
- Quando você escreve `player.pontos`, o editor já avisa se `pontos` não existe
- Reduz bugs em 40–60% para iniciantes
- Todos os frameworks abaixo suportam TypeScript nativamente

**Onde você vai usar:**
- No site (Next.js)
- No app (React Native)
- No backend (Firebase Functions)

---

## Frontend Web: Next.js

### O que é

Next.js é um framework para criar sites e aplicações web com React.

Pense assim:
- **HTML** → estrutura da página (o esqueleto)
- **CSS** → estilo da página (a aparência)
- **JavaScript / React** → comportamento (o que acontece quando o usuário clica)
- **Next.js** → organiza tudo isso de forma inteligente e otimizada

### Por que Next.js e não React puro

| Recurso | React puro | Next.js |
|---|---|---|
| Configuração inicial | Complexa | Automática |
| SEO (aparecer no Google) | Difícil | Nativo |
| Velocidade | Mediana | Otimizada |
| Roteamento (navegação entre páginas) | Biblioteca extra | Nativo |
| Deploy (publicar o site) | Manual | 1 comando |

### Onde hospedar: Vercel

- Criada pelos mesmos criadores do Next.js
- Deploy automático: cada vez que você empurrar código, o site atualiza
- Plano gratuito generoso para projetos pessoais
- Conecta direto com GitHub

---

## App Mobile: React Native + Expo

### O que é React Native

React Native permite escrever um único código que roda tanto no Android quanto no iOS.

Sem React Native, você precisaria:
- Aprender Swift para iOS (diferente linguagem)
- Aprender Kotlin para Android (outra linguagem diferente)
- Manter dois códigos separados

Com React Native:
- Um código → dois apps

### O que é Expo

Expo é uma camada em cima do React Native que simplifica tudo:

| Tarefa | Sem Expo | Com Expo |
|---|---|---|
| Configurar ambiente | 2–4 horas | 10 minutos |
| Testar no celular | Cabo USB + configuração | QR Code pelo celular |
| Push Notifications | Configuração complexa | 1 linha de código |
| Publicar na loja | Processo manual | `eas build` |

### Como testar durante o desenvolvimento

1. Instale o app "Expo Go" no seu celular (grátis)
2. Rode `npx expo start` no seu computador
3. Escaneie o QR code
4. O app aparece no seu celular instantaneamente
5. Cada mudança no código atualiza o celular em segundos

---

## Backend: Firebase (Google)

### Por que Firebase

Firebase é um "backend como serviço" — você não precisa criar um servidor do zero.

Comparação:
- **Sem Firebase:** Você precisaria aprender Node.js + Express + PostgreSQL + Redis + configurar servidor Linux + SSL + backup...
- **Com Firebase:** Você usa serviços prontos que o Google mantém para você

### Componentes do Firebase que vamos usar

#### Firebase Authentication
```
Função: Gerenciar login e cadastro de usuários
Complexidade para você: Baixíssima (10-20 linhas de código)
Custo: Gratuito
```

#### Firestore Database
```
Função: Banco de dados em tempo real
Tipo: NoSQL (documentos, como arquivos JSON)
Diferencial: Atualiza o app de todos os usuários instantaneamente
Custo: Gratuito até 50.000 leituras/dia
```

**O que é NoSQL vs SQL:**
- SQL: planilhas com linhas e colunas rígidas (Excel)
- NoSQL: documentos flexíveis (como arquivos de texto estruturado)
- Para este projeto, NoSQL é ideal porque a estrutura de dados muda com frequência

#### Cloud Functions
```
Função: Código que roda automaticamente no servidor
Exemplo de uso: "Quando a rodada fechar, calcule os pontos"
Linguagem: JavaScript/TypeScript (mesma que o resto!)
Custo: 2 milhões de execuções/mês grátis
```

#### Firebase Storage
```
Função: Armazenar arquivos (fotos dos jogadores, escudos)
Custo: 5 GB grátis
```

#### Firebase Cloud Messaging (FCM)
```
Função: Push notifications (avisos no celular)
Custo: Totalmente gratuito
```

---

## Gerenciamento de Estado: Zustand

### O que é "estado"

"Estado" em programação é a situação atual do app. Por exemplo:
- Qual usuário está logado?
- Quais jogadores estão no meu time?
- Qual rodada está ativa?

### Por que Zustand

- Mais simples que o Redux (alternativa popular mas complexa)
- 1 arquivo para configurar
- Funciona igual no Next.js e React Native

---

## Estilização: NativeWind

### O que é

NativeWind traz o Tailwind CSS para o React Native.

**Tailwind CSS** é uma forma de estilizar componentes usando classes pré-definidas:

```jsx
// Sem Tailwind (estilo antigo)
<View style={{ backgroundColor: 'green', padding: 16, borderRadius: 8 }}>

// Com NativeWind (Tailwind no mobile)
<View className="bg-green-500 p-4 rounded-lg">
```

É muito mais rápido para iniciantes porque você não precisa lembrar nomes de propriedades CSS.

---

## API de Dados Esportivos: API-Football

### O que é

Um serviço que fornece dados em tempo real de campeonatos de futebol do mundo todo, incluindo o Brasileirão Série A.

### O que ela fornece

- Escalações de cada jogo
- Gols (quem marcou, em que minuto)
- Assistências
- Cartões (amarelo/vermelho)
- Estatísticas de cada jogador (passes, finalizações, etc.)
- Status dos jogadores (lesionado, suspenso)
- Tabela do campeonato

### Planos

| Plano | Requisições/dia | Preço | Indicado para |
|---|---|---|---|
| Free | 100 | Grátis | Desenvolvimento e testes |
| Basic | 7.500 | ~$10/mês | Até ~5.000 usuários |
| Standard | Ilimitado | ~$30/mês | Produção |

---

## Controle de Versão: Git + GitHub

### O que é Git

Git é um sistema que salva o histórico de todas as mudanças no código.

Pense como o "histórico de versões" do Google Docs, mas muito mais poderoso.

**Comandos básicos que você vai usar todo dia:**

```bash
git add .                    # "Selecionar" arquivos modificados
git commit -m "descrição"    # Salvar um checkpoint
git push                     # Enviar para o GitHub
git pull                     # Baixar mudanças do GitHub
```

### O que é GitHub

GitHub é onde o código fica armazenado online. É como o Google Drive do código.

Benefícios:
- Backup automático
- Histórico de cada mudança
- Deploy automático (Vercel publica o site cada vez que você faz push)
- Colaboração (se tiver outros devs)

---

## Resumo da Stack Completa

```
┌─────────────────────────────────────────────┐
│              STACK TECNOLÓGICA              │
│                                             │
│  LINGUAGEM: TypeScript (JS com tipos)       │
│                                             │
│  MOBILE: React Native + Expo                │
│    └── Estilo: NativeWind (Tailwind)         │
│    └── Estado: Zustand                      │
│                                             │
│  WEB: Next.js                               │
│    └── Estilo: Tailwind CSS                 │
│    └── Estado: Zustand                      │
│    └── Deploy: Vercel (gratuito)            │
│                                             │
│  BACKEND: Firebase                          │
│    └── Auth: Firebase Authentication       │
│    └── Banco: Firestore                     │
│    └── Lógica: Cloud Functions              │
│    └── Arquivos: Firebase Storage           │
│    └── Notificações: FCM                    │
│                                             │
│  DADOS ESPORTIVOS: API-Football             │
│                                             │
│  CONTROLE DE VERSÃO: Git + GitHub           │
└─────────────────────────────────────────────┘
```

---

## O que você vai aprender (nesta ordem)

1. **HTML + CSS básico** — 1 semana (base de tudo)
2. **JavaScript básico** — 2–3 semanas
3. **React (componentes, estado)** — 2–3 semanas
4. **TypeScript básico** — 1 semana
5. **Next.js** — 2 semanas
6. **Firebase** — 1–2 semanas
7. **React Native + Expo** — 2–3 semanas (muito similar ao React)

**Total estimado:** 3–4 meses de estudo + prática diária de 1–2 horas

**Recursos gratuitos em português:**
- Rocketseat (YouTube + plataforma)
- Filipe Deschamps (YouTube)
- The Odin Project (inglês, mas excelente)
- Documentação oficial do Next.js (tem versão em PT-BR)
