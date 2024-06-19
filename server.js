const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./api/routes/index');
const models = require('./api/models/index');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false }));

// NODE_ENV='production'
// app.use(cors({credentials: true, origin: 'https://orderswift.outdoorequippedservice.com'}));

// NODE_ENV='development'
app.use(cors());

routes.initRoutes({ app });
models.connectDB();

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, './client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
    });
}

app.listen(port, () => console.log(`Port Server: ${port}`));