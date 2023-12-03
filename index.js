const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const {protect}=require('./middlewares/auth')
const connectDB=require('./DB/connect')


const app = express();
const port = process.env.PORT|| 5000

app.use(express.json());

// mongoose.connect('mongodb+srv://footprint-manager:footpr%21nt%40123@cluster0.9zjapyn.mongodb.net/footprint-project-management?retryWrites=true&w=majority', 
//   {useNewUrlParser: true}
// );


app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Authentication failed' });
    }

    const token = jwt.sign({ username: user.username }, 'your-secret-key', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/protected', protect, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});


const start = async () => {
  try {
      await connectDB('mongodb+srv://footprint-manager:footpr%21nt%40123@cluster0.9zjapyn.mongodb.net/footprint-project-management?retryWrites=true&w=majority')
      await app.listen(port, () => {
          console.log(`Example app listening on port ${port}`)
      })
  }
  catch (error) {
      console.log(error)
  }
}

start()
  