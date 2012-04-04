(function($) {

  var default_options = {
    grid_size: 24,
    grid_offset_x: -12,
    grid_offset_y: -12,
    animate_on_resize: false,
    resize_timer_resolution: 70,
    background_image_url: null
  };
  var options = default_options;

  var BG_ORIGINAL_WIDTH = -1;
  var BG_ORIGINAL_HEIGHT = -1;
  var HAS_BGIMAGE = false;
  var resizeTimer = null;

  var snapMainContent = function(animate) {
    if(typeof animate === 'undefined') {
      animate = false;
    }
    // qdr-maincontent should be centered as best as possible
    var mainWidth = $('#qdr-maincontent').width();
    var mainHeight = $('#qdr-maincontent').height();
    var offset = $('#qdr-maincontent').offset();
    var center = {
      x: ($('#qdr-viewport').width() / 2),
      y: ($('#qdr-viewport').height() / 2)
    };
    var nearestCorner = getNearestGridCorner((center.x - (mainWidth / 2)), (center.y - (mainHeight / 2)));
    $('#qdr-maincontent').css('position', 'relative');
    if(animate) {
      $('#qdr-maincontent').animate({left: nearestCorner.x}, 300);
      if(resizeTimer !== null) {
        clearTimeout(resizeTimer);
        resizeTimer = null;
      }
    } else {
      $('#qdr-maincontent').css('top', -1 * options.grid_offset_x + 'px');
      $('#qdr-maincontent').css('left', nearestCorner.x);
    }
  };

  var snapBackgroundImage = function() {
    var viewportAR = $(window).width() / $(window).height();
    var bgImageAR = BG_ORIGINAL_WIDTH / BG_ORIGINAL_HEIGHT;
    // fix the width if:
    //  1. width of window is greater than image width
    // fix the height if:
    //  2. height of window is greater than image height
    if( viewportAR > bgImageAR ) {
      $('#qdr-fakebackground').width($(window).width() + 'px');
      $('#qdr-fakebackground').css('height', 'auto');
    } else {
      $('#qdr-fakebackground').height($(window).height() + 'px');
      $('#qdr-fakebackground').css('width', 'auto');
    }
    if( $(window).width() > BG_ORIGINAL_WIDTH ) {
      $('#qdr-fakebackground').width($(window).width() + 'px');
    }
    if( $(window).height() > BG_ORIGINAL_HEIGHT ) {
      $('#qdr-fakebackground').height($(window).height() + 'px');
    }
  };

  var getMainCoordinates = function() {
    var top = 0;
    var left = 0;
    if(parseInt($('#qdr-maincontent').css('top'))) {
      top = parseInt($('#qdr-maincontent').css('top'));
    } else {
      top = $('#qdr-maincontent').offset().top;
    }
    if(parseInt($('#qdr-maincontent').css('left'))) {
      left = parseInt($('#qdr-maincontent').css('top'));
    } else {
      left = $('#qdr-maincontent').offset().left;
    }
    return { x: left, y: top };
  };

  var getBackgroundImageSize = function() {
    BG_ORIGINAL_WIDTH  = $('#qdr-backgroundsize').width();
    BG_ORIGINAL_HEIGHT = $('#qdr-backgroundsize').height();
  };

  var getNearestGridCorner = function(x,y) {
    // snaps to "nearest" center on grid
    var closestIntersection_x = Math.round((x - options.grid_offset_x) / options.grid_size);
    var closestIntersection_y = Math.floor((y - options.grid_offset_y) / options.grid_size) - 1;
    var nearest_x = options.grid_size * (closestIntersection_x) + options.grid_offset_x;
    var nearest_y = options.grid_size * (closestIntersection_y) + options.grid_offset_y;
    return { x: nearest_x, y: nearest_y };
  };

  var setInternalGridHeight = function() {
    var mainContent_height = $('#qdr-maincontent').height();
    var window_height = $(window).height();
    $('#qdr-gridinternal').height(Math.max(mainContent_height, window_height) + 'px');
  };

  var viewportSize = function() {
    return {
        x: $(window).width(),
        y: $(window).height()
    };
  };

  var injectBackground = function() {
    $('#qdr-grid').before($('<img id="qdr-backgroundsize" src="' + options.background_image_url + '">'));
    $('#qdr-grid').before($('<img id="qdr-fakebackground" src="' + options.background_image_url + '">'));
    getBackgroundImageSize();
  };

  var evtResize = function(e) {
    setInternalGridHeight();
    if(HAS_BGIMAGE) { snapBackgroundImage(); }
    resizeTimer = setTimeout(function() {
      snapMainContent(options.animate_on_resize);
    }, options.resize_timer_resolution );
  };

  var evtLoad = function(e) {
    snapMainContent();
    setInternalGridHeight();
    if(HAS_BGIMAGE) { snapBackgroundImage(); }
  };

  var evtReady = function(e) {
    $('body').addClass('js-on');
    setInternalGridHeight();
    snapMainContent();
    if(HAS_BGIMAGE) { injectBackground(); }
  };

  $.quadrille = function(opts) {
    options = $.extend({}, default_options, opts);
    if( options.background_image_url !== null ) {
      HAS_BGIMAGE = true;
    }
    $(window).resize(evtResize);
    $(window).load(evtLoad);
    $(document).ready(evtReady);
  };

})(jQuery);
