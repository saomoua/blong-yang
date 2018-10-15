'use strict';

var mainContents = $(".main-contents"),
  siteHeader = $(".site-header"),
  siteHeaderHeight = $(".site-header").outerHeight();

function siteNav() {
  $('.menu-label').on("click", function(e) {
    e.preventDefault();
    $(this).next('.menu-lvl-2').addClass('menu-active').fadeIn();
  });
}

function pushMainContents() {
  mainContents.css({
    "margin-top": siteHeaderHeight
  })
}

pushMainContents();
siteNav();

$(window).on("resize", function() {
  pushMainContents();
  siteNav();
});