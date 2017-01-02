const { Move } = require('./hlt');
const Networking = require('./networking');
const _ = require('lodash');
const Logger = require('./Logger.js');

// Enable Logging
Logger.enabled = false; 

const network = new Networking('MikesBot');

function checkExpandMove(currentSite, moveCandidates) {
  var sortedCandidates = _.chain(moveCandidates)
              .sortBy('strength')
              .value();

  var weakestCandidate = _.find(sortedCandidates, (candidate) => {
    return currentSite.strength >= candidate.strength && 
           currentSite.owner !== candidate.owner &&
           currentSite.strength > 0;
  })

  Logger.debug('weakestCandidate: ', weakestCandidate);
  Logger.debug('currentStrength: ', currentSite.strength);

  return weakestCandidate; 
}

function noOffensiveMoves(currentSite, moveCandidates) {
  Logger.debug('Canidates', moveCandidates);

  return _.every(moveCandidates, ['owner', currentSite.owner]);
}

network.on('map', (gameMap, id) => {
  const moves = [];
  let moveHash = {}; 

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
        let expandMove = checkExpandMove(currentSite, moveCandidates); 

        // Check if Expand
        if (expandMove){
          Logger.debug('expandMove: ', expandMove)
          let moveSite = gameMap.getLocation(expandMove.loc, expandMove.dir);
          let moveString = moveSite.x + ' ' + moveSite.y;
          Logger.debug('expandMove moveString ', !_.has(moveHash, moveString))
          if (!_.has(moveHash, moveString)) {
            moveHash[moveString] = true;
            Logger.info('Move: ', new Move(loc, expandMove.dir))
            moves.push(new Move(loc, expandMove.dir));
          }
        // Random if no offensive moves
        } else if ((noOffensiveMoves(currentSite, moveCandidates))) {
          Logger.debug('noOffensiveMoves')
          let dir = (Math.floor(Math.random() * 2) + 2);
          let moveSite = gameMap.getLocation(loc, dir);
          let moveString = moveSite.x + ' ' + moveSite.y;
          if (!_.has(moveHash, moveString) && currentSite.strength > 40 ) {
            moveHash[moveString] = true;
            Logger.info('Move: ', new Move(loc, dir))
            moves.push(new Move(loc, dir));
          }
        } else {
          Logger.info('No Move: ');
        }

        moveHash = {};
      }
    }
  }

  network.sendMoves(moves);
});
