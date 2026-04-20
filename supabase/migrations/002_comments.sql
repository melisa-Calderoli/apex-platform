-- Action comments - ejecutar en Supabase SQL Editor

create table if not exists action_comments (
  id uuid primary key default gen_random_uuid(),
  action_id uuid references actions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  author_name text,
  author_role text,
  content text not null,
  created_at timestamptz default now()
);

alter table action_comments enable row level security;

-- Comments: visible si se ve la accion
create policy "comments_select" on action_comments for select using (
  exists (
    select 1 from actions a
    where a.id = action_id and (is_admin() or a.company_id = user_company_id())
  )
);

-- Admin y dueño de empresa pueden agregar comentarios
create policy "comments_insert" on action_comments for insert with check (
  user_id = auth.uid() and
  exists (
    select 1 from actions a
    where a.id = action_id and (is_admin() or a.company_id = user_company_id())
  )
);

-- Solo el autor puede borrar su comentario
create policy "comments_delete" on action_comments for delete using (user_id = auth.uid() or is_admin());
