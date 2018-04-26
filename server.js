'use strict'

const express = require('express');
const morgan = require('morgan')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

const { PORT, DATABASE_URL } = require('./config');
const { BlogPost } = require('./models');
const blogPostRouter = require('./blogPostRoutes')

mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use(bodyParser.json());
app.use('/posts', blogPostRouter);

let server;

function runServer(databaseUrl, port = PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
                .on('error', err => {
                    mongoose.disconnect();
                    reject(err);
                });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };