'use strict';

var mainContents = $(".main-contents"),
  siteHeader = $(".site-header"),
  siteHeaderHeight = $(".site-header").outerHeight();

function siteNav() {
  $('.menu-label').unbind().on("click", function(e) {
    e.preventDefault();
    $(this).find('.svg').toggleClass('icon-rotated');
    $(this).next('.menu-lvl-2').toggleClass('menu-active').fadeToggle();
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