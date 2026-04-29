// Dados falsos para o app funcionar sem backend
// Substitua por chamadas reais ao Firebase depois

const now = Date.now();

// ─── Jogadores reais do Brasileirão ───────────────────────────────────────
export const ALL_PLAYERS = [
  { id:'p01', name:'Everson',       nick:'Everson',     pos:'GOL', club:'CAM', pts:10.2, avg:7.8, price:120, status:'available' },
  { id:'p02', name:'Hugo Souza',    nick:'Hugo',        pos:'GOL', club:'COR', pts:8.4,  avg:6.1, price:90,  status:'available' },
  { id:'p03', name:'Léo Ortiz',     nick:'Léo Ortiz',   pos:'ZAG', club:'FLA', pts:9.1,  avg:7.0, price:110, status:'available' },
  { id:'p04', name:'Gustavo Gómez', nick:'G. Gómez',    pos:'ZAG', club:'PAL', pts:11.5, avg:8.2, price:130, status:'available' },
  { id:'p05', name:'Vitor Reis',    nick:'Vitor Reis',  pos:'ZAG', club:'PAL', pts:7.8,  avg:6.5, price:85,  status:'available' },
  { id:'p06', name:'Kannemann',     nick:'Kannemann',   pos:'ZAG', club:'GRE', pts:8.9,  avg:7.1, price:100, status:'injured'   },
  { id:'p07', name:'Marcos Rocha',  nick:'M. Rocha',    pos:'LAT', club:'PAL', pts:12.1, avg:9.0, price:140, status:'available' },
  { id:'p08', name:'Piquerez',      nick:'Piquerez',    pos:'LAT', club:'PAL', pts:10.8, avg:8.5, price:125, status:'available' },
  { id:'p09', name:'Guilherme Arana',nick:'Arana',      pos:'LAT', club:'CAM', pts:9.5,  avg:7.8, price:115, status:'available' },
  { id:'p10', name:'Matheuzinho',   nick:'Matheuzinho', pos:'LAT', club:'FLA', pts:7.2,  avg:5.9, price:75,  status:'available' },
  { id:'p11', name:'Gerson',        nick:'Gerson',      pos:'MEI', club:'FLA', pts:14.5, avg:10.2,price:180, status:'available' },
  { id:'p12', name:'Raphael Veiga', nick:'Veiga',       pos:'MEI', club:'PAL', pts:13.8, avg:9.9, price:175, status:'available' },
  { id:'p13', name:'Anibal Moreno', nick:'A. Moreno',   pos:'MEI', club:'PAL', pts:8.1,  avg:7.0, price:95,  status:'available' },
  { id:'p14', name:'Marlon Freitas',nick:'M. Freitas',  pos:'MEI', club:'BOT', pts:11.2, avg:8.8, price:135, status:'available' },
  { id:'p15', name:'Mauricio',      nick:'Mauricio',    pos:'MEI', club:'INT', pts:10.5, avg:8.1, price:120, status:'available' },
  { id:'p16', name:'Cristaldo',     nick:'Cristaldo',   pos:'MEI', club:'GRE', pts:12.3, avg:9.5, price:155, status:'suspended' },
  { id:'p17', name:'Pedro',         nick:'Pedro',       pos:'ATA', club:'FLA', pts:18.5, avg:12.1,price:220, status:'available' },
  { id:'p18', name:'Hulk',          nick:'Hulk',        pos:'ATA', club:'CAM', pts:16.2, avg:11.0,price:200, status:'available' },
  { id:'p19', name:'Estevao',       nick:'Estevão',     pos:'ATA', club:'PAL', pts:15.8, avg:10.8,price:195, status:'available' },
  { id:'p20', name:'Tiquinho',      nick:'Tiquinho',    pos:'ATA', club:'BOT', pts:14.1, avg:9.8, price:170, status:'available' },
  { id:'p21', name:'Calleri',       nick:'Calleri',     pos:'ATA', club:'SAO', pts:13.5, avg:9.2, price:160, status:'available' },
  { id:'p22', name:'Luiz Henrique', nick:'L. Henrique', pos:'ATA', club:'BOT', pts:11.8, avg:8.6, price:145, status:'available' },
];

// ─── Time do usuário logado ────────────────────────────────────────────────
export const MY_TEAM = {
  id:   'team_me',
  name: 'Os Brabos FC',
  coins: 1000,
  players: ['p01','p04','p07','p11','p17'], // IDs no elenco
  starters: ['p01','p04','p07','p11','p17'],
  bench:    [],
  captain:  'p17',
  scheme:   '4-3-3',
  totalPts: 387.5,
  roundPts: 54.2,
};

// ─── Liga e outros times ───────────────────────────────────────────────────
export const LEAGUE = {
  id:   'liga_1',
  name: 'Liga dos Amigos',
  code: 'AMIGOS',
  type: 'draft',
  status: 'active',
  maxMembers: 8,
  members: [
    { teamId:'team_me',  teamName:'Os Brabos FC',    owner:'Você',       pts:387.5, coins:1000 },
    { teamId:'team_2',   teamName:'Palmeirenses FC',  owner:'Carlos',     pts:352.1, coins:820  },
    { teamId:'team_3',   teamName:'Fla Fla FC',       owner:'Ana',        pts:341.8, coins:650  },
    { teamId:'team_4',   teamName:'Nação 12',         owner:'Bruno',      pts:328.4, coins:910  },
    { teamId:'team_5',   teamName:'Galo FC',          owner:'Mariana',    pts:315.0, coins:750  },
    { teamId:'team_6',   teamName:'Tricolor SP',      owner:'Lucas',      pts:298.7, coins:540  },
    { teamId:'team_7',   teamName:'Atletiba',         owner:'Fernanda',   pts:285.2, coins:680  },
    { teamId:'team_8',   teamName:'Inter de Pelotas', owner:'Rafael',     pts:271.9, coins:420  },
  ],
};

