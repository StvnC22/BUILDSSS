-- ============================================================
-- MANTA CUIDA IA - ESQUEMA COMPLETO DE SUPABASE
-- ADVERTENCIA: este script elimina las tablas financieras antiguas.
-- Ejecutar en Supabase Dashboard > SQL Editor sobre el proyecto de desarrollo.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_role() CASCADE;

DROP TABLE IF EXISTS public.case_reviews CASCADE;
DROP TABLE IF EXISTS public.consent_logs CASCADE;
DROP TABLE IF EXISTS public.case_followups CASCADE;
DROP TABLE IF EXISTS public.case_actions CASCADE;
DROP TABLE IF EXISTS public.health_question_config CASCADE;
DROP TABLE IF EXISTS public.approved_health_content CASCADE;
DROP TABLE IF EXISTS public.health_services CASCADE;
DROP TABLE IF EXISTS public.health_cases CASCADE;
DROP TABLE IF EXISTS public.mensajes CASCADE;
DROP TABLE IF EXISTS public.conversaciones CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Tablas heredadas del agente financiero
DROP TABLE IF EXISTS public.acciones_comerciales CASCADE;
DROP TABLE IF EXISTS public.evaluaciones_quiz CASCADE;
DROP TABLE IF EXISTS public.leads_crm CASCADE;
DROP TABLE IF EXISTS public.fa_followups CASCADE;
DROP TABLE IF EXISTS public.fa_messages CASCADE;
DROP TABLE IF EXISTS public.fa_sessions CASCADE;
DROP TABLE IF EXISTS public.fa_education_content CASCADE;
DROP TABLE IF EXISTS public.fa_question_config CASCADE;

DROP TYPE IF EXISTS public.accion_estado CASCADE;
DROP TYPE IF EXISTS public.lead_tipo CASCADE;
DROP TYPE IF EXISTS public.mensaje_rol CASCADE;
DROP TYPE IF EXISTS public.chat_tipo CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.health_priority CASCADE;
DROP TYPE IF EXISTS public.health_case_status CASCADE;
DROP TYPE IF EXISTS public.case_action_status CASCADE;

