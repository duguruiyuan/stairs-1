var qs = require('qs');
var renderStairs = require('./representers/render-stairs');
var randomId = require('idmaker').randomId;
var seedRandom = require('seedrandom');
var createProbable = require('probable').createProbable;

var probable = createProbable({
  random: seedRandom('test')
});


((function go() {
  route();
})());

function route() {
  // Skip the # part of the hash.
  var routeDict = qs.parse(window.location.hash.slice(1));

  // Routing logic.
  // Render no matter what.
  // renderStairs([
  //   {
  //     id: 'one',
  //     vector: [400, 400],
  //     stepWidth: 40,
  //     stepHeight: 40,
  //     startHorizontally: false,
  //     floorAtBottom: true
  //   },
  //   {
  //     id: 'two',
  //     vector: [-300, 200],
  //     stepWidth: 60,
  //     stepHeight: 50
  //   }
  // ]);
  var flightSpecs = generateFlightSpecs(10, 800);
  console.log(JSON.stringify(flightSpecs, null, '  '));
  renderStairs(flightSpecs);
}

function generateFlightSpecs(numberOfFlights, boardWidth) {
  var lastSpec;
  var lastX = 0;
  var lastY = 0;
  var specs = [];

  for (var i = 0; i < numberOfFlights; ++i) {
    let vectorX = probable.rollDie(boardWidth);
    let vectorY = ~~(vectorX/2) + probable.roll(vectorX);
    // TODO: Override start position.
    let spec = {
      id: randomId(4),
      vector: [vectorX, vectorY],
      floorAtBottom: probable.roll(2) === 0,
      startHorizontally: true
    };

    spec.stepWidth = spec.vector[0] / (5 + probable.roll(10));
    spec.stepHeight = spec.vector[1] / (5 + probable.roll(10));

    if (lastSpec) {
      // TODO: Consider going back up.
      if (lastSpec.vector[0] > 0) {
        spec.vector[0] *= -1;
      }

      // Keep all the flights inside the board bounds.
      if (lastX + spec.vector[0] > boardWidth) {
        spec.vector[0] = boardWidth - lastX;
      }
      else if (lastX + spec.vector[0] < 0) {
        spec.vector[0] = -lastX;
      }
      spec.startHorizontally = !lastSpec.startHorizontally;
    }

    specs.push(spec);
    lastSpec = spec;
    lastX += lastSpec.vector[0];
    lastY += lastSpec.vector[1];
  }

  return specs;
}
