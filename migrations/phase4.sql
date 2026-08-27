-- Phase 4 Migration: Recurring tasks, SM-2 flashcards, study session improvements
-- Run this in Supabase SQL Editor

-- Add SM-2 columns to flashcards
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS user_id uuid references profiles(id) on delete cascade;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS subject text default '';
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS ease_factor float default 2.5;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS interval int default 0;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS repetitions int default 0;
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS last_review timestamptz;

-- Add completed column to study_sessions
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS completed boolean default false;

-- Update study_sessions type check to include focus/break
ALTER TABLE study_sessions DROP CONSTRAINT IF EXISTS study_sessions_type_check;
ALTER TABLE study_sessions ADD CONSTRAINT study_sessions_type_check CHECK (type IN ('focus', 'break', 'pomodoro', 'free', 'review'));

-- Update flashcards RLS to support direct user_id access
DROP POLICY IF EXISTS "Users can view own cards" ON flashcards;
DROP POLICY IF EXISTS "Users can create cards" ON flashcards;
DROP POLICY IF EXISTS "Users can update own cards" ON flashcards;
DROP POLICY IF EXISTS "Users can delete own cards" ON flashcards;

CREATE POLICY "Users can view own cards" ON flashcards FOR select using (auth.uid() = user_id OR exists (select 1 from flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid()));
CREATE POLICY "Users can create cards" ON flashcards FOR insert with check (auth.uid() = user_id OR exists (select 1 from flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid()));
CREATE POLICY "Users can update own cards" ON flashcards FOR update using (auth.uid() = user_id OR exists (select 1 from flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid()));
CREATE POLICY "Users can delete own cards" ON flashcards FOR delete using (auth.uid() = user_id OR exists (select 1 from flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid()));

-- Index for SM-2 queries
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review_user ON flashcards(user_id, next_review);
