-- Migration: add city and state to shops table
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)

-- 1. Add city, state, rating, and review columns (nullable / default values)
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS city         text,
  ADD COLUMN IF NOT EXISTS state        text,
  ADD COLUMN IF NOT EXISTS avg_rating   double precision DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count bigint           DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_range  integer          DEFAULT 0;

-- 2. Index columns for fast search filtering and sorting
CREATE INDEX IF NOT EXISTS idx_shops_city  ON shops (city);
CREATE INDEX IF NOT EXISTS idx_shops_state ON shops (state);
CREATE INDEX IF NOT EXISTS idx_shops_rating ON shops (avg_rating DESC);
CREATE INDEX IF NOT EXISTS idx_shops_reviews ON shops (review_count DESC);

-- 3. Add suggested_city to shop_suggestions for community-driven city tagging
ALTER TABLE shop_suggestions
  ADD COLUMN IF NOT EXISTS suggested_city  text,
  ADD COLUMN IF NOT EXISTS suggested_state text;


-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: add lat/lng for hyperlocal search
-- Run AFTER the city/state migration above.
-- Enable PostGIS extension (required for ST_MakePoint, ST_DWithin, and geography types)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Lat/lng on shops (nullable — populated as reviewers detect location)
ALTER TABLE shops
  ADD COLUMN IF NOT EXISTS lat double precision,
  ADD COLUMN IF NOT EXISTS lng double precision;

-- 2. Spatial index — GIST on a geometry point for fast ST_DWithin
CREATE INDEX IF NOT EXISTS idx_shops_geo
  ON shops USING GIST ( (ST_MakePoint(lng, lat)::geography) );

-- 3. Allow community suggestions to carry a pin
ALTER TABLE shop_suggestions
  ADD COLUMN IF NOT EXISTS suggested_lat  double precision,
  ADD COLUMN IF NOT EXISTS suggested_lng  double precision;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. RPC: search_shops_nearby
--    Returns shops within radius_km of (user_lat, user_lng),
--    with optional shop_type, min_rating, price_range filters.
--    distance_m is included so the client can show a distance badge.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_shops_nearby(
  user_lat      double precision,
  user_lng      double precision,
  radius_km     double precision DEFAULT 5,
  p_shop_types  text[]           DEFAULT NULL,
  p_min_rating  double precision DEFAULT 0,
  p_price_range int              DEFAULT 0,
  p_query       text             DEFAULT NULL,
  p_sort        text             DEFAULT 'distance',  -- 'distance' | 'rating_desc' | 'rating_asc' | 'reviews_desc'
  p_limit       int              DEFAULT 12,
  p_offset      int              DEFAULT 0
)
RETURNS TABLE (
  upi_id        text,
  name          text,
  display_name  text,
  shop_type     text,
  hash          text,
  avg_rating    double precision,
  review_count  bigint,
  price_range   int,
  city          text,
  state         text,
  lat           double precision,
  lng           double precision,
  distance_m    double precision
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.upi_id,
    s.name,
    s.display_name,
    s.shop_type,
    h.hash,
    s.avg_rating,
    s.review_count,
    s.price_range,
    s.city,
    s.state,
    s.lat,
    s.lng,
    ST_Distance(
      ST_MakePoint(s.lng, s.lat)::geography,
      ST_MakePoint(user_lng, user_lat)::geography
    ) AS distance_m
  FROM shops s
  LEFT JOIN upi_hashes h ON s.upi_id = h.upi_id
  WHERE
    s.lat IS NOT NULL
    AND s.lng IS NOT NULL
    AND ST_DWithin(
      ST_MakePoint(s.lng, s.lat)::geography,
      ST_MakePoint(user_lng, user_lat)::geography,
      radius_km * 1000   -- ST_DWithin uses metres for geography
    )
    AND (p_shop_types IS NULL OR s.shop_type = ANY(p_shop_types))
    AND (p_min_rating = 0  OR s.avg_rating >= p_min_rating)
    AND (p_price_range = 0 OR s.price_range = p_price_range)
    AND (p_query IS NULL   OR s.display_name ILIKE '%' || p_query || '%')
  ORDER BY
    CASE WHEN p_sort = 'distance'      THEN ST_Distance(ST_MakePoint(s.lng, s.lat)::geography, ST_MakePoint(user_lng, user_lat)::geography) END ASC  NULLS LAST,
    CASE WHEN p_sort = 'rating_desc'   THEN s.avg_rating         END DESC NULLS LAST,
    CASE WHEN p_sort = 'rating_asc'    THEN s.avg_rating         END ASC  NULLS LAST,
    CASE WHEN p_sort = 'reviews_desc'  THEN s.review_count::float END DESC NULLS LAST
  LIMIT  p_limit
  OFFSET p_offset;
$$;

-- Grant execute to the anon / authenticated roles Supabase uses
GRANT EXECUTE ON FUNCTION search_shops_nearby TO anon, authenticated;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Trigger & Backfill: Keep avg_rating, review_count, and price_range updated
--    whenever reviews are added, updated, or deleted.
-- ─────────────────────────────────────────────────────────────────────────────

-- Create trigger function
CREATE OR REPLACE FUNCTION update_shop_ratings()
RETURNS TRIGGER AS $$
DECLARE
  v_shop_id text;
BEGIN
  v_shop_id := COALESCE(NEW.shop_id, OLD.shop_id);

  UPDATE shops
  SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM reviews
      WHERE shop_id = v_shop_id
    ), 0),
    review_count = (
      SELECT COUNT(*)
      FROM reviews
      WHERE shop_id = v_shop_id
    ),
    price_range = COALESCE((
      SELECT ROUND(AVG(price_range)::numeric)::integer
      FROM reviews
      WHERE shop_id = v_shop_id AND price_range IS NOT NULL
    ), 0)
  WHERE upi_id = v_shop_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Bind trigger to reviews table
CREATE OR REPLACE TRIGGER trg_update_shop_ratings
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_shop_ratings();

-- Backfill ratings cache for all existing shops immediately
UPDATE shops s
SET
  avg_rating = COALESCE((
    SELECT ROUND(AVG(rating)::numeric, 2)
    FROM reviews
    WHERE shop_id = s.upi_id
  ), 0),
  review_count = (
    SELECT COUNT(*)
    FROM reviews
    WHERE shop_id = s.upi_id
  ),
  price_range = COALESCE((
    SELECT ROUND(AVG(price_range)::numeric)::integer
    FROM reviews
    WHERE shop_id = s.upi_id AND price_range IS NOT NULL
  ), 0);

