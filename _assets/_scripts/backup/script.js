/**
 *
 * Begin the javascript constructor
 *
 * @author    Sebastian Inman @sebastian_inman, inherited by Barrett Chamberlain
 * @link      http://www.highwayproducts.com
 * @license   http://www.highwayproducts.com/docs/license.txt
 * @copyright Highway Products Inc. 2014
 *
 */

// define default variables
var refreshingList = 0;
// set the default base url
var url = window.location.href.replace(window.location.hash,'');
// get the url directories
var loc = window.location.pathname.split('/');
// get the current url directory
var dir = loc[loc.length-2];

// check if there are lazy images to load
if( $( '.lazy' ).length > 0 ) {
  // lazy load the images!
  // hide the images first then check them
  $( '.lazy' ).hide().each( function( i ) {
    // add loading gif to each image
    $( this ).before( "<div class='lzyld' id='lzy-" + i + "'/>" );
  } );
} else {
  // no images to lazy load
}

  //use lazyload plugin to delay image loading
$(function() {
    $("img.delayLoad").lazyload({
        event : "sporty"
    });
});

$(window).bind("load", function() {
    var timeout = setTimeout(function() { $("img.delayLoad").trigger("sporty") }, 0);
}); 


/**
 *
 * Scale the supplied element to the provided aspect ratio
 *
 * @param string $ratio : the supplied aspect ratio to size the element [16:9 | 4:3 | 2:1 | etc.]
 * @param string $elem  : the name of the element to resize [id | class]
 *
 */

function scaleRatio( nums, elem ) {
  var selector  = $( elem ),
      elemw = selector.width(),
      // split the ratio into seperate numbers
      ratio = nums.split( ':' ),
      // get ratio base height from the elements width
      elemh = Math.floor( elemw * ( ratio[1] / ratio[0] ) );
  // set the elements new height
  selector.css( 'height',elemh );
}




/**
 *
 * Get URL variables from current url e.g. www.highwayproducts.com?id=1632&key=999
 * @return vars[1] = 1632, vars[2] = 999
 *
 */

function getUrlVars() {
  // create empty array to hold the variables
  var vars = [], hash;
  // split the url at every '?' and '&' into variables
  var hashes = window.location.href.slice( window.location.href.indexOf( '?' ) + 1 ).split( '&' );
  // add each variable into the array
  for( var i = 0; i < hashes.length; i++ ) {
      hash = hashes[i].split( '=' );
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
  }
  // return the variables
  return vars;
}




/**
 *
 * Set the current product being viewed in the product navigation and select the parent menu
 * @param string $selector : the selector of the current product being viewed
 * @param string $parent   : the parent selector of the current product being viewed
 *
 */

function currentProduct( selector, parent ) {
  // make every product item inactive by default
  $( '.list-link, .list-toggle, .list' ).removeClass( 'active' );
  $( '.list.packages' ).addClass( 'active' );
  // make the current item active and open the category that it's contained inside of
  $( '.list-link[data-product="' + selector + '"], .list-toggle[data-category="' + parent + '"], .list[data-list="' + parent + '"]' ).addClass( 'active' );
}




/**
 *
 * Handle the toggling of product menu categories
 *
 */

function menuTabs() {
  $( '.list-toggle' ).click( function() {
    // make every tab inactive
    $( '.list-toggle' ).removeClass( 'active' );
    // make the clicked tab active
    $( this ).addClass( 'active' );
    // get the selector of the clicked tab
    var menu = $( this ).attr( 'id' ).replace( 'toggle-','' );
    // console.log( 'List Products: ' + menu.replace( '-', ' ' ).toUpperCase() );
    // make every list inactive
    $( '.list' ).each( function() {
      if( $( this ).hasClass( 'packages' ) ) {
        // don't hide the package lists
        $( this ).addClass( 'active' );
      } else {
        $( this ).removeClass( 'active' );
        // make the clicked list active
        $( '#list-' + menu ).addClass( 'active' );
      }
    } );
  } );
}


$('.items-block').on('click', function(event) {
  if($(this).hasClass('item')){

  }else{
    event.preventDefault();
    var items = $(this).attr('id');
    $('.items-listings#'+items).addClass('active');
  }
});

$('.hide-listings').on('click', function(event){
  event.preventDefault();
  $('.items-listings').removeClass('active');
});


/**
 *
 * Build the main image sliders. Handle controls and id setting
 *
 */

