-- ============================================================
-- Migration 0002: Leads, Interactions, Conversations, Scoring
-- ============================================================

-- ========== LEADS ==========
create table leads (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  assigned_agent_id uuid references agents(id),

  full_name text,
  phone text,
  email text,
  whatsapp_id text,
  instagram_handle text,

  tokko_contact_id text unique,

  source text,
  source_detail text,
  intent text,
  budget_min numeric,
  budget_max numeric,
  budget_currency text default 'USD',
  preferred_zones text[],
  property_types text[],
  rooms_min int,
  notes text,

  -- Atribución Meta/ML (el game changer para lookalikes)
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  meta_campaign_id text,
  meta_adset_id text,
  meta_ad_id text,
  fbclid text,
  mercadolibre_item_id text,

  current_temperature int default 0,
  temperature_label text default 'cold',
  last_scored_at timestamptz,

  first_contact_at timestamptz default now(),
  last_contact_at timestamptz,
  lifecycle_stage text default 'new',
  closed_at timestamptz,
  closed_property_id uuid references properties(id),
  closed_value numeric,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_leads_org_agent on leads(organization_id, assigned_agent_id);
create index idx_leads_temperature on leads(organization_id, current_temperature desc);
create index idx_leads_phone on leads(phone);
create index idx_leads_meta_campaign on leads(meta_campaign_id);
create index idx_leads_lifecycle on leads(organization_id, lifecycle_stage);

-- ========== INTERACTIONS ==========
create table interactions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  lead_id uuid not null references leads(id) on delete cascade,
  agent_id uuid references agents(id),
  type text not null,
  channel text,
  property_id uuid references properties(id),
  payload jsonb,
  occurred_at timestamptz default now(),
  created_at timestamptz default now()
);

create index idx_interactions_lead on interactions(lead_id, occurred_at desc);
create index idx_interactions_org_recent on interactions(organization_id, occurred_at desc);
create index idx_interactions_type on interactions(organization_id, type, occurred_at desc);

-- ========== CONVERSATIONS + MESSAGES ==========
create table conversations (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  lead_id uuid not null references leads(id) on delete cascade,
  channel text not null,
  external_id text,
  last_message_at timestamptz,
  unread_count int default 0,
  status text default 'open',
  snoozed_until timestamptz,
  created_at timestamptz default now(),
  unique(lead_id, channel)
);

create index idx_conversations_org_unread on conversations(organization_id, last_message_at desc) where unread_count > 0;

