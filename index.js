const path = require('path');

const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const {hashIt, writeFile} = require('./util');

app.set('port', process.env.PORT || 8080);
app.use('/static', express.static(path.join(__dirname, 'public')));
// support parsing of application/json type post data
app.use(bodyParser.json());

//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.post('/', (req, res) => {
    let link = `http://${req.body.link}`;
    let link_hash = hashIt(link);

    res.status(200).json({
        'link': link,
        'link_hash': link_hash
    })
})

const server = app.listen(app.get('port'), () => {
    console.log(`App listening on port ${server.address().port}`)
})

process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    server.close();
    process.exit(1);
  });