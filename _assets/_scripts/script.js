/*
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2015 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.5
 *
 */

(function($, window, document, undefined) {
    var $window = $(window);

    $.fn.lazyload = function(options) {
        var elements = this;
        var $container;
        var settings = {
            threshold       : 0,
            failure_limit   : 0,
            event           : "scroll",
            effect          : "show",
            container       : window,
            data_attribute  : "original",
            skip_invisible  : false,
            appear          : null,
            load            : null,
            placeholder     : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
        };

        function update() {
            var counter = 0;

            elements.each(function() {
                var $this = $(this);
                if (settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if ($.abovethetop(this, settings) ||
                    $.leftofbegin(this, settings)) {
                        /* Nothing. */
                } else if (!$.belowthefold(this, settings) &&
                    !$.rightoffold(this, settings)) {
                        $this.trigger("appear");
                        /* if we found an image we'll load, reset the counter */
                        counter = 0;
                } else {
                    if (++counter > settings.failure_limit) {
                        return false;
                    }
                }
            });

        }

        if(options) {
            /* Maintain BC for a couple of versions. */
            if (undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit;
            }
            if (undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed;
            }

            $.extend(settings, options);
        }

        /* Cache container as jQuery as object. */
        $container = (settings.container === undefined ||
                      settings.container === window) ? $window : $(settings.container);

        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if (0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function() {
                return update();
            });
        }

        this.each(function() {
            var self = this;
            var $self = $(self);

            self.loaded = false;

            /* If no src attribute given use data:uri. */
            if ($self.attr("src") === undefined || $self.attr("src") === false) {
                if ($self.is("img")) {
                    $self.attr("src", settings.placeholder);
                }
            }

            /* When appear is triggered load original image. */
            $self.one("appear", function() {
                if (!this.loaded) {
                    if (settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    $("<img />")
                        .bind("load", function() {

                            var original = $self.attr("data-" + settings.data_attribute);
                            $self.hide();
                            if ($self.is("img")) {
                                $self.attr("src", original);
                            } else {
                                $self.css("background-image", "url('" + original + "')");
                            }
                            $self[settings.effect](settings.effect_speed);

                            self.loaded = true;

                            /* Remove image from array so it is not looped next time. */
                            var temp = $.grep(elements, function(element) {
                                return !element.loaded;
                            });
                            elements = $(temp);

                            if (settings.load) {
                                var elements_left = elements.length;
                                settings.load.call(self, elements_left, settings);
                            }
                        })
                        .attr("src", $self.attr("data-" + settings.data_attribute));
                }
            });

            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if (0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function() {
                    if (!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });

        /* Check if something appears when window is resized. */
        $window.bind("resize", function() {
            update();
        });

        /* With IOS5 force loading images when navigating with back button. */
        /* Non optimal workaround. */
        if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
            $window.bind("pageshow", function(event) {
                if (event.originalEvent && event.originalEvent.persisted) {
                    elements.each(function() {
                        $(this).trigger("appear");
                    });
                }
            });
        }

        /* Force initial check if images should appear. */
        $(document).ready(function() {
            update();
        });

        return this;
    };

    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */

    $.belowthefold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }

        return fold <= $(element).offset().top - settings.threshold;
    };

    $.rightoffold = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }

        return fold <= $(element).offset().left - settings.threshold;
    };

    $.abovethetop = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }

        return fold >= $(element).offset().top + settings.threshold  + $(element).height();
    };

    $.leftofbegin = function(element, settings) {
        var fold;

        if (settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }

        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };

    $.inviewport = function(element, settings) {
         return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) &&
                !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
     };

    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */

    $.extend($.expr[":"], {
        "below-the-fold" : function(a) { return $.belowthefold(a, {threshold : 0}); },
        "above-the-top"  : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-screen": function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-screen" : function(a) { return !$.rightoffold(a, {threshold : 0}); },
        "in-viewport"    : function(a) { return $.inviewport(a, {threshold : 0}); },
        /* Maintain BC for couple of versions. */
        "above-the-fold" : function(a) { return !$.belowthefold(a, {threshold : 0}); },
        "right-of-fold"  : function(a) { return $.rightoffold(a, {threshold : 0}); },
        "left-of-fold"   : function(a) { return !$.rightoffold(a, {threshold : 0}); }
    });

})(jQuery, window, document);

//end lazyload

//begin jQuery cookie API

