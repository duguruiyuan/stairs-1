var d3 = require('d3-selection');
var shape = require('d3-shape');
var accessor = require('accessor');
var cloneDeep = require('lodash.clonedeep');

const line = shape.line();

function renderStairs({flightSpecs, leftLimit, rightLimit, floorWidth}) {
  if (leftLimit === rightLimit) {
    return;
  }
  
  var stairSpecs = convertFlightSpecsToStairSpecs({
    flightSpecs: flightSpecs,
    leftLimit: leftLimit,
    rightLimit: rightLimit
  });
  var floorPositions = deriveFloorPositionsFromStairSpecs(stairSpecs);

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
  floors.enter().append('rect')
    .classed('floor-line', true)
    .attr('x', 0)
    .attr('height', floorWidth)
    .attr('width', '100%')
    .merge(floors)
      .attr('y', getFloorRectTop);

  var lastStairs = stairSpecs[stairSpecs.length - 1];
  var lastPointRendered = lastStairs.points[lastStairs.points.length - 1];
  var board = d3.select('#board');
  board.attr('height', lastPointRendered[1]);
  return lastPointRendered;
}

function getPathFromStairSpec(stairSpec) {
  // console.log('points', stairSpec.points);
  // var pathData = line(stairSpec.points);
  // console.log('pathData', pathData);
  // return pathData;

  return line(stairSpec.points);
}

function makeStairPoints({
    start, endNear, stepWidth, stepHeight, startHorizontally, endLeftLimit, endRightLimit
  }) {

  if (startHorizontally === undefined) {
    startHorizontally = true;
  }
  var points = [];
  var nextPoint = start;
  var moveHorizontallyNext = startHorizontally;
  var xStep = endNear[0] > start[0] ? stepWidth : - stepWidth;
  var yStep = endNear[1] > start[1] ? stepHeight : - stepHeight;

  do {
    points.push([nextPoint[0], nextPoint[1]]);

    if (moveHorizontallyNext) {
      nextPoint = [nextPoint[0] + xStep, nextPoint[1]];
    }
    else {
      nextPoint = [nextPoint[0], nextPoint[1] + yStep];      
    }

    moveHorizontallyNext = !moveHorizontallyNext;
  }
  while ((xStep > 0 ? nextPoint[0] <= endNear[0] : nextPoint[0] >= endNear[0]) &&
    (nextPoint[0] <= endRightLimit && nextPoint[0] >= endLeftLimit) &&
    (yStep > 0 ? nextPoint[1] <= endNear[1] : nextPoint[1] >= endNear[1]));

  return points;
}

function convertFlightSpecsToStairSpecs({flightSpecs, leftLimit, rightLimit}) {
  var lastActualEnd;
  return flightSpecs.map(convertFlightSpecToStairSpecs);

  function convertFlightSpecToStairSpecs(flightSpec, i) {
    var opts = {
      stepWidth: flightSpec.stepWidth,
      stepHeight: flightSpec.stepHeight,
      startHorizontally: flightSpec.startHorizontally,
      endLeftLimit: leftLimit,
      endRightLimit: rightLimit
    };
    
    if (i > 0) {
      opts.start = lastActualEnd;
    }
    else {
      opts.start = [0, 0];
    }

    if (!isNaN(flightSpec.overrideStartX)) {
      opts.start[0] = flightSpec.overrideStartX;
    }
    if (!isNaN(flightSpec.overrideStartY)) {
      opts.start[1] = flightSpec.overrideStartY;
    }

    opts.endNear = addPairs(opts.start, flightSpec.vector);

    var spec = {
      id: 'stairs-' + flightSpec.id,
      points: makeStairPoints(opts),
      floorAtTop: flightSpec.floorAtTop
    };
    lastActualEnd = cloneDeep(spec.points[spec.points.length - 1]);
    // console.log('start', spec.points[0]);
    // console.log('lastActualEnd', lastActualEnd);

    // console.log(JSON.stringify(spec.points, null, '  '));

    return spec;
  }
}

function deriveFloorPositionsFromStairSpecs(stairSpecs) {
  var floorPositions = [];
  
  stairSpecs.forEach(addFloor);
  return floorPositions;

  function addFloor(stairSpec) {
    if (stairSpec.floorAtTop) {
      floorPositions.push(stairSpec.points[0][1]);
    }
  }
}

function identity(x) {
  return x;
}

function getFloorRectTop(floorCenterY) {
  return floorCenterY - 2;
}

function addPairs(a, b) {
  return [a[0] + b[0], a[1] + b[1]];
}

module.exports = renderStairs;
