-- ==========================================
-- CREATE VISITOR ANALYTICS SCHEMA FOR GHL
-- ==========================================

-- 1. Create analytics table to record page views
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anonymous public inserts (page view hits)
CREATE POLICY "Allow public page view inserts" ON public.analytics
  FOR INSERT TO public WITH CHECK (true);

-- 4. Policy: Allow authenticated admin users to read the logs/counts
CREATE POLICY "Allow admin selects for analytics" ON public.analytics
  FOR SELECT TO authenticated USING (true);
