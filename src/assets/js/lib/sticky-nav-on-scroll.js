// Hide Header/Nav on on scroll down
// set variables
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var siteHeader = $(".site-header"),
  siteHeaderHeight = $(".site-header").outerHeight();

function hasScrolled() {
  var st = $(window).scrollTop();
  // Make sure they scroll more than delta
  if (Math.abs(lastScrollTop - st) <= delta) return;
  // If they scrolled down and are past the site header, add up class
  // This is necessary so you never see what is "behind" the site header.
  if (st > lastScrollTop && st > siteHeaderHeight) {
    // when scrolling down, pull up site header
    siteHeader.removeClass("is-down").addClass("is-up");
  } else {
    // when scrolling up, bring down site header
    if (st + $(window).height() < $(document).height()) {
      siteHeader.removeClass("is-up").addClass("is-down");
    }
  }
  lastScrollTop = st;
}
// add down class to site header
siteHeader.addClass("is-down");
// set interval so function doesn"t run continously
setInterval(function() {
  if (didScroll) {
    hasScrolled();
    didScroll = false;
  }
}, 250);
// on page scroll, run function
$(window).on("scroll", function(event) {
  didScroll = true;
});