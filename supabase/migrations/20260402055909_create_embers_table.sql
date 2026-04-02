CREATE TABLE public.embers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 100),
    description TEXT CHECK (char_length(description) <= 500),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.embers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own embers" ON public.embers
    FOR ALL USING (auth.uid() = user_id);

CREATE INDEX idx_embers_user_id ON public.embers(user_id);
