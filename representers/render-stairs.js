var d3 = require('d3-selection');
var shape = require('d3-shape');
var accessor = require('accessor');

const stairLine = shape.line();

function renderStairs(flightSpecs) {
  var stairSpecs = convertFlightSpecsToStairSpecs(flightSpecs);

  var layer = d3.select('.wall-stairs-layer');
  var stairs = layer.selectAll('.stair-line').data(stairSpecs, accessor());
  stairs.exit().remove();
  stairs.enter().append('path')
    .classed('stair-line', true)
    .merge(stairs)
      .attr('d', getPathFromStairSpec);
}

function getPathFromStairSpec(stairSpec) {
  return stairLine(makeStairPoints(stairSpec));
}

function makeStairPoints({start, end, stepWidth, stepHeight}) {
  var points = [];
  var nextPoint = start;
  var moveHorizontallyNext = true;
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
  while (nextPoint[0] < end[0] || nextPoint[1] < end[1]);

  return points;
}

function convertFlightSpecsToStairSpecs(flightSpecs) {
  var lastFlightSpec;
  return flightSpecs.map(convertFlightSpecToStairSpecs);

  function convertFlightSpecToStairSpecs(flightSpec) {
    var stairSpec = {
      id: 'stairs-' + flightSpec.id,
      stepWidth: flightSpec.stepWidth,
      stepHeight: flightSpec.stepHeight
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

module.exports = renderStairs;