function slider() {
  var current_slide = 1;
  var slide_percent = 0;
  if($('.slide').length > 1){
    var slide_timer = setInterval(autoSlide, 5000);
  }

  // prevent middle mouse click on slider
  $( '.slider-container' ).mousedown( function( event ) {
    if( event.which === 2 ) { event.preventDefault(); }
  } );

  /**
   *
   * Handle the sliding between slides
   * @param number $num : id number of the slide we will slide to
   *
   */

  function slideTo( num ) {
    // just a small delay before starting the sliding animation
    window.setTimeout( function() {
        // get the position of this slide so we can move to it
        var slide = $( '.slide[data-slide=' + num + ']' ).position().left;
        // move to the the position of this slide
        $( '.slider-container' ).animate( {scrollLeft: slide}, 400 );
        $('.slides-elapsed').css('width', '-20%');
    }, 300 ); }

  // append the slide selectors to the slider


  function autoSlide() {
    var num_slides = $('.selector').length;
    current_slide++;
    if(current_slide > num_slides){
      current_slide = 1;
    }
    slideTo(current_slide);
    $('.selector').removeClass('active');
    $('.selector[data-slide='+current_slide+']').addClass('active');
  }

  $('.selectors-container').append("<div class='slides-timer'><div class='slides-elapsed'></div></div>");
  if( $(window).width() > 700 ){
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/2+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/2+"px'><span class='fa fa-chevron-right'></span></div>");
  }
  if( $(window).width() < 700 || $(window).height() < 561){
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(".slide").height()+"px; height:"+$(".slide").height()+"px;'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(".slide").height()+"px; height:"+$(".slide").height()+"px;'><span class='fa fa-chevron-right'></span></div>");
  }
  $( window ).resize(function() {
    $('.slide-ctrl').remove();
   if( $(window).width() > 700 ){
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/2+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/2+"px'><span class='fa fa-chevron-right'></span></div>");
    slideTo(current_slide);
  }else{
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(".slide").height()+"px; height:"+$(".slide").height()+"px;'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(".slide").height()+"px; height:"+$(".slide").height()+"px;'><span class='fa fa-chevron-right'></span></div>");
    slideTo(current_slide);
  }
   if( $(window).width() < 700 || $(window).height() < 561){
    $('.slide-ctrl').remove();
     $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(".slide").height()+"px; height:"+$(".slide").height()+"px;'><span class='fa fa-chevron-left'></span></div>");
     $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(".slide").height()+"px; height:"+$(".slide").height()+"px;'><span class='fa fa-chevron-right'></span></div>");
     slideTo(current_slide);
   }
  $(".slide-ctrl").click(function() {
    var num_slides = $('.selector').length;
    clearInterval(slide_timer);
    if($(this).hasClass("slide-left")){
      current_slide--;
      if(current_slide < 1){
        current_slide = num_slides;
      }
    }
    if($(this).hasClass("slide-right")){
      current_slide++;
      if(current_slide > num_slides){
        current_slide = 1;
      }
    }
    slideTo( current_slide );
    $( '.selector, .thumb-selector' ).removeClass( 'active' );
    $(".selector[data-slide='"+current_slide+"']").addClass('active');
  });

  });

  $(".slide-ctrl").click(function() {
    var num_slides = $('.selector').length;
    clearInterval(slide_timer);
    if($(this).hasClass("slide-left")){
      current_slide--;
      if(current_slide < 1){
        current_slide = num_slides;
      }
    }
    if($(this).hasClass("slide-right")){
      current_slide++;
      if(current_slide > num_slides){
        current_slide = 1;
      }
    }
    slideTo( current_slide );
    $( '.selector, .thumb-selector' ).removeClass( 'active' );
    $(".selector[data-slide='"+current_slide+"']").addClass('active');
  });

  // select the first selector by default
  $( '.selector, .thumb-selector' ).first().addClass( 'active' );
  // selector click function - toggle class and slide to selector
  $( '.selector, .thumb-selector' ).click( function() {
    clearInterval(slide_timer);
    // get the id of the clicked selector
    var slide = $( this ).attr( 'data-slide' );
    // remove active class from all selectors
    $( '.selector, .thumb-selector' ).removeClass( 'active' );
    // add active class to the clicked selector
    $( this ).addClass( 'active' );
    // move to the clicked slide
    slideTo( slide );
    current_slide = slide;
  } );
}




/**
 *
 * Set the height of the main slider based on its width and the height of the header
 *
 */

function sizeSlider() {
  // get the height of the slider
  var sliderh = $( '.slider-container' ).height(),
      // get the height of the page header
      headerh = $( 'header' ).height();
  // set the new height of the slider: old slider height minus height of header
  $( '.slider-container' ).css( 'height' ,  (sliderh - headerh ) );
}




/**
 *
 * Randomize the order of items in a supplied array
 * @param array $o : the supplied array to be shuffled
 # @return         : return the newly shuffled array
 *
 */

function shuffle( o ) {
  for( var j, x, i = o.length; i; j = parseInt( Math.random() * i ), x = o[--i], o[i] = o[j], o[j] = x );
  return o;
};




/**
 *
 * Create a randomized list of products
 *
 */

function randomList() {
  // create an array to hold the products
  list = new Array();
  // create the counter
  var i;
  // perform check on each product
  $( '.related-product' ).each( function() {
      // add each product into the array
      list.push( $( this ).html() );
  } );
  // shuffle the array
  shuffle(list);
  // empty the products container when refreshed
  $( '.related-products .refresh' ).empty();
  // perform check for each item in the array
  for ( i = 0; i < list.length; i++ ) {
      // append the array items in the new order
      $( '.related-products .refresh' ).append( '<li class="related-product" style="display:none;">' + list[i] + '</li>' );
  }
}




/**
 *
 * Handle random lists being reshuffled before displaying them again
 *
 */

function refreshList() {
  $( '.refresh-list' ).on( 'click', function() {
      // get the totaly number of products in the list
      var numList = $( '.related-product' ).length;
      // check if the list is currently being refreshed
      if( refreshingList === 0 ) {
      // list is not being refreshed right now
      // set it to being refreshed so it can't be refreshed again yet
      refreshingList = 1;
      // perform check on each product in reverse order - start a counter
      $( $( '.related-product' ).get().reverse() ).each( function( i ) {
          // fadeout the product
          $( this ).fadeOut( 300, function() {
              if( i + 1 === numList ) {
                // randomize the list
                randomList();
                // perform check on each product after list is shuffled - start new counter
                $( '.related-product' ).each( function( i ) {
                  // fade the products back in
                  $( this ).fadeIn( 300, function() {
                      // all products are faded in
                      if(i+1 === numList){
                        // reset the list - can be refreshed again
                        refreshingList = 0;
                      }
                  } );
                } );
              }
          } );
      } );
      } else {
        /* waiting for content to refresh - can't shuffle yet */
      }
  } );
}




