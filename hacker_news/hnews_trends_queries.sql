 CREATE TABLE hacker_news(
  title TEXT,
  user TEXT,
  score INTEGER,
  timestamp DATETIME,
  url TEXT
 );
 
 SELECT title, score FROM hacker_news ORDER BY score DESC LIMIT 5;


 SELECT sum(score) 
 FROM hacker_news;

SELECT user, SUM(score) 
FROM hacker_news 
GROUP BY user HAVING SUM(score) > 200 
ORDER BY 2 DESC;


SELECT (517 + 309 + 304 + 282)/ 6366.0 AS 'Average Score';

SELECT user, COUNT(*) 
FROM hacker_news WHERE url LIKE '%watch?v=dQw4w9WgXcQ%' 
GROUP BY user ORDER BY COUNT(*) DESC;

SELECT CASE
  WHEN url LIKE '%github.com%' THEN 'GitHub'
  WHEN url LIKE '%medium.com%' THEN 'Medium' 
  WHEN url LIKE '%nytimes.com%' THEN 'Nytimes'
  ELSE 'Other'
END AS 'Source',
COUNT(*)
FROM hacker_news
GROUP BY 1;

SELECT timestamp, strftime('%H', timestamp) 
FROM hacker_news 
GROUP BY 1 LIMIT 20;

SELECT strftime('%H', timestamp) AS 'Hour', 
ROUND(AVG(score), 2) AS 'Average Score', 
COUNT(*) AS 'Total Count' 
FROM hacker_news WHERE timestamp IS NOT NULL 
GROUP BY 1 ORDER BY 2 DESC; 