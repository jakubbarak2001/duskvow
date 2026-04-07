-- =============================================================
-- Atomic streak update RPC
-- Replaces the Python read-modify-write in update_streak():
-- reads last_activity_date + current_streak, computes new value,
-- and writes back — all in one transaction.
-- =============================================================

CREATE OR REPLACE FUNCTION update_streak_atomic(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_last_date    DATE;
  v_current      INT;
  v_longest      INT;
  v_new_streak   INT;
  v_today        DATE := CURRENT_DATE;
BEGIN
  SELECT last_activity_date, current_streak, longest_streak
    INTO v_last_date, v_current, v_longest
    FROM public.profiles
   WHERE id = p_user_id;

  -- Profile doesn't exist yet — nothing to update
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Already recorded today — nothing to do
  IF v_last_date = v_today THEN
    RETURN;
  END IF;

  -- Compute new streak
  IF v_last_date IS NULL THEN
    v_new_streak := 1;
  ELSIF v_last_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_current + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  UPDATE public.profiles
     SET current_streak     = v_new_streak,
         longest_streak     = GREATEST(v_longest, v_new_streak),
         last_activity_date = v_today,
         updated_at         = NOW()
   WHERE id = p_user_id;
END;
$$;