(function(e){if(typeof define==="function"&&define.amd){define(["jquery"],e)}else if(typeof exports==="object"){e(require("jquery"))}else{e(jQuery)}})(function(e){function n(e){return u.raw?e:encodeURIComponent(e)}function r(e){return u.raw?e:decodeURIComponent(e)}function i(e){return n(u.json?JSON.stringify(e):String(e))}function s(e){if(e.indexOf('"')===0){e=e.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\")}try{e=decodeURIComponent(e.replace(t," "));return u.json?JSON.parse(e):e}catch(n){}}function o(t,n){var r=u.raw?t:s(t);return e.isFunction(n)?n(r):r}var t=/\+/g;var u=e.cookie=function(t,s,a){if(s!==undefined&&!e.isFunction(s)){a=e.extend({},u.defaults,a);if(typeof a.expires==="number"){var f=a.expires,l=a.expires=new Date;l.setTime(+l+f*864e5)}return document.cookie=[n(t),"=",i(s),a.expires?"; expires="+a.expires.toUTCString():"",a.path?"; path="+a.path:"",a.domain?"; domain="+a.domain:"",a.secure?"; secure":""].join("")}var c=t?undefined:{};var h=document.cookie?document.cookie.split("; "):[];for(var p=0,d=h.length;p<d;p++){var v=h[p].split("=");var m=r(v.shift());var g=v.join("=");if(t&&t===m){c=o(g,s);break}if(!t&&(g=o(g))!==undefined){c[m]=g}}return c};u.defaults={};e.removeCookie=function(t,n){if(e.cookie(t)===undefined){return false}e.cookie(t,"",e.extend({},n,{expires:-1}));return!e.cookie(t)}});

//end jquery cookie API

//begin Instagram feed

(function(){var e,t;e=function(){function e(e,t){var n,r;this.options={target:"instafeed",get:"popular",resolution:"thumbnail",sortBy:"none",links:!0,mock:!1,useHttp:!1};if(typeof e=="object")for(n in e)r=e[n],this.options[n]=r;this.context=t!=null?t:this,this.unique=this._genKey()}return e.prototype.hasNext=function(){return typeof this.context.nextUrl=="string"&&this.context.nextUrl.length>0},e.prototype.next=function(){return this.hasNext()?this.run(this.context.nextUrl):!1},e.prototype.run=function(t){var n,r,i;if(typeof this.options.clientId!="string"&&typeof this.options.accessToken!="string")throw new Error("Missing clientId or accessToken.");if(typeof this.options.accessToken!="string"&&typeof this.options.clientId!="string")throw new Error("Missing clientId or accessToken.");return this.options.before!=null&&typeof this.options.before=="function"&&this.options.before.call(this),typeof document!="undefined"&&document!==null&&(i=document.createElement("script"),i.id="instafeed-fetcher",i.src=t||this._buildUrl(),n=document.getElementsByTagName("head"),n[0].appendChild(i),r="instafeedCache"+this.unique,window[r]=new e(this.options,this),window[r].unique=this.unique),!0},e.prototype.parse=function(e){var t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S;if(typeof e!="object"){if(this.options.error!=null&&typeof this.options.error=="function")return this.options.error.call(this,"Invalid JSON data"),!1;throw new Error("Invalid JSON response")}if(e.meta.code!==200){if(this.options.error!=null&&typeof this.options.error=="function")return this.options.error.call(this,e.meta.error_message),!1;throw new Error("Error from Instagram: "+e.meta.error_message)}if(e.data.length===0){if(this.options.error!=null&&typeof this.options.error=="function")return this.options.error.call(this,"No images were returned from Instagram"),!1;throw new Error("No images were returned from Instagram")}this.options.success!=null&&typeof this.options.success=="function"&&this.options.success.call(this,e),this.context.nextUrl="",e.pagination!=null&&(this.context.nextUrl=e.pagination.next_url);if(this.options.sortBy!=="none"){this.options.sortBy==="random"?d=["","random"]:d=this.options.sortBy.split("-"),p=d[0]==="least"?!0:!1;switch(d[1]){case"random":e.data.sort(function(){return.5-Math.random()});break;case"recent":e.data=this._sortBy(e.data,"created_time",p);break;case"liked":e.data=this._sortBy(e.data,"likes.count",p);break;case"commented":e.data=this._sortBy(e.data,"comments.count",p);break;default:throw new Error("Invalid option for sortBy: '"+this.options.sortBy+"'.")}}if(typeof document!="undefined"&&document!==null&&this.options.mock===!1){a=e.data,this.options.limit!=null&&a.length>this.options.limit&&(a=a.slice(0,this.options.limit+1||9e9)),n=document.createDocumentFragment(),this.options.filter!=null&&typeof this.options.filter=="function"&&(a=this._filter(a,this.options.filter));if(this.options.template!=null&&typeof this.options.template=="string"){i="",o="",l="",v=document.createElement("div");for(m=0,b=a.length;m<b;m++)s=a[m],u=s.images[this.options.resolution].url,this.options.useHttp||(u=u.replace("http://","//")),o=this._makeTemplate(this.options.template,{model:s,id:s.id,link:s.link,image:u,caption:this._getObjectProperty(s,"caption.text"),likes:s.likes.count,comments:s.comments.count,location:this._getObjectProperty(s,"location.name")}),i+=o;v.innerHTML=i,S=[].slice.call(v.childNodes);for(g=0,w=S.length;g<w;g++)h=S[g],n.appendChild(h)}else for(y=0,E=a.length;y<E;y++)s=a[y],f=document.createElement("img"),u=s.images[this.options.resolution].url,this.options.useHttp||(u=u.replace("http://","//")),f.src=u,this.options.links===!0?(t=document.createElement("a"),t.href=s.link,t.appendChild(f),n.appendChild(t)):n.appendChild(f);document.getElementById(this.options.target).appendChild(n),r=document.getElementsByTagName("head")[0],r.removeChild(document.getElementById("instafeed-fetcher")),c="instafeedCache"+this.unique,window[c]=void 0;try{delete window[c]}catch(x){}}return this.options.after!=null&&typeof this.options.after=="function"&&this.options.after.call(this),!0},e.prototype._buildUrl=function(){var e,t,n;e="https://api.instagram.com/v1";switch(this.options.get){case"popular":t="media/popular";break;case"tagged":if(typeof this.options.tagName!="string")throw new Error("No tag name specified. Use the 'tagName' option.");t="tags/"+this.options.tagName+"/media/recent";break;case"location":if(typeof this.options.locationId!="number")throw new Error("No location specified. Use the 'locationId' option.");t="locations/"+this.options.locationId+"/media/recent";break;case"user":if(typeof this.options.userId!="number")throw new Error("No user specified. Use the 'userId' option.");if(typeof this.options.accessToken!="string")throw new Error("No access token. Use the 'accessToken' option.");t="users/"+this.options.userId+"/media/recent";break;default:throw new Error("Invalid option for get: '"+this.options.get+"'.")}return n=""+e+"/"+t,this.options.accessToken!=null?n+="?access_token="+this.options.accessToken:n+="?client_id="+this.options.clientId,this.options.limit!=null&&(n+="&count="+this.options.limit),n+="&callback=instafeedCache"+this.unique+".parse",n},e.prototype._genKey=function(){var e;return e=function(){return((1+Math.random())*65536|0).toString(16).substring(1)},""+e()+e()+e()+e()},e.prototype._makeTemplate=function(e,t){var n,r,i,s,o;r=/(?:\{{2})([\w\[\]\.]+)(?:\}{2})/,n=e;while(r.test(n))i=n.match(r)[1],s=(o=this._getObjectProperty(t,i))!=null?o:"",n=n.replace(r,""+s);return n},e.prototype._getObjectProperty=function(e,t){var n,r;t=t.replace(/\[(\w+)\]/g,".$1"),r=t.split(".");while(r.length){n=r.shift();if(!(e!=null&&n in e))return null;e=e[n]}return e},e.prototype._sortBy=function(e,t,n){var r;return r=function(e,r){var i,s;return i=this._getObjectProperty(e,t),s=this._getObjectProperty(r,t),n?i>s?1:-1:i<s?1:-1},e.sort(r.bind(this)),e},e.prototype._filter=function(e,t){var n,r,i,s,o;n=[],i=function(e){if(t(e))return n.push(e)};for(s=0,o=e.length;s<o;s++)r=e[s],i(r);return n},e}(),t=typeof exports!="undefined"&&exports!==null?exports:window,t.Instafeed=e}).call(this);

//end Instagram feed

//Begin proprietary javascript

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
        // catch error to prevent excessive errors on console
    try {
      var slide = $( '.slide[data-slide=' + num + ']' ).position().left;
      }
    catch(err) {
      }
        
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
  if( $(window).width() > 1025 ){
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/2+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/2+"px'><span class='fa fa-chevron-right'></span></div>");
  }
  if( $(window).width() > 730 && $(window).width() < 1025 ){
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/3+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/3+"px'><span class='fa fa-chevron-right'></span></div>");
  }
  if( $(window).width() < 730 && $(window).width() > 360){
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/5+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/5+"px'><span class='fa fa-chevron-right'></span></div>");
  }
  if( $(window).width() < 360){
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/8+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/8+"px'><span class='fa fa-chevron-right'></span></div>");
  }
  $( window ).resize(function() {
    $('.slide-ctrl').remove();
   if( $(window).width() > 730 ){
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/2+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/2+"px'><span class='fa fa-chevron-right'></span></div>");
    slideTo(current_slide);
  }else{
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/5+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/5+"px'><span class='fa fa-chevron-right'></span></div>");
    slideTo(current_slide);
  }
   if( $(window).width() < 730 && $(window).width() > 360){
    $('.slide-ctrl').remove();
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/5+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/5+"px'><span class='fa fa-chevron-right'></span></div>");
     slideTo(current_slide);
   }
   if( $(window).width() < 360){
    $('.slide-ctrl').remove();
    $('.selectors-container').append("<div class='slide-ctrl slide-left' style='top:-"+$(window).height()/8+"px'><span class='fa fa-chevron-left'></span></div>");
    $('.selectors-container').append("<div class='slide-ctrl slide-right'style='top:-"+$(window).height()/8+"px'><span class='fa fa-chevron-right'></span></div>");
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
          $( '.search-input' ).focus();
          // perform check every time a letter is typed into the form
          // let's submit the search form
          $( '.nav-search' ).submit( function( event ) {
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
 * Scale elements to suplied ratio
 *
 */

scaleRatio( '370:210', '.player' );
scaleRatio( '2:1.5', '.side-gallery-img' );
// scaleRatio( '2:1.3', '.media-container' );
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
    $(this).html("<p>Menu</p>");
  }
  $('.mobile-nav').toggleClass('visible');
});
$('.m_master_list_link > a, .m_sub_list > a').click(function(){
    if($(this).parent().hasClass('collapsable')){
      $(this).parent().toggleClass('toggled');
      $(this).find("span.fa").toggleClass('fa-caret-right').toggleClass('fa-caret-down');
    }
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
      $('input[tabindex=501]').click();
    } 
    //if it isn't the contact form or newsletter form
    if(!(form.hasClass('contact-form')) && !(form.hasClass('newsletter-form'))) {
      $.cookie( 'quote_sent', 'true', { expires: 2, path: '/' } );
      $('input[tabindex=511]').click();
    }
      });