/**
 *
 * Handle FAQ questions - prevent link from being clicked
 * change the url to the questions 'data-question' and load content
 *
 */

function faQuestions() {
  $( '.faq-question' ).click( function( event ) {
    // get the questions url variable
    var answer = $( this ).attr( 'data-question' );
    // get the height of the answer content before changing it
    var lastHeight = $( '.faq-answers' ).height();
    // check if browser allows history pushstate changes
    if( history.pushState ) {
      // browser allows pushstate changes - prevent default links
      event.preventDefault();
      // change the url to the clicked question
      history.pushState( null, null, answer );
      // remove active class from all questions
      $( '.faq-question' ).removeClass( 'active' );
      // add active class to the clicked question
      $( this ).addClass( 'active' );
      // set the height of the answer container while it loads the new answers
      $( '.faq-answers' ).css( 'height', lastHeight ).empty().addClass( 'hidden' ).load( 'question.php?q=' + answer, function() {
        // new answer has loaded - slight delay before showing it again
        window.setTimeout( function() {
          // show the new answers
          $( '.faq-answers' ).removeClass( 'hidden' ).css( 'height','auto' );
          $( '.current-page' ).empty().append( answer );
          if( $('.current-page').length > 0 ) {
            $( '.current-page' ).empty().append( answer );
          } else {
            $( '.breadcrumbs > li:last-child' ).wrapInner( "<a href='" + loc[0] + "'></a>" );
            $( '.breadcrumbs > li:last-child > a' ).append( "<i class='fa fa-angle-right'></i>" );
            $( '.breadcrumbs' ).append("<li class='current-page'>" + answer + "</li>");
          }
          // console.log( 'Support topic loaded: ' + answer );
        }, 500 );
      } );
    } else {
      // browser does not allow pushstate changes - click the link like normal
    }
  } );
}




/**
 *
 * Handle the opening of a question based on the url of the page you're on
 * @param string $question : the selector for the current question
 *
 */

function openQuestion( question ) {
  ( function fn() {
    fn.now = +new Date;
    $( window ).bind( 'load', function() {
      if ( +new Date - fn.now < 500 ) setTimeout( fn, 500 );
      // the page is loaded with cache
      $( document ).ready( function() {
        // click the current question to load it
        $( '.faq-question[data-question="' + question + '"]').click();
        if( $('.current-page').length > 0 ) {
          $( '.current-page' ).empty().append( question );
        } else {
          $( '.breadcrumbs' ).append("<li class='current-page'>" + question + "</li>");
        }
        // console.log( 'Support topic loaded: ' + question );
      } );
    } );
  } )();
}



$('.get-quote-plox, .fixed-quote-button, .m_quote').on('click', function(event){
  event.preventDefault();
  $('.get-quote-wrapper').css('display','block');
});
$('.close-quote').on('click', function(){
  $('.get-quote-wrapper').css('display','none');
});



/**
 *
 * Handle the lightbox effect for clicking image thumbnails
 * @param string $question : the selector for the current question
 *
 */

