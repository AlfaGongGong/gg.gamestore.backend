const express = require('express');
const jwt = require('jsonwebtoken');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use('/api/auth', authRoutes);



const checkJwt = (req, res, next) => {
  const token = req.headers.authorization.split(' ')[1];
  jwt.verify(token, 'tajna', (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Neispravan token' });
    }
    req.user = decoded;
    next();
  });

};

app.get('/api/user-dashboard', checkJwt, (req, res) => {

  res.json({ message: 'Dobrodošli na korisnički dashboard' });


});

app.get('/api/admin-dashboard', checkJwt, (req, res) => {

  res.json({ message: 'Dobrodošli na admin dashboard' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
