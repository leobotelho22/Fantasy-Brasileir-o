'use client';
import { useState, useMemo } from 'react';
import { Search, X, Coins, AlertCircle, UserMinus, CheckCircle, Clock } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import AuctionCard from '@/components/AuctionCard';
import PlayerRow from '@/components/PlayerRow';
import Badge from '@/components/Badge';
import CoinBalance from '@/components/CoinBalance';
import CountdownTimer from '@/components/CountdownTimer';
import { Avatar } from '@/components/PlayerRow';
import useStore from '@/store/useStore';
import { ALL_PLAYERS } from '@/data/mock';

const MAX_SQUAD     = 23;
const MIN_INCREMENT = 10;
const POSITIONS     = ['TODOS', 'GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];

export default function MercadoPage() {
  const { coins, auctions, freeAgents, team, placeBid, startAuction, simulateOutbid } = useStore();

  const [tab,        setTab]        = useState('auctions');
  const [bidModal,   setBidModal]   = useState(null);
  const [bidAmount,  setBidAmount]  = useState('');
  const [dropId,     setDropId]     = useState('');
  const [bidLoading, setBidLoading] = useState(false);
  const [bidError,   setBidError]   = useState('');
  const [search,     setSearch]     = useState('');
  const [posFilter,  setPosFilter]  = useState('TODOS');

  const myHighBids = useMemo(
    () => new Set(auctions.filter(a => a.highBidderTeamId === 'team_me').map(a => a.id)),
    [auctions]
  );

  const myPlayers = useMemo(
    () => (team.players ?? []).map(id => ALL_PLAYERS.find(p => p.id === id)).filter(Boolean),
    [team.players]
  );

  const squadFull = myPlayers.length >= MAX_SQUAD;

  function openBid(auction) {
    const alreadyWinning = auction.highBidderTeamId === 'team_me';
    setBidAmount(String((auction.currentBid ?? 0) + MIN_INCREMENT));
    setDropId('');
    setBidError('');
    setBidModal({ ...auction, alreadyWinning });
  }

  function handleBid() {
    setBidError('');
    const amount = parseInt(bidAmount, 10);
    const min    = (bidModal.currentBid ?? 0) + MIN_INCREMENT;

    if (isNaN(amount) || amount < min) { setBidError(`Lance mínimo: ${min} moedas.`); return; }

    const effectiveCoins = bidModal.alreadyWinning ? coins + bidModal.currentBid : coins;
    if (amount > effectiveCoins) { setBidError('Saldo insuficiente.'); return; }

    const needsDrop = squadFull && !bidModal.alreadyWinning;
    if (needsDrop && !dropId) { setBidError('Seu time está cheio. Escolha um jogador para liberar.'); return; }

    setBidLoading(true);
    setTimeout(() => {
      placeBid(bidModal.id, amount, dropId || null);
      setBidLoading(false);
      setBidModal(null);
    }, 500);
  }

  const filteredFree = useMemo(() =>
    (freeAgents ?? [])
      .filter(p => posFilter === 'TODOS' || p.pos === posFilter)
      .filter(p => !search || p.nick.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0)),
    [freeAgents, posFilter, search]
  );

  // Re-read auction from store to keep modal in sync after simulateOutbid
  const liveModal = bidModal ? auctions.find(a => a.id === bidModal.id) : null;

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
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              tab === key ? 'bg-bg text-white border border-rim' : 'text-sub hover:text-white'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Auctions grid */}
      {tab === 'auctions' && (
        auctions.length === 0
          ? <Empty icon="🔨" message="Nenhum leilão ativo no momento." />
          : <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctions.map(a => (
                <AuctionCard
                  key={a.id}
                  auction={a}
                  isHighBidder={myHighBids.has(a.id)}
                  onBid={() => openBid(a)}
                  onSimulateOutbid={myHighBids.has(a.id) ? () => simulateOutbid(a.id) : null}
                />
              ))}
            </div>
      )}

      {/* Free agents */}
      {tab === 'free' && (
        <div>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex items-center gap-2 flex-1 bg-input border border-rim rounded-lg px-3 py-2 focus-within:border-green/40 transition-colors">
              <Search size={14} className="text-sub" />
              <input type="text" placeholder="Buscar jogador ou clube..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm placeholder-muted outline-none" />
              {search && <button onClick={() => setSearch('')}><X size={13} className="text-muted" /></button>}
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {POSITIONS.map(pos => (
                <button key={pos} onClick={() => setPosFilter(pos)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                    posFilter === pos ? 'bg-green-glow border-green/30 text-green' : 'border-rim text-sub hover:text-white'
                  }`}>
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {filteredFree.length === 0
            ? <Empty icon="👤" message="Nenhum agente livre encontrado." />
            : <div className="space-y-2">
                {filteredFree.map(p => (
                  <PlayerRow key={p.id} player={p}
                    action={
                      <button
                        onClick={() => { if (window.confirm(`Iniciar leilão de ${p.nick}? Dura 12 horas.`)) startAuction(p.id); }}
                        className="text-xs font-bold text-green border border-green/30 bg-green-glow rounded-full px-3 py-1.5 hover:bg-green/15 transition-colors whitespace-nowrap"
                      >
                        Leiloar
                      </button>
                    }
                  />
                ))}
              </div>
          }
        </div>
      )}

      {/* ── Bid Modal ──────────────────────────────────────────────────── */}
      {bidModal && liveModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
             onClick={e => { if (e.target === e.currentTarget) setBidModal(null); }}>
          <div className="bg-surface border border-rim rounded-2xl w-full max-w-md overflow-hidden">

            {/* Status header */}
            {liveModal.highBidderTeamId === 'team_me' ? (
              <div className="flex items-center justify-center gap-2 bg-green-glow border-b border-green/20 px-5 py-2.5">
                <CheckCircle size={14} className="text-green" />
                <span className="text-green text-sm font-bold">Você está ganhando este leilão</span>
              </div>
            ) : liveModal.highBidderTeamId ? (
              <div className="flex items-center justify-center gap-2 bg-danger/10 border-b border-danger/20 px-5 py-2.5">
                <AlertCircle size={14} className="text-danger" />
                <span className="text-danger text-sm font-bold">
                  {liveModal.highBidder} está ganhando — supere o lance!
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 bg-info/10 border-b border-info/20 px-5 py-2.5">
                <span className="text-info text-sm font-bold">Sem lances ainda — seja o primeiro!</span>
              </div>
            )}

            <div className="px-5 py-4 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Player + countdown */}
              <div className="flex items-center gap-3 bg-bg rounded-xl p-3">
                <Avatar nick={liveModal.player?.nick} pos={liveModal.player?.pos} size="lg" />
                <div className="flex-1">
                  <div className="font-bold text-white">{liveModal.player?.nick}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge label={liveModal.player?.pos} small />
                    <span className="text-xs text-sub">{liveModal.player?.club}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    <Clock size={11} className="text-sub" />
                    <CountdownTimer endsAt={liveModal.endsAt} className="text-xs" />
                  </div>
                  <div className="text-[10px] text-muted mt-0.5">{liveModal.numBids} lance{liveModal.numBids !== 1 ? 's' : ''}</div>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <InfoBox label="Lance atual"  value={<CoinBalance amount={liveModal.currentBid} />} />
                <InfoBox label="Lance mínimo" value={<CoinBalance amount={liveModal.currentBid + MIN_INCREMENT} />} highlight />
                <InfoBox label="Meu saldo"    value={<CoinBalance amount={coins} />} />
                <InfoBox label="Meu time"     value={`${myPlayers.length}/${MAX_SQUAD} jogadores`} />
              </div>

              {/* Drop player selector (only when squad is full and not already winning) */}
              {squadFull && !bidModal.alreadyWinning && (
                <div>
                  <div className="flex items-start gap-2 bg-warn/10 border border-warn/30 rounded-lg p-3 mb-3">
                    <AlertCircle size={13} className="text-warn mt-0.5 shrink-0" />
                    <p className="text-xs text-warn">
                      <strong>Time cheio (23/23).</strong> Escolha um jogador para liberar a vaga antes de confirmar o lance.
                    </p>
                  </div>

                  <p className="text-xs text-sub font-semibold mb-2">
                    Jogador a liberar <span className="text-danger">*</span>
                    {dropId && <span className="text-green ml-1">✓ selecionado</span>}
                  </p>

                  <div className="rounded-xl border border-rim overflow-hidden max-h-44 overflow-y-auto">
                    {myPlayers.map(p => {
                      const selected = dropId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setDropId(selected ? '' : p.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-b border-rim last:border-0 ${
                            selected
                              ? 'bg-danger/10 border-l-2 border-l-danger'
                              : 'hover:bg-rim/60'
                          }`}
                        >
                          <Avatar nick={p.nick} pos={p.pos} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">{p.nick}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Badge label={p.pos} small />
                              <span className="text-xs text-sub">{p.club}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-xs text-green font-bold">{(p.pts ?? 0).toFixed(1)}</div>
                            <div className="text-[10px] text-muted">pts</div>
                          </div>
                          {selected && <UserMinus size={14} className="text-danger shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Bid amount input */}
              <div>
                <label className="text-xs text-sub font-semibold mb-2 block">Valor do lance</label>
                <div className="flex items-center gap-2 bg-input border border-rim rounded-xl px-4 py-3 focus-within:border-green/50 transition-colors">
                  <Coins size={18} className="text-gold" />
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e => setBidAmount(e.target.value)}
                    className="flex-1 bg-transparent text-white text-2xl font-black outline-none tabular-nums"
                    min={(liveModal.currentBid ?? 0) + MIN_INCREMENT}
                  />
                  <span className="text-sub text-sm font-semibold">moedas</span>
                </div>

                {/* Quick increments */}
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100].map(inc => (
                    <button key={inc} onClick={() => setBidAmount(v => String((parseInt(v, 10) || 0) + inc))}
                      className="flex-1 text-xs font-bold text-sub border border-rim rounded-lg py-1.5 hover:bg-rim hover:text-white transition-colors">
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

              {/* Confirm + Cancel */}
              <div className="flex gap-2">
                <button onClick={() => setBidModal(null)}
                  className="px-4 py-3 text-sm text-sub border border-rim rounded-xl hover:bg-rim transition-colors font-semibold">
                  Cancelar
                </button>
                <button onClick={handleBid} disabled={bidLoading}
                  className="flex-1 bg-green text-bg font-bold py-3 rounded-xl text-sm hover:bg-green-dark transition-colors disabled:opacity-60">
                  {bidLoading
                    ? <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                        Confirmando...
                      </span>
                    : `Confirmar ${parseInt(bidAmount, 10) || 0} moedas`
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

function InfoBox({ label, value, highlight = false }) {
  return (
    <div className={`rounded-lg px-3 py-2.5 ${highlight ? 'bg-green-glow border border-green/20' : 'bg-bg'}`}>
      <div className="text-[10px] text-muted mb-1">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

function Empty({ icon, message }) {
  return (
    <div className="card p-16 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sub text-sm">{message}</p>
    </div>
  );
}
