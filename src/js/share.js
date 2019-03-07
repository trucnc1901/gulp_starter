let maxHeightArray = [],
  $window,
  winWidth,
  widthFlg,

  heightTemp,
  winHeight,

  $global_nav,
  length;

$(() => {
  $window = $(window);
  winWidth = $window.width();
  widthFlg = (winWidth > 767) ? false : true;

  setTimeout(function() {
    winHeight = $window.height()
    heightTemp = $('.js-fixed').height();
    socialFixed();
  }, 1000);

  $global_nav = $('.global_nav');
  $menuButton = $('.btn_menu');
  $overlay = $('.overlay');

  $('.global_nav_anchor, .global_nav_child_item a').on('click', function(e) {
    location.reload();
  })
  scrollHandle();
  removeHoverCSSRule();
  menuButton();
  smoothScroll();
  
  $window.on('resize', function () {
    winWidth = $window.width();
    widthFlg = (winWidth > 767) ? false : true;
    if(winWidth < 767) {
      var container_width = $('.footer_facebook_plugin').width();
      $('.footer_facebook_plugin_wrapper').html('<div class="fb-page" data-href="https://www.facebook.com/beauteashop/" data-tabs="timeline" data-width="' + container_width + '" data-height="300" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="false"><blockquote class="fb-xfbml-parse-ignore" cite="https://www.facebook.com/beauteashop/"><a href="https://www.facebook.com/beauteashop/"> </a></blockquote></div>');
      FB.XFBML.parse();
    } else {
      $('.footer_facebook_plugin_wrapper').html('<div class="fb-page" data-href="https://www.facebook.com/beauteashop/" data-tabs="timeline" data-width="400" data-height="300" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="false"><blockquote class="fb-xfbml-parse-ignore" cite="https://www.facebook.com/beauteashop/"><a href="https://www.facebook.com/beauteashop/"> </a></blockquote></div>');
      FB.XFBML.parse();
    }
  });
});

// --------------------------------------
//  Fixed
// --------------------------------------
function socialFixed() {
  $('.nav_local, .contact_pos')
    .css({
      'bottom': (winHeight - heightTemp - 60)
    })
    .addClass('show');
  $window.on('scroll', function () {
    var h = $(this).scrollTop();
    var p = $('.main_content').innerHeight() - $('.main_footer').height() - 70;
    if (h >= p) {
      $('.contact_pos, .nav_local').addClass('o-fixed');
    } else {
      $('.contact_pos, .nav_local').removeClass('o-fixed');
    }
  })
}

// --------------------------------------
//  Resize Logo and Button menu when scroll
// --------------------------------------
function scrollHandle() {
  var headerLeft = $('.header_logo');
  var headerRight = $('.btn_menu_bg');
  var headerPattern = $('.header_pattern');
  var sticky = 70;
  $(window).on('scroll', function () {
    if (!widthFlg) {
      if ($(this).scrollTop() > sticky) {
        headerLeft.addClass('is-scroll');
        headerRight.addClass('is-scroll');
        headerPattern.css({
          'opacity': '0',
          'visibility': 'hidden'
        })
      } else {
        headerLeft.removeClass('is-scroll');
        headerRight.removeClass('is-scroll');
        headerPattern.css({
          'opacity': '1',
          'visibility': 'visible'
        })
      }
    } else {
      return false;
    }
  })
}

// --------------------------------------
//  Set Width Facebook Plugin
// --------------------------------------

function facebookPlugin() {
  var widthBox = $('.footer_facebook_plugin').width();
  winWidth = $window.width();
  widthFlg = (winWidth > 767) ? false : true;
  $('.fb-page').attr('data-width', widthBox)

  $window.trigger('resize');
}
// --------------------------------------
//  button menu
// --------------------------------------
function menuButton() {
  $menuButton.on('click tap', function (e) {
    e.preventDefault();
    $(this).stop()
      .toggleClass('open')
      .attr('aria-pressed', 'true')
      .parent().css('background', 'none');
    if ($(this).hasClass('btn_menu_push')) {
      // menuPull();
    } else {
      if ($(this).hasClass('open')) {
        if ($global_nav.hasClass('global_nav_right')) {
          $('.global_nav_right')
            .addClass('show')
          // $('html, body').css({
          //   'overflow': 'hidden',
          // });
          setTimeout(function () {
            $('.global_nav_item').each(function (i, el) {
              setTimeout(function () {
                $(el).addClass('o-visible')
              }, i * 70)
            });
          }, 300);
          $overlay.addClass('o-visible')
        } else {
          $global_nav.closest('.header').addClass('header_show_global_nav');
        }
      } else {
        $(this)
          .attr('aria-pressed', 'false')
          .parent().removeAttr('style')
          .closest('.header').removeClass('header_show_global_nav');
        $('.global_nav_right')
          .removeClass('show')
          .find('.global_nav_item').removeClass('o-visible')
        // $('html, body').removeAttr('style');
        $overlay.removeClass('o-visible');
      }
    }
  });
  closeMenu()
}
// --------------------------------------
//  Close Menu
// --------------------------------------
function closeMenu() {
  $overlay.on('click', function (e) {
    e.preventDefault();
    $('.btn_menu').attr('aria-pressed', 'false');
    $overlay.removeClass('o-visible');
    $('.global_nav_push, .global_nav_right').removeClass('show');
    $('body')
      .removeClass('body_push')
      .parent('html').removeAttr('style');
    $filter.animate({
      'right': '-100%'
    });
  });
}
// --------------------------------------
//  Menu Pull
// --------------------------------------
function menuPull() {
  if ($('.btn_menu').hasClass('open')) {
    $('.global_nav_push').addClass('show');
    $('.overlay').fadeIn(300);
    $('body')
      .addClass('body_push')
      .parent('html').css('overflow', 'hidden');
  } else {
    $('.btn_menu').attr('aria-pressed', 'false');
    $('.overlay').removeAttr('style');
    $('.global_nav_push').removeClass('show');
    $('body')
      .removeClass('body_push')
      .parent('html').removeAttr('style');
  }
}

// --------------------------------------
//  Smooth Scroll
// --------------------------------------
function smoothScroll() {
  $('a[href^="#"]').on("click", function (e) {
    e.preventDefault();
    var h = $(this).attr("href");
    var t = $(h == "#" || h === "" ? 'body' : h);
    var p = t.offset().top;
    $('html,body').animate({
      scrollTop: p
    }, 500);
    return false;
  });
}

// --------------------------------------
//  Remove Hover on SP
// --------------------------------------

function removeHoverCSSRule() {
  if ('createTouch' in document) {
    try {
      var ignore = /:hover/;
      for (var i = 0; i < document.styleSheets.length; i++) {
        var sheet = document.styleSheets[i];
        if (!sheet.cssRules) {
          continue;
        }
        for (var j = sheet.cssRules.length - 1; j >= 0; j--) {
          var rule = sheet.cssRules[j];
          if (rule.type === CSSRule.STYLE_RULE && ignore.test(rule.selectorText)) {
            sheet.deleteRule(j);
          }
        }
      }
    } catch (e) {}
  }
}