CREATE TABLE startups(
    name TEXT,
location TEXT,
category TEXT,
employees INTEGER,
raised INTEGER,
valuation INTEGER,
founded	INTEGER,
stage TEXT,
ceo TEXT,
info TEXT
);


SELECT * FROM startups;


--Calc the total number of companies in the table
SELECT COUNT(*) FROM startups;


--Total value of all companies in the table
SELECT SUM(valuation) FROM startups;


--Max rasied from a startup
SELECT MAX(raised) FROM startups;


--Maximum amount of money raised during seed stage
SELECT MAX(raised) FROM startups WHERE stage ='Seed';


--Oldest company founded year in dataset
SELECT MIN(founded), name FROM startups;


--avg valuation
SELECT AVG(valuation) FROM startups;


--avg valuation from each category
SELECT AVG(valuation), category FROM startups GROUP BY category;


--avg valuation from each category rouned to two decimals
SELECT ROUND(AVG(valuation), 2), category FROM startups GROUP BY category;


--Return the avg valuation, in each category rounded and ordered from highest to lowest
SELECT category, ROUND(AVG(valuation), 2) FROM startups GROUP BY 1 ORDER BY 2 DESC;


--What are the most competitive markets?
SELECT category, COUNT(*) FROM startups GROUP BY category HAVING COUNT(*) > 3;


--difference in startup sizes among locations
SELECT AVG(employees), location FROM startups GROUP BY location;


--AVG size of startup in each location with employee avg above 500
SELECT AVG(employees), location FROM startups GROUP BY location HAVING AVG(employees) > 500;





