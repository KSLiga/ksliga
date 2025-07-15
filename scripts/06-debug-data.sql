-- Check current data in database
SELECT 'Championships' as table_name, count(*) as count FROM championships
UNION ALL
SELECT 'Teams', count(*) FROM teams
UNION ALL
SELECT 'Matches', count(*) FROM matches
UNION ALL
SELECT 'Players', count(*) FROM players;

-- Show championships with their teams
SELECT 
  c.name as championship_name,
  c.season,
  c.is_active,
  count(t.id) as team_count
FROM championships c
LEFT JOIN teams t ON c.id = t.championship_id
GROUP BY c.id, c.name, c.season, c.is_active
ORDER BY c.id;

-- Show teams by championship
SELECT 
  c.name as championship_name,
  t.name as team_name,
  t.championship_id
FROM championships c
LEFT JOIN teams t ON c.id = t.championship_id
ORDER BY c.id, t.name;
