'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, RotateCcw, Brain, ChevronLeft, ChevronRight, Sparkles, Zap } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Flashcard { id: string; front: string; back: string; subject: string; ease_factor: number; interval: number; repetitions: number; next_review: string; last_review: string | null; }

interface SM2Result { ease_factor: number; interval: number; repetitions: number; next_review: string; }

function sm2(card: Flashcard, quality: number): SM2Result {
  let { ease_factor, interval, repetitions } = card;

  if (quality >= 3) {
    if (repetitions === 0) { interval = 1; }
    else if (repetitions === 1) { interval = 6; }
    else { interval = Math.round(interval * ease_factor); }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (ease_factor < 1.3) ease_factor = 1.3;

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return { ease_factor: Math.round(ease_factor * 100) / 100, interval, repetitions, next_review: nextReview.toISOString().split('T')[0] };
}

export default function FlashcardsPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'browse' | 'study' | 'create'>('browse');
  const [loading, setLoading] = useState(true);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [dueCards, setDueCards] = useState<Flashcard[]>([]);
  const supabase = createClient();

  useEffect(() => { loadCards(); }, []);

  async function loadCards() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('flashcards').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (data) { setCards(data); filterDue(data); }
    setLoading(false);
  }

  function filterDue(allCards: Flashcard[]) {
    const today = new Date().toISOString().split('T')[0];
    setDueCards(allCards.filter((c) => !c.next_review || c.next_review <= today));
  }

  async function addCard() {
    if (!newFront.trim() || !newBack.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('flashcards').insert({ user_id: user.id, front: newFront, back: newBack, subject: newSubject, ease_factor: 2.5, interval: 0, repetitions: 0, next_review: new Date().toISOString().split('T')[0] }).select().single();
    if (data) { setCards([data, ...cards]); setNewFront(''); setNewBack(''); toast.success('Card created!'); }
  }

  async function reviewCard(quality: number) {
    const card = dueCards[currentIndex] || cards[currentIndex];
    if (!card) return;
    const result = sm2(card, quality);
    await supabase.from('flashcards').update({ ease_factor: result.ease_factor, interval: result.interval, repetitions: result.repetitions, next_review: result.next_review, last_review: new Date().toISOString() }).eq('id', card.id);
    setCards(cards.map((c) => c.id === card.id ? { ...c, ...result, last_review: new Date().toISOString() } : c));
    setIsFlipped(false);
    if (currentIndex < (mode === 'study' ? dueCards.length : cards.length) - 1) { setCurrentIndex(currentIndex + 1); }
    else { toast.success('All cards reviewed!'); setCurrentIndex(0); filterDue(cards); }
  }

  const subjects = [...new Set(cards.map((c) => c.subject).filter(Boolean))];
  const filtered = subjectFilter === 'all' ? cards : cards.filter((c) => c.subject === subjectFilter);
  const studyCards = dueCards.length > 0 ? dueCards : cards;
  const activeCards = mode === 'study' ? studyCards : filtered;
  const currentCard = activeCards[currentIndex];

  return (
    <div className="h-full overflow-y-auto p-6 dark:bg-gray-950">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Flashcards</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{cards.length} cards · {dueCards.length} due for review</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setMode('study'); setCurrentIndex(0); setIsFlipped(false); }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"><Brain className="w-4 h-4" />Study ({dueCards.length})</button>
          <button onClick={() => { setMode('browse'); setShowNew(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Card</button>
        </div>
      </div>

      {subjects.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button onClick={() => setSubjectFilter('all')} className={clsx('px-3 py-1.5 rounded-lg text-sm', subjectFilter === 'all' ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}>All</button>
          {subjects.map((s) => <button key={s} onClick={() => setSubjectFilter(s)} className={clsx('px-3 py-1.5 rounded-lg text-sm', subjectFilter === s ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800')}>{s}</button>)}
        </div>
      )}

      {showNew && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-6">
          <h3 className="font-semibold mb-4 dark:text-white">Create Flashcard</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <textarea placeholder="Front (question)" value={newFront} onChange={(e) => setNewFront(e.target.value)} className="px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white h-24 resize-none" />
            <textarea placeholder="Back (answer)" value={newBack} onChange={(e) => setNewBack(e.target.value)} className="px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white h-24 resize-none" />
          </div>
          <input type="text" placeholder="Subject" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl text-sm dark:text-white mb-4" />
          <div className="flex gap-2">
            <button onClick={() => setShowNew(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
            <button onClick={addCard} className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700">Create</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
      : activeCards.length === 0 ? <div className="text-center py-16 text-gray-400 dark:text-gray-500"><Zap className="w-12 h-12 mx-auto mb-4 opacity-50" /><p>No flashcards yet. Create your first card!</p></div>
      : (
        <div className="max-w-xl mx-auto">
          {mode === 'study' && dueCards.length === 0 && (
            <div className="text-center mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <Sparkles className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 dark:text-green-300 font-medium">No cards due! All caught up.</p>
            </div>
          )}
          <div className="text-center mb-4 text-sm text-gray-500 dark:text-gray-400">{currentIndex + 1} / {activeCards.length}</div>
          <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl min-h-[300px] flex items-center justify-center cursor-pointer hover:shadow-lg transition-shadow p-8" onClick={() => setIsFlipped(!isFlipped)}>
            <div className="text-center w-full">
              {currentCard && (
                <>
                  <p className="text-2xl font-semibold dark:text-white mb-4">{isFlipped ? currentCard.back : currentCard.front}</p>
                  {currentCard.subject && <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-1 rounded">{currentCard.subject}</span>}
                </>
              )}
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-3">Click card to flip · {isFlipped ? 'Rate your recall below' : 'Click to reveal answer'}</p>
          {isFlipped && (
            <div className="flex justify-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((q) => (
                <button key={q} onClick={() => reviewCard(q)} className={clsx('px-4 py-2 rounded-xl font-medium text-sm', q <= 2 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200' : q === 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-200' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200')}>
                  {q <= 2 ? 'Again' : q === 3 ? 'Good' : 'Easy'}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setIsFlipped(false); }} disabled={currentIndex === 0} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => { setMode('browse'); setCurrentIndex(0); setIsFlipped(false); }} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"><RotateCcw className="w-5 h-5" /></button>
            <button onClick={() => { setCurrentIndex(Math.min(activeCards.length - 1, currentIndex + 1)); setIsFlipped(false); }} disabled={currentIndex >= activeCards.length - 1} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-gray-800"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
