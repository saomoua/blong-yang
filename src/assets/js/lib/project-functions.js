'use strict';

var mainContents = $(".main-contents"),
  siteHeader = $(".site-header"),
  siteHeaderHeight = $(".site-header").outerHeight();

function pushMainContents() {
  mainContents.css({
    "margin-top": siteHeaderHeight
  })
}

pushMainContents();
$(window).on("resize", function() {
  pushMainContents();
});