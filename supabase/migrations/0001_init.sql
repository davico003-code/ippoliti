-- ============================================================================
-- 0001_init.sql · Schema inicial multi-tenant
--
-- Tablas: organizations, agents, invitations, properties,
--         property_photos, property_videos, property_changes
-- Triggers: search_vector (properties), log_property_change (audit)
-- Seed: organización 'si' (SI INMOBILIARIA)
--
-- Pendiente (esperando blueprint sección 3.5): RLS helpers
-- (current_organization_id, is_owner_or_admin) y policies por tabla.
-- Marcado al final con TODO.
-- ============================================================================

-- ───────────────────────── 0. Extensions ───────────────────────────────────

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";
create extension if not exists "vector";


-- ───────────────────────── 1. organizations ────────────────────────────────

create table organizations (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  display_name text,
  logo_url text,
  primary_color text default '#1A5C38',
  timezone text default 'America/Argentina/Buenos_Aires',
  locale text default 'es-AR',
  business_hours jsonb default '{"mon":[9,19],"tue":[9,19],"wed":[9,19],"thu":[9,19],"fri":[9,19],"sat":[9,13]}'::jsonb,

  manychat_api_key_encrypted text,
  meta_pixel_id text,
  meta_catalog_id text,
  meta_access_token_encrypted text,
  mercadolibre_user_id text,
  mercadolibre_tokens_encrypted text,

  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);


-- ───────────────────────── 2. agents ───────────────────────────────────────

create table agents (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references organizations(id),
  full_name text not null,
  email text not null,
  phone text,
  whatsapp_number text,
  avatar_url text,
  role text not null default 'agent', -- 'owner' | 'admin' | 'agent'
  office text, -- 'Roldán Histórica' | 'Roldán Ventas' | 'Funes'
  bio text,
  writing_style jsonb default '{}'::jsonb,
  notify_new_lead boolean default true,
  notify_hot_temperature boolean default true,
  active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  -- Mismo email puede coexistir en distintas orgs (multi-tenant).
  -- Único por (org, email).
  unique (organization_id, email)
);

create index idx_agents_org on agents(organization_id);
create index idx_agents_email on agents(email);


-- ───────────────────────── 3. invitations ──────────────────────────────────

create table invitations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  invited_by uuid references agents(id),
  email text not null,
  full_name text,
  role text not null default 'agent',
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  accepted_at timestamptz,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);


-- ───────────────────────── 4. properties ───────────────────────────────────

create table properties (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),

  reference_code text unique,
  public_slug text unique,
  status text not null default 'draft',
  -- 'draft' | 'review' | 'published' | 'reserved' | 'sold' | 'rented' | 'archived'

  operation_type text not null, -- 'sale' | 'rent' | 'temporary_rent'
  property_type text not null,  -- 'house' | 'apartment' | 'lot' | 'commercial' | 'country_house' | 'office' | 'warehouse'

  price numeric,
  price_currency text default 'USD',
  expenses numeric,
  expenses_currency text default 'ARS',
  price_negotiable boolean default false,

  title text not null,
  description text,
  description_seo text,
  tagline text,

  country text default 'Argentina',
  province text default 'Santa Fe',
  city text,
  neighborhood text,
  address_street text,
  address_number text,
  address_hidden boolean default true,
  latitude numeric,
  longitude numeric,
  location_notes text,

  total_surface numeric,
  covered_surface numeric,
  semi_covered_surface numeric,
  land_surface numeric,

  rooms int,
  bedrooms int,
  bathrooms int,
  toilets int,
  garages int,
  floors int,
  floor_number int,
  age_years int,

  features text[] default '{}',

  listing_agent_id uuid references agents(id),
  captured_by_agent_id uuid references agents(id),
  captured_at timestamptz,
  exclusivity boolean default false,
  exclusivity_until date,

  owner_name text,
  owner_phone text,
  owner_email text,
  owner_notes text,
  commission_percent numeric,

  first_published_at timestamptz,
  last_republished_at timestamptz,

  views_count int default 0,
  inquiries_count int default 0,

  ai_extracted_data jsonb,
  raw_notes text,

  tokko_id text,
  migrated_from text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  search_vector tsvector
);

create index idx_properties_org_status on properties(organization_id, status);
create index idx_properties_agent on properties(listing_agent_id);
create index idx_properties_location on properties(organization_id, city, neighborhood);
create index idx_properties_search on properties using gin(search_vector);


-- ─── trigger: search_vector (properties) ───
create or replace function update_property_search_vector()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('spanish', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(new.neighborhood, '') || ' ' || coalesce(new.city, '')), 'B') ||
    setweight(to_tsvector('spanish', coalesce(new.description, '')), 'C') ||
    setweight(to_tsvector('spanish', coalesce(array_to_string(new.features, ' '), '')), 'D');
  return new;