$.fn.lightbox = function( options ) {
  // create or load an array of option values
  options = options || {};
  // create an array of deault options
  var defaults = {
    key_controls   : true, // allow the use of keyboard controls?
    show_alts      : true // use image alt tags as descriptions?
  }
  // add each default option into the options array
  for( var i in options ) {
    defaults[i] = options[i];
  }
  options = defaults;
  // handle click function for the lightbox images
  $( this ).click( function() {
    // get the images id number
    var img_id       = $( this ).attr( 'data-id' );
    // get the original source of the thumbmnail image
    var img_source   = $( this ).attr( 'src' );
    // get the source for the full image
    var img_d_source = $( this ).attr( 'data-source' );
    // get the name of the group the image is inside of
    var img_group    = $( this ).attr( 'data-group' );
    // check to see if a lightbox is open or not
    if( $( '.lb-shadow' ).length > 0 ) {
      // there is a lightbox open already
    } else {
      //log gallery information
      // console.log( 'Loading Gallery "' + img_group + '"' );
      // console.log('Gallery "' + img_group + '" : load image ' + img_id + ' ( ' + img_d_source + ' )');
      // no lightbox open - we can make one
      $( 'body' ).append("<div class='lb-shadow'/>");
      // create variable for the lightbox container
      var lb           = $('.lb-shadow');
      // create an empty array for the groups images
      var group_images = [];
      // fade in the gallery container
      lb.delay(250).fadeIn(250);
      // perform a check on each image in this gallery
      $( '.lb[data-group="' + img_group + '"]' ).each( function( i ) {
        var group_img_alt    = $( this ).attr( 'alt' );
        var group_img_source = $( this ).attr( 'src' );
        var group_d_source   = $( this ).attr( 'data-source' );
        var group_img_array  = {
          id    : i+1,
          alt   : group_img_alt,
          o_src : group_img_source,
          d_src : group_d_source
        }
        group_images[i + 1] = group_img_array;
      } );

      var group_total   = group_images.length - 1;
      var move_to = img_id;

      // add the lightbox controls
      lb.append( "<div class='lb-container'><div class='cogContainer'><i class='fa fa-cog fa-spin'></i></div><img class='lb-img' data-id='" + img_id + "' src='" + img_d_source + "'/></div>" );
      lb.append( "<div class='lb-ctrl img-exit'><i class='fa fa-times' data-dir='exit'></i></div>" );
      lb.append( "<div class='lb-ctrl img-prev'><i class='fa fa-chevron-left' data-dir='prev'></i></div>" );
      lb.append( "<div class='lb-ctrl img-next'><i class='fa fa-chevron-right' data-dir='next'></i></div>" );

      //once image in lightbox has loaded, remove throbber and show image / label
      $( '.lb-img' ).load(function() {
            console.log(group_images[img_id]['alt']);
            console.log(group_images[img_id]['o_src']);
            //img_source
      $( 'i.fa.fa-cog.fa-spin' ).css( 'display', 'none' );
      $( '.lb-img' ).css( 'display', 'block' );
      $( 'label.lb-lbl' ).css( 'display', 'block' );
      
      });
      var lb_img = $( '.lb-container' );
      var lb_ctrl = $( '.lb-ctrl > i' );

      if( options['show_alts'] == true ) {
        lb_img.append( "<label class='lb-lbl'>" + group_images[img_id]['alt'] + "</label>" );
        var lb_lbl = $( '.lb-lbl' );
      }

      function prevImg() {
        $( '.lb-img' ).css( 'display', 'none' );
        $( 'label.lb-lbl' ).css( 'display', 'none' );
        $( 'i.fa.fa-cog.fa-spin' ).css( 'display', 'block' );
        move_to--;
        if( move_to < 1 ) {
          move_to = group_total;
        }
        lb_img.find('img').attr( 'src', group_images[move_to]['d_src'] );
        if( options['show_alts'] == true ) {
          lb_lbl.empty().append( group_images[move_to]['alt'] );
        }
        $( '.lb-img' ).load(function() {
          $( 'i.fa.fa-cog.fa-spin' ).css( 'display', 'none' );
          $( '.lb-img' ).css( 'display', 'block' );
          $( 'label.lb-lbl' ).css( 'display', 'block' );
        });
        // console.log('Gallery "' + img_group + '" : load image ' + move_to + ' ( ' + group_images[move_to]['d_src'] + ' )');
      }

      function nextImg() {
        $( '.lb-img' ).css( 'display', 'none' );
        $( 'label.lb-lbl' ).css( 'display', 'none' );
        $( 'i.fa.fa-cog.fa-spin' ).css( 'display', 'block' );
        move_to++;
        if( move_to > group_total ) {
          move_to = 1;
        }
        lb_img.find('img').attr( 'src', group_images[move_to]['d_src'] );
        if( options['show_alts'] == true ) {
          lb_lbl.empty().append( group_images[move_to]['alt'] );
        }
        $( '.lb-img' ).load(function() {
          $( 'i.fa.fa-cog.fa-spin' ).css( 'display', 'none' );
          $( '.lb-img' ).css( 'display', 'block' );
          $( 'label.lb-lbl' ).css( 'display', 'block' );
        });
        // console.log('Gallery "' + img_group + '" : load image ' + move_to + ' ( ' + group_images[move_to]['d_src'] + ' )');
      }
      function exitImg() {
        lb_img.fadeOut( 300, function() {
          lb.fadeOut( 300, function() {
            lb.remove();
          } );
        } );
      }

      lb_ctrl.click( function() {
        var direction = $( this ).attr( 'data-dir' );
        if( direction == 'prev' ) {
          prevImg();
        }
        if( direction == 'next' ) {
          nextImg();
        }
        if( direction == 'exit' ) {
          exitImg();
        }
      } );

      if( options['key_controls'] == true ) {
        var controls = {
          prev : '37',
          next : '39',
          exit : '27'
        }
        $( 'body' ).keyup( function( event ) {
          var key = event.keyCode || event.which;
          if( key == controls['prev'] ) {
            prevImg();
          }
          if( key == controls['next'] ) {
            nextImg();
          }
          if( key == controls['exit'] ) {
            exitImg();
          }
        } );
      }
    }
  } );
}




/**
 *
 * Handle the large header search field - toggle visiblility and
 * determine visiblity and sorting of search results
 *
 */

function searchClick(){
  $( '.nav-link' ).click( function( event ) {
    // check if the navlink clicked is the search button
    if( $( this ).hasClass( 'search' ) ) {
      // it's the search button - toggle the search form
      // fade out the nav links to make room for the search form
      $( '.nav-links.main' ).fadeOut( 250, function() {
        // fade in the search form
        $( '.nav-search' ).fadeIn( 250, function() {
          // focus on the input when it loads
          $( this ).find( 'input' ).focus();
          // perform check every time a letter is typed into the form
          $( '.nav-search input' ).keyup( function() {
            // get the number of characters in the input
            var carCount = $( this ).val().length;
            // check how many characters have been typed
            if(carCount > 0){
              // there is at least one character - submit the form
              $('.nav-search').submit();
            } else {
              // nothing has been typed - do nothing
            }
          } );
          // let's submit the search form
          $( '.nav-search' ).submit( function( event ) {
            // prevent default form submission
            event.preventDefault();
            // get the inputs value and seperate words with a dash
            var query = $( this ).find( 'input' ).val().replace( /\s+/g, '-' ).toLowerCase();
            // fade in the results container
            $( '.result-load' ).fadeIn( 250 );
            // load the results into the container
            $( '.search-results .results' ).load( '../_includes/search.inc.php?p=' + query + '', function() {
              $( '.result-load' ).fadeOut( 250 );
              // create an array for duplicate results
              var seen = {};
              // run a check on each search result
              $( '.search-result' ).each( function() {
                // get the id of each result
                var id = $( this ).attr( 'data-product' );
                // get the level of likeness of each result
                var likeness = $( this ).attr( 'data-likeness' );
                // check if the result has already been cataloged
                if( seen[id] ) {
                  // already cataloged - remove it
                  $(this).remove();
                } else {
                  // hasn't been cataloged yet - catalog it
                  seen[id] = true;
                }
              } );
              // get total number of results returned
              var numResults = $( '.search-result' ).length;
              // emty the results list and replace it with the truncated results
              $( '.result-count' ).empty().append( numResults );
              // fade the number of results in
              $( '.result-count' ).fadeIn( 250 );
              // check how many results have been returned
              if( numResults > 0 ) {
                // there's at least 1 result - show it
                $( '.search-results' ).fadeIn( 250 );
              } else {
                // there's no results - hide them forever
                $( '.search-results' ).fadeOut( 250 );
              }
              // append a label for related search results
              $( '.search-result.related' ).first().before( "<div class='also-interested'>Products You may also be interested in:</div>" );
            } );
          } );
          // handle the closing of the search form
          $( '.close-nav-search' ).click( function() {
            // fade out the search form
            $( '.nav-search' ).fadeOut( 250, function() {
              // reset the value of the search input
              $( this ).find( 'input' ).val( '' );
              // fade the navlinks back in
              $( '.nav-links.main' ).fadeIn( 250, function() {
                // empty the search results
                $( '.search-results .results' ).empty();
                // hide the results container
                $( '.search-results' ).hide();
              } );
            } );
          } );
        } );
      } );
    } else {
      // just a normal navlink was clicked - don't open search form
    }
  } );
}




/**
 *
 * Perform cache check and renew the entire page
 * on each load - then perform functions
 *
 */

function testimonials() {
  // get total number of testimonials displayed
  var count = $( '.testimonial' ).length;
  // run the rest of the function, only if testimonials exist
  if( count > 0 ) {
    // get the id of the active testimonial
    var active = $( '.testimonial.active' ).attr( 'id' ).replace( 'testimonial-', '' );
    // get the height of the active testimonial
    var b_height = $( '#testimonial-' + active ).height();
    var a_height = b_height;
    $( '.testimonials' ).css( 'height', a_height );
    // handle the testimonial direction click
    $( '.tst-ctrl' ).click( function() {
      // get the direction the testimonials should move - left or right
      var direction = $( this ).attr( 'id' );
      // direction is left
      if( direction == 'left' ) {
        active--;
      }
      // direction is right
      if( direction == 'right' ) {
        active++;
      }
      if( active > count ) {
        active = 1;
      }
      if( active < 1 ) {
        active = count;
      }
      // remove active class from testimonials
      $( '.testimonial' ).removeClass( 'active' );
      // add active class to the current testimonial
      window.setTimeout( function() {
        $( '#testimonial-' + active ).addClass( 'active' );
        a_height = $( '#testimonial-' + active ).height();
        $( '.testimonials' ).animate( {height: a_height}, 300 );
      }, 500);
    } );
  } else {
    // no testimonials on the page, do nothing
  }
}




/**
 *
 * Change the global font size of copy
 * @param number $size : the selected font size
 *
 */

function makeFontSizer( size ) {
  return function() {
    // change font size to supplied size
    $( 'p' ).css( 'font-size', size + 'px' );
    // adjust the line height to the supplied font size
    $( 'p' ).css( 'line-height', ( size + 12 ) + 'px' );
    // create cookie rememebering font size after removing the cookie
    $.removeCookie('font_size', { path: '/' } );
    $.cookie( 'font_size', size, { expires: 2, path: '/' } );
    // console.log( 'Global Font Size: ' + size + 'px' );
  };
}

var size14 = makeFontSizer( 14 );
var size16 = makeFontSizer( 16 );
var size18 = makeFontSizer( 18 );

/**
 *
 * Handle menu tabs and links being clicked
 *
 */

menuTabs();

/**
 *
 * Handle refreshing of item lists
 *
 */

refreshList();

/**
 *
 * Handle the changing of FAQ questions
 *
 */

faQuestions();

/**
 *
 * Handle the main search form
 *
 */

searchClick();

/**
 *
 * Handle the pages testimonials
 *
 */

testimonials();

/**
 *
 * Handle font size functions
 *
 */

document.getElementById('size-14').onclick = size14;
document.getElementById('size-16').onclick = size16;
document.getElementById('size-18').onclick = size18;
if( $.cookie( 'font_size' ) == '14' ) {
  // change font size to supplied size
  $( 'p' ).css( 'font-size', '14px' );
  // adjust the line height to the supplied font size
  $( 'p' ).css( 'line-height', '24px' );
  // console.log( 'Global Font size: 14px' );
}
if( $.cookie( 'font_size' ) == '16' ) {
  // change font size to supplied size
  $( 'p' ).css( 'font-size', '16px' );
  // adjust the line height to the supplied font size
  $( 'p' ).css( 'line-height', '26px' );
  // console.log( 'Global Font size: 16px' );
}
if( $.cookie( 'font_size' ) == '18' ) {
  // change font size to supplied size
  $( 'p' ).css( 'font-size', '18px' );
  // adjust the line height to the supplied font size
  $( 'p' ).css( 'line-height', '28px' );
  // console.log( 'Global Font size: 18px' );
}

/**
 *
 * Scale elements to suplied ratio
 *
 */

