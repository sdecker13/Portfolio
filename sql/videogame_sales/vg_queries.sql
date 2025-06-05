-- View first 25 games
SELECT * FROM real_sales limit 25;

-- Top-selling games
SELECT title, global_sales
FROM games
ORDER BY global_sales DESC
LIMIT 3;

-- Sales by genre
SELECT genre, SUM(total_sales)as total_sales
FROM real_sales
GROUP BY genre;

--All games published by nintendo
SELECT title, publisher FROM real_sales WHERE publisher = 'Nintendo';

SELECT title, na_sales, jp_sales 
FROM real_sales 
WHERE 
  jp_sales IS NOT NULL AND
  na_sales IS NOT NULL AND
  TRIM(na_sales) != '' AND
  TRIM(jp_sales) != '' AND
  CAST(jp_sales AS REAL) > CAST(na_sales AS REAL);