end;
$$ language plpgsql;

create trigger trg_property_search_vector
before insert or update on properties
for each row execute function update_property_search_vector();


-- ───────────────────────── 5. property_photos ──────────────────────────────

create table property_photos (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  property_id uuid not null references properties(id) on delete cascade,
  storage_path text not null,
  public_url text not null,
  thumbnail_url text,
  position int not null default 0,
  is_cover boolean default false,
  ai_room_type text,
  ai_quality_score int,
  ai_caption text,
  width int,
  height int,
  file_size_bytes int,
  created_at timestamptz default now()
);

create index idx_photos_property on property_photos(property_id, position);


-- ───────────────────────── 6. property_videos ──────────────────────────────

create table property_videos (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  property_id uuid not null references properties(id) on delete cascade,
  url text not null,
  provider text,
  thumbnail_url text,
  position int default 0,
  created_at timestamptz default now()
);


-- ───────────────────────── 7. property_changes (audit log) ─────────────────

create table property_changes (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  property_id uuid not null references properties(id) on delete cascade,
  agent_id uuid references agents(id),
  change_type text,
  field_name text,
  old_value text,
  new_value text,
  created_at timestamptz default now()
);

create index idx_property_changes_property on property_changes(property_id, created_at desc);


-- ─── trigger: log_property_change (audit + updated_at) ───
create or replace function log_property_change()
returns trigger as $$
begin
  if (new.status is distinct from old.status) then
    insert into property_changes (organization_id, property_id, agent_id, change_type, field_name, old_value, new_value)
    values (new.organization_id, new.id, auth.uid(), 'status_changed', 'status', old.status, new.status);
  end if;
  if (new.price is distinct from old.price) then
    insert into property_changes (organization_id, property_id, agent_id, change_type, field_name, old_value, new_value)
    values (new.organization_id, new.id, auth.uid(), 'price_changed', 'price', old.price::text, new.price::text);
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_log_property
before update on properties
for each row execute function log_property_change();


-- ───────────────────────── 8. Seed ─────────────────────────────────────────

insert into organizations (slug, name, display_name)
values ('si', 'SI INMOBILIARIA', 'SI INMOBILIARIA');


-- ============================================================
-- SECCIÓN 3.5 — RLS + Helpers + Policies
-- ============================================================

-- Helpers
create or replace function current_organization_id()
returns uuid as $$
  select organization_id from agents where id = auth.uid()
$$ language sql stable;

create or replace function is_owner_or_admin()
returns boolean as $$
  select role in ('owner', 'admin') from agents where id = auth.uid()
$$ language sql stable;

-- Enable RLS en todas las tablas existentes
alter table organizations enable row level security;
alter table agents enable row level security;
alter table invitations enable row level security;
alter table properties enable row level security;
alter table property_photos enable row level security;
alter table property_videos enable row level security;
alter table property_changes enable row level security;

-- ORGANIZATIONS: cada user solo ve la suya
create policy org_select on organizations for select
  using (id = current_organization_id());

-- ORGANIZATIONS: owner puede editar su org
create policy org_update on organizations for update
  using (id = current_organization_id() and is_owner_or_admin());

-- AGENTS: todos ven a todos los de su org. Solo admin/owner editan.
create policy agents_select on agents for select
  using (organization_id = current_organization_id());

create policy agents_update on agents for update
  using (organization_id = current_organization_id() and is_owner_or_admin());

create policy agents_insert on agents for insert
  with check (organization_id = current_organization_id() and is_owner_or_admin());

-- AGENTS: solo owner/admin pueden eliminar agentes
create policy agents_delete on agents for delete
  using (organization_id = current_organization_id() and is_owner_or_admin());

-- INVITATIONS: solo admin/owner las ven y crean
create policy invitations_all on invitations for all
  using (organization_id = current_organization_id() and is_owner_or_admin());

-- PROPERTIES: todos ven, solo listing_agent o admin editan
create policy prop_select on properties for select
  using (organization_id = current_organization_id());

create policy prop_insert on properties for insert
  with check (organization_id = current_organization_id());

create policy prop_update on properties for update
  using (
    organization_id = current_organization_id()
    and (is_owner_or_admin() or listing_agent_id = auth.uid())
  );

create policy prop_delete on properties for delete
  using (organization_id = current_organization_id() and is_owner_or_admin());

-- PROPERTY_PHOTOS / VIDEOS / CHANGES: heredan scope de properties
create policy photos_all on property_photos for all
  using (organization_id = current_organization_id());

create policy videos_all on property_videos for all
  using (organization_id = current_organization_id());

create policy changes_all on property_changes for all
  using (organization_id = current_organization_id());
