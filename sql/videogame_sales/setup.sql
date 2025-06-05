-- Create a new table for games
DROP TABLE IF EXISTS real_sales;

SELECT title, na_sales, jp_sales
FROM real_sales
WHERE 
  jp_sales IS NOT NULL AND
  na_sales IS NOT NULL AND
  jp_sales > na_sales;



