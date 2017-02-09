var qs = require('qs');
var wireScrolling = require('./representers/wire-scrolling');
var renderStairs = require('./representers/render-stairs');
var randomId = require('idmaker').randomId;
var seedRandom = require('./browser-seedrandom');
var createProbable = require('probable').createProbable;

var probable;

const stairMarginLeft = 0;
// This should be the only place outside of the representers that the DOM is touched.
const boardWidth = document.getElementById('board').clientWidth;

var currentFlightSpecs = [];
var lastRenderedPoint;
var routeDict;

((function go() {
  window.onhashchange = route;
  route();

  wireScrolling({
    onScrolledToBottom: addMoreStairs
  });
})());

function route() {
  // Skip the # part of the hash.
  routeDict = qs.parse(window.location.hash.slice(1));
  var seed;
  if ('set' in routeDict) {
    seed = routeDict.set;
  }
  else {
    seed = randomId(8);
    routeDict.set = seed;
    var updatedURL = location.protocol + '//' + location.host + location.pathname + '#' + qs.stringify(routeDict);
    console.log(updatedURL);

    // // Sync URL without triggering onhashchange.
    // window.history.pushState(null, null, updatedURL);
  }

  probable = createProbable({
    random: seedRandom(seed)
  });

  addMoreStairs();
}

function addMoreStairs() {
  var startX;
  var startY;

  if (routeDict.glitchMode || !lastRenderedPoint) {
    startX = 2 + probable.roll(boardWidth - 4);
    startY = 2;
  }
  else {
    startX = lastRenderedPoint[0];
    startY = lastRenderedPoint[1];
  }

  currentFlightSpecs = currentFlightSpecs.concat(
    generateFlightSpecs({
      numberOfFlights: 10,
      boardWidth: boardWidth,
      startX: startX,
      startY: startY
    })
  );

  // console.log(JSON.stringify(flightSpecs, null, '  '));
  lastRenderedPoint = renderStairs({
    flightSpecs: currentFlightSpecs,
    leftLimit: stairMarginLeft,
    rightLimit: boardWidth,
    floorWidth: boardWidth > 480 ? 4 : 2
  });
}

function generateFlightSpecs({numberOfFlights, boardWidth, startX, startY}) {
  var lastSpec;
  var lastX = 0;
  // var lastY = 0;
  var specs = [];

  for (var i = 0; i < numberOfFlights; ++i) {
    let vectorX = probable.rollDie(boardWidth);
    let vectorY = ~~(vectorX/2) + probable.roll(vectorX);

    let spec = {
      id: randomId(4),
      vector: [vectorX, vectorY],
      floorAtTop: probable.roll(4) === 0,
      startHorizontally: true
    };

    if (i === 0) {
      spec.overrideStartX = startX;
      spec.overrideStartY = startY;
    }
    else if (probable.roll(3) === 0) {
      // Move the x position of the flight to somewhere random.
      var direction = probable.roll(2) === 0 ? 1 : -1;
      spec.overrideStartX = lastX + direction * probable.roll(boardWidth/4);
      // Put a floor at the top of every flight that jumps over.
      spec.floorAtTop = true;
    }

    spec.stepWidth = spec.vector[0] / (5 + probable.roll(6) + probable.roll(6));
    spec.stepHeight = spec.vector[1] / (5 + probable.roll(6) + probable.roll(6));

    if (lastSpec) {
      // TODO: Consider going back up.
      if (lastSpec.vector[0] > 0) {
        spec.vector[0] *= -1;
      }

      // Keep all the flights inside the board bounds.
      if (lastX + spec.vector[0] > boardWidth) {
        spec.vector[0] = boardWidth - lastX;
      }
      else if (lastX + spec.vector[0] < stairMarginLeft) {
        spec.vector[0] = stairMarginLeft - lastX;
      }
      spec.startHorizontally = probable.roll(2) === 0;
    }

    specs.push(spec);
    lastSpec = spec;
    lastX += lastSpec.vector[0];
    // lastY += lastSpec.vector[1];
  }

  return specs;
}
