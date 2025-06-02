const express = require('express');
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const app = express();
const port = 4000;
const secretKey = 'your-secret-key';

const mongoURI = 'mongodb+srv://sdeck1313:####@statistics.b04y7.mongodb.net/Accounts';
const accountsDB = mongoose.createConnection(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// MongoDB connection for NFL data API
const uri = 'mongodb+srv://sdeck1313:####@statistics.b04y7.mongodb.net/';
const client = new MongoClient(uri);

// Define User schema and model in the Accounts database
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { collection: 'User Data' });
const User = accountsDB.model('User', userSchema);

app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Register endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(400).send('Username already taken');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    console.log('User registered:', username);
    res.status(201).send('User registered successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registering user');
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
      console.log('User logged in:', username);
      res.json({ token });
    } else {
      res.status(401).send('Invalid username or password');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Error logging in');
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('Token is required');

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) return res.status(401).send('Invalid token');
    req.user = decoded;
    next();
  });
};

// Logout endpoint
app.post('/logout', verifyToken, (req, res) => {
  res.status(200).send('Logout successful');
});

// API for NFL Data
app.get('/', (req, res) => {
  res.send('Welcome to the NFL Data API');
});

function convertToDecimalOdds(odds) {
  return odds > 0 ? (odds / 100) + 1 : (100 / Math.abs(odds)) + 1;
}

function calculateParlayOdds(selections) {
  return selections.reduce((totalOdds, selection) => {
    const odds = convertToDecimalOdds(selection.line);
    return totalOdds * odds;
  }, 1);
}

function calculatePotentialPayout(betAmount, totalOdds) {
  return betAmount * totalOdds;
}

app.post('/process_bet', async (req, res) => {
  const { betId, userId, selections, betAmount } = req.body;
  const totalOdds = calculateParlayOdds(selections);
  const potentialPayout = calculatePotentialPayout(betAmount, totalOdds);

  const outputData = { betId, userId, totalOdds, potentialPayout, betAmount, selections };

  try {
    await client.connect();
    const db = client.db('TEST');
    const outputCollection = db.collection('useroutput');
    await outputCollection.insertOne(outputData);
    res.status(201).json(outputData);
  } catch (error) {
    console.error('Error saving output data:', error);
    res.status(500).json({ message: 'Failed to save output data' });
  } finally {
    await client.close();
  }
});

// API to save user bet input
app.post('/api/input', async (req, res) => {
  const { betId, userId, selections, betPrice } = req.body;

  try {
    await client.connect();
    const database = client.db('TEST');
    const collection = database.collection('userinput');
    await collection.insertOne({ betId, userId, selections, betPrice });

    const totalOdds = calculateParlayOdds(selections);
    const potentialPayout = calculatePotentialPayout(betPrice, totalOdds);

    const outputData = {
      betId, userId, totalOdds, potentialPayout, betPrice, selections,
    };

    const outputCollection = database.collection('useroutput');
    await outputCollection.insertOne(outputData);

    res.status(200).json({ message: 'Bet slip saved and output calculated successfully!' });
  } catch (error) {
    console.error('Error saving bet slip and processing:', error);
    res.status(500).json({ message: 'Failed to save bet slip and process data' });
  } finally {
    await client.close();
  }
});

// Endpoint to fetch user output
app.get('/api/useroutput', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('TEST');
    const collection = db.collection('useroutput');

    const { username } = req.query;

    if (!username) {
      return res.status(400).json({ error: 'Username query parameter is required' });
    }

    const userOutputs = await collection.find({ userId: username }).toArray();

    res.status(200).json(userOutputs);
  } catch (error) {
    console.error('Error fetching user output data:', error);
    res.status(500).json({ error: 'Failed to fetch user output data' });
  } finally {
    await client.close();
  }
});

// Fetch 2024-25 NFL schedule
app.get('/api/schedule', async (req, res) => {
  try {
    await client.connect();
    const db = client.db('NFLData');
    const collection = db.collection('NFL 2024-25 Schedule');
    const schedule = await collection.find({}).toArray();
    res.status(200).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch schedule data' });
  } finally {
    await client.close();
  }
});

