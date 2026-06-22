-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  claude_api_key text,  -- encrypted, optional
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Workspaces (for team/collab)
create table workspaces (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now()
);

alter table workspaces enable row level security;

-- Workspace members with roles
create table workspace_members (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('owner', 'editor', 'viewer')) not null default 'viewer',
  invited_by uuid references profiles(id),
  joined_at timestamptz default now(),
  unique(workspace_id, user_id)
);

alter table workspace_members enable row level security;

-- RLS: members can see their own workspace memberships
create policy "Members can view workspace" on workspace_members
  for select using (user_id = auth.uid());

create policy "Owners can manage members" on workspace_members
  for all using (
    exists (
      select 1 from workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
      and wm.user_id = auth.uid()
      and wm.role = 'owner'
    )
  );

-- Workspaces RLS
create policy "Members can view workspace details" on workspaces
  for select using (
    exists (
      select 1 from workspace_members
      where workspace_id = workspaces.id and user_id = auth.uid()
    )
  );

create policy "Owners can update workspace" on workspaces
  for update using (owner_id = auth.uid());

create policy "Users can create workspaces" on workspaces
  for insert with check (owner_id = auth.uid());

-- Content briefs
create table briefs (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  created_by uuid references profiles(id) not null,
  content_type text check (content_type in ('food', 'hotel')) not null,
  subject text not null,           -- dish or hotel name
  location text not null,
  angle text,
  platforms text[] not null default '{}',
  ai_provider text check (ai_provider in ('gemini', 'claude')) not null default 'gemini',
  output jsonb,                    -- full AI-generated brief JSON
  status text check (status in ('draft', 'ready', 'published')) default 'draft',
  scheduled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table briefs enable row level security;

create policy "Workspace members can view briefs" on briefs
  for select using (
    exists (
      select 1 from workspace_members
      where workspace_id = briefs.workspace_id and user_id = auth.uid()
    )
  );

create policy "Editors and owners can manage briefs" on briefs
  for all using (
    exists (
      select 1 from workspace_members
      where workspace_id = briefs.workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'editor')
    )
  );

-- Saved hooks library
create table hooks (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  content_type text check (content_type in ('food', 'hotel')) not null,
  style text not null,
  text text not null,
  rating int check (rating between 1 and 5),
  created_at timestamptz default now()
);

alter table hooks enable row level security;

create policy "Workspace members can view hooks" on hooks
  for select using (
    exists (
      select 1 from workspace_members
      where workspace_id = hooks.workspace_id and user_id = auth.uid()
    )
  );

create policy "Editors and owners can manage hooks" on hooks
  for all using (
    exists (
      select 1 from workspace_members
      where workspace_id = hooks.workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'editor')
    )
  );

-- Performance logs
create table performance_logs (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) on delete cascade not null,
  brief_id uuid references briefs(id) on delete set null,
  platform text check (platform in ('instagram', 'tiktok', 'youtube_shorts')) not null,
  post_url text,
  posted_at timestamptz,
  views int default 0,
  likes int default 0,
  shares int default 0,
  reposts int default 0,
  comments int default 0,
  source text check (source in ('manual', 'api')) default 'manual',
  created_at timestamptz default now()
);

alter table performance_logs enable row level security;

create policy "Workspace members can view logs" on performance_logs
  for select using (
    exists (
      select 1 from workspace_members
      where workspace_id = performance_logs.workspace_id and user_id = auth.uid()
    )
  );

create policy "Editors and owners can manage logs" on performance_logs
  for all using (
    exists (
      select 1 from workspace_members
      where workspace_id = performance_logs.workspace_id
      and user_id = auth.uid()
      and role in ('owner', 'editor')
    )
  );

-- Auto-create profile on signup
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
  for each row execute procedure handle_new_user();

-- Auto-create default workspace on profile creation
create or replace function handle_new_profile()
returns trigger as $$
declare
  new_workspace_id uuid;
begin
  insert into workspaces (name, owner_id)
  values ('My Workspace', new.id)
  returning id into new_workspace_id;

  insert into workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$ language plpgsql security definer;

create trigger on_profile_created
  after insert on profiles
  for each row execute procedure handle_new_profile();