create table messages (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  conversation_id uuid not null references conversations(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  direction text not null,
  sender_agent_id uuid references agents(id),
  content text,
  media_url text,
  media_type text,
  external_id text,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index idx_messages_conv on messages(conversation_id, created_at desc);

-- ========== LEAD SCORING EVENTS ==========
create table lead_scoring_events (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  lead_id uuid not null references leads(id) on delete cascade,
  interaction_id uuid references interactions(id) on delete set null,
  event_type text not null,
  points_awarded int not null,
  reason text,
  created_at timestamptz default now()
);

create index idx_scoring_lead on lead_scoring_events(lead_id, created_at desc);

-- ========== NEXT ACTIONS ==========
create table next_actions (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  lead_id uuid not null references leads(id) on delete cascade,
  agent_id uuid references agents(id),
  action_type text not null,
  priority int not null,
  reasoning text not null,
  suggested_message text,
  property_id uuid references properties(id),
  best_time_window text,
  why_now text,
  status text default 'pending',
  snoozed_until timestamptz,
  executed_at timestamptz,
  executed_by_agent_id uuid references agents(id),
  generated_by_model text,
  created_at timestamptz default now(),
  expires_at timestamptz
);

create index idx_next_actions_agent_pending on next_actions(agent_id, priority desc) where status = 'pending';
create index idx_next_actions_lead on next_actions(lead_id, created_at desc);

-- ========== PUBLICATIONS (ML + Meta) ==========
create table publications (
  id uuid primary key default uuid_generate_v4(),
  organization_id uuid not null references organizations(id),
  property_id uuid not null references properties(id) on delete cascade,
  channel text not null,
  external_id text,
  external_url text,
  status text default 'pending',
  error_message text,
  published_at timestamptz,
  last_synced_at timestamptz,
  views int default 0,
  contacts int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(property_id, channel)
);

create index idx_publications_status on publications(organization_id, channel, status);

-- ========== TRIGGERS ==========

-- Touch lead al insertar interaction
create or replace function touch_lead_on_interaction()
returns trigger as $$
begin
  update leads
  set last_contact_at = new.occurred_at,
      updated_at = now()
  where id = new.lead_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_touch_lead_on_interaction
after insert on interactions
for each row execute function touch_lead_on_interaction();

-- Touch conversation al insertar message
create or replace function touch_conversation_on_message()
returns trigger as $$
begin
  update conversations
  set last_message_at = new.created_at,
      unread_count = case when new.direction = 'inbound' then unread_count + 1 else unread_count end
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_touch_conversation_on_message
after insert on messages
for each row execute function touch_conversation_on_message();

-- Scoring automático al insertar interaction
create or replace function award_scoring_points()
returns trigger as $$
declare v_points int;
begin
  v_points := case new.type
    when 'property_view' then 5
    when 'property_view_repeat' then 12
    when 'property_favorite' then 15
    when 'message_in' then 8
    when 'message_in_question' then 15
    when 'visit_scheduled' then 30
    when 'visit_attended' then 40
    when 'visit_no_show' then -20
    when 'budget_disclosed' then 20
    when 'timeline_disclosed' then 25
    when 'objection_raised' then 5
    when 'offer_made' then 50
    when 'offer_accepted' then 100
    else 0
  end;

  if v_points != 0 then
    insert into lead_scoring_events (organization_id, lead_id, interaction_id, event_type, points_awarded, reason)
    values (new.organization_id, new.lead_id, new.id, new.type, v_points, new.type || ' event');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_award_scoring
after insert on interactions
for each row execute function award_scoring_points();

-- ========== FUNCIONES DE SCORING ==========

-- Calcula temperatura de un lead con decay exponencial (half-life 10 días)
-- + penalización por silencio
create or replace function calculate_lead_temperature(p_lead_id uuid)
returns int as $$
declare
  v_raw_score numeric := 0;
  v_days_silent int;
  v_final int;
begin
  -- Suma decay-weighted. 14.43 = 10 / ln(2) para half-life de 10 días.
  select coalesce(sum(
    points_awarded * exp(-extract(epoch from (now() - created_at)) / (86400.0 * 14.43))
  ), 0)
  into v_raw_score
  from lead_scoring_events
  where lead_id = p_lead_id;

  -- Días desde última interacción
  select coalesce(extract(day from (now() - max(occurred_at))), 999)::int
  into v_days_silent
  from interactions
  where lead_id = p_lead_id;

  -- Penalización por silencio
  if v_days_silent > 30 then
    v_raw_score := least(v_raw_score, 20);
  elsif v_days_silent > 14 then
    v_raw_score := v_raw_score - 30;
  elsif v_days_silent > 7 then
    v_raw_score := v_raw_score - 15;
  elsif v_days_silent > 3 then
    v_raw_score := v_raw_score - 5;
  end if;

  v_final := greatest(0, least(100, round(v_raw_score)));
  return v_final;
end;
$$ language plpgsql;

-- Refresca temperatura de TODOS los leads de una organización
create or replace function refresh_all_temperatures(p_org_id uuid)
returns int as $$
declare v_count int;
begin
  update leads
  set
    current_temperature = calculate_lead_temperature(id),
    temperature_label = case
      when calculate_lead_temperature(id) >= 71 then 'hot'
      when calculate_lead_temperature(id) >= 31 then 'warm'
      else 'cold'
    end,
    last_scored_at = now()
  where organization_id = p_org_id;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql;

-- ========== RLS ==========

alter table leads enable row level security;
alter table interactions enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table lead_scoring_events enable row level security;
alter table next_actions enable row level security;
alter table publications enable row level security;

-- LEADS: agente ve solo los suyos + sin asignar; admin/owner ven todos
create policy leads_select on leads for select
  using (
    organization_id = current_organization_id()
    and (is_owner_or_admin() or assigned_agent_id = auth.uid() or assigned_agent_id is null)
  );

create policy leads_insert on leads for insert
  with check (organization_id = current_organization_id());

create policy leads_update on leads for update
  using (
    organization_id = current_organization_id()
    and (is_owner_or_admin() or assigned_agent_id = auth.uid())
  );

create policy leads_delete on leads for delete
  using (organization_id = current_organization_id() and is_owner_or_admin());

-- INTERACTIONS: heredan scope del lead
create policy interactions_all on interactions for all
  using (
    organization_id = current_organization_id()
    and (
      is_owner_or_admin()
      or lead_id in (select id from leads where assigned_agent_id = auth.uid() or assigned_agent_id is null)
    )
  );

-- CONVERSATIONS: idem
create policy conversations_all on conversations for all
  using (
    organization_id = current_organization_id()
    and (
      is_owner_or_admin()
      or lead_id in (select id from leads where assigned_agent_id = auth.uid() or assigned_agent_id is null)
    )
  );

-- MESSAGES: idem
create policy messages_all on messages for all
  using (
    organization_id = current_organization_id()
    and (
      is_owner_or_admin()
      or lead_id in (select id from leads where assigned_agent_id = auth.uid() or assigned_agent_id is null)
    )
  );

-- LEAD SCORING EVENTS: igual
create policy scoring_all on lead_scoring_events for all
  using (
    organization_id = current_organization_id()
    and (
      is_owner_or_admin()
      or lead_id in (select id from leads where assigned_agent_id = auth.uid() or assigned_agent_id is null)
    )
  );

-- NEXT ACTIONS: agente ve solo las suyas + sin asignar; admin/owner ven todas
create policy next_actions_all on next_actions for all
  using (
    organization_id = current_organization_id()
    and (is_owner_or_admin() or agent_id = auth.uid() or agent_id is null)
  );

-- PUBLICATIONS: solo admin/owner (son decisiones de negocio)
create policy publications_all on publications for all
  using (organization_id = current_organization_id() and is_owner_or_admin());
