'use strict';

var mainContents = $(".main-contents"),
  siteHeader = $(".site-header"),
  siteHeaderHeight = $(".site-header").outerHeight();

function siteNav() {
  $('.menu-label').unbind().on("click", function (e) {
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

$(window).on("resize", function () {
  pushMainContents();
  siteNav();
});

$('html').click(function () {
  if ($(window).width() >= 1024) {
    // close menu when clicking anywhere outside on large screens
    // $('li.has-children').find('.svg').removeClass('icon-rotated').find('.menu-lvl-2').removeClass('menu-active').fadeOut();
  } else {
    // close menu when clicking anywhere outside on small screens
    $('.site-nav-offcanvas').removeClass('is-open');
    $('.js-off-canvas-overlay').removeClass('is-visible');
  }
});