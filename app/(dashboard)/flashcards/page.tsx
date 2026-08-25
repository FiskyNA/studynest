'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Brain, RotateCcw, Check, X, ChevronRight, Trophy, Wand2, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface Deck { id: string; name: string; description: string; card_count: number; }
interface Flashcard { id: string; deck_id: string; front: string; back: string; difficulty: number; next_review: string; review_count: number; }

function generateFlashcards(text: string): { front: string; back: string }[] {
  const cards: { front: string; back: string }[] = [];
  const lines = text.split('\n').filter((l) => l.trim());

  for (const line of lines) {
    const trimmed = line.replace(/^[-•*]\s*/, '').trim();
    if (!trimmed) continue;

    if (trimmed.includes(':')) {
      const [key, ...rest] = trimmed.split(':');
      const val = rest.join(':').trim();
      if (key.trim().length > 3 && val.length > 3) {
        cards.push({ front: `What is ${key.trim()}?`, back: val });
      }
    } else if (trimmed.toLowerCase().startsWith('define ') || trimmed.toLowerCase().startsWith('what is ')) {
      cards.push({ front: trimmed, back: '_(define based on your notes)_' });
    } else if (trimmed.match(/^[A-Z]/) && trimmed.length > 20) {
      const words = trimmed.split(' ');
      const mid = Math.floor(words.length / 2);
      cards.push({ front: words.slice(0, mid).join(' '), back: words.slice(mid).join(' ') });
    } else if (trimmed.length > 5) {
      cards.push({ front: trimmed, back: '_(explain this concept)_' });
    }
  }

  if (cards.length === 0 && text.trim().length > 20) {
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 15);
    for (let i = 0; i < Math.min(sentences.length, 10); i += 2) {
      const q = sentences[i]?.trim();
      const a = sentences[i + 1]?.trim();
      if (q && a) cards.push({ front: q + '?', back: a });
    }
  }

  return cards.slice(0, 20);
}

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [loading, setLoading] = useState(true);
  const [studyMode, setStudyMode] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [showAddCard, setShowAddCard] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [showAiGen, setShowAiGen] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => { loadDecks(); }, []);

  async function loadDecks() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('flashcard_decks').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setDecks(data || []); setLoading(false);
  }

  async function createDeck() {
    if (!newDeckName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('flashcard_decks').insert({ user_id: user.id, name: newDeckName, description: '' }).select().single();
    if (data) { setDecks([data, ...decks]); setNewDeckName(''); setShowNew(false); toast.success('Deck created!'); }
  }

  async function loadCards(deckId: string) {
    setSelectedDeck(deckId);
    const { data } = await supabase.from('flashcards').select('*').eq('deck_id', deckId).order('next_review');
    setCards(data || []);
  }

  async function addCard() {
    if (!newFront.trim() || !newBack.trim() || !selectedDeck) return;
    const { data } = await supabase.from('flashcards').insert({ deck_id: selectedDeck, front: newFront, back: newBack, difficulty: 0, next_review: new Date().toISOString(), review_count: 0 }).select().single();
    if (data) { setCards([...cards, data]); setNewFront(''); setNewBack(''); setShowAddCard(false); toast.success('Card added!'); }
  }

  function startStudy() {
    if (cards.length === 0) { toast.error('No cards!'); return; }
    setStudyMode(true); setCurrentIdx(0); setShowAnswer(false); setStats({ correct: 0, incorrect: 0 });
  }

  function rateCard(d: number) {
    const card = cards[currentIdx]; if (!card) return;
    const newD = Math.max(0, Math.min(5, card.difficulty + (d >= 3 ? 1 : -1)));
    const interval = d >= 3 ? Math.pow(2, newD) : 1;
    supabase.from('flashcards').update({ difficulty: newD, next_review: new Date(Date.now() + interval * 86400000).toISOString(), review_count: card.review_count + 1 }).eq('id', card.id);
    if (d >= 3) setStats({ ...stats, correct: stats.correct + 1 }); else setStats({ ...stats, incorrect: stats.incorrect + 1 });
    if (currentIdx < cards.length - 1) { setCurrentIdx(currentIdx + 1); setShowAnswer(false); } else { setStudyMode(false); toast.success(`Done! ${stats.correct + (d >= 3 ? 1 : 0)}/${cards.length}`); }
  }

  async function generateFromText() {
    if (!aiText.trim() || !selectedDeck) return;
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const generated = generateFlashcards(aiText);
    if (generated.length === 0) { toast.error('Could not generate cards. Try different text.'); setAiLoading(false); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAiLoading(false); return; }

    const toInsert = generated.map((c) => ({ deck_id: selectedDeck, front: c.front, back: c.back, difficulty: 0, next_review: new Date().toISOString(), review_count: 0 }));
    const { data } = await supabase.from('flashcards').insert(toInsert).select();
    if (data) { setCards([...cards, ...data]); toast.success(`Generated ${data.length} flashcards!`); setShowAiGen(false); setAiText(''); }
    setAiLoading(false);
  }

  return (
    <div className="h-full flex flex-col dark:bg-gray-950">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold dark:text-white">Flashcards</h1><p className="text-sm text-gray-500 dark:text-gray-400">{decks.length} decks</p></div>
          {!selectedDeck && <button onClick={() => setShowNew(true)} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700"><Plus className="w-4 h-4" />New Deck</button>}
          {selectedDeck && (
            <div className="flex gap-2">
              <button onClick={() => setShowAiGen(true)} className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-xl font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50"><Wand2 className="w-4 h-4" />AI Generate</button>
              <button onClick={() => setShowAddCard(true)} className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700"><Plus className="w-4 h-4" />Add Card</button>
              <button onClick={startStudy} className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-brand-700"><Brain className="w-4 h-4" />Study</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {showAiGen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowAiGen(false)}>
            <div className="fixed inset-0 bg-black/50" />
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-lg dark:text-white">AI Flashcard Generator</h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Paste your notes below and we&apos;ll generate flashcards automatically.</p>
              <textarea value={aiText} onChange={(e) => setAiText(e.target.value)} placeholder="Paste your notes, textbook content, or lecture slides here..." className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 resize-none h-48 text-sm dark:text-white mb-4" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAiGen(false)} className="px-4 py-2 text-sm text-gray-500">Cancel</button>
                <button onClick={generateFromText} disabled={aiLoading || !aiText.trim()} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
                  {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4" />Generate Cards</>}
                </button>
              </div>
            </div>
          </div>
        )}
        {studyMode ? (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-gray-500 dark:text-gray-400">Card {currentIdx + 1} of {cards.length}</span>
              <div className="flex gap-4"><span className="text-sm text-green-600 dark:text-green-400">✓ {stats.correct}</span><span className="text-sm text-red-600 dark:text-red-400">✗ {stats.incorrect}</span></div>
            </div>
            <div className={clsx('bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-8 min-h-[300px] flex items-center justify-center cursor-pointer transition-all hover:shadow-lg', showAnswer && 'border-brand-300 dark:border-brand-600 bg-brand-50 dark:bg-brand-900/20')} onClick={() => setShowAnswer(!showAnswer)}>
              <div className="text-center"><p className="text-lg font-medium dark:text-white">{showAnswer ? cards[currentIdx]?.back : cards[currentIdx]?.front}</p>{!showAnswer && <p className="text-sm text-gray-400 dark:text-gray-500 mt-4">Click to reveal</p>}</div>
            </div>
            {showAnswer && (
              <div className="flex justify-center gap-3 mt-6">
                <button onClick={() => rateCard(1)} className="flex items-center gap-2 px-6 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50"><X className="w-4 h-4" />Again</button>
                <button onClick={() => rateCard(3)} className="flex items-center gap-2 px-6 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-xl font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/50"><RotateCcw className="w-4 h-4" />Hard</button>
                <button onClick={() => rateCard(4)} className="flex items-center gap-2 px-6 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium hover:bg-green-200 dark:hover:bg-green-900/50"><Check className="w-4 h-4" />Good</button>
                <button onClick={() => rateCard(5)} className="flex items-center gap-2 px-6 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50"><Trophy className="w-4 h-4" />Easy</button>
              </div>
            )}
            <button onClick={() => setStudyMode(false)} className="mt-6 w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">End Session</button>
          </div>
        ) : loading ? <div className="flex justify-center h-64"><div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" /></div>
        : selectedDeck ? (
          <div>
            {showAddCard && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Front</label><textarea value={newFront} onChange={(e) => setNewFront(e.target.value)} placeholder="Question..." className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none resize-none h-24 dark:text-white" /></div>
                  <div><label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Back</label><textarea value={newBack} onChange={(e) => setNewBack(e.target.value)} placeholder="Answer..." className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg text-sm outline-none resize-none h-24 dark:text-white" /></div>
                </div>
                <div className="flex justify-end gap-2"><button onClick={() => setShowAddCard(false)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button><button onClick={addCard} className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Add</button></div>
              </div>
            )}
            <button onClick={() => setSelectedDeck(null)} className="text-sm text-brand-600 dark:text-brand-400 hover:underline mb-4">← Back to decks</button>
            {cards.length === 0 ? <p className="text-gray-500 dark:text-gray-400 text-center py-12">No cards yet. Add one or use AI Generate!</p>
            : <div className="space-y-3">{cards.map((c) => (<div key={c.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4"><div className="grid grid-cols-2 gap-4"><div><p className="text-xs text-gray-400 mb-1">Front</p><p className="text-sm dark:text-white">{c.front}</p></div><div><p className="text-xs text-gray-400 mb-1">Back</p><p className="text-sm text-gray-600 dark:text-gray-300">{c.back}</p></div></div></div>))}</div>}
          </div>
        ) : (
          <div>
            {showNew && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4">
                <input autoFocus type="text" value={newDeckName} onChange={(e) => setNewDeckName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && createDeck()} placeholder="Deck name (e.g. Biology 101)" className="w-full text-lg outline-none mb-3 dark:text-white dark:bg-transparent" />
                <div className="flex justify-end gap-2"><button onClick={() => setShowNew(false)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button><button onClick={createDeck} className="px-4 py-1.5 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">Create</button></div>
              </div>
            )}
            {decks.length === 0 ? <div className="flex flex-col items-center justify-center h-64"><Brain className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" /><h3 className="font-medium dark:text-white">No decks yet</h3></div>
            : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{decks.map((d) => (<button key={d.id} onClick={() => loadCards(d.id)} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 text-left hover:shadow-md hover:border-brand-200 dark:hover:border-brand-600 transition-all group"><div className="flex items-center justify-between mb-2"><h3 className="font-semibold dark:text-white">{d.name}</h3><ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500" /></div><p className="text-xs text-gray-400">{d.card_count || 0} cards</p></button>))}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
