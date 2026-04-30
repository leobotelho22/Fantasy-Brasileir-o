export const ALL_PLAYERS = [
  { id: 'p1',  nick: 'Cássio',         pos: 'GOL', club: 'Corinthians', pts: 14.2, avg: 12.1, status: 'available' },
  { id: 'p2',  nick: 'Everson',         pos: 'GOL', club: 'Atlético-MG', pts: 11.5, avg: 10.3, status: 'available' },
  { id: 'p3',  nick: 'Santos',          pos: 'GOL', club: 'Flamengo',    pts:  9.3, avg:  8.7, status: 'injured'   },
  { id: 'p4',  nick: 'Nino',            pos: 'ZAG', club: 'Fluminense',  pts: 10.4, avg:  9.8, status: 'available' },
  { id: 'p5',  nick: 'Léo Pereira',     pos: 'ZAG', club: 'Flamengo',    pts: 12.1, avg: 11.0, status: 'available' },
  { id: 'p6',  nick: 'Murillo',         pos: 'ZAG', club: 'Corinthians', pts:  8.6, avg:  7.9, status: 'available' },
  { id: 'p7',  nick: 'Gilberto',        pos: 'LAT', club: 'Fluminense',  pts: 11.3, avg: 10.1, status: 'available' },
  { id: 'p8',  nick: 'Varela',          pos: 'LAT', club: 'Flamengo',    pts: 13.5, avg: 12.4, status: 'available' },
  { id: 'p9',  nick: 'Dodô',            pos: 'LAT', club: 'São Paulo',   pts:  9.2, avg:  8.5, status: 'available' },
  { id: 'p10', nick: 'Gerson',          pos: 'MEI', club: 'Flamengo',    pts: 16.3, avg: 14.8, status: 'available' },
  { id: 'p11', nick: 'De Arrascaeta',   pos: 'MEI', club: 'Flamengo',    pts: 18.7, avg: 17.2, status: 'available' },
  { id: 'p12', nick: 'Raphael Veiga',   pos: 'MEI', club: 'Palmeiras',   pts: 15.2, avg: 14.1, status: 'available' },
  { id: 'p13', nick: 'Scarpa',          pos: 'MEI', club: 'Atlético-MG', pts: 13.8, avg: 12.5, status: 'available' },
  { id: 'p14', nick: 'Rodrigo Garro',   pos: 'MEI', club: 'Corinthians', pts: 14.1, avg: 13.0, status: 'available' },
  { id: 'p15', nick: 'Hulk',            pos: 'ATA', club: 'Atlético-MG', pts: 17.5, avg: 16.0, status: 'available' },
  { id: 'p16', nick: 'Endrick',         pos: 'ATA', club: 'Palmeiras',   pts: 14.8, avg: 13.5, status: 'available' },
  { id: 'p17', nick: 'Pedro',           pos: 'ATA', club: 'Flamengo',    pts: 19.2, avg: 18.1, status: 'available' },
  { id: 'p18', nick: 'Cano',            pos: 'ATA', club: 'Fluminense',  pts: 13.1, avg: 12.3, status: 'suspended' },
  { id: 'p19', nick: 'Rony',            pos: 'ATA', club: 'Palmeiras',   pts: 11.2, avg: 10.5, status: 'available' },
  { id: 'p20', nick: 'Luciano',         pos: 'ATA', club: 'São Paulo',   pts: 12.5, avg: 11.8, status: 'available' },
  { id: 'p21', nick: 'Calleri',         pos: 'ATA', club: 'São Paulo',   pts: 10.8, avg:  9.9, status: 'available' },
  { id: 'p22', nick: 'Mostarda',        pos: 'MEI', club: 'Grêmio',      pts:  8.3, avg:  7.8, status: 'available' },
  { id: 'p23', nick: 'Suárez',          pos: 'ATA', club: 'Grêmio',      pts: 16.1, avg: 15.0, status: 'available' },
  { id: 'p24', nick: 'Alan Patrick',    pos: 'MEI', club: 'Inter',       pts: 14.5, avg: 13.8, status: 'available' },
  { id: 'p25', nick: 'Bremer',          pos: 'ZAG', club: 'Juventus',    pts:  9.7, avg:  9.0, status: 'available' },
  { id: 'p26', nick: 'Militão',         pos: 'ZAG', club: 'Real Madrid', pts: 10.3, avg:  9.5, status: 'available' },
  { id: 'p27', nick: 'Alex Sandro',     pos: 'LAT', club: 'Flamengo',    pts:  8.1, avg:  7.5, status: 'injured'   },
  { id: 'p28', nick: 'Raphinha',        pos: 'ATA', club: 'Barcelona',   pts: 15.6, avg: 14.8, status: 'available' },
  { id: 'p29', nick: 'Rodrygo',         pos: 'ATA', club: 'Real Madrid', pts: 14.2, avg: 13.5, status: 'available' },
  { id: 'p30', nick: 'Vinícius Jr',     pos: 'ATA', club: 'Real Madrid', pts: 22.3, avg: 20.8, status: 'available' },
];

