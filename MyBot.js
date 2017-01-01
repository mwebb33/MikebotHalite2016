const {
  Move,
} = require('./hlt');
const Networking = require('./networking');
const _ = require('lodash');
const Logger = require('./Logger.js');

const network = new Networking('MyJavaScriptBot');

network.on('map', (gameMap, id) => {
  const moves = [];
  const moveHash = {}; 

  for (let y = 0; y < gameMap.height; y++) {
    for (let x = 0; x < gameMap.width; x++) {
      const loc = { x, y };
      const currentSite = gameMap.getSite(loc);
      if (currentSite.owner === id) {
        let sites = []

        sites.push(_.assign(gameMap.getSite(loc), {dir: 0, loc: gameMap.getLocation(loc, 0)})); 
        sites.push(_.assign(gameMap.getSite(loc, 1), {dir: 1, loc: gameMap.getLocation(loc, 1)}));
        sites.push(_.assign(gameMap.getSite(loc, 2), {dir: 2, loc: gameMap.getLocation(loc, 2)}));
        sites.push(_.assign(gameMap.getSite(loc, 3), {dir: 3, loc: gameMap.getLocation(loc, 3)}));
        sites.push(_.assign(gameMap.getSite(loc, 4), {dir: 4, loc: gameMap.getLocation(loc, 4)}));

        var sortedSites = _.chain(sites)
                    .sortBy('strength')
                    .value();

        var weakestSite = _.find(sortedSites, (candidate) => {
          return currentSite.strength >= candidate.strength;
        })

        // Check if should expand
        if (weakestSite.owner !== id) {
          Logger.info('expand', currentSite.strength, weakestSite.strength);

          let siteToMoveTo = gameMap.getLocation(loc, weakestSite.dir);
          let moveString = weakestSite.loc.x + ' ' + weakestSite.loc.y
          if (!!_.has(moveHash, moveString)) {
            Logger.info('expand', currentSite.strength, weakestSite.strength);
          } else {
            Logger.info('duplicate', currentSite.strength, weakestSite.strength);
          }

          moves.push(new Move(loc, weakestSite.dir));
        }
      }
    }
  }

  network.sendMoves(moves);
});
