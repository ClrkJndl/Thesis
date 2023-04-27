DELETE FROM grades
WHERE id in (SELECT id FROM grades GROUP BY id HAVING COUNT(id) > 1);