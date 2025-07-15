-- Update existing data with championship_id
UPDATE teams SET championship_id = 1 WHERE championship_id IS NULL;
UPDATE matches SET championship_id = 1 WHERE championship_id IS NULL;
UPDATE players SET championship_id = 1 WHERE championship_id IS NULL;

-- Make championship_id required
ALTER TABLE teams ALTER COLUMN championship_id SET NOT NULL;
ALTER TABLE matches ALTER COLUMN championship_id SET NOT NULL;
ALTER TABLE players ALTER COLUMN championship_id SET NOT NULL;
