const { Move } = require('./hlt');
const Networking = require('./networking');
const _ = require('lodash');
const Logger = require('./Logger.js');

const network = new Networking('MikeBot');
var turn = 0;

function offensiveMove(currentSite, moveCandidates) {
  var sortedCandidates = _.chain(moveCandidates)
                          .reject({owner: currentSite.owner})
                          .sortBy('strength')
                          .value();

  if (sortedCandidates[0] && (currentSite.strength > (sortedCandidates[0].strength + 20))) {
     return sortedCandidates[0];
  }
};

function noOffensiveMoves(id, moveCandidates) {
  return _.every(moveCandidates, ['owner', id]);
};

function init(gameMap, id) {
  this.gameMap = gameMap;
  this.id = id;
}

network.on('init', (gameMap, id) => {
  init(gameMap, id);
});

network.on('map', (gameMap, id) => {
  const moves = [];
  Logger.info('Turn: ', turn++);

  for (let y = 0; y < gameMap.height; y++) {
    for (let x = 0; x < gameMap.width; x++) {
      const loc = { x, y };
      const currentSite = gameMap.getSite(loc);

      if (currentSite.owner === id) {
        let moveCandidates = []

        moveCandidates.push(_.assign(gameMap.getSite(loc, 1), {dir: 1, loc: gameMap.getLocation(loc, 1)}));
        moveCandidates.push(_.assign(gameMap.getSite(loc, 2), {dir: 2, loc: gameMap.getLocation(loc, 2)}));
        moveCandidates.push(_.assign(gameMap.getSite(loc, 3), {dir: 3, loc: gameMap.getLocation(loc, 3)}));
        moveCandidates.push(_.assign(gameMap.getSite(loc, 4), {dir: 4, loc: gameMap.getLocation(loc, 4)}));

        // Check if move exists to expand or wait
        let expandMove = offensiveMove(currentSite, moveCandidates);
        // Check if Expand
        if (expandMove) {
          let moveSite = gameMap.getSite(loc, expandMove.dir);
          moves.push(new Move(loc, expandMove.dir));
        // Random if no offensive moves
        } else if (noOffensiveMoves(id, moveCandidates)) {
          // Try try right, down
          let randDir = (Math.floor(Math.random() * 2) + 2);
          var moveOrder = [randDir, randDir == 2 ? 3 : 2, 1];

          _.forEach(moveOrder, (dir) => {
            let moveSite = gameMap.getSite(loc, dir);
            if (!moveSite.total) moveSite.total = moveSite.strength;

            if ((currentSite.strength > 20) &&
                (currentSite.strength + moveSite.total) < 255) {
              moveSite.total = currentSite.strength + moveSite.strength;
              moves.push(new Move(loc, dir));
              return false;
            }
          });
        // No moves
        }
      }
    }
  }

  network.sendMoves(moves);
});
