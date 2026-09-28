import React, { useState, useEffect, useRef } from 'react';
import { gameApi } from '../api/game.api';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import {
  Gamepad2,
  Trophy,
  Play,
  Users,
  Target,
  Sparkles,
  Dices,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

const TRIVIA_QUESTIONS = [
  {
    q: 'Which layer of Earth is composed of liquid iron & nickel?',
    options: ['Crust', 'Mantle', 'Outer Core', 'Inner Core'],
    correct: 2
  },
  {
    q: 'What is the fastest land animal in the world?',
    options: ['Cheetah', 'Pronghorn', 'Lion', 'Peregrine Falcon'],
    correct: 0
  },
  {
    q: 'Which element has the chemical symbol "Au"?',
    options: ['Silver', 'Gold', 'Argon', 'Copper'],
    correct: 1
  },
  {
    q: 'How many bones are in the adult human body?',
    options: ['206', '210', '198', '215'],
    correct: 0
  },
  {
    q: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
    correct: 2
  }
];

const CARD_SYMBOLS = ['🍎', '🚀', '⚡', '💎', '🍎', '🚀', '⚡', '💎'];

export const GamesHub = () => {
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('GAMES');
  const [playingGame, setPlayingGame] = useState(null);
  const [session, setSession] = useState(null);
  const [gameScore, setGameScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);

  // Minigame States
  const [targetPos, setTargetPos] = useState({ top: 40, left: 40 });
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  const [triviaIdx, setTriviaIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  const [diceValues, setDiceValues] = useState([1, 1, 1, 1, 1]);
  const [rollsLeft, setRollsLeft] = useState(3);

  const fetchHubData = async () => {
    try {
      setLoading(true);
      const [gamesRes, boardRes] = await Promise.all([
        gameApi.getGames(),
        gameApi.getLeaderboard()
      ]);
      if (gamesRes.success && gamesRes.data?.games) {
        setGames(gamesRes.data.games);
      }
      if (boardRes.success && boardRes.data?.leaderboard) {
        setLeaderboard(boardRes.data.leaderboard);
      }
    } catch (err) {
      console.error('Error fetching games hub:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, []);

  const handleStartGame = async (game) => {
    try {
      setPlayingGame(game);
      setGameScore(0);
      setGameOver(false);

      const res = await gameApi.joinSession(game._id);
      if (res.success && res.data?.session) {
        setSession(res.data.session);
      }

      if (game.title.includes('Target')) {
        setTimeLeft(15);
        moveTarget();
      } else if (game.title.includes('Trivia')) {
        setTriviaIdx(0);
        setSelectedAnswer(null);
      } else if (game.title.includes('Memory')) {
        const shuffled = [...CARD_SYMBOLS].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setFlipped([]);
        setMatched([]);
      } else if (game.title.includes('Dice')) {
        setDiceValues([1, 1, 1, 1, 1]);
        setRollsLeft(3);
      }
    } catch (err) {
      alert(err.message || 'Failed to start game session');
      setPlayingGame(null);
    }
  };

  useEffect(() => {
    if (playingGame?.title.includes('Target') && !gameOver) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [playingGame, gameOver]);

  const moveTarget = () => {
    const top = Math.floor(Math.random() * 70) + 15;
    const left = Math.floor(Math.random() * 70) + 15;
    setTargetPos({ top, left });
  };

  const handleTargetClick = () => {
    if (gameOver) return;
    setGameScore((prev) => prev + 10);
    moveTarget();
  };

  const handleAnswerTrivia = (idx) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const q = TRIVIA_QUESTIONS[triviaIdx];
    if (idx === q.correct) {
      setGameScore((prev) => prev + 20);
    }

    setTimeout(() => {
      if (triviaIdx + 1 < TRIVIA_QUESTIONS.length) {
        setTriviaIdx((prev) => prev + 1);
        setSelectedAnswer(null);
      } else {
        setGameOver(true);
      }
    }, 1200);
  };

  const handleCardClick = (idx) => {
    if (flipped.length === 2 || flipped.includes(idx) || matched.includes(idx)) return;
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const [first, second] = nextFlipped;
      if (cards[first] === cards[second]) {
        setMatched((prev) => [...prev, first, second]);
        setGameScore((prev) => prev + 25);
        setFlipped([]);
        if (matched.length + 2 === cards.length) {
          setGameOver(true);
        }
      } else {
        setTimeout(() => {
          setFlipped([]);
        }, 800);
      }
    }
  };

  const handleRollDice = () => {
    if (rollsLeft <= 0) return;
    const newDice = diceValues.map(() => Math.floor(Math.random() * 6) + 1);
    setDiceValues(newDice);
    const newRollsLeft = rollsLeft - 1;
    setRollsLeft(newRollsLeft);

    const sum = newDice.reduce((a, b) => a + b, 0);
    setGameScore(sum * 2);

    if (newRollsLeft === 0) {
      setGameOver(true);
    }
  };

  const handleSubmitFinalScore = async () => {
    if (!session?._id) {
      setPlayingGame(null);
      return;
    }

    try {
      setSubmittingScore(true);
      await gameApi.submitScore({
        sessionId: session._id,
        points: gameScore
      });
      fetchHubData();
      setPlayingGame(null);
    } catch (err) {
      alert(err.message || 'Failed to submit score');
    } finally {
      setSubmittingScore(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Loading games hub..." />;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <Gamepad2 className="w-5 h-5 text-cyan-400" />
          <span>Friend Group Minigames & Leaderboard</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Play interactive minigames, earn points, and dominate your friend circle leaderboard!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('GAMES')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'GAMES' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          🎮 Available Minigames ({games.length})
        </button>
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'LEADERBOARD' ? 'border-cyan-400 text-cyan-400 font-bold' : 'border-transparent text-slate-400'
          }`}
        >
          🏆 Friend Leaderboard
        </button>
      </div>

      {activeTab === 'GAMES' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.length === 0 ? (
            <div className="col-span-full p-8 text-center text-xs text-slate-400 glass-panel rounded-2xl">
              No games currently available.
            </div>
          ) : (
            games.map((game) => (
              <div key={game._id} className="glass-panel p-5 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{game.type}</span>
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>Max {game.maxPlayers}</span>
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <span>{game.title}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{game.description || 'Fun friend circle minigame.'}</p>
                </div>

                <button
                  onClick={() => handleStartGame(game)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-1.5 transition"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>PLAY NOW</span>
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Leaderboard Table */
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          {leaderboard.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">No leaderboard scores recorded yet. Play games to score points!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Player</th>
                    <th className="py-3 px-4">Games Played</th>
                    <th className="py-3 px-4">Total Score Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {leaderboard.map((item, index) => (
                    <tr key={item.user?._id || index} className="hover:bg-slate-900/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-300">
                        {index === 0 ? '🥇 #1' : index === 1 ? '🥈 #2' : index === 2 ? '🥉 #3' : `#${index + 1}`}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-100">{item.user?.name || 'Player'}</td>
                      <td className="py-3 px-4 text-slate-400">{item.gamesPlayed}</td>
                      <td className="py-3 px-4 font-bold text-cyan-400 font-mono text-sm">{item.totalPoints} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Interactive Game Play Modal */}
      {playingGame && (
        <Modal
          isOpen={true}
          onClose={() => setPlayingGame(null)}
          title={playingGame.title}
        >
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Current Score:</span>
              <span className="text-cyan-400 font-bold font-mono text-base">{gameScore} pts</span>
            </div>

            {!gameOver ? (
              <>
                {playingGame.title.includes('Target') && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>Time Remaining:</span>
                      <span className="text-amber-400 font-bold">{timeLeft}s</span>
                    </div>
                    <div className="relative w-full h-60 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden cursor-crosshair">
                      <button
                        type="button"
                        onClick={handleTargetClick}
                        style={{ top: `${targetPos.top}%`, left: `${targetPos.left}%` }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full text-white shadow-lg shadow-rose-500/50 hover:scale-110 active:scale-95 transition"
                      >
                        <Target className="w-6 h-6 animate-pulse" />
                      </button>
                    </div>
                  </div>
                )}

                {playingGame.title.includes('Trivia') && (
                  <div className="space-y-3">
                    <div className="text-xs text-cyan-400 font-bold">
                      Question {triviaIdx + 1} of {TRIVIA_QUESTIONS.length}
                    </div>
                    <p className="text-sm font-semibold text-slate-100">{TRIVIA_QUESTIONS[triviaIdx].q}</p>
                    <div className="space-y-2">
                      {TRIVIA_QUESTIONS[triviaIdx].options.map((opt, oIdx) => {
                        const isCorrect = oIdx === TRIVIA_QUESTIONS[triviaIdx].correct;
                        const isSelected = selectedAnswer === oIdx;
                        let btnStyle = 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800';
                        if (selectedAnswer !== null) {
                          if (isCorrect) btnStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
                          else if (isSelected) btnStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300';
                        }
                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleAnswerTrivia(oIdx)}
                            disabled={selectedAnswer !== null}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-semibold transition ${btnStyle}`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {playingGame.title.includes('Memory') && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-400 text-center">Flip cards to match all 4 pairs!</p>
                    <div className="grid grid-cols-4 gap-2">
                      {cards.map((sym, cIdx) => {
                        const isFlipped = flipped.includes(cIdx) || matched.includes(cIdx);
                        return (
                          <button
                            key={cIdx}
                            onClick={() => handleCardClick(cIdx)}
                            className={`h-16 rounded-xl text-2xl flex items-center justify-center border font-bold transition ${
                              isFlipped
                                ? 'bg-slate-800 border-cyan-500 text-white'
                                : 'bg-slate-900 border-slate-800 text-transparent hover:border-slate-700'
                            }`}
                          >
                            {isFlipped ? sym : '?'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {playingGame.title.includes('Dice') && (
                  <div className="space-y-4 text-center">
                    <div className="text-xs text-slate-400">Rolls Remaining: <strong className="text-amber-400">{rollsLeft}</strong></div>
                    <div className="flex justify-center space-x-3">
                      {diceValues.map((val, dIdx) => (
                        <div key={dIdx} className="w-12 h-12 bg-slate-900 border border-cyan-500/40 rounded-xl flex items-center justify-center font-bold text-xl text-cyan-300 shadow-md">
                          {val}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleRollDice}
                      disabled={rollsLeft <= 0}
                      className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                    >
                      <Dices className="w-4 h-4" />
                      <span>ROLL DICE</span>
                    </button>
                  </div>
                )}

                {playingGame.title.includes('Snake') && (
                  <div className="space-y-3 text-center">
                    <p className="text-xs text-slate-400">Tap directional buttons to navigate & eat targets!</p>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => { setGameScore((prev) => prev + 15); }}
                        className="py-2 px-4 rounded-xl bg-cyan-600/30 text-cyan-300 text-xs font-bold border border-cyan-500/30 hover:bg-cyan-600/50"
                      >
                        🐍 Eat Snake Target (+15 pts)
                      </button>
                      <button
                        onClick={() => setGameOver(true)}
                        className="py-2 px-4 rounded-xl bg-rose-600/30 text-rose-300 text-xs font-bold border border-rose-500/30"
                      >
                        End Game
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mx-auto">
                  <Trophy className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Game Finished!</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Final Score Achieved</p>
                  <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">{gameScore} Points</div>
                </div>

                <button
                  onClick={handleSubmitFinalScore}
                  disabled={submittingScore}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
                >
                  {submittingScore ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save Score to Leaderboard</span>
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