CREATE TYPE public.user_role AS ENUM ('ciudadano', 'operador', 'admin');
CREATE TYPE public.chat_tipo AS ENUM ('orientacion', 'servicios', 'prevencion', 'tramite');
CREATE TYPE public.mensaje_rol AS ENUM ('usuario', 'asistente');
CREATE TYPE public.health_priority AS ENUM ('EMERGENCY', 'PRIORITY', 'ROUTINE', 'PREVENTIVE');
CREATE TYPE public.health_case_status AS ENUM ('NEW', 'ORIENTED', 'REFERRED', 'PENDING_REVIEW', 'FOLLOW_UP', 'RESOLVED', 'CLOSED');
CREATE TYPE public.case_action_status AS ENUM ('pending', 'approved', 'edited', 'rejected', 'completed');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'ciudadano',
  phone TEXT,
  city TEXT DEFAULT 'Manta',
  sector TEXT DEFAULT '',
  preferred_contact TEXT DEFAULT 'correo',
  accessibility_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL DEFAULT 'Nueva orientación',
  tipo public.chat_tipo NOT NULL DEFAULT 'orientacion',
  estado TEXT NOT NULL DEFAULT 'activa',
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
  rol public.mensaje_rol NOT NULL,
  contenido TEXT NOT NULL CHECK (char_length(contenido) <= 12000),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.health_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  conversation_id UUID UNIQUE REFERENCES public.conversaciones(id) ON DELETE SET NULL,
  reported_age INTEGER CHECK (reported_age IS NULL OR reported_age BETWEEN 0 AND 125),
  location TEXT NOT NULL DEFAULT 'Manta',
  sector TEXT NOT NULL DEFAULT '',
  reason TEXT NOT NULL DEFAULT '',
  reported_symptoms JSONB NOT NULL DEFAULT '[]'::jsonb,
  symptom_duration TEXT NOT NULL DEFAULT '',
  relevant_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  accessibility_needs JSONB NOT NULL DEFAULT '[]'::jsonb,
  access_barriers JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority_level public.health_priority NOT NULL DEFAULT 'PREVENTIVE',
  priority_score INTEGER NOT NULL DEFAULT 0 CHECK (priority_score BETWEEN 0 AND 100),
  warning_signs JSONB NOT NULL DEFAULT '[]'::jsonb,
  requested_service TEXT NOT NULL DEFAULT '',
  recommended_service_type TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  status public.health_case_status NOT NULL DEFAULT 'NEW',
  requires_human_review BOOLEAN NOT NULL DEFAULT FALSE,
  consent BOOLEAN NOT NULL DEFAULT FALSE,
  next_follow_up_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.health_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_type TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT 'Manta',
  sector TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL DEFAULT '',
  emergency_available BOOLEAN NOT NULL DEFAULT FALSE,
  specialties JSONB NOT NULL DEFAULT '[]'::jsonb,
  accessibility_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  requirements JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_name TEXT NOT NULL,
  source_reference TEXT,
  verified_at DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.approved_health_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_organization TEXT NOT NULL,
  source_document TEXT NOT NULL,
  source_reference TEXT,
  version TEXT NOT NULL DEFAULT '1.0',
  approval_status TEXT NOT NULL DEFAULT 'draft' CHECK (approval_status IN ('draft', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  verified_at DATE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.case_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.health_cases(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status public.case_action_status NOT NULL DEFAULT 'pending',
  operator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.case_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.health_cases(id) ON DELETE CASCADE,
  follow_up_type TEXT NOT NULL,
  case_summary TEXT NOT NULL DEFAULT '',
  access_barriers JSONB NOT NULL DEFAULT '[]'::jsonb,
  case_status TEXT NOT NULL DEFAULT 'NEW',
  suggested_action TEXT NOT NULL DEFAULT 'human_review',
  action_details TEXT NOT NULL DEFAULT '',
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'edited', 'rejected', 'completed')),
  final_action TEXT,
  requires_review BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.case_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.health_cases(id) ON DELETE CASCADE,
  proposed_action TEXT,
  final_action TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  review_notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE public.consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.health_cases(id) ON DELETE SET NULL,
  consent_type TEXT NOT NULL,
  presented_text TEXT NOT NULL,
  accepted BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.health_question_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  field_name TEXT NOT NULL,
  question_text TEXT NOT NULL,
  answer_options JSONB NOT NULL DEFAULT '[]'::jsonb,
  rationale TEXT NOT NULL DEFAULT '',
  intent TEXT NOT NULL DEFAULT 'ANY',
  priority_level TEXT NOT NULL DEFAULT 'ANY',
  sort_order INTEGER NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['profiles','conversaciones','health_cases','health_services','approved_health_content','case_actions','case_followups','health_question_config']
  LOOP
    EXECUTE format('CREATE TRIGGER %I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at()', table_name, table_name);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE selected_role public.user_role := 'ciudadano';
BEGIN
  IF NEW.raw_user_meta_data->>'role' IN ('ciudadano', 'operador', 'admin') THEN
    selected_role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  END IF;
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.email,''), selected_role)
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Recupera perfiles de usuarios que ya existían antes de ejecutar este script.
INSERT INTO public.profiles (id, full_name, email, role)
SELECT id, COALESCE(raw_user_meta_data->>'full_name',''), COALESCE(email,''),
  CASE WHEN raw_user_meta_data->>'role' IN ('operador','admin') THEN (raw_user_meta_data->>'role')::public.user_role ELSE 'ciudadano'::public.user_role END
FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approved_health_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_question_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (id = auth.uid() OR public.get_my_role() IN ('operador','admin'));
CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY profiles_update_self ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY profiles_admin ON public.profiles FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY conversations_select ON public.conversaciones FOR SELECT USING (user_id = auth.uid() OR public.get_my_role() IN ('operador','admin'));
CREATE POLICY conversations_insert ON public.conversaciones FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY conversations_update ON public.conversaciones FOR UPDATE USING (user_id = auth.uid() OR public.get_my_role() = 'admin');
CREATE POLICY conversations_delete ON public.conversaciones FOR DELETE USING (user_id = auth.uid() OR public.get_my_role() = 'admin');

CREATE POLICY messages_select ON public.mensajes FOR SELECT USING (EXISTS (SELECT 1 FROM public.conversaciones c WHERE c.id = mensajes.conversacion_id AND (c.user_id = auth.uid() OR public.get_my_role() IN ('operador','admin'))));
CREATE POLICY messages_insert ON public.mensajes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.conversaciones c WHERE c.id = mensajes.conversacion_id AND c.user_id = auth.uid()));

CREATE POLICY cases_select ON public.health_cases FOR SELECT USING (user_id = auth.uid() OR public.get_my_role() IN ('operador','admin'));
CREATE POLICY cases_insert ON public.health_cases FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY cases_update ON public.health_cases FOR UPDATE USING (user_id = auth.uid() OR public.get_my_role() IN ('operador','admin'));

CREATE POLICY services_public_read ON public.health_services FOR SELECT USING (active = TRUE);
CREATE POLICY services_admin_manage ON public.health_services FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY content_public_read ON public.approved_health_content FOR SELECT USING (active = TRUE AND approval_status = 'approved');
CREATE POLICY content_admin_manage ON public.approved_health_content FOR ALL USING (public.get_my_role() = 'admin');
CREATE POLICY questions_public_read ON public.health_question_config FOR SELECT USING (active = TRUE);
CREATE POLICY questions_admin_manage ON public.health_question_config FOR ALL USING (public.get_my_role() = 'admin');

CREATE POLICY actions_select ON public.case_actions FOR SELECT USING (public.get_my_role() IN ('operador','admin') OR EXISTS (SELECT 1 FROM public.health_cases c WHERE c.id = case_actions.case_id AND c.user_id = auth.uid()));
CREATE POLICY actions_manage ON public.case_actions FOR ALL USING (public.get_my_role() IN ('operador','admin'));
CREATE POLICY followups_select ON public.case_followups FOR SELECT USING (public.get_my_role() IN ('operador','admin') OR EXISTS (SELECT 1 FROM public.health_cases c WHERE c.id = case_followups.case_id AND c.user_id = auth.uid()));
CREATE POLICY followups_manage ON public.case_followups FOR ALL USING (public.get_my_role() IN ('operador','admin'));
CREATE POLICY reviews_manage ON public.case_reviews FOR ALL USING (public.get_my_role() IN ('operador','admin'));
CREATE POLICY consents_self ON public.consent_logs FOR ALL USING (user_id = auth.uid() OR public.get_my_role() IN ('operador','admin')) WITH CHECK (user_id = auth.uid() OR public.get_my_role() IN ('operador','admin'));

CREATE INDEX idx_conversations_user ON public.conversaciones(user_id, updated_at DESC);
CREATE INDEX idx_messages_conversation ON public.mensajes(conversacion_id, created_at);
CREATE INDEX idx_cases_user ON public.health_cases(user_id, updated_at DESC);
CREATE INDEX idx_cases_priority ON public.health_cases(priority_level, status, updated_at DESC);
CREATE INDEX idx_services_search ON public.health_services(city, sector, active);
CREATE INDEX idx_content_topic ON public.approved_health_content(topic, approval_status, active);
CREATE INDEX idx_followups_pending ON public.case_followups(status, scheduled_at);

-- n8n debe conectarse a PostgreSQL con una credencial de servidor segura.
-- No expongas la contraseña de la base de datos en el frontend.
