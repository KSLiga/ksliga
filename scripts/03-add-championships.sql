-- Create championships table
CREATE TABLE IF NOT EXISTS championships (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  season VARCHAR(20) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add championship_id to existing tables
ALTER TABLE teams ADD COLUMN IF NOT EXISTS championship_id INTEGER REFERENCES championships(id) ON DELETE CASCADE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS championship_id INTEGER REFERENCES championships(id) ON DELETE CASCADE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS championship_id INTEGER REFERENCES championships(id) ON DELETE CASCADE;

-- Insert default championship
INSERT INTO championships (name, season, is_active) VALUES
('KS Liga', '2025', true)
ON CONFLICT (name) DO NOTHING;

-- Update existing data to use default championship
UPDATE teams SET championship_id = 1 WHERE championship_id IS NULL;
UPDATE matches SET championship_id = 1 WHERE championship_id IS NULL;
UPDATE players SET championship_id = 1 WHERE championship_id IS NULL;

-- Update RLS policies
DROP POLICY IF EXISTS "Allow public read access on championships";
CREATE POLICY "Allow public read access on championships" ON championships FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage championships" ON championships FOR ALL USING (auth.role() = 'authenticated');
