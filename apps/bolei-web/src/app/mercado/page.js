'use client';
import { useState, useMemo } from 'react';
import { Search, X, Coins, AlertCircle, UserMinus } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import AuctionCard from '@/components/AuctionCard';
import PlayerRow, { Avatar } from '@/components/PlayerRow';
import Badge from '@/components/Badge';
import CoinBalance from '@/components/CoinBalance';
import Button from '@/components/Button';
import useStore from '@/store/useStore';
import { ALL_PLAYERS } from '@/data/mock';

const MAX_SQUAD = 23;
const MIN_INCREMENT = 10;

export default function MercadoPage() {
  const { coins, auctions, freeAgents, team, placeBid, startAuction } = useStore();

  const [tab,         setTab]         = useState('auctions'); // 'auctions' | 'free'
  const [bidModal,    setBidModal]    = useState(null);       // auction object
  const [bidAmount,   setBidAmount]   = useState('');
  const [dropId,      setDropId]      = useState('');
  const [bidLoading,  setBidLoading]  = useState(false);
  const [bidError,    setBidError]    = useState('');
  const [search,      setSearch]      = useState('');
  const [posFilter,   setPosFilter]   = useState('TODOS');

  const myHighBids = new Set(auctions.filter(a => a.highBidderTeamId === 'team_me').map(a => a.id));

  const myPlayers = useMemo(() =>
    (team.players ?? []).map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean),
    [team.players]
  );
  const squadFull = myPlayers.length >= MAX_SQUAD;

  // When we open bid modal: check if we're already winning (won't add a player)
  function openBid(auction) {
    const alreadyWinning = auction.highBidderTeamId === 'team_me';
    const min = (auction.currentBid ?? 0) + MIN_INCREMENT;
    setBidAmount(String(min));
    setDropId('');
    setBidError('');
    setBidModal({ ...auction, alreadyWinning });
  }

  function handleBid() {
    setBidError('');
    const amount = parseInt(bidAmount, 10);
    const min = (bidModal.currentBid ?? 0) + MIN_INCREMENT;

    if (isNaN(amount) || amount < min) {
      setBidError(`Lance mínimo: ${min} moedas.`); return;
    }
    // Effective coins after potential refund
    const effectiveCoins = bidModal.alreadyWinning ? coins + bidModal.currentBid : coins;
    if (amount > effectiveCoins) {
      setBidError('Saldo insuficiente.'); return;
    }
    // If squad is full and we're not already winning this auction, need to drop
    const needsDrop = squadFull && !bidModal.alreadyWinning;
    if (needsDrop && !dropId) {
      setBidError('Seu time está cheio. Escolha um jogador para liberar vaga.'); return;
    }

    setBidLoading(true);
    setTimeout(() => {
      placeBid(bidModal.id, amount, dropId || null);
      setBidLoading(false);
      setBidModal(null);
    }, 600);
  }

  // Free agents filtered
  const filteredFree = useMemo(() => {
    return (freeAgents ?? [])
      .filter(p => posFilter === 'TODOS' || p.pos === posFilter)
      .filter(p => !search ||
        p.nick.toLowerCase().includes(search.toLowerCase()) ||
        p.club.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
  }, [freeAgents, posFilter, search]);

  const POSITIONS = ['TODOS', 'GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Mercado</h1>
          <p className="text-sub text-sm mt-1">{auctions.length} leilões · {(freeAgents ?? []).length} agentes livres</p>
        </div>
        <CoinBalance amount={coins} />
      </div>

      {/* Tabs */}
      <div className="flex bg-surface border border-rim rounded-lg p-1 mb-6 gap-1 w-fit">
        {[['auctions', `Leilões (${auctions.length})`], ['free', 'Agentes Livres']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === key ? 'bg-bg text-white border border-rim' : 'text-sub hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Auctions tab */}
      {tab === 'auctions' && (
        auctions.length === 0 ? (
          <EmptyState icon="🔨" message="Nenhum leilão ativo no momento." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {auctions.map(a => (
              <AuctionCard
                key={a.id}
                auction={a}
                isHighBidder={myHighBids.has(a.id)}
                onBid={() => openBid(a)}
              />
            ))}
          </div>
        )
      )}

      {/* Free agents tab */}
      {tab === 'free' && (
        <div>
          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-input border border-rim rounded-lg px-3 py-2 focus-within:border-green/40 transition-colors">
              <Search size={14} className="text-sub" />
              <input
                type="text"
                placeholder="Buscar jogador ou clube..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm placeholder-muted outline-none"
              />
              {search && <button onClick={() => setSearch('')}><X size={13} className="text-muted hover:text-white" /></button>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {POSITIONS.map(pos => (
                <button
                  key={pos}
                  onClick={() => setPosFilter(pos)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    posFilter === pos
                      ? 'bg-green-glow border-green/30 text-green'
                      : 'border-rim text-sub hover:text-white'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {filteredFree.length === 0 ? (
            <EmptyState icon="👤" message="Nenhum agente livre encontrado." />
          ) : (
            <div className="space-y-2">
              {filteredFree.map(p => (
                <PlayerRow
                  key={p.id}
                  player={p}
                  action={
                    <button
                      onClick={() => {
                        if (window.confirm(`Iniciar leilão de ${p.nick}? Dura 12 horas.`)) {
                          startAuction(p.id);
                        }
                      }}
                      className="text-xs font-bold text-green border border-green/30 bg-green-glow rounded-full px-3 py-1.5 hover:bg-green/15 transition-colors whitespace-nowrap"
                    >
                      Leiloar
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Bid Modal ──────────────────────────────────────────────────────── */}
      {bidModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-rim rounded-2xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-rim">
              <h2 className="text-base font-bold text-white">Dar lance</h2>
              <button onClick={() => setBidModal(null)} className="text-sub hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Player info */}
              <div className="flex items-center gap-3 bg-bg rounded-xl p-3">
                <Avatar nick={bidModal.player?.nick} pos={bidModal.player?.pos} size="lg" />
                <div>
                  <div className="font-bold text-white">{bidModal.player?.nick}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge label={bidModal.player?.pos} small />
                    <span className="text-xs text-sub">{bidModal.player?.club}</span>
                  </div>
                </div>
              </div>

              {/* Bid info grid */}
              <div className="grid grid-cols-2 gap-3">
                <InfoBox label="Lance atual"     value={<CoinBalance amount={bidModal.currentBid} />} />
                <InfoBox label="Lance mínimo"    value={<CoinBalance amount={bidModal.currentBid + MIN_INCREMENT} />} />
                <InfoBox label="Meu saldo"       value={<CoinBalance amount={coins} />} />
                <InfoBox label="Meu time"        value={`${myPlayers.length}/${MAX_SQUAD} jogadores`} />
              </div>

              {/* Squad full warning + drop selector */}
              {squadFull && !bidModal.alreadyWinning && (
                <div>
                  <div className="flex items-start gap-2 bg-warn/10 border border-warn/30 rounded-lg p-3 mb-3">
                    <AlertCircle size={14} className="text-warn mt-0.5 shrink-0" />
                    <p className="text-xs text-warn">
                      Seu time está cheio (23 jogadores). Escolha um jogador para liberar a vaga antes de dar o lance.
                    </p>
                  </div>

                  <label className="text-xs text-sub font-semibold mb-2 block">
                    Jogador a liberar <span className="text-danger">*</span>
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto rounded-lg border border-rim">
                    {myPlayers.map(p => (
                      <button
                        key={p.id}
                        onClick={() => setDropId(p.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                          dropId === p.id
                            ? 'bg-danger/10 border-l-2 border-danger'
                            : 'hover:bg-rim/60'
                        }`}
                      >
                        <Avatar nick={p.nick} pos={p.pos} size="sm" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold text-white truncate block">{p.nick}</span>
                          <div className="flex items-center gap-1.5">
                            <Badge label={p.pos} small />
                            <span className="text-xs text-sub">{p.club}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green font-bold">{(p.pts ?? 0).toFixed(1)} pts</div>
                        </div>
                        {dropId === p.id && (
                          <UserMinus size={14} className="text-danger shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bid amount input */}
              <div>
                <label className="text-xs text-sub font-semibold mb-2 block">Valor do lance</label>
                <div className="flex items-center gap-2 bg-input border border-rim rounded-lg px-3 py-3 focus-within:border-green/40 transition-colors">
                  <Coins size={16} className="text-gold" />
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    className="flex-1 bg-transparent text-white text-xl font-bold outline-none tabular-nums"
                    min={bidModal.currentBid + MIN_INCREMENT}
                  />
                </div>

                {/* Quick increments */}
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100].map(inc => (
                    <button
                      key={inc}
                      onClick={() => setBidAmount(v => String((parseInt(v, 10) || 0) + inc))}
                      className="flex-1 text-xs font-bold text-sub border border-rim rounded-lg py-1.5 hover:bg-rim hover:text-white transition-colors"
                    >
                      +{inc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {bidError && (
                <div className="flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                  <AlertCircle size={13} className="text-danger shrink-0" />
                  <p className="text-xs text-danger">{bidError}</p>
                </div>
              )}

              {/* Confirm button */}
              <button
                onClick={handleBid}
                disabled={bidLoading}
                className="w-full bg-green text-bg font-bold py-3 rounded-lg text-sm hover:bg-green-dark transition-colors disabled:opacity-60"
              >
                {bidLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                    Confirmando...
                  </span>
                ) : `Confirmar lance de ${parseInt(bidAmount, 10) || 0} moedas`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="bg-bg rounded-lg px-3 py-2.5">
      <div className="text-[10px] text-muted mb-1">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function EmptyState({ icon, message }) {
  return (
    <div className="card p-16 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sub text-sm">{message}</p>
    </div>
  );
}