// Meu time — 13 jogadores (slots até 23 disponíveis)
export const MY_TEAM = {
  id: 'team_me',
  name: 'Os Crias FC',
  players: ['p1','p4','p5','p7','p8','p10','p11','p12','p15','p17','p20','p24','p30'],
  captain: 'p30',
  totalPts: 182.4,
  roundPts: 24.6,
};

export const LEAGUE = {
  id: 'liga_1',
  name: 'Liga dos Monstros',
  currentRound: 5,
  members: [
    { teamId: 'team_me', teamName: 'Os Crias FC',    pts: 182.4, roundPts: 24.6, played: 5, wins: 4 },
    { teamId: 'team_2',  teamName: 'Diretoria FC',   pts: 175.2, roundPts: 18.3, played: 5, wins: 3 },
    { teamId: 'team_3',  teamName: 'Viradouro XI',   pts: 168.7, roundPts: 22.1, played: 5, wins: 3 },
    { teamId: 'team_4',  teamName: 'Pé de Vento',    pts: 154.3, roundPts: 15.5, played: 5, wins: 2 },
    { teamId: 'team_5',  teamName: 'Seleção Véi',    pts: 149.8, roundPts: 19.7, played: 5, wins: 2 },
    { teamId: 'team_6',  teamName: 'Boladas SC',     pts: 142.1, roundPts: 16.2, played: 5, wins: 2 },
    { teamId: 'team_7',  teamName: 'Pelé Eterno',    pts: 138.5, roundPts: 12.8, played: 5, wins: 1 },
    { teamId: 'team_8',  teamName: 'Zico 10',        pts: 125.3, roundPts: 11.4, played: 5, wins: 1 },
  ],
};

const _p = id => ALL_PLAYERS.find(p => p.id === id);

export const AUCTIONS = [
  {
    id: 'a1', playerId: 'p13', player: _p('p13'),
    currentBid: 150, highBidder: 'Diretoria FC', highBidderTeamId: 'team_2',
    numBids: 4, endsAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
  },
  {
    id: 'a2', playerId: 'p16', player: _p('p16'),
    currentBid: 220, highBidder: 'Viradouro XI', highBidderTeamId: 'team_3',
    numBids: 7, endsAt: new Date(Date.now() + 1.5 * 3600_000).toISOString(),
  },
  {
    id: 'a3', playerId: 'p23', player: _p('p23'),
    currentBid: 80,  highBidder: null, highBidderTeamId: null,
    numBids: 0, endsAt: new Date(Date.now() + 10 * 3600_000).toISOString(),
  },
  {
    id: 'a4', playerId: 'p29', player: _p('p29'),
    currentBid: 190, highBidder: 'Boladas SC', highBidderTeamId: 'team_6',
    numBids: 5, endsAt: new Date(Date.now() + 0.4 * 3600_000).toISOString(),
  },
];

const auctionIds = new Set(AUCTIONS.map(a => a.playerId));
const teamIds    = new Set(MY_TEAM.players);

export const FREE_AGENTS = ALL_PLAYERS.filter(
  p => !teamIds.has(p.id) && !auctionIds.has(p.id)
);

export const TRADES = [
  {
    id: 'tr1',
    fromTeamId: 'team_2', fromTeamName: 'Diretoria FC',
    toTeamId: 'team_me',  toTeamName: 'Os Crias FC',
    offeredPlayers: ['p26'], offeredCoins: 100,
    requestedPlayers: ['p15'], requestedCoins: 0,
    status: 'pending',
    createdAt: new Date(Date.now() - 2 * 3600_000).toISOString(),
  },
  {
    id: 'tr2',
    fromTeamId: 'team_me',  fromTeamName: 'Os Crias FC',
    toTeamId: 'team_3',     toTeamName: 'Viradouro XI',
    offeredPlayers: ['p20'], offeredCoins: 0,
    requestedPlayers: ['p18'], requestedCoins: 0,
    status: 'pending',
    createdAt: new Date(Date.now() - 1 * 3600_000).toISOString(),
  },
];

const DRAFT_TEAMS = [
  { id: 'team_me', name: 'Os Crias FC' },
  { id: 'team_2',  name: 'Diretoria FC' },
  { id: 'team_3',  name: 'Viradouro XI' },
  { id: 'team_4',  name: 'Pé de Vento' },
  { id: 'team_5',  name: 'Seleção Véi' },
  { id: 'team_6',  name: 'Boladas SC' },
  { id: 'team_7',  name: 'Pelé Eterno' },
  { id: 'team_8',  name: 'Zico 10' },
];

export const DRAFT_STATE = {
  status: 'active',
  currentPick: 5,
  currentTeam: 'team_me',
  currentTeamName: 'Os Crias FC',
  teams: DRAFT_TEAMS,
  picks: [
    { pickNumber: 1, teamId: 'team_me', teamName: 'Os Crias FC',  playerId: 'p30' },
    { pickNumber: 2, teamId: 'team_2',  teamName: 'Diretoria FC', playerId: 'p17' },
    { pickNumber: 3, teamId: 'team_3',  teamName: 'Viradouro XI', playerId: 'p11' },
    { pickNumber: 4, teamId: 'team_4',  teamName: 'Pé de Vento',  playerId: 'p15' },
  ],
};

export const ROUND = {
  number: 5,
  status: 'live',
  deadline: new Date(Date.now() + 2 * 3600_000).toISOString(),
};
