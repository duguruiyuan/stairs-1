function wireScrolling({onScrolledToBottom}) {
  var notifying = false;
  window.onscroll = respondToScroll;

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


module.exports = wireScrolling;
