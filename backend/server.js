const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./database/connection');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to SkillSync API' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error details:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established.');
    return sequelize.sync();
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });
