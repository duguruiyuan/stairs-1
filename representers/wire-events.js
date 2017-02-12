var d3 = require('d3-selection');

function wireEvents({onScrolledToBottom, onMouseMove, onClick, onKeyUp}) {
  var notifying = false;
  window.onscroll = respondToScroll;

  d3.select(document).on('mousemove', onMouseMove);
  d3.select(document).on('click', onClick);
  d3.select(document).on('keyup', onKeyUp);

  function respondToScroll() {
    if (!notifying) {
      window.requestAnimationFrame(checkScrollToBottom);
    }
  }

  function checkScrollToBottom() {
    if (document.body.scrollHeight - window.scrollY <= window.innerHeight) {
      notifying = true;
      onScrolledToBottom();
      notifying = false;
    }
  }
}


module.exports = wireEvents;
