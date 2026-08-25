create extension if not exists "uuid-ossp";

create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  university text,
  major text,
  year_of_study int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table notes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null default 'Untitled',
  content text default '',
  folder_id uuid,
  is_pinned boolean default false,
  is_favorite boolean default false,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table folders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  parent_id uuid references folders(id) on delete cascade,
  color text default '#4c6ef5',
  created_at timestamptz default now()
);

create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  due_date timestamptz,
  subject text default '',
  recurring text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table schedule (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  instructor text default '',
  location text default '',
  day_of_week int check (day_of_week between 0 and 6) not null,
  start_time time not null,
  end_time time not null,
  color text default '#4c6ef5',
  created_at timestamptz default now()
);

create table flashcard_decks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  description text default '',
  card_count int default 0,
  created_at timestamptz default now()
);

create table flashcards (
  id uuid default uuid_generate_v4() primary key,
  deck_id uuid references flashcard_decks(id) on delete cascade not null,
  front text not null,
  back text not null,
  difficulty int default 0 check (difficulty between 0 and 5),
  next_review timestamptz default now(),
  review_count int default 0,
  created_at timestamptz default now()
);

create table grades (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  subject text not null,
  score float not null,
  max_score float not null default 100,
  weight float not null default 1,
  date date not null default current_date,
  semester text default '',
  created_at timestamptz default now()
);

create table study_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  subject text,
  duration_minutes int not null,
  type text check (type in ('pomodoro', 'free', 'review')) default 'pomodoro',
  notes text default '',
  started_at timestamptz default now(),
  ended_at timestamptz
);

create table resources (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  note_id uuid references notes(id) on delete cascade,
  name text not null,
  url text not null,
  type text default 'file',
  size int default 0,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table notes enable row level security;
alter table folders enable row level security;
alter table tasks enable row level security;
alter table schedule enable row level security;
alter table flashcard_decks enable row level security;
alter table flashcards enable row level security;
alter table grades enable row level security;
alter table study_sessions enable row level security;
alter table resources enable row level security;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "Users can view own notes" on notes for select using (auth.uid() = user_id);
create policy "Users can create notes" on notes for insert with check (auth.uid() = user_id);
create policy "Users can update own notes" on notes for update using (auth.uid() = user_id);
create policy "Users can delete own notes" on notes for delete using (auth.uid() = user_id);

create policy "Users can view own folders" on folders for select using (auth.uid() = user_id);
create policy "Users can create folders" on folders for insert with check (auth.uid() = user_id);
create policy "Users can update own folders" on folders for update using (auth.uid() = user_id);
create policy "Users can delete own folders" on folders for delete using (auth.uid() = user_id);

create policy "Users can view own tasks" on tasks for select using (auth.uid() = user_id);
create policy "Users can create tasks" on tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on tasks for delete using (auth.uid() = user_id);

create policy "Users can view own schedule" on schedule for select using (auth.uid() = user_id);
create policy "Users can create schedule" on schedule for insert with check (auth.uid() = user_id);
create policy "Users can update own schedule" on schedule for update using (auth.uid() = user_id);
create policy "Users can delete own schedule" on schedule for delete using (auth.uid() = user_id);

create policy "Users can view own decks" on flashcard_decks for select using (auth.uid() = user_id);
create policy "Users can create decks" on flashcard_decks for insert with check (auth.uid() = user_id);
create policy "Users can update own decks" on flashcard_decks for update using (auth.uid() = user_id);
create policy "Users can delete own decks" on flashcard_decks for delete using (auth.uid() = user_id);

create policy "Users can view own cards" on flashcards for select using (
  exists (select 1 from flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid())
);
create policy "Users can create cards" on flashcards for insert with check (
  exists (select 1 from flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid())
);
create policy "Users can update own cards" on flashcards for update using (
  exists (select 1 from flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid())
);
create policy "Users can delete own cards" on flashcards for delete using (
  exists (select 1 from flashcard_decks where flashcard_decks.id = flashcards.deck_id and flashcard_decks.user_id = auth.uid())
);

create policy "Users can view own grades" on grades for select using (auth.uid() = user_id);
create policy "Users can create grades" on grades for insert with check (auth.uid() = user_id);
create policy "Users can update own grades" on grades for update using (auth.uid() = user_id);
create policy "Users can delete own grades" on grades for delete using (auth.uid() = user_id);

create policy "Users can view own sessions" on study_sessions for select using (auth.uid() = user_id);
create policy "Users can create sessions" on study_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions" on study_sessions for update using (auth.uid() = user_id);

create policy "Users can view own resources" on resources for select using (auth.uid() = user_id);
create policy "Users can create resources" on resources for insert with check (auth.uid() = user_id);
create policy "Users can delete own resources" on resources for delete using (auth.uid() = user_id);

create index idx_notes_user_id on notes(user_id);
create index idx_notes_updated_at on notes(updated_at desc);
create index idx_tasks_user_id on tasks(user_id);
create index idx_tasks_completed on tasks(completed);
create index idx_tasks_due_date on tasks(due_date);
create index idx_schedule_user_id on schedule(user_id);
create index idx_grades_user_id on grades(user_id);
create index idx_flashcards_deck_id on flashcards(deck_id);
create index idx_flashcards_next_review on flashcards(next_review);
create index idx_study_sessions_user_id on study_sessions(user_id);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at_column();
create trigger update_notes_updated_at before update on notes for each row execute function update_updated_at_column();
create trigger update_tasks_updated_at before update on tasks for each row execute function update_updated_at_column();

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
