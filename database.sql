-- The Vine - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  display_name text,
  avatar_url text,
  bio text,
  role text default 'member' check (role in ('pastor', 'elder', 'deacon', 'leader', 'member')),
  location text,
  website text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- POSTS TABLE
-- ============================================
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  image_url text,
  post_type text default 'post' check (post_type in ('post', 'testimony', 'announcement', 'event')),
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policies
create policy "Posts are viewable by everyone"
  on public.posts for select
  using (true);

create policy "Users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = author_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

-- ============================================
-- REACTIONS TABLE
-- ============================================
create table public.reactions (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reaction_type text not null check (reaction_type in ('amen', 'love', 'praise', 'pray')),
  created_at timestamptz default now(),
  unique(post_id, user_id, reaction_type)
);

-- Enable RLS
alter table public.reactions enable row level security;

-- Policies
create policy "Reactions are viewable by everyone"
  on public.reactions for select
  using (true);

create policy "Users can add reactions"
  on public.reactions for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own reactions"
  on public.reactions for delete
  using (auth.uid() = user_id);

-- ============================================
-- COMMENTS TABLE
-- ============================================
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  author_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.comments enable row level security;

-- Policies
create policy "Comments are viewable by everyone"
  on public.comments for select
  using (true);

create policy "Users can create comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = author_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

-- ============================================
-- FOLLOWS TABLE
-- ============================================
create table public.follows (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(follower_id, following_id)
);

-- Enable RLS
alter table public.follows enable row level security;

-- Policies
create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

create policy "Users can follow others"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.follows for delete
  using (auth.uid() = follower_id);

-- ============================================
-- PRAYER REQUESTS TABLE
-- ============================================
create table public.prayer_requests (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  is_anonymous boolean default false,
  is_answered boolean default false,
  prayer_count int default 0,
  visibility text default 'public' check (visibility in ('public', 'private', 'leadership')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.prayer_requests enable row level security;

-- Policies
create policy "Public prayers are viewable by everyone"
  on public.prayer_requests for select
  using (visibility = 'public' or auth.uid() = author_id);

create policy "Users can create prayer requests"
  on public.prayer_requests for insert
  with check (auth.uid() = author_id);

create policy "Users can update own prayer requests"
  on public.prayer_requests for update
  using (auth.uid() = author_id);

create policy "Users can delete own prayer requests"
  on public.prayer_requests for delete
  using (auth.uid() = author_id);

-- ============================================
-- PRAYER SUPPORT TABLE (who prayed for what)
-- ============================================
create table public.prayer_support (
  id uuid default uuid_generate_v4() primary key,
  prayer_id uuid references public.prayer_requests(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(prayer_id, user_id)
);

-- Enable RLS
alter table public.prayer_support enable row level security;

-- Policies
create policy "Prayer support is viewable by everyone"
  on public.prayer_support for select
  using (true);

create policy "Users can add prayer support"
  on public.prayer_support for insert
  with check (auth.uid() = user_id);

create policy "Users can remove prayer support"
  on public.prayer_support for delete
  using (auth.uid() = user_id);

-- ============================================
-- EVENTS TABLE
-- ============================================
create table public.events (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  location text,
  start_time timestamptz not null,
  end_time timestamptz,
  image_url text,
  is_recurring boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.events enable row level security;

-- Policies
create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

create policy "Leaders can create events"
  on public.events for insert
  with check (auth.uid() = created_by);

create policy "Creators can update events"
  on public.events for update
  using (auth.uid() = created_by);

create policy "Creators can delete events"
  on public.events for delete
  using (auth.uid() = created_by);

-- ============================================
-- MESSAGES TABLE (Direct Messages)
-- ============================================
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  receiver_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.messages enable row level security;

-- Policies
create policy "Users can view their messages"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "Receivers can update read status"
  on public.messages for update
  using (auth.uid() = receiver_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('follow', 'reaction', 'comment', 'prayer', 'mention', 'message')),
  content text not null,
  reference_id uuid,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Create profile on signup
-- ============================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Trigger to create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- INDEXES for performance
-- ============================================
create index posts_author_id_idx on public.posts(author_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index reactions_post_id_idx on public.reactions(post_id);
create index comments_post_id_idx on public.comments(post_id);
create index follows_follower_idx on public.follows(follower_id);
create index follows_following_idx on public.follows(following_id);
create index prayer_requests_author_idx on public.prayer_requests(author_id);
create index notifications_user_idx on public.notifications(user_id);
