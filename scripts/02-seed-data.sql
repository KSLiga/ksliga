-- Insert teams
INSERT INTO teams (name, logo) VALUES
('Динамо', 'https://upload.wikimedia.org/wikipedia/commons/0/0d/FC_Dynamo_Kyiv_logo.svg'),
('Шахтар', 'https://upload.wikimedia.org/wikipedia/commons/f/f5/Shakhtar_Donetsk.svg'),
('Зоря', 'https://upload.wikimedia.org/wikipedia/commons/e/e4/FC_Zorya_Luhansk.png'),
('Ворскла', 'https://upload.wikimedia.org/wikipedia/en/c/c0/FC_Vorskla_Poltava_logo.png')
ON CONFLICT (name) DO NOTHING;

-- Insert matches
INSERT INTO matches (round, date, home_team, away_team, home_score, away_score, is_finished) VALUES
(1, '2025-07-10', 'Динамо', 'Ворскла', 3, 1, true),
(1, '2025-07-10', 'Шахтар', 'Зоря', 2, 2, true),
(2, '2025-07-12', 'Зоря', 'Динамо', 1, 3, true),
(2, '2025-07-13', 'Ворскла', 'Шахтар', NULL, NULL, false)
ON CONFLICT DO NOTHING;

-- Insert players
INSERT INTO players (name, team, goals) VALUES
('Віктор Циганков', 'Динамо', 4),
('Артем Довбик', 'Шахтар', 3),
('Ярмоленко', 'Динамо', 2)
ON CONFLICT DO NOTHING;
