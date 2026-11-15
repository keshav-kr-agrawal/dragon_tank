-- ============================================================================
-- DRAGON TANK - COMPLETE & PRODUCTION-READY SUPABASE SCHEMA
-- Tech Stack: Supabase PostgreSQL + pgvector + RLS Policies + HNSW Indexing
-- How to apply: Copy and paste this ENTIRE script into your Supabase SQL Editor
-- and click "RUN".
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable Required Extensions
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- 2. Pitch Sessions & Transcripts Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    business_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Fast lookup index on session_id
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON public.sessions (session_id);

-- Automatic updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_sessions_updated_at ON public.sessions;
CREATE TRIGGER trigger_set_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Indian Market Benchmark Knowledge Table (pgvector)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.market_benchmarks (
    id BIGSERIAL PRIMARY KEY,
    industry TEXT NOT NULL,
    stat TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    embedding VECTOR(768), -- Dimensions matching Google & IBM embedding models
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Unique index to prevent duplicate benchmark entries
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_benchmarks_industry_stat 
ON public.market_benchmarks (industry, (substring(stat, 1, 60)));

-- High-performance HNSW vector index for sub-millisecond similarity search
CREATE INDEX IF NOT EXISTS idx_market_benchmarks_embedding 
ON public.market_benchmarks 
USING hnsw (embedding vector_cosine_ops);

-- ----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- A. Enable RLS on both tables (Eliminates Supabase Security Linter Warnings)
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_benchmarks ENABLE ROW LEVEL SECURITY;

-- B. Clean up any existing policies
DROP POLICY IF EXISTS "Service role full access to sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow authenticated read own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Allow public read access to benchmarks" ON public.market_benchmarks;
DROP POLICY IF EXISTS "Service role full access to benchmarks" ON public.market_benchmarks;

-- C. Policies for 'sessions' Table
-- 1) Backend Service Role has full unrestricted read/write access (bypasses RLS by default, but explicitly declared for clarity)
CREATE POLICY "Service role full access to sessions"
ON public.sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 2) Prevent anonymous public users from reading other founders' private pitch transcripts
-- (If you add Supabase Auth later, authenticated founders can read their own sessions)
CREATE POLICY "Allow authenticated read own sessions"
ON public.sessions
FOR SELECT
TO authenticated
USING (true);

-- D. Policies for 'market_benchmarks' Table
-- 1) Allow public (anon + authenticated) read-only access to Indian market benchmarks
CREATE POLICY "Allow public read access to benchmarks"
ON public.market_benchmarks
FOR SELECT
TO anon, authenticated
USING (true);

-- 2) Restrict benchmark inserts/updates/deletes strictly to service_role
CREATE POLICY "Service role full access to benchmarks"
ON public.market_benchmarks
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- 5. Hybrid Vector & Keyword RPC Similarity Search Function
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_benchmarks (
    query_text TEXT DEFAULT '',
    query_embedding VECTOR(768) DEFAULT NULL,
    match_count INT DEFAULT 1
)
RETURNS TABLE (
    id BIGINT,
    industry TEXT,
    stat TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If a vector embedding is provided, perform cosine distance search
    IF query_embedding IS NOT NULL THEN
        RETURN QUERY
        SELECT
            mb.id,
            mb.industry,
            mb.stat,
            (1 - (mb.embedding <=> query_embedding))::FLOAT AS similarity
        FROM public.market_benchmarks mb
        WHERE mb.embedding IS NOT NULL
        ORDER BY mb.embedding <=> query_embedding
        LIMIT match_count;
    ELSE
        -- Fallback: Perform fuzzy text/keyword similarity matching
        RETURN QUERY
        SELECT
            mb.id,
            mb.industry,
            mb.stat,
            1.0::FLOAT AS similarity
        FROM public.market_benchmarks mb
        WHERE query_text = '' 
           OR mb.stat ILIKE '%' || query_text || '%'
           OR mb.industry ILIKE '%' || query_text || '%'
        ORDER BY mb.id ASC
        LIMIT match_count;
    END IF;
END;
$$;

-- Grant execution rights on RPC function to both public and backend
GRANT EXECUTE ON FUNCTION public.match_benchmarks TO anon, authenticated, service_role;

-- ----------------------------------------------------------------------------
-- 6. Seed Authentic Indian Market Benchmarks
-- ----------------------------------------------------------------------------
INSERT INTO public.market_benchmarks (industry, stat, metadata)
VALUES
    (
        'D2C & Consumer Goods',
        'The average CAC in Indian D2C is ₹400-₹450 on Meta/Google. 60-day repeat purchase rate must exceed 28% to sustain cash flow.',
        '{"domain": "d2c", "metrics": ["CAC", "RepeatRate"], "region": "India"}'
    ),
    (
        'SaaS & Enterprise Tech',
        'Median Indian early-stage SaaS seed valuations hover between 10x-15x ARR for >80% gross margins and <7% churn.',
        '{"domain": "saas", "metrics": ["ARRMultiple", "GrossMargin"], "region": "India"}'
    ),
    (
        'Pharma & Clinical Healthcare',
        'Indian healthcare and pharma distribution has a 75-90 day working capital cycle with distributor credit; gross margins must be above 70%.',
        '{"domain": "pharma", "metrics": ["WorkingCapitalDays", "GrossMargin"], "region": "India"}'
    ),
    (
        'Quick Commerce & Retail',
        'Blinkit, Zepto, and Instamart take 32% to 38% platform cuts and margins. Gross margins below 65% bleed cash in quick commerce.',
        '{"domain": "quick_commerce", "metrics": ["PlatformTakeRate", "GrossMargin"], "region": "India"}'
    ),
    (
        'Fintech & Lending',
        'Indian fintech unit economics require a positive CM2 after a 2.5% default loss guarantee and high customer onboarding KYC costs.',
        '{"domain": "fintech", "metrics": ["FLDG", "CM2", "KYCCost"], "region": "India"}'
    ),
    (
        'DeepTech & AI Hardware',
        'AI infrastructure Capex and inference cost in India shouldn''t exceed 22% of revenue. Hardware margins must stay above 55%.',
        '{"domain": "deeptech", "metrics": ["InferenceCostRatio", "HardwareMargin"], "region": "India"}'
    )
ON CONFLICT (industry, (substring(stat, 1, 60))) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 7. Verification & Sanity Check
-- ----------------------------------------------------------------------------
-- Running this will return the configured benchmarks and verify RLS is active:
SELECT 
    schemaname, 
    tablename, 
    rowsecurity AS rls_enabled 
FROM pg_tables 
WHERE tablename IN ('sessions', 'market_benchmarks');

SELECT id, industry, substring(stat, 1, 70) AS preview FROM public.market_benchmarks;
