var d3 = require('d3-selection');
var shape = require('d3-shape');
var accessor = require('accessor');

const line = shape.line();

function renderStairs(flightSpecs) {
  var stairSpecs = convertFlightSpecsToStairSpecs(flightSpecs);
  var floorPositions = deriveFloorPositionsFromFlightSpecs(flightSpecs);

  console.log('stairSpecs', JSON.stringify(stairSpecs, null, '  '));

  var stairsLayer = d3.select('.stairs-layer');
  var stairs = stairsLayer.selectAll('.stair-line').data(stairSpecs, accessor());
  stairs.exit().remove();
  stairs.enter().append('path')
    .classed('stair-line', true)
    .merge(stairs)
      .attr('d', getPathFromStairSpec);

  var floorsLayer = d3.select('.floors-layer');
  var floors = floorsLayer.selectAll('.floor-line').data(floorPositions, identity);
  floors.exit().remove();
  floors.enter().append('path')
    .classed('floor-line', true)
    .merge(floors)
      .attr('d', getPathForFloorAtY);
}

function getPathFromStairSpec(stairSpec) {
  return line(makeStairPoints(stairSpec));
}

function makeStairPoints({start, end, stepWidth, stepHeight, startHorizontally}) {
  if (startHorizontally === undefined) {
    startHorizontally = true;
  }
  var points = [];
  var nextPoint = start;
  var moveHorizontallyNext = startHorizontally;
  var xStep = end[0] > start[0] ? stepWidth : - stepWidth;
  var yStep = end[1] > start[1] ? stepHeight : - stepHeight;

  do {
    points.push(nextPoint);

    if (moveHorizontallyNext) {
      nextPoint = [nextPoint[0] + xStep, nextPoint[1]];
    }
    else {
      nextPoint = [nextPoint[0], nextPoint[1] + yStep];      
    }

    moveHorizontallyNext = !moveHorizontallyNext;
  }
  while ((xStep > 0 ? nextPoint[0] <= end[0] : nextPoint[0] >= end[0]) ||
    (yStep > 0 ? nextPoint[1] <= end[1] : nextPoint[1] >= end[1]));

  return points;
}

function convertFlightSpecsToStairSpecs(flightSpecs) {
  var lastFlightSpec;
  return flightSpecs.map(convertFlightSpecToStairSpecs);

  function convertFlightSpecToStairSpecs(flightSpec) {
    var stairSpec = {
      id: 'stairs-' + flightSpec.id,
      stepWidth: flightSpec.stepWidth,
      stepHeight: flightSpec.stepHeight,
      startHorizontally: flightSpec.startHorizontally
    };
    if (lastFlightSpec) {
      stairSpec.start = lastFlightSpec.end;
      stairSpec.end = [
        lastFlightSpec.end[0] + flightSpec.vector[0],
        lastFlightSpec.end[1] + flightSpec.vector[1]
      ];
    }
    else {
      stairSpec.start = [0, 0];
      stairSpec.end = flightSpec.vector;
    }

    lastFlightSpec = stairSpec;
    return stairSpec;
  }
}

function deriveFloorPositionsFromFlightSpecs(flightSpecs) {
  var floorPositions = [];
  var y = 0;

  flightSpecs.forEach(addFloor);
  return floorPositions;

  function addFloor(flightSpec) {
    y += flightSpec.vector[1];

    if (flightSpec.floorAtBottom) {
      floorPositions.push(y);
    }
  }
}

function getPathForFloorAtY(y) {
  return line([[0, y], [1000, y]]);
}

function identity(x) {
  return x;
}

module.exports = renderStairs;