scaleRatio( '370:210', '.player' );
scaleRatio( '2:1.5', '.side-gallery-img' );
scaleRatio( '2:1.3', '.media-container' );
scaleRatio( '16:9', '.sidemap' );
scaleRatio( '16:9', '.blockvideo' );
scaleRatio( '16:9', '.player' );
/*
if( $( window ).width() >= 1024 ) {
  scaleRatio( '16:7', '.slider-container' );
}
if( $( window ).width() <= 1024 ) {
  scaleRatio( '2:1', '.slider-container' );
}
if( $( window ).width() <= 600 ) {
  scaleRatio( '1.5:1', '.slider-container' );
}
*/


/**
 *
 * Check if a cookie exists for hiding or showing the newsletter signup forms
 * @param cookie $hide_newsletter : determines if newsletter signup forms are hidden - default is false
 *
 */

// check if the newsletter cookie exists
if( $.cookie( 'hide_newsletter' ) == 'true' ) {
  // the cookie already exists - remove the newsletter form
  $( '.newsletter-signup' ).remove();
  // console.log( 'Newsletter Signup Form Status: hidden' );
} else {
  // the cookie doesn't exist yet - show the newsletter form
  // create the cookie when the close button is clicked on the form
  // console.log( 'Newsletter Signup Form Status: visible' );
  $( '.close-newsletter' ).click( function() {
    // set the cookie - expires in 2 days accross the domain
    $.cookie( 'hide_newsletter', 'true', { expires: 2, path: '/' } );
    // fade out the newsletter form once the cookie is created
    $( '.newsletter-signup' ).fadeOut( 300, function() {
      // remove the form from the page
      $( this ).remove();
      // console.log( 'Newsletter Signup Form Status: hidden' );
    } );
  } );
}




/**
 *
 * Toggle the mobile navigation menu
 *
 */

$('.toggle-mobile-nav').click(function(){
  $(this).toggleClass('menu-visible');
  if($(this).hasClass('menu-visible')){
    $(this).html("<i class='fa fa-close'></i>");
  }else{
    $(this).html("<i class='fa fa-bars'></i>");
  }
  $('.mobile-nav').toggleClass('visible');
  $('.m_master_list_link > a, .m_sub_list > a').click(function(){
    if($(this).parent().hasClass('collapsable')){
      $(this).parent().toggleClass('toggled');
      $(this).find("span.fa").toggleClass('fa-caret-right').toggleClass('fa-caret-down');
    }
  });
});


function checkEmail(email){
  var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
  return pattern.test(email);
}

function checkPhone(phone){
  var pattern = new RegExp(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/);
  return pattern.test(phone);
}
//copy input content from site form to script-generated aweber form
var _contact_errors = [];
$.fn.awebify = function(){
  var _this = $(this);
  if(_this.length > 0){
    var _aweber = _this.attr('data-aweber');
    _this.on('change keyup', function(){
      var _val = _this.val();
      $('#'+_aweber).val(_val);
    });
  }
};
//if there was an error in submission, re-awebify form inputs
$( document ).ready(function() {
   $( ".aweber-input" ).each(function( index ) {
    var _aweber = $(this).attr('data-aweber');
    var _val = $(this).val();
      $('#'+_aweber).val(_val);
  });
});
$('.aweber-input').each(function(){
  $(this).awebify();
});
//event handler for different form submissions
$('.aweber-form').on('submit', function(event){
  event.preventDefault();
  var form = $(this);
    if(form.hasClass('contact-form')){
      $('#af-submit-image-1082506812').click();
    } 
    if(form.hasClass('newsletter-form')){
      $('#af-submit-image-718137999').click();
    } 
    //if it isn't the contact form or newsletter form
    if(!(form.hasClass('contact-form')) && !(form.hasClass('newsletter-form'))) {
      $('input[tabindex=511]').click();
    }
      });

$('.style-option').click(function(event){
  event.preventDefault();
  $('.style-option').removeClass('active');
  $(this).addClass('active');
  var name = $(this).attr('data-name');
  var desc = $(this).attr('data-description');
  $('.selected-style').addClass('hidden');
  setTimeout(function(){
    $('.selected-style').empty().html("<h2>"+name+" Style Option</h2><p>"+desc+"</p>");
    setTimeout(function(){
      $('.selected-style').removeClass('hidden');
    }, 100);
  },100);
});

$('.style-option').first().click();

if( $.cookie( 'voted_'+loc[2] ) ) {
  $('.ratings').addClass('disabled');
  $('.ratings li').removeClass('filled');
  for(var h = 0; h <= $.cookie( 'voted_'+loc[2] ); h++){
    $(".ratings li[data-star='" + h + "']").addClass('rate');
  }
}


$('.service-link').on('click', function(){
  var service = $(this).attr('data-service');
  //$( '.get-quote-wrapper' ).css( 'display', 'block' );
  $('body').append("<div class='privacy-wrapper'></div>");
  $('.privacy-wrapper').load('../../service.php', function(){

  });
});


