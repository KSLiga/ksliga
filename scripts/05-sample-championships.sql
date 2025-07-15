-- Insert additional sample championships
INSERT INTO championships (name, season, is_active) VALUES
('Кубок України', '2025', false),
('Суперкубок', '2025', false)
ON CONFLICT (name) DO NOTHING;

-- Get championship IDs
DO $$
DECLARE
    ks_liga_id INTEGER;
    cup_id INTEGER;
    supercup_id INTEGER;
BEGIN
    SELECT id INTO ks_liga_id FROM championships WHERE name = 'KS Liga';
    SELECT id INTO cup_id FROM championships WHERE name = 'Кубок України';
    SELECT id INTO supercup_id FROM championships WHERE name = 'Суперкубок';

    -- Add teams to Cup championship
    INSERT INTO teams (name, logo, championship_id) VALUES
    ('Динамо', 'https://upload.wikimedia.org/wikipedia/commons/0/0d/FC_Dynamo_Kyiv_logo.svg', cup_id),
    ('Шахтар', 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Shakhtar_Donetsk.svg', cup_id),
    ('Зоря', 'https://upload.wikimedia.org/wikipedia/commons/e/e4/FC_Zorya_Luhansk.png', cup_id),
    ('Ворскла', 'https://upload.wikimedia.org/wikipedia/en/c/c0/FC_Vorskla_Poltava_logo.png', cup_id),
    ('Дніпро-1', 'https://upload.wikimedia.org/wikipedia/en/thumb/1/1c/FC_Dnipro-1_logo.svg/200px-FC_Dnipro-1_logo.svg.png', cup_id),
    ('Олександрія', 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/FC_Oleksandriya_logo.svg/200px-FC_Oleksandriya_logo.svg.png', cup_id)
    ON CONFLICT DO NOTHING;

    -- Add some cup matches
    INSERT INTO matches (round, date, home_team, away_team, home_score, away_score, is_finished, championship_id) VALUES
    (1, '2025-08-01', 'Динамо', 'Олександрія', 2, 0, true, cup_id),
    (1, '2025-08-01', 'Шахтар', 'Дніпро-1', 1, 1, true, cup_id),
    (1, '2025-08-02', 'Зоря', 'Ворскла', 3, 1, true, cup_id),
    (2, '2025-08-15', 'Динамо', 'Шахтар', NULL, NULL, false, cup_id),
    (2, '2025-08-15', 'Зоря', 'TBD', NULL, NULL, false, cup_id)
    ON CONFLICT DO NOTHING;

    -- Add players for cup
    INSERT INTO players (name, team, goals, championship_id) VALUES
    ('Віктор Циганков', 'Динамо', 2, cup_id),
    ('Артем Довбик', 'Шахтар', 1, cup_id),
    ('Владислав Ваната', 'Зоря', 3, cup_id)
    ON CONFLICT DO NOTHING;

END $$;
