const API = require('../src/scraping')

const APPID_TROPICO4 = 57690

function asyncDebug(promise) {
  promise.then(r => console.log(r)).catch(e => console.error(e))
}

// asyncDebug(API.steamAppDetails(APPID_TROPICO4))

asyncDebug(API.igSearchGames('noen abyss'))
