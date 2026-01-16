/*
  # Create Natal Chart Database Tables

  1. New Tables
    - `natal_charts` - Store user natal charts
    - `chart_bodies` - Store planetary positions (planets, nodes, etc)
    - `chart_aspects` - Store aspects between planets
    - `chart_houses` - Store house cusps and signs (Placidus system)

  2. Security
    - Enable RLS on all tables
    - Users can only see their own charts
    - Public read access to interpretation data

  3. Indexes
    - Add indexes on user_id for fast lookups
*/

CREATE TABLE IF NOT EXISTS natal_charts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  birth_date date NOT NULL,
  birth_time time NOT NULL,
  birth_location text NOT NULL,
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  timezone_offset integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE natal_charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own charts"
  ON natal_charts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create charts"
  ON natal_charts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own charts"
  ON natal_charts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own charts"
  ON natal_charts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_natal_charts_user_id ON natal_charts(user_id);

CREATE TABLE IF NOT EXISTS chart_bodies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_id uuid NOT NULL REFERENCES natal_charts(id) ON DELETE CASCADE,
  name text NOT NULL,
  sign text NOT NULL,
  degrees decimal NOT NULL,
  minutes decimal NOT NULL,
  house integer NOT NULL,
  is_retrograde boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chart_bodies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chart bodies"
  ON chart_bodies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_bodies.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chart bodies"
  ON chart_bodies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_bodies.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own chart bodies"
  ON chart_bodies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_bodies.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE INDEX idx_chart_bodies_chart_id ON chart_bodies(chart_id);

CREATE TABLE IF NOT EXISTS chart_aspects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_id uuid NOT NULL REFERENCES natal_charts(id) ON DELETE CASCADE,
  body1 text NOT NULL,
  body2 text NOT NULL,
  aspect_type text NOT NULL,
  aspect_degrees decimal NOT NULL,
  orb decimal NOT NULL,
  is_applying boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chart_aspects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own aspects"
  ON chart_aspects FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_aspects.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create aspects"
  ON chart_aspects FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_aspects.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own aspects"
  ON chart_aspects FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_aspects.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE INDEX idx_chart_aspects_chart_id ON chart_aspects(chart_id);

CREATE TABLE IF NOT EXISTS chart_houses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_id uuid NOT NULL REFERENCES natal_charts(id) ON DELETE CASCADE,
  house_number integer NOT NULL,
  sign text NOT NULL,
  cusp_degrees decimal NOT NULL,
  cusp_minutes decimal NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chart_houses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own houses"
  ON chart_houses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_houses.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create houses"
  ON chart_houses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_houses.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own houses"
  ON chart_houses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM natal_charts
      WHERE natal_charts.id = chart_houses.chart_id
      AND natal_charts.user_id = auth.uid()
    )
  );

CREATE INDEX idx_chart_houses_chart_id ON chart_houses(chart_id);