// ─── Leilões ativos ────────────────────────────────────────────────────────
export const AUCTIONS = [
  {
    id: 'auc_1',
    player: ALL_PLAYERS.find(p => p.id === 'p12'), // Raphael Veiga
    currentBid:  240,
    highBidder:  'Carlos',
    highBidTeam: 'team_2',
    endsAt: new Date(now + 3 * 3600_000).toISOString(),   // 3h restantes
    numBids: 7,
    startedBy: 'Ana',
  },
  {
    id: 'auc_2',
    player: ALL_PLAYERS.find(p => p.id === 'p20'), // Tiquinho
    currentBid: 185,
    highBidder: 'Bruno',
    highBidTeam:'team_4',
    endsAt: new Date(now + 9 * 3600_000).toISOString(),   // 9h restantes
    numBids: 3,
    startedBy: 'sistema',
  },
  {
    id: 'auc_3',
    player: ALL_PLAYERS.find(p => p.id === 'p14'), // Marlon Freitas
    currentBid: 150,
    highBidder: 'Mariana',
    highBidTeam:'team_5',
    endsAt: new Date(now + 1.5 * 3600_000).toISOString(), // 1h30 restantes
    numBids: 12,
    startedBy: 'sistema',
  },
  {
    id: 'auc_4',
    player: ALL_PLAYERS.find(p => p.id === 'p06'), // Kannemann (lesionado → dropped)
    currentBid: 55,
    highBidder: 'Lucas',
    highBidTeam:'team_6',
    endsAt: new Date(now + 6 * 3600_000).toISOString(),
    numBids: 2,
    startedBy: 'sistema',
  },
];

// ─── Free Agents (sem time, fora do leilão) ───────────────────────────────
export const FREE_AGENTS = ALL_PLAYERS.filter(p =>
  !['p01','p04','p07','p11','p17'].includes(p.id) &&   // não no meu time
  !AUCTIONS.find(a => a.player.id === p.id)            // não em leilão
);

// ─── Trades pendentes ──────────────────────────────────────────────────────
export const TRADES = [
  {
    id: 'trade_1',
    type: 'incoming',                   // trade recebida
    from: { teamId:'team_2', name:'Carlos', teamName:'Palmeirenses FC' },
    offer: {
      players: [ALL_PLAYERS.find(p => p.id === 'p08')], // Piquerez
      coins: 50,
    },
    request: {
      players: [ALL_PLAYERS.find(p => p.id === 'p17')], // Pedro
      coins: 0,
    },
    expiresAt: new Date(now + 24 * 3600_000).toISOString(),
    status: 'pending',
  },
  {
    id: 'trade_2',
    type: 'outgoing',                   // trade enviada
    to: { teamId:'team_3', name:'Ana', teamName:'Fla Fla FC' },
    offer: {
      players: [ALL_PLAYERS.find(p => p.id === 'p07')], // Marcos Rocha
      coins: 100,
    },
    request: {
      players: [ALL_PLAYERS.find(p => p.id === 'p16')], // Cristaldo
      coins: 0,
    },
    expiresAt: new Date(now + 12 * 3600_000).toISOString(),
    status: 'pending',
  },
];

// ─── Estado do Snake Draft ────────────────────────────────────────────────
export const DRAFT_STATE = {
  status: 'active',    // waiting | active | completed
  currentPick: 5,
  currentRound: 1,
  totalRounds: 15,
  timePerPick: 60,     // segundos
  pickDeadline: new Date(now + 45_000).toISOString(), // 45s restantes

  // Ordem fixa (embaralhada no início)
  draftOrder: [
    { teamId:'team_me',  teamName:'Os Brabos FC',   owner:'Você'     },
    { teamId:'team_2',   teamName:'Palmeirenses FC', owner:'Carlos'   },
    { teamId:'team_3',   teamName:'Fla Fla FC',      owner:'Ana'      },
    { teamId:'team_4',   teamName:'Nação 12',        owner:'Bruno'    },
    { teamId:'team_5',   teamName:'Galo FC',         owner:'Mariana'  },
    { teamId:'team_6',   teamName:'Tricolor SP',     owner:'Lucas'    },
  ],

  // Picks já realizados (picks 1-4)
  picks: [
    { pick:1, round:1, teamId:'team_me',  player:ALL_PLAYERS.find(p=>p.id==='p17') },
    { pick:2, round:1, teamId:'team_2',   player:ALL_PLAYERS.find(p=>p.id==='p11') },
    { pick:3, round:1, teamId:'team_3',   player:ALL_PLAYERS.find(p=>p.id==='p18') },
    { pick:4, round:1, teamId:'team_4',   player:ALL_PLAYERS.find(p=>p.id==='p04') },
  ],
};

// ─── Rodada atual ─────────────────────────────────────────────────────────
export const ROUND = {
  number: 15,
  status: 'live',
  deadline: new Date(now + 2 * 3600_000).toISOString(),
};
