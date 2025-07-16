-- 👇 «Підштовхуємо» PostgREST до оновлення кешу
ALTER TABLE match_goals
  ALTER COLUMN player_name TYPE VARCHAR(100);

-- (тип не змінюється, але PostgREST фіксує, що колонка є)
