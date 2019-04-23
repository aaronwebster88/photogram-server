require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const bodyParser = require('body-parser');
const app = express();

sequelize.sync();
app.use(require('./middleware/headers'));
app.use(bodyParser.json());
app.use('/users', require('./controllers/usercontroller'));
app.use('/photos', require('./controllers/photocontroller'));

app.listen(process.env.PORT, () => console.log(`App is listening on ${process.env.PORT}.`));