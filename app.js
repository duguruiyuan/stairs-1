var qs = require('qs');
var renderStairs = require('./representers/render-stairs');

((function go() {
  route();
})());

function route() {
  // Skip the # part of the hash.
  var routeDict = qs.parse(window.location.hash.slice(1));

  // Routing logic.
  // Render no matter what.
  renderStairs([
    {
      id: 'one',
      vector: [400, 400],
      stepWidth: 40,
      stepHeight: 40
    },
    {
      id: 'two',
      vector: [-300, 200],
      stepWidth: 60,
      stepHeight: 50
    }
  ]);
}
