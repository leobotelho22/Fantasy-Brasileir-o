# Como rodar o app no seu celular

Siga os passos abaixo. Não precisa saber programar — só copiar e colar os comandos.

---

## 1. Instale o Node.js (se ainda não tiver)

Acesse https://nodejs.org e baixe a versão **LTS**. Instale normalmente.

---

## 2. Instale o Expo Go no seu celular

- **Android:** baixe **Expo Go** na Play Store
- **iPhone:** baixe **Expo Go** na App Store

---

## 3. Abra o terminal no computador

No Windows: aperte `Win + R`, digite `cmd`, Enter.
No Mac: aperte `Cmd + Espaço`, escreva `Terminal`, Enter.

---

## 4. Entre na pasta do app

```bash
cd Fantasy-Brasileirão/apps/mobile
```

> Adapte o caminho conforme onde você salvou o projeto.

---

## 5. Instale as dependências (só na primeira vez)

```bash
npm install
```

Aguarde — pode demorar alguns minutos. Mensagens em amarelo são normais.

---

## 6. Inicie o app

```bash
npx expo start
```

Vai aparecer um **QR Code** no terminal.

---

## 7. Abra no celular

- **Android:** abra o app **Expo Go** → toque em **"Scan QR code"** → aponte a câmera para o QR code do terminal.
- **iPhone:** abra a câmera nativa → aponte para o QR code → toque na notificação que aparecer.

O app vai carregar no seu celular em alguns segundos!

---

## Dicas

| Situação | O que fazer |
|---|---|
| App não carregou | Verifique se o celular e o computador estão na **mesma rede Wi-Fi** |
| Tela branca | Chacoalhe o celular → **Reload** |
| Erro vermelho | Leia a mensagem — geralmente é fácil de resolver |
| Teclado esconde a tela | Normal no iOS, já está configurado |

---

## Estrutura do projeto (resumo)

```
apps/mobile/
├── App.js                  ← Ponto de entrada
├── src/
│   ├── theme/index.js      ← Cores, fontes, espaçamentos
│   ├── data/mock.js        ← Dados falsos (jogadores, leilões, etc.)
│   ├── store/useStore.js   ← Estado global (Zustand)
│   ├── components/         ← Peças reutilizáveis (botões, cards, etc.)
│   ├── navigation/         ← Navegação entre telas
│   └── screens/            ← Telas do app
│       ├── LoginScreen.js
│       ├── DashboardScreen.js
│       ├── MyTeamScreen.js
│       ├── DraftScreen.js
│       ├── MarketScreen.js
│       ├── TradesScreen.js
│       └── LeaguesScreen.js
```

---

## Próximos passos (para o futuro)

1. **Firebase** — trocar `mock.js` por dados reais no Firestore
2. **Sofascore** — ligar a API para scouts ao vivo
3. **Notificações** — avisar quando for a vez no draft ou quando perder um leilão
4. **Push para produção** — publicar na Play Store / App Store com `eas build`
