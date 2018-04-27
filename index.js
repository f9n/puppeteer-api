const path = require('path');

const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const {hashIt, writeFile} = require('./util');

let browser;
puppeteer.launch({
    headless: true,
    waitUntil: 'networkidle2',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
}).then(async _browser => {
    browser = _browser;
})

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
    let link = `${req.body.link}`;
    // is_valid_link()
    let link_hash = hashIt(link);
    let content_file = `${link_hash}_content.txt`;
    let links_file = `${link_hash}_links.json`;
    let screenshot_file = `${link_hash}.png`;
    let pdf_file = `${link_hash}.pdf`;
    let error_message = "";
    console.log(link, link_hash);
    browser.newPage()
        .then(async page => {
            await page.exposeFunction('hashIt', hashIt);
            page.on('console', msg => console.log('PAGE LOG:', msg.text()));
            page.on('load', () => console.log("Page is loaded"))
            page.on('pageerror', () => {
                console.log('Emitted when an uncaught exception happens within the page')
            })
            page.on('requestfailed', () => {
                let msg = 'Emitted when a request fails, for example by timing out.'
                console.log(msg)
                error_message += msg;
                page.close()
            })
            await page.goto(link, {followRedirect: true});
            // Get Links, Content
            let {links, body_text} = await page.evaluate(() => {
                // Links
                const anchors = Array.from(document.querySelectorAll("a"));
                let link = document.createElement("a");
                let links = anchors.map(anchor => {
                    link.href = anchor.getAttribute("href");
                    let new_link_props = {
                        link: link.href.split("#")[0].replace(":80", "").replace(":443", "").replace('\n', ''),
                        link_hash: "",
                    }
                    hashIt(new_link_props.link).then(v => {
                        new_link_props.link_hash = v;
                    });
                    return new_link_props;
                });
                // Content
                let body_text = document.getElementsByTagName('body')[0].innerText;
                return {
                    links,
                    body_text
                };
            });

            await writeFile(`public/${content_file}`, "w",body_text);
            await writeFile(`public/${links_file}`, "w", links);

            await page.screenshot({ path: `public/${screenshot_file}`, fullPage: true })
            await page.pdf({path: `public/${pdf_file}`})
            console.log("Puppeteer finished!")
            res.status(200).json({
                'link': link,
                'link_hash': link_hash,
                'content_url': `/static/${content_file}`,
                'links_url': `/static/${links_file}`,
                'screenshot_url': `/static/${screenshot_file}`,
                'pdf_url': `/static/${pdf_file}`
            })
            })
        .catch((err) => {
            console.log(err)
            res.status(404).json({
                'message': error_message
            })
        })
})

const server = app.listen(app.get('port'), () => {
    console.log(`Puppeteer Api listening on port ${server.address().port}`)
})

/*
process.on('SIGINT', function() {
    console.log( "\nGracefully shutting down from SIGINT (Ctrl-C)" );
    browser.close();
    server.close();
    process.exit(1);
});
*/