$('.ratings li').mouseover(function(){

  var base_votes = $("span[itemprop='reviewCount']").html();
  var this_rating = $(this).attr('data-star');

  if($('.ratings').hasClass('disabled')){
    // can't vote on this product
  }else{

    // check if the visitor has voted on this product
    if( $.cookie( 'voted_'+loc[2] ) ) {
      // the cookie exits, don't allow voting
    } else {
      // the cookie doesn't exist yet
      $(this).click(function(){

        var data = [loc[2], this_rating];
        var aData = {data: JSON.stringify(data)};

        $('.ratings li').removeClass('filled');
        for(var i = 0; i <= this_rating; i++){
          $(".ratings li[data-star='" + i + "']").addClass('rate');
        }

        $.ajax({
          type: 'POST',
          url: '../../products/rate.php',
          data: aData,
          success: function(data){
            // success
            $('.ratings').addClass('disabled');
            $('.ratings li').removeClass('filled');
            for(var j = 0; j <= this_rating; j++){
              $(".ratings li[data-star='" + j + "']").addClass('rate');
            }
            $("span[itemprop='reviewCount']").html(parseInt(base_votes) + 1);
            $.cookie( 'voted_'+loc[2], this_rating, { path: '/' } );
          }
        });

      });

      $('.ratings li').removeClass('filled');
      for(var i = 0; i <= this_rating; i++){
        $(".ratings li[data-star='" + i + "']").addClass('rate');
      }

    }

  }

});

$('.ratings').mouseout(function(){
  var base_rating = $("span[itemprop='ratingValue']").html();
  if($(this).hasClass('disabled')){
    $('.ratings li').removeClass('filled');
    for(var j = 0; j <= $.cookie( 'voted_'+loc[2] ); j++){
      $(".ratings li[data-star='" + j + "']").addClass('rate');
    }
  }else{
    $('.ratings li').removeClass('rate');
    for(var j = 0; j <= base_rating; j++){
      $(".ratings li[data-star='" + j + "']").addClass('filled');
    }
  }
});


$('.feature-video').click(function(){
  var v_type = $(this).attr('data-type');
  var v_code = $(this).attr('data-code');
  if($('.lb-shadow').length > 0){
      // there is a lightbox open already
    }else{
      // no lightbox open - we can make one
      $('body').append("<div class='lb-shadow video'/>");
      var lb = $('.lb-shadow');
      lb.append( "<div class='lb-ctrl video-exit'><i class='fa fa-times' data-dir='exit'></i></div>" );
      // fade in the gallery container
      if(v_type == 'vimeo'){
        lb.append("<iframe class='video' src='//player.vimeo.com/video/" + v_code + "?title=0&amp;byline=0&amp;portrait=0&amp;color=4EA5D5&amp;autoplay=1' width='500' height='281' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>");
      }
      if(v_type == 'youtube'){
        lb.append("<iframe class='video' width='853' height='480' src='//www.youtube.com/embed/" + v_code + "?autoplay=1&rel=0' frameborder='0' allowfullscreen></iframe>");
      }
      lb.delay(250).fadeIn(250);

      function exitVideo(){
        lb.fadeOut(300, function(){
          lb.remove();
        });
      }

      $('.video-exit').click(function(){
        exitVideo();
      });

      $('body').keyup( function(event){
        var key = event.keyCode || event.which;
        if(key == 27){
          exitVideo();
        }
      });

    }

});

//control right-side sidebar display & prevent from disappearing under footer

var sub_top;
var sub_width;

//use at least one event to capture and continually update viewport metrics

$( document ).ready(function() {
   var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],viewWidth=w.innerWidth||e.clientWidth||g.clientWidth,viewHeight=w.innerHeight||e.clientHeight||g.clientHeight;
});

$(window).resize(function(){
   var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],viewWidth=w.innerWidth||e.clientWidth||g.clientWidth,viewHeight=w.innerHeight||e.clientHeight||g.clientHeight;
});

if($('.sidebar-signup').length > 0){
  sub_top = $('.sidebar-signup').offset().top;
  sub_width = $('.right-content').width();

  $(window).scroll(function(){
    var w=window,d=document,e=d.documentElement,g=d.getElementsByTagName('body')[0],viewWidth=w.innerWidth||e.clientWidth||g.clientWidth,viewHeight=w.innerHeight||e.clientHeight||g.clientHeight;
      console.log(viewWidth,viewHeight);
      var scrollPercent = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100;
      var floorScrollPercent = Math.floor( scrollPercent );

      if(viewWidth > 768){ // if gt 768 px wide
        var sub_left = $('.sidebar-signup').offset().left;
        var page_scroll = $(this).scrollTop();
        if (floorScrollPercent < 50 ) {
          $('#hideSep').css({'display':'block'});
          $('.sidebar-signup').css({
            'position': 'relative',
            'left': '0px',
            'top': '0px',
            'width': '100%'
          });
        }
        if (floorScrollPercent > 50 && floorScrollPercent < 94) {
           $('#hideSep').css({'display':'none'});
           $('.sidebar-signup').css({
             'position': 'fixed',
             'left': sub_left+'px',
             'top': '250px',
             'width': sub_width+'px',
             'bottom':'auto'
           });
        }
        if (floorScrollPercent > 94) {
          $('.sidebar-signup').css({
              'top':'auto',
              'bottom': '350px'
            });
          $('.newsletter-form').css({
          'margin': '20px 0 40px 0'
            });
        }
      } // if lt 768 px height
      if(viewHeight < 768){
        var sub_left = $('.sidebar-signup').offset().left;
        var page_scroll = $(this).scrollTop();
        if (floorScrollPercent < 50 ) {
          $('#hideSep').css({'display':'block'});
          $('.sidebar-signup').css({
            'position': 'relative',
            'left': '0px',
            'top': '0px',
            'width': '100%'
          });
          $('.testimonial-content').css({
              'display': 'block'
            });
        }
        if (floorScrollPercent > 50 && floorScrollPercent < 94) {
           $('#hideSep').css({'display':'none'});
           $('.sidebar-signup').css({
             'position': 'fixed',
             'left': sub_left+'px',
             'top': '250px',
             'width': sub_width+'px',
             'bottom':'auto'
           });
           $('h1.newsSign').css({
              'margin-bottom':'5px',
              'font-size':'17px'
            });
           $('h1.interProd').css({
              'margin-bottom':'5px',
              'margin-top':'5px',
              'font-size':'17px'
            });
           $('form.newsletter-form.sidebar-news.aweber-form').css({
              'margin':'0px 0 10px 0'
            });
           $('.testimonial-content').css({
              'display': 'none'
            });
        }
        if (floorScrollPercent > 94) {
          $('.sidebar-signup').css({
              'top':'auto',
              'bottom': '340px'
            });
          $('.newsletter-form').css({
              'margin': '20px 0 40px 0'
            });
        }

      }
  });
}