//handle close window functionality for success dialogue
$('.close-message').click(function(){
    setTimeout(function(){ $('.message-sent').fadeOut() });
  });

//handle style options

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


$('.double-style-option').click(function(event){
  event.preventDefault();
  $('.double-style-option').removeClass('active');
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

$('.double-style-option').first().click();

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
      $('.lb-shadow.video').click(function(){
        exitVideo();
      });
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

var sub_top;
var sub_width;

if($('.sidebar-signup').length > 0){
  sub_top = $('.sidebar-signup').offset().top;
  sub_width = $('.right-content').width();
  $(window).scroll(function(){
    var page_width = $(this).width();
    if(page_width > 800){

      var sub_left = $('.sidebar-signup').offset().left;
      var page_scroll = $(this).scrollTop();

      if(page_scroll >= (sub_top - 244 )){
        $('.sidebar-signup').css({
          'position': 'fixed',
          'left': sub_left+'px',
          'top': '40px',
          'width': sub_width+'px'
        });
      }

      if(page_scroll < (sub_top - 244 )){
        $('.sidebar-signup').css({
          'position': 'relative',
          'left': '0px',
          'top': '0px',
          'width': '100%'
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
        accessToken: '1409725856.230245c.0c55ca82c6274f10806a7a789d883c6a',
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
          // if( $( this ).hasClass( 'lb' ) ) {
            // $( this ).lightbox();
          // }
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
  // scaleRatio( '2:1.3', '.media-container' );
  scaleRatio( '16:9', '.blockvideo' );

});

//end proprietary javascript

//begin Magnific Lightbox

// Magnific Popup v1.0.0 by Dmitry Semenov
// http://bit.ly/magnific-popup#build=inline+image+ajax+iframe+gallery+retina+imagezoom+fastclick
(function(a){typeof define=="function"&&define.amd?define(["jquery"],a):typeof exports=="object"?a(require("jquery")):a(window.jQuery||window.Zepto)})(function(a){var b="Close",c="BeforeClose",d="AfterClose",e="BeforeAppend",f="MarkupParse",g="Open",h="Change",i="mfp",j="."+i,k="mfp-ready",l="mfp-removing",m="mfp-prevent-close",n,o=function(){},p=!!window.jQuery,q,r=a(window),s,t,u,v,w=function(a,b){n.ev.on(i+a+j,b)},x=function(b,c,d,e){var f=document.createElement("div");return f.className="mfp-"+b,d&&(f.innerHTML=d),e?c&&c.appendChild(f):(f=a(f),c&&f.appendTo(c)),f},y=function(b,c){n.ev.triggerHandler(i+b,c),n.st.callbacks&&(b=b.charAt(0).toLowerCase()+b.slice(1),n.st.callbacks[b]&&n.st.callbacks[b].apply(n,a.isArray(c)?c:[c]))},z=function(b){if(b!==v||!n.currTemplate.closeBtn)n.currTemplate.closeBtn=a(n.st.closeMarkup.replace("%title%",n.st.tClose)),v=b;return n.currTemplate.closeBtn},A=function(){a.magnificPopup.instance||(n=new o,n.init(),a.magnificPopup.instance=n)},B=function(){var a=document.createElement("p").style,b=["ms","O","Moz","Webkit"];if(a.transition!==undefined)return!0;while(b.length)if(b.pop()+"Transition"in a)return!0;return!1};o.prototype={constructor:o,init:function(){var b=navigator.appVersion;n.isIE7=b.indexOf("MSIE 7.")!==-1,n.isIE8=b.indexOf("MSIE 8.")!==-1,n.isLowIE=n.isIE7||n.isIE8,n.isAndroid=/android/gi.test(b),n.isIOS=/iphone|ipad|ipod/gi.test(b),n.supportsTransition=B(),n.probablyMobile=n.isAndroid||n.isIOS||/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent),s=a(document),n.popupsCache={}},open:function(b){var c;if(b.isObj===!1){n.items=b.items.toArray(),n.index=0;var d=b.items,e;for(c=0;c<d.length;c++){e=d[c],e.parsed&&(e=e.el[0]);if(e===b.el[0]){n.index=c;break}}}else n.items=a.isArray(b.items)?b.items:[b.items],n.index=b.index||0;if(n.isOpen){n.updateItemHTML();return}n.types=[],u="",b.mainEl&&b.mainEl.length?n.ev=b.mainEl.eq(0):n.ev=s,b.key?(n.popupsCache[b.key]||(n.popupsCache[b.key]={}),n.currTemplate=n.popupsCache[b.key]):n.currTemplate={},n.st=a.extend(!0,{},a.magnificPopup.defaults,b),n.fixedContentPos=n.st.fixedContentPos==="auto"?!n.probablyMobile:n.st.fixedContentPos,n.st.modal&&(n.st.closeOnContentClick=!1,n.st.closeOnBgClick=!1,n.st.showCloseBtn=!1,n.st.enableEscapeKey=!1),n.bgOverlay||(n.bgOverlay=x("bg").on("click"+j,function(){n.close()}),n.wrap=x("wrap").attr("tabindex",-1).on("click"+j,function(a){n._checkIfClose(a.target)&&n.close()}),n.container=x("container",n.wrap)),n.contentContainer=x("content"),n.st.preloader&&(n.preloader=x("preloader",n.container,n.st.tLoading));var h=a.magnificPopup.modules;for(c=0;c<h.length;c++){var i=h[c];i=i.charAt(0).toUpperCase()+i.slice(1),n["init"+i].call(n)}y("BeforeOpen"),n.st.showCloseBtn&&(n.st.closeBtnInside?(w(f,function(a,b,c,d){c.close_replaceWith=z(d.type)}),u+=" mfp-close-btn-in"):n.wrap.append(z())),n.st.alignTop&&(u+=" mfp-align-top"),n.fixedContentPos?n.wrap.css({overflow:n.st.overflowY,overflowX:"hidden",overflowY:n.st.overflowY}):n.wrap.css({top:r.scrollTop(),position:"absolute"}),(n.st.fixedBgPos===!1||n.st.fixedBgPos==="auto"&&!n.fixedContentPos)&&n.bgOverlay.css({height:s.height(),position:"absolute"}),n.st.enableEscapeKey&&s.on("keyup"+j,function(a){a.keyCode===27&&n.close()}),r.on("resize"+j,function(){n.updateSize()}),n.st.closeOnContentClick||(u+=" mfp-auto-cursor"),u&&n.wrap.addClass(u);var l=n.wH=r.height(),m={};if(n.fixedContentPos&&n._hasScrollBar(l)){var o=n._getScrollbarSize();o&&(m.marginRight=o)}n.fixedContentPos&&(n.isIE7?a("body, html").css("overflow","hidden"):m.overflow="hidden");var p=n.st.mainClass;return n.isIE7&&(p+=" mfp-ie7"),p&&n._addClassToMFP(p),n.updateItemHTML(),y("BuildControls"),a("html").css(m),n.bgOverlay.add(n.wrap).prependTo(n.st.prependTo||a(document.body)),n._lastFocusedEl=document.activeElement,setTimeout(function(){n.content?(n._addClassToMFP(k),n._setFocus()):n.bgOverlay.addClass(k),s.on("focusin"+j,n._onFocusIn)},16),n.isOpen=!0,n.updateSize(l),y(g),b},close:function(){if(!n.isOpen)return;y(c),n.isOpen=!1,n.st.removalDelay&&!n.isLowIE&&n.supportsTransition?(n._addClassToMFP(l),setTimeout(function(){n._close()},n.st.removalDelay)):n._close()},_close:function(){y(b);var c=l+" "+k+" ";n.bgOverlay.detach(),n.wrap.detach(),n.container.empty(),n.st.mainClass&&(c+=n.st.mainClass+" "),n._removeClassFromMFP(c);if(n.fixedContentPos){var e={marginRight:""};n.isIE7?a("body, html").css("overflow",""):e.overflow="",a("html").css(e)}s.off("keyup"+j+" focusin"+j),n.ev.off(j),n.wrap.attr("class","mfp-wrap").removeAttr("style"),n.bgOverlay.attr("class","mfp-bg"),n.container.attr("class","mfp-container"),n.st.showCloseBtn&&(!n.st.closeBtnInside||n.currTemplate[n.currItem.type]===!0)&&n.currTemplate.closeBtn&&n.currTemplate.closeBtn.detach(),n.st.autoFocusLast&&n._lastFocusedEl&&a(n._lastFocusedEl).focus(),n.currItem=null,n.content=null,n.currTemplate=null,n.prevHeight=0,y(d)},updateSize:function(a){if(n.isIOS){var b=document.documentElement.clientWidth/window.innerWidth,c=window.innerHeight*b;n.wrap.css("height",c),n.wH=c}else n.wH=a||r.height();n.fixedContentPos||n.wrap.css("height",n.wH),y("Resize")},updateItemHTML:function(){var b=n.items[n.index];n.contentContainer.detach(),n.content&&n.content.detach(),b.parsed||(b=n.parseEl(n.index));var c=b.type;y("BeforeChange",[n.currItem?n.currItem.type:"",c]),n.currItem=b;if(!n.currTemplate[c]){var d=n.st[c]?n.st[c].markup:!1;y("FirstMarkupParse",d),d?n.currTemplate[c]=a(d):n.currTemplate[c]=!0}t&&t!==b.type&&n.container.removeClass("mfp-"+t+"-holder");var e=n["get"+c.charAt(0).toUpperCase()+c.slice(1)](b,n.currTemplate[c]);n.appendContent(e,c),b.preloaded=!0,y(h,b),t=b.type,n.container.prepend(n.contentContainer),y("AfterChange")},appendContent:function(a,b){n.content=a,a?n.st.showCloseBtn&&n.st.closeBtnInside&&n.currTemplate[b]===!0?n.content.find(".mfp-close").length||n.content.append(z()):n.content=a:n.content="",y(e),n.container.addClass("mfp-"+b+"-holder"),n.contentContainer.append(n.content)},parseEl:function(b){var c=n.items[b],d;c.tagName?c={el:a(c)}:(d=c.type,c={data:c,src:c.src});if(c.el){var e=n.types;for(var f=0;f<e.length;f++)if(c.el.hasClass("mfp-"+e[f])){d=e[f];break}c.src=c.el.attr("data-mfp-src"),c.src||(c.src=c.el.attr("href"))}return c.type=d||n.st.type||"inline",c.index=b,c.parsed=!0,n.items[b]=c,y("ElementParse",c),n.items[b]},addGroup:function(a,b){var c=function(c){c.mfpEl=this,n._openClick(c,a,b)};b||(b={});var d="click.magnificPopup";b.mainEl=a,b.items?(b.isObj=!0,a.off(d).on(d,c)):(b.isObj=!1,b.delegate?a.off(d).on(d,b.delegate,c):(b.items=a,a.off(d).on(d,c)))},_openClick:function(b,c,d){var e=d.midClick!==undefined?d.midClick:a.magnificPopup.defaults.midClick;if(!e&&(b.which===2||b.ctrlKey||b.metaKey||b.altKey||b.shiftKey))return;var f=d.disableOn!==undefined?d.disableOn:a.magnificPopup.defaults.disableOn;if(f)if(a.isFunction(f)){if(!f.call(n))return!0}else if(r.width()<f)return!0;b.type&&(b.preventDefault(),n.isOpen&&b.stopPropagation()),d.el=a(b.mfpEl),d.delegate&&(d.items=c.find(d.delegate)),n.open(d)},updateStatus:function(a,b){if(n.preloader){q!==a&&n.container.removeClass("mfp-s-"+q),!b&&a==="loading"&&(b=n.st.tLoading);var c={status:a,text:b};y("UpdateStatus",c),a=c.status,b=c.text,n.preloader.html(b),n.preloader.find("a").on("click",function(a){a.stopImmediatePropagation()}),n.container.addClass("mfp-s-"+a),q=a}},_checkIfClose:function(b){if(a(b).hasClass(m))return;var c=n.st.closeOnContentClick,d=n.st.closeOnBgClick;if(c&&d)return!0;if(!n.content||a(b).hasClass("mfp-close")||n.preloader&&b===n.preloader[0])return!0;if(b!==n.content[0]&&!a.contains(n.content[0],b)){if(d&&a.contains(document,b))return!0}else if(c)return!0;return!1},_addClassToMFP:function(a){n.bgOverlay.addClass(a),n.wrap.addClass(a)},_removeClassFromMFP:function(a){this.bgOverlay.removeClass(a),n.wrap.removeClass(a)},_hasScrollBar:function(a){return(n.isIE7?s.height():document.body.scrollHeight)>(a||r.height())},_setFocus:function(){(n.st.focus?n.content.find(n.st.focus).eq(0):n.wrap).focus()},_onFocusIn:function(b){if(b.target!==n.wrap[0]&&!a.contains(n.wrap[0],b.target))return n._setFocus(),!1},_parseMarkup:function(b,c,d){var e;d.data&&(c=a.extend(d.data,c)),y(f,[b,c,d]),a.each(c,function(a,c){if(c===undefined||c===!1)return!0;e=a.split("_");if(e.length>1){var d=b.find(j+"-"+e[0]);if(d.length>0){var f=e[1];f==="replaceWith"?d[0]!==c[0]&&d.replaceWith(c):f==="img"?d.is("img")?d.attr("src",c):d.replaceWith('<img src="'+c+'" class="'+d.attr("class")+'" />'):d.attr(e[1],c)}}else b.find(j+"-"+a).html(c)})},_getScrollbarSize:function(){if(n.scrollbarSize===undefined){var a=document.createElement("div");a.style.cssText="width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;",document.body.appendChild(a),n.scrollbarSize=a.offsetWidth-a.clientWidth,document.body.removeChild(a)}return n.scrollbarSize}},a.magnificPopup={instance:null,proto:o.prototype,modules:[],open:function(b,c){return A(),b?b=a.extend(!0,{},b):b={},b.isObj=!0,b.index=c||0,this.instance.open(b)},close:function(){return a.magnificPopup.instance&&a.magnificPopup.instance.close()},registerModule:function(b,c){c.options&&(a.magnificPopup.defaults[b]=c.options),a.extend(this.proto,c.proto),this.modules.push(b)},defaults:{disableOn:0,key:null,midClick:!1,mainClass:"",preloader:!0,focus:"",closeOnContentClick:!1,closeOnBgClick:!0,closeBtnInside:!0,showCloseBtn:!0,enableEscapeKey:!0,modal:!1,alignTop:!1,removalDelay:0,prependTo:null,fixedContentPos:"auto",fixedBgPos:"auto",overflowY:"auto",closeMarkup:'<button title="%title%" type="button" class="mfp-close">&#215;</button>',tClose:"Close (Esc)",tLoading:"Loading...",autoFocusLast:!0}},a.fn.magnificPopup=function(b){A();var c=a(this);if(typeof b=="string")if(b==="open"){var d,e=p?c.data("magnificPopup"):c[0].magnificPopup,f=parseInt(arguments[1],10)||0;e.items?d=e.items[f]:(d=c,e.delegate&&(d=d.find(e.delegate)),d=d.eq(f)),n._openClick({mfpEl:d},c,e)}else n.isOpen&&n[b].apply(n,Array.prototype.slice.call(arguments,1));else b=a.extend(!0,{},b),p?c.data("magnificPopup",b):c[0].magnificPopup=b,n.addGroup(c,b);return c};var C="inline",D,E,F,G=function(){F&&(E.after(F.addClass(D)).detach(),F=null)};a.magnificPopup.registerModule(C,{options:{hiddenClass:"hide",markup:"",tNotFound:"Content not found"},proto:{initInline:function(){n.types.push(C),w(b+"."+C,function(){G()})},getInline:function(b,c){G();if(b.src){var d=n.st.inline,e=a(b.src);if(e.length){var f=e[0].parentNode;f&&f.tagName&&(E||(D=d.hiddenClass,E=x(D),D="mfp-"+D),F=e.after(E).detach().removeClass(D)),n.updateStatus("ready")}else n.updateStatus("error",d.tNotFound),e=a("<div>");return b.inlineElement=e,e}return n.updateStatus("ready"),n._parseMarkup(c,{},b),c}}});var H="ajax",I,J=function(){I&&a(document.body).removeClass(I)},K=function(){J(),n.req&&n.req.abort()};a.magnificPopup.registerModule(H,{options:{settings:null,cursor:"mfp-ajax-cur",tError:'<a href="%url%">The content</a> could not be loaded.'},proto:{initAjax:function(){n.types.push(H),I=n.st.ajax.cursor,w(b+"."+H,K),w("BeforeChange."+H,K)},getAjax:function(b){I&&a(document.body).addClass(I),n.updateStatus("loading");var c=a.extend({url:b.src,success:function(c,d,e){var f={data:c,xhr:e};y("ParseAjax",f),n.appendContent(a(f.data),H),b.finished=!0,J(),n._setFocus(),setTimeout(function(){n.wrap.addClass(k)},16),n.updateStatus("ready"),y("AjaxContentAdded")},error:function(){J(),b.finished=b.loadError=!0,n.updateStatus("error",n.st.ajax.tError.replace("%url%",b.src))}},n.st.ajax.settings);return n.req=a.ajax(c),""}}});var L,M=function(b){if(b.data&&b.data.title!==undefined)return b.data.title;var c=n.st.image.titleSrc;if(c){if(a.isFunction(c))return c.call(n,b);if(b.el)return b.el.attr(c)||""}return""};a.magnificPopup.registerModule("image",{options:{markup:'<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',cursor:"mfp-zoom-out-cur",titleSrc:"title",verticalFit:!0,tError:'<a href="%url%">The image</a> could not be loaded.'},proto:{initImage:function(){var c=n.st.image,d=".image";n.types.push("image"),w(g+d,function(){n.currItem.type==="image"&&c.cursor&&a(document.body).addClass(c.cursor)}),w(b+d,function(){c.cursor&&a(document.body).removeClass(c.cursor),r.off("resize"+j)}),w("Resize"+d,n.resizeImage),n.isLowIE&&w("AfterChange",n.resizeImage)},resizeImage:function(){var a=n.currItem;if(!a||!a.img)return;if(n.st.image.verticalFit){var b=0;n.isLowIE&&(b=parseInt(a.img.css("padding-top"),10)+parseInt(a.img.css("padding-bottom"),10)),a.img.css("max-height",n.wH-b)}},_onImageHasSize:function(a){a.img&&(a.hasSize=!0,L&&clearInterval(L),a.isCheckingImgSize=!1,y("ImageHasSize",a),a.imgHidden&&(n.content&&n.content.removeClass("mfp-loading"),a.imgHidden=!1))},findImageSize:function(a){var b=0,c=a.img[0],d=function(e){L&&clearInterval(L),L=setInterval(function(){if(c.naturalWidth>0){n._onImageHasSize(a);return}b>200&&clearInterval(L),b++,b===3?d(10):b===40?d(50):b===100&&d(500)},e)};d(1)},getImage:function(b,c){var d=0,e=function(){b&&(b.img[0].complete?(b.img.off(".mfploader"),b===n.currItem&&(n._onImageHasSize(b),n.updateStatus("ready")),b.hasSize=!0,b.loaded=!0,y("ImageLoadComplete")):(d++,d<200?setTimeout(e,100):f()))},f=function(){b&&(b.img.off(".mfploader"),b===n.currItem&&(n._onImageHasSize(b),n.updateStatus("error",g.tError.replace("%url%",b.src))),b.hasSize=!0,b.loaded=!0,b.loadError=!0)},g=n.st.image,h=c.find(".mfp-img");if(h.length){var i=document.createElement("img");i.className="mfp-img",b.el&&b.el.find("img").length&&(i.alt=b.el.find("img").attr("alt")),b.img=a(i).on("load.mfploader",e).on("error.mfploader",f),i.src=b.src,h.is("img")&&(b.img=b.img.clone()),i=b.img[0],i.naturalWidth>0?b.hasSize=!0:i.width||(b.hasSize=!1)}return n._parseMarkup(c,{title:M(b),img_replaceWith:b.img},b),n.resizeImage(),b.hasSize?(L&&clearInterval(L),b.loadError?(c.addClass("mfp-loading"),n.updateStatus("error",g.tError.replace("%url%",b.src))):(c.removeClass("mfp-loading"),n.updateStatus("ready")),c):(n.updateStatus("loading"),b.loading=!0,b.hasSize||(b.imgHidden=!0,c.addClass("mfp-loading"),n.findImageSize(b)),c)}}});var N,O=function(){return N===undefined&&(N=document.createElement("p").style.MozTransform!==undefined),N};a.magnificPopup.registerModule("zoom",{options:{enabled:!1,easing:"ease-in-out",duration:300,opener:function(a){return a.is("img")?a:a.find("img")}},proto:{initZoom:function(){var a=n.st.zoom,d=".zoom",e;if(!a.enabled||!n.supportsTransition)return;var f=a.duration,g=function(b){var c=b.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),d="all "+a.duration/1e3+"s "+a.easing,e={position:"fixed",zIndex:9999,left:0,top:0,"-webkit-backface-visibility":"hidden"},f="transition";return e["-webkit-"+f]=e["-moz-"+f]=e["-o-"+f]=e[f]=d,c.css(e),c},h=function(){n.content.css("visibility","visible")},i,j;w("BuildControls"+d,function(){if(n._allowZoom()){clearTimeout(i),n.content.css("visibility","hidden"),e=n._getItemToZoom();if(!e){h();return}j=g(e),j.css(n._getOffset()),n.wrap.append(j),i=setTimeout(function(){j.css(n._getOffset(!0)),i=setTimeout(function(){h(),setTimeout(function(){j.remove(),e=j=null,y("ZoomAnimationEnded")},16)},f)},16)}}),w(c+d,function(){if(n._allowZoom()){clearTimeout(i),n.st.removalDelay=f;if(!e){e=n._getItemToZoom();if(!e)return;j=g(e)}j.css(n._getOffset(!0)),n.wrap.append(j),n.content.css("visibility","hidden"),setTimeout(function(){j.css(n._getOffset())},16)}}),w(b+d,function(){n._allowZoom()&&(h(),j&&j.remove(),e=null)})},_allowZoom:function(){return n.currItem.type==="image"},_getItemToZoom:function(){return n.currItem.hasSize?n.currItem.img:!1},_getOffset:function(b){var c;b?c=n.currItem.img:c=n.st.zoom.opener(n.currItem.el||n.currItem);var d=c.offset(),e=parseInt(c.css("padding-top"),10),f=parseInt(c.css("padding-bottom"),10);d.top-=a(window).scrollTop()-e;var g={width:c.width(),height:(p?c.innerHeight():c[0].offsetHeight)-f-e};return O()?g["-moz-transform"]=g.transform="translate("+d.left+"px,"+d.top+"px)":(g.left=d.left,g.top=d.top),g}}});var P="iframe",Q="//about:blank",R=function(a){if(n.currTemplate[P]){var b=n.currTemplate[P].find("iframe");b.length&&(a||(b[0].src=Q),n.isIE8&&b.css("display",a?"block":"none"))}};a.magnificPopup.registerModule(P,{options:{markup:'<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',srcAction:"iframe_src",patterns:{youtube:{index:"youtube.com",id:"v=",src:"//www.youtube.com/embed/%id%?autoplay=1"},vimeo:{index:"vimeo.com/",id:"/",src:"//player.vimeo.com/video/%id%?autoplay=1"},gmaps:{index:"//maps.google.",src:"%id%&output=embed"}}},proto:{initIframe:function(){n.types.push(P),w("BeforeChange",function(a,b,c){b!==c&&(b===P?R():c===P&&R(!0))}),w(b+"."+P,function(){R()})},getIframe:function(b,c){var d=b.src,e=n.st.iframe;a.each(e.patterns,function(){if(d.indexOf(this.index)>-1)return this.id&&(typeof this.id=="string"?d=d.substr(d.lastIndexOf(this.id)+this.id.length,d.length):d=this.id.call(this,d)),d=this.src.replace("%id%",d),!1});var f={};return e.srcAction&&(f[e.srcAction]=d),n._parseMarkup(c,f,b),n.updateStatus("ready"),c}}});var S=function(a){var b=n.items.length;return a>b-1?a-b:a<0?b+a:a},T=function(a,b,c){return a.replace(/%curr%/gi,b+1).replace(/%total%/gi,c)};a.magnificPopup.registerModule("gallery",{options:{enabled:!1,arrowMarkup:'<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',preload:[0,2],navigateByImgClick:!0,arrows:!0,tPrev:"Previous (Left arrow key)",tNext:"Next (Right arrow key)",tCounter:"%curr% of %total%"},proto:{initGallery:function(){var c=n.st.gallery,d=".mfp-gallery",e=Boolean(a.fn.mfpFastClick);n.direction=!0;if(!c||!c.enabled)return!1;u+=" mfp-gallery",w(g+d,function(){c.navigateByImgClick&&n.wrap.on("click"+d,".mfp-img",function(){if(n.items.length>1)return n.next(),!1}),s.on("keydown"+d,function(a){a.keyCode===37?n.prev():a.keyCode===39&&n.next()})}),w("UpdateStatus"+d,function(a,b){b.text&&(b.text=T(b.text,n.currItem.index,n.items.length))}),w(f+d,function(a,b,d,e){var f=n.items.length;d.counter=f>1?T(c.tCounter,e.index,f):""}),w("BuildControls"+d,function(){if(n.items.length>1&&c.arrows&&!n.arrowLeft){var b=c.arrowMarkup,d=n.arrowLeft=a(b.replace(/%title%/gi,c.tPrev).replace(/%dir%/gi,"left")).addClass(m),f=n.arrowRight=a(b.replace(/%title%/gi,c.tNext).replace(/%dir%/gi,"right")).addClass(m),g=e?"mfpFastClick":"click";d[g](function(){n.prev()}),f[g](function(){n.next()}),n.isIE7&&(x("b",d[0],!1,!0),x("a",d[0],!1,!0),x("b",f[0],!1,!0),x("a",f[0],!1,!0)),n.container.append(d.add(f))}}),w(h+d,function(){n._preloadTimeout&&clearTimeout(n._preloadTimeout),n._preloadTimeout=setTimeout(function(){n.preloadNearbyImages(),n._preloadTimeout=null},16)}),w(b+d,function(){s.off(d),n.wrap.off("click"+d),n.arrowLeft&&e&&n.arrowLeft.add(n.arrowRight).destroyMfpFastClick(),n.arrowRight=n.arrowLeft=null})},next:function(){n.direction=!0,n.index=S(n.index+1),n.updateItemHTML()},prev:function(){n.direction=!1,n.index=S(n.index-1),n.updateItemHTML()},goTo:function(a){n.direction=a>=n.index,n.index=a,n.updateItemHTML()},preloadNearbyImages:function(){var a=n.st.gallery.preload,b=Math.min(a[0],n.items.length),c=Math.min(a[1],n.items.length),d;for(d=1;d<=(n.direction?c:b);d++)n._preloadItem(n.index+d);for(d=1;d<=(n.direction?b:c);d++)n._preloadItem(n.index-d)},_preloadItem:function(b){b=S(b);if(n.items[b].preloaded)return;var c=n.items[b];c.parsed||(c=n.parseEl(b)),y("LazyLoad",c),c.type==="image"&&(c.img=a('<img class="mfp-img" />').on("load.mfploader",function(){c.hasSize=!0}).on("error.mfploader",function(){c.hasSize=!0,c.loadError=!0,y("LazyLoadError",c)}).attr("src",c.src)),c.preloaded=!0}}});var U="retina";a.magnificPopup.registerModule(U,{options:{replaceSrc:function(a){return a.src.replace(/\.\w+$/,function(a){return"@2x"+a})},ratio:1},proto:{initRetina:function(){if(window.devicePixelRatio>1){var a=n.st.retina,b=a.ratio;b=isNaN(b)?b():b,b>1&&(w("ImageHasSize."+U,function(a,c){c.img.css({"max-width":c.img[0].naturalWidth/b,width:"100%"})}),w("ElementParse."+U,function(c,d){d.src=a.replaceSrc(d,b)}))}}}}),function(){var b=1e3,c="ontouchstart"in window,d=function(){r.off("touchmove"+f+" touchend"+f)},e="mfpFastClick",f="."+e;a.fn.mfpFastClick=function(e){return a(this).each(function(){var g=a(this),h;if(c){var i,j,k,l,m,n;g.on("touchstart"+f,function(a){l=!1,n=1,m=a.originalEvent?a.originalEvent.touches[0]:a.touches[0],j=m.clientX,k=m.clientY,r.on("touchmove"+f,function(a){m=a.originalEvent?a.originalEvent.touches:a.touches,n=m.length,m=m[0];if(Math.abs(m.clientX-j)>10||Math.abs(m.clientY-k)>10)l=!0,d()}).on("touchend"+f,function(a){d();if(l||n>1)return;h=!0,a.preventDefault(),clearTimeout(i),i=setTimeout(function(){h=!1},b),e()})})}g.on("click"+f,function(){h||e()})})},a.fn.destroyMfpFastClick=function(){a(this).off("touchstart"+f+" click"+f),c&&r.off("touchmove"+f+" touchend"+f)}}(),A()})

//end Maginific Lightbox