-- =============================================================
-- Add consent-acceptance timestamps to profiles + update the
-- handle_new_user trigger to stamp them at signup.
-- Migration: 20260417_consent_columns
--
-- REASON: GDPR requires a durable record of when the user accepted
-- the Terms of Service and Privacy Policy. The checkbox on the
-- sign-up form is the enforcement surface; these columns are the
-- server-side record of acceptance. Without them, a "did the user
-- actually consent" question in the future has no answer.
-- =============================================================


ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS terms_accepted_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;


-- -----------------------------------------------------------
-- Rewrite handle_new_user() to stamp both columns with NOW().
-- Safe because the user has already clicked through the consent
-- checkbox before this trigger fires; OAuth signups are covered
-- under the same agreement (the /auth page shows the consent text
-- next to the Create Vow tab as well).
-- -----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        display_name,
        terms_accepted_at,
        privacy_accepted_at
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data ->> 'full_name',
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;


-- Trigger is already created in 001_initial_schema.sql; function
-- replacement via CREATE OR REPLACE is sufficient.