if($('.scroll-slider').length > 0){
  // console.log('scroll slider is present');
  $(window).scroll(function(){
    var window_y = $(window).height();
    var scrolled_y = $(window).scrollTop();
    // console.log(window_y);
    // console.log(scrolled_y);
    if(scrolled_y >= 70){
      $('.scroll-slider').hide();
    }else{
      $('.scroll-slider').show();
    }
  });
  $('.scroll-slider').on('click', function(){
    var window_y = $(window).height();
    $(window).animate({
      scrollTop: window_y
    });
  });
}

$('.list-link').on('mouseover', function() {
  var fetchTimer;
  var link = $(this).attr('data-product');
  var parent_offset_left = $(this).parent().position().left;
  var parent_offset_top = $(this).parent().position().top;
  var link_offset_left = $(this).position().left;
  var link_offset_top = $(this).position().top;
  var ab_left = parent_offset_left + link_offset_left;
  var ab_top = parent_offset_top + link_offset_top;

  $('.fetch').remove();
  $('.fetch-loader').remove();

    $(this).append("<div class='fetch'/>");
    if(ab_top > 146){
      // top oriented
      $(this).parent().parent().prepend("<div class='fetch-loader' style='left:"+ab_left+"px;top:"+(ab_top - 184)+"px;' />");
    }else{
      // bottom oriented
      $(this).parent().parent().prepend("<div class='fetch-loader' style='left:"+ab_left+"px;top:"+(ab_top + 22)+"px;' />");
    }

    fetchTimer = window.setTimeout(function(){
      $(".fetch-loader").load('../_includes/fetch.inc.php?p='+link, function(){
        $('.fetch').remove();
        // console.log(ab_top);
      });
    }, 500);

  $('.list-link').on('mouseout', function() {
    window.clearTimeout(fetchTimer);
    $('.fetch').remove();
    $('.fetch-loader').remove();
  });
});



/**
 *
 * Perform cache check and renew the entire page
 * on each load - then perform functions
 *
 */

( function fn() {
  fn.now = +new Date;
  $( window ).bind( 'load', function() {
    if ( +new Date - fn.now < 500 ) setTimeout( fn, 500 );
    // the page is loaded with cache
    $( document ).ready( function() {

      var feed = new Instafeed({
        get: 'user',
        userId: 1409725856,
        accessToken: '1409725856.467ede5.ced978ef8b734e969270f9d9ff620d3f',
        limit: 4
      });

      feed.run();

      var images_loaded = 0;
      //instant-load first image
      if( $( '.now' ).length > 0 ) {
        $( '.now' ).each( function( i ) {
          images_loaded++;
          var source = $( this ).attr( 'src' );
            // console.log( 'Image instant-loaded: ' + source );
          } );
      } else {
      }
      // check for lazy images to load
      if( $( '.lazy' ).length > 0 ) {
        // lazy load the images
        $( '.lazy' ).each( function( i ) {
          images_loaded++;
          var source = $( this ).attr( 'src' );
          $( this ).delay( i * 100 ).fadeIn( 300, function() {
            $( '#lzy-' + i ).fadeOut( 300, function() {
              $( this ).remove();
            } );
            // console.log( 'Image successfully loaded: ' + source );
          } );
          if( $( this ).hasClass( 'lb' ) ) {
            $( this ).lightbox();
          }
        } );
      } else {
      }
      if( images_loaded >= $(".slide").length ) {
        $( '.slide' ).each( function( int) {
          $( '.selectors' ).append( '<li class="selector animate circle" data-slide="' + ( int + 1 ) + '"></li>' );
        } );
        slider();
      }

    } );

  } );
} )();

$( window ).resize( function() {

  /*
  if( $( window ).width() >= 1024 ) {
    scaleRatio( '16:9', '.slider-container' ); // resize the image slider
  }
  if( $( window ).width() <= 1024 ) {
    scaleRatio( '2:1', '.slider-container' );
  }
  if( $( window ).width() <= 600 ) {
    scaleRatio( '1.5:1', '.slider-container' );
  }
  */

  if( $(window).width() > 700 ) {
    $(".slide-ctrl").css("top", "-"+$(window).height()/2+"px; height:48px;");
  } else {
    $(".slide-ctrl").css("top", "-"+$(".slide").height()+"px !important; height:"+$(".slide").height()+"px !important;");
  }

  $('.sidebar-signup').css({
    'position': 'relative',
    'left': '0px',
    'top': '0px',
    'width': '100%'
  });

  scaleRatio( '16:9', '.player' ); // scale the media video players
  scaleRatio( '2:1.3', '.media-container' );
  scaleRatio( '16:9', '.blockvideo' );

});
