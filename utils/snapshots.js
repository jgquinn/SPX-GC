const puppeteer = require( 'puppeteer' );
const { v4: uuidv4 } = require('uuid');

const tryCleanup = 1000 * 60;
const staleAfter = 1000 * 60 * 5;

var snapshotBrowser = null;
var snapshotPage = null;
var snapshotRequested = Date.now();

setInterval( () => {
    now = Date.now();
    if ( now > snapshotRequested+staleAfter ) {
        snapshotStop();
    }
}, tryCleanup );

async function snapshotEnsureReady() {
    if ( snapshotPage!=null && snapshotBrowser!=null ) {
        return new Promise( (resolve) => { resolve( snapshotBrowser ); } );
    }
    snapshotBrowser = await puppeteer.launch( {
        defaultViewport: {
            width: 1920,
            height: 1080,
            isLandscape: true
        }
    } );
    snapshotPage = await snapshotBrowser.newPage();
    return snapshotPage.goto( 'http://localhost:5000/renderer' );
}

function snapshotStop() {
    if ( snapshotPage!=null ) {
        snapshotPage.close();
        snapshotPage = null;
    }
    if ( snapshotBrowser!=null ) {
        snapshotBrowser.close();
        snapshotBrowser = null;
    }
}

function snapshotRefresh() {
    snapshotStop();
    return snapshotEnsureReady();
}

async function captureSnapshot() {
    snapshotRequested = Date.now();
    await snapshotEnsureReady();
    return snapshotPage.screenshot( {
        omitBackground: true
    } );
}

module.exports = {
    configureSnapshots: function( expapp ) {
        expapp.get( '/export-snapshot', async ( req, res ) => {
            captureSnapshot().then((buf) => {
                res.set('Content-type', 'image/png');
                res.status(200).send(buf);
            }).catch((err) => {
                res.status(500).json(err);
            });
        } );
    }
};