app.get('/api/combine', async (req, res) => {
  try {
    await client.connect();

    // Connect to the databases and collections
    const nflDb = client.db('NFLData');
    const scheduleCollection = nflDb.collection('NFL 2024-25 Schedule');
    const modelDb = client.db('ModelData');
    const predictionsCollection = modelDb.collection('Predictions');

    // Fetch all games from both collections
    const schedule = await scheduleCollection.find({}).toArray();
    const predictions = await predictionsCollection.find({}).toArray();

    // Define the fields to retain from the schedule collection
    const retainFields = [
      '_id', 'away_moneyline', 'away_score', 'away_spread', 'away_spread_odds', 'away_team',
      'game_id', 'home_moneyline', 'home_score', 'home_spread', 'home_spread_odds', 'home_team',
      'over_odds', 'season', 'spread_line', 'total', 'total_line', 'under_odds', 'week', 'winner'
    ];

    // Filter and combine the datasets
    const combinedData = schedule.map(game => {
      // Retain only the specified fields from the schedule
      const filteredGame = Object.fromEntries(
        Object.entries(game).filter(([key]) => retainFields.includes(key))
      );

      // Match the prediction data
      const prediction = predictions.find(p => p.game_id === game.game_id);

      if (prediction) {
        // Calculate whether predictions are correct
        const spreadcorrect = 
          (game.winner === game.away_team && parseFloat(game.spread_line) > 0) || 
          (game.winner === game.home_team && parseFloat(game.spread_line) < 0) ? 1 : 0;

        const moneylinecorrect = game.winner === prediction.winner ? 1 : 0;

        const actual_total = game.home_score + game.away_score;
        const totalcorrect = 
          (actual_total > game.total_line && prediction.avg_total_score > game.total_line) || 
          (actual_total < game.total_line && prediction.avg_total_score < game.total_line) ? 1 : 0;

        // Add the correctness fields to the prediction
        prediction.spreadcorrect = spreadcorrect;
        prediction.moneylinecorrect = moneylinecorrect;
        prediction.totalcorrect = totalcorrect;
      }

      return {
        ...filteredGame,
        prediction: prediction || null, // Include prediction if it exists
      };
    });

    // Calculate weekly prediction statistics
    const weeklyStats = combinedData.reduce((stats, game) => {
      const { week } = game;

      if (!stats[week]) {
        stats[week] = {
          totalGames: 0,
          spreadPredicted: 0,
          moneylinePredicted: 0,
          totalPredicted: 0,
        };
      }

      stats[week].totalGames += 1;

      if (game.prediction) {
        if (game.prediction.spreadcorrect === 1) stats[week].spreadPredicted += 1;
        if (game.prediction.moneylinecorrect === 1) stats[week].moneylinePredicted += 1;
        if (game.prediction.totalcorrect === 1) stats[week].totalPredicted += 1;
      }

      return stats;
    }, {});

    // Convert the stats object to an array of weekly data
    const weeklyResults = Object.keys(weeklyStats).map(week => ({
      week,
      totalGames: weeklyStats[week].totalGames,
      spreadPredicted: weeklyStats[week].spreadPredicted,
      moneylinePredicted: weeklyStats[week].moneylinePredicted,
      totalPredicted: weeklyStats[week].totalPredicted,
    }));

    // Return the combined data and the weekly prediction statistics
    res.json({ combinedData, weeklyResults });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  } finally {
    await client.close();
  }
});


// Generic data-fetching function for NFL player data and betting data
function getData(databaseName, collectionName) {
  return async (req, res) => {
    try {
      await client.connect();
      const db = client.db(databaseName);
      const collection = db.collection(collectionName);
      const data = await collection.find({}).toArray();
      res.status(200).json(data);
    } catch (error) {
      console.error(`Error fetching data from ${collectionName}:`, error);
      res.status(500).json({ error: `Failed to fetch data from ${collectionName}` });
    } finally {
      await client.close();
    }
  };
}

// Player data endpoints
app.get('/api/qbweeklydata', getData('NFLWeeklyPlayerData', 'QB Weekly Statistics'));
app.get('/api/rbweeklydata', getData('NFLWeeklyPlayerData', 'RB Weekly Statistics'));
app.get('/api/wrweeklydata', getData('NFLWeeklyPlayerData', 'WR Weekly Statistics'));
app.get('/api/teweeklydata', getData('NFLWeeklyPlayerData', 'TE Weekly Statistics'));

// Season data endpoints
app.get('/api/qbseasondata', getData('NFLSeasonPlayerData', 'QB Season Statistics'));
app.get('/api/wrseasondata', getData('NFLSeasonPlayerData', 'WR Season Statistics'));
app.get('/api/rbseasondata', getData('NFLSeasonPlayerData', 'RB Season Statistics'));
app.get('/api/teseasondata', getData('NFLSeasonPlayerData', 'TE Season Statistics'));

// Betting data endpoints
app.get('/api/spread', getData('BettingData', 'Spread'));
app.get('/api/totals', getData('BettingData', 'Totals'));
app.get('/api/moneyline', getData('BettingData', 'Moneyline'));
app.get('/api/predictions', getData('ModelData', 'Predictions'));

app.get('/api/logos', getData('nfl_database', 'team_logos'));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});