-- =============================================================
-- Update streak RPC to also compute and persist streak_multiplier.
-- Also returns the new streak for the caller to detect milestones.
-- Must drop first because return type changed from VOID to JSONB.
-- =============================================================

DO $wrapper$
BEGIN
  DROP FUNCTION IF EXISTS update_streak_atomic(UUID);

  CREATE FUNCTION update_streak_atomic(p_user_id UUID)
  RETURNS JSONB
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $fn$
  DECLARE
    v_last_date      DATE;
    v_current        INT;
    v_longest        INT;
    v_new_streak     INT;
    v_today          DATE := CURRENT_DATE;
    v_multiplier     NUMERIC(3,2);
    v_old_multiplier NUMERIC(3,2);
    v_streak_broken  BOOL := FALSE;
  BEGIN
    SELECT last_activity_date, current_streak, longest_streak, streak_multiplier
      INTO v_last_date, v_current, v_longest, v_old_multiplier
      FROM public.profiles
     WHERE id = p_user_id;

    IF NOT FOUND THEN
      RETURN jsonb_build_object(
        'new_streak', 0,
        'streak_multiplier', 1.00,
        'streak_milestone', NULL,
        'streak_broken', FALSE
      );
    END IF;

    IF v_last_date = v_today THEN
      RETURN jsonb_build_object(
        'new_streak', v_current,
        'streak_multiplier', v_old_multiplier,
        'streak_milestone', NULL,
        'streak_broken', FALSE
      );
    END IF;

    IF v_last_date IS NULL THEN
      v_new_streak := 1;
    ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
      v_new_streak := v_current + 1;
    ELSE
      v_new_streak := 1;
      v_streak_broken := v_current > 1;
    END IF;

    v_multiplier := CASE
      WHEN v_new_streak >= 30 THEN 1.20
      WHEN v_new_streak >= 14 THEN 1.15
      WHEN v_new_streak >= 7  THEN 1.10
      WHEN v_new_streak >= 3  THEN 1.05
      ELSE 1.00
    END;

    UPDATE public.profiles
       SET current_streak     = v_new_streak,
           longest_streak     = GREATEST(v_longest, v_new_streak),
           last_activity_date = v_today,
           streak_multiplier  = v_multiplier,
           updated_at         = NOW()
     WHERE id = p_user_id;

    RETURN jsonb_build_object(
      'new_streak', v_new_streak,
      'streak_multiplier', v_multiplier,
      'streak_milestone', CASE
        WHEN v_new_streak IN (3, 7, 14, 30) THEN jsonb_build_object(
          'days', v_new_streak,
          'multiplier', v_multiplier
        )
        ELSE NULL
      END,
      'streak_broken', v_streak_broken
    );
  END;
  $fn$;
END;
$wrapper$;
