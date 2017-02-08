var d3 = require('d3-selection');
var shape = require('d3-shape');
var accessor = require('accessor');
var cloneDeep = require('lodash.clonedeep');

const line = shape.line();

function renderStairs(flightSpecs) {
  var stairSpecs = convertFlightSpecsToStairSpecs(flightSpecs);
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
    .attr('height', 4)
    .attr('width', '100%')
    .merge(floors)
      .attr('y', getFloorRectTop);
}

function getPathFromStairSpec(stairSpec) {
  // console.log('points', stairSpec.points);
  // var pathData = line(stairSpec.points);
  // console.log('pathData', pathData);
  // return pathData;

  return line(stairSpec.points);
}

function makeStairPoints({start, endNear, stepWidth, stepHeight, startHorizontally}) {
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
    (yStep > 0 ? nextPoint[1] <= endNear[1] : nextPoint[1] >= endNear[1]));

  return points;
}

function convertFlightSpecsToStairSpecs(flightSpecs) {
  var lastActualEnd;
  return flightSpecs.map(convertFlightSpecToStairSpecs);

  function convertFlightSpecToStairSpecs(flightSpec, i) {
    var opts = {
      stepWidth: flightSpec.stepWidth,
      stepHeight: flightSpec.stepHeight,
      startHorizontally: flightSpec.startHorizontally
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
      floorAtBottom: flightSpec.floorAtBottom
    };
    lastActualEnd = cloneDeep(spec.points[spec.points.length - 1]);

    // console.log(JSON.stringify(spec.points, null, '  '));

    return spec;
  }
}

function deriveFloorPositionsFromStairSpecs(stairSpecs) {
  var floorPositions = [];
  
  stairSpecs.forEach(addFloor);
  return floorPositions;

  function addFloor(stairSpec) {
    if (stairSpec.floorAtBottom) {
      floorPositions.push(stairSpec.points[stairSpec.points.length - 1][1]);
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
