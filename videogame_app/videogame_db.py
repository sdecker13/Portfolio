import sqlite3

conn = sqlite3.connect("videogames.db")
c = conn.cursor()

def create_table(conn):
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS Videogames (
            id INTEGER PRIMARY KEY,
            title TEXT NOT NULL,
            condition INTEGER,
            platform TEXT,
            rate TEXT,
            price TEXT,
            photo TEXT
        )
    ''')
    conn.commit()

game_inventory = [
        ('Kinect Adventures!', 8, 'Xbox 360', 'E', '10.99', 'game_photos/KinectAdvXbox.jpg'),
        ('Tom Clancys Rainbow Six Siege', 9, 'Xbox One', 'M', '15.99', 'game_photos/Rainbow6XB1.jpg'),
        ('Ratatouille', 6, 'Nintendo DS', 'E', '6.99', 'game_photos/RatatouiileDS.jpg'),
        ('Wii Fit', 7, 'Nintendo Wii', 'E', '12.99', 'game_photos/WiiFit.jpg')]

def insert_games(conn, games):
    c = conn.cursor()
    c.executemany('''
        INSERT INTO Videogames (title, condition, platform, rate, price, photo)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', games)
    conn.commit()

def view_all_games(conn):
    c = conn.cursor()
    c.execute("SELECT * FROM Videogames")
    rows = c.fetchall()
    for row in rows:
        print(row)


if __name__ == "__main__":
    #create_table(conn)
    #insert_games(conn, game_inventory)
    #view_all_games(conn)
    conn.close()

