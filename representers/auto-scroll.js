var d3 = require('d3-selection');
var ease = require('d3-ease');
var timer = require('d3-timer').timer;
var createSimpleScroll = require('simplescroll');

function AutoScroll({scrollDuration, easingFnName}) {
  var simpleScroll = createSimpleScroll({
    d3: d3,
    easingFn: easingFnName ? ease[easingFnName] : ease.easeLinear, // easeElasticInOut
    timer: timer,
    root: document.body
  });

  return {
    scrollTo: scrollTo,
    stopScroll: simpleScroll.stopScroll
  };

  function scrollTo({targetY}) {
    if (simpleScroll.isStillScrolling()) {
      simpleScroll.stopScroll();
    }
    simpleScroll.scrollTo(targetY, scrollDuration);
  }
}

module.exports = AutoScroll;
