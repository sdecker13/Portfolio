-- Create a new table for games
DROP TABLE IF EXISTS real_sales;

CREATE TABLE real_sales(
    img TEXT,
    title TEXT,
    console TEXT,
    genre TEXT,
    publisher TEXT,
    developer TEXT,
    critic_score REAL,
    total_sales REAL,
    na_sales REAL,
    jp_sales REAL,
    pal_sales REAL,
    other_sales REAL,
    release_date TEXT,
    last_update TEXT
);


