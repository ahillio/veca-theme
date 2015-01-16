/**
 * webskillet Javascript utilities
 * Jonathan Kissam (plus others as credited)
 * April 2012
 *
 * Table of contents:
 * 1. jQuery extensions
 * 2. wsUtil object definition
 * 3. jQuery (document).ready, (window).load and (window).smartresize functions
 */

/**
 * 1. jQuery extensions
 */

jQuery.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();

(function(jQuery,sr){
 
  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;
 
      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null; 
          };
 
          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);
 
          timeout = setTimeout(delayed, threshold || 100); 
      };
  }
	// smartresize 
	jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };
 
})(jQuery,'smartresize');

// Creating custom :external selector
jQuery.expr[':'].external = function(obj){
    if ((obj.href == '#') || (obj.href == '') || (obj.href == null)) { return false; }
    if(obj.href.match(/^mailto\:/)) { return false; }
    if(obj.href.match(/^javascript\:/)) { return false; }
    if ( (obj.hostname == location.hostname)
	|| ('www.'+obj.hostname == location.hostname)
	|| (obj.hostname == 'www.'+location.hostname)
	) { return false; }
    return true;
};

// Creating custom :youtube selector
jQuery.expr[':'].youtube = function(obj){
	if (obj.hostname.match(/(www\.)?youtu(be\.com|\.be)/i)) { return true; }
	return false;
}

/**
 * 2. wsUtil object definition
 */

wsUtil = {

	// variables
	YTvideoIds : new Array(),
	ytPlayerReady : false,
	ytCurrentId : '',
	FBappid : 0,
	FBstatus : 0, // 0 = not logged into FB, 1 = logged in but not authorized, 2 = logged in, authorized
	FBuserid : null,
	FBaccessToken : null,
	frb : null,
	frbWidth : 0,
	frbTolerance : 0,
	frbOffset : 0,
	currentPopId : '',

	// functions
	init : function() {
		var self = wsUtil;
		self.populateInputs();
		self.prepareRollStates();
		self.prepareLoader();
	},

	setCookie : function(c_name,value,exdays) {
		var exdate=new Date();
		exdate.setDate(exdate.getDate() + exdays);
		var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
		document.cookie=c_name + "=" + c_value;
	},

	getCookie : function (c_name) {
		var i,x,y,ARRcookies=document.cookie.split(";");
		for (i=0;i<ARRcookies.length;i++) {
			x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
			y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
			x=x.replace(/^\s+|\s+$/g,"");
			if (x==c_name) {
				return unescape(y);
			}
		}
	},

	// populate inputs with the value of their labels
	populateInputs : function() {
		jQuery('input.populate').each(function() {
			var populate_text = jQuery('label[for="' + jQuery(this).attr('id') + '"]').text();
			if (populate_text) {
				if (jQuery.support.placeholder) {
					jQuery(this).attr('placeholder',populate_text);
				} else {
					jQuery(this).val(populate_text).data('populate_text', populate_text);
					jQuery(this).addClass('populated');				
					jQuery(this).focus(function() {
						if (jQuery(this).val() == jQuery(this).data('populate_text')) {
							jQuery(this).val('');
							jQuery(this).removeClass('populated');
						}
					});
					jQuery(this).blur(function() {
						if (jQuery(this).val() == '') {
							jQuery(this).val(jQuery(this).data('populate_text'));
							jQuery(this).addClass('populated');
						}
					});
				}
			}
		});
	},

	// set up roll states for submit buttons and images
	prepareRollStates : function() {
		var i = new Image();
		jQuery('.roll-image').each(function() {
			i.src = jQuery(this).attr('src').replace(/\.png/, '-on.png');
		});
		jQuery('.roll-image').hover(function() {
			jQuery(this).attr('src', jQuery(this).attr('src').replace(/\.png/, '-on.png'));
		}, function() {
			jQuery(this).attr('src', jQuery(this).attr('src').replace(/-on\.png/, '.png'));
		});
	},

	prepareLoader : function() {
		jQuery('#wrapper').append('<div id="wsutil-loader"><span class="throbber">Loading...</span></div>');
		var l = (jQuery('body').outerWidth() - jQuery('#wsutil-loader').outerWidth()) / 2;
		var t = (jQuery('body').outerHeight() - jQuery('#wsutil-loader').outerHeight()) / 2;
		jQuery('#wsutil-loader').css({ display : 'none', top : t+'px', left : l+'px' });
	},

	showLoader : function() {
		jQuery('#wsutil-loader').show();
	},

	hideLoader : function() {
		jQuery('#wsutil-loader').hide();
	},

	reCenterLoader : function() {
		var l = (jQuery('body').outerWidth() - jQuery('#wsutil-loader').outerWidth()) / 2;
		var t = (jQuery('body').outerHeight() - jQuery('#wsutil-loader').outerHeight()) / 2;
		jQuery('#wsutil-loader').css({ top : t+'px', left : l+'px' });
	},

	// open pop-up windows on particular links, by selector
	preparePopUps : function(sel,w,h) {
		jQuery(sel).click(function(event){
			var left = (screen.width - w)/2;
			var top = (screen.height - h)/2;
			top = (top < 50) ? 50 : top;
			var attr = 'height='+h+',width='+w+',left='+left+',top='+top+',location=0,menubar=0,status=0';
			window.open(jQuery(this).attr('href'),'popup',attr);
			event.preventDefault();
		});
	},

	// prepare external links
	prepareExternalLinks : function(exceptions) {
		var sel;
		if (exceptions instanceof Array) {
			sel = exceptions.join()
		} else {
			sel = exceptions;
		}
		jQuery('a:external').addClass('external');
		jQuery(sel).removeClass('external');
		jQuery('a:youtube').removeClass('external'); // comment out if not using YTLinks function
		jQuery('a.external').each(function(){
			var href = jQuery(this).attr('href');
			var title = jQuery(this).attr('title') ? jQuery(this).attr('title') : '';
			title += (title.length > 0) ? ' ' : '';
			title += '(opens in a new window)';
			jQuery(this).attr('title',title);
			jQuery(this).click(function(event){
				window.open(href,'external','');
				event.preventDefault();
			});
		});
	},

	prepareNavigation : function(container) {
		jQuery('#navigation h2.navigation-header, #navigation > ul.main-menu').addClass('collapsed');
		jQuery('#navigation h2.navigation-header').append('<span class="toggle">+</span>').click(function(){
			if (jQuery(this).hasClass('collapsed')) {
				jQuery('#navigation h2.navigation-header, #navigation > ul.main-menu').removeClass('collapsed').addClass('expanded');
				jQuery(this).find('.toggle').html('-');
			} else {
				jQuery('#navigation h2.navigation-header, #navigation > ul.main-menu').removeClass('expanded').addClass('collapsed');
				jQuery(this).find('.toggle').html('+');
			}
		});
	},

	prepareTouchMenu : function(breakpoint, phone) {

		if (breakpoint == null) { breakpoint = 767; }

		// for touch devices wider than the breakpoint (defaults to iPad)
		jQuery('.touch #navigation li.expanded > a').click(function(event){
			if (jQuery(window).width() <= breakpoint) { return true; }
			var $p = jQuery(this).parent();
			if ($p.hasClass('touchExpanded')) { return true; }
			$p.children('ul.main-menu').slideDown(300, function(){
				$p.addClass('touchExpanded');
			});
			event.preventDefault();
		});

		if ((jQuery(window).width() > breakpoint) || (jQuery(window).height() > breakpoint)) {
			jQuery('.touch ul.main-menu li ul').wipetouch({
				wipeUp: function(result) {
					jQuery('li.touchExpanded ul').slideUp(300, function(){
						jQuery('li.touchExpanded').removeClass('touchExpanded');
					});
				} 
			});
		}

		jQuery(document).click(function(event){
			var $t = jQuery(event.target);
			if ($t.is('a')) { return; }
			if ($t.closest('li.touchExpanded').length) { return; }
			jQuery('li.touchExpanded ul').slideUp(300, function(){
				jQuery('li.touchExpanded').removeClass('touchExpanded');
			});
		});

		// set up phone menu with multiple layers
		if (phone) {
			wsUtil.preparePhoneMenu(breakpoint);
		}

	},

	preparePhoneMenu : function(breakpoint) {
		if (jQuery('html').hasClass('no-touch')) { wsUtil.prepareNavigation(); return; }

		(function($) {

		$('#navigation-wrapper').addClass('touch-menu');
		$('#navigation li.expanded > a').append('<span class="expand">&raquo;</span>');
		$('#navigation .navigation-header').remove().prependTo('#navigation-wrapper').click(function(event){
			event.preventDefault();
			$('#navigation').show();
			var w = $('#navigation').width();
			$('#navigation > ul').css('left',w).animate({'left' : 0}, 300);
		});
		if ((jQuery(window).width() <= breakpoint) || (jQuery(window).height() <= breakpoint)) {
			$('.touch-menu #navigation li.expanded .expand').click(function(event){
				event.stopPropagation();
				event.preventDefault();
				w = $(this).parents('ul').width();
				$(this).parents('li.expanded').children('ul').css('left',w).animate({'left' : 0}, 300);
			});
			$('.touch-menu #navigation ul.main-menu').wipetouch({
				preventDefault : false,
				wipeRight: function(result) {
					w = result.source.width();
					result.source.animate({'left' : w}, 300, function() {
						result.source.css('left','100%');
						if (result.source.parent().attr('id') == 'navigation') { $('#navigation').hide(); }
					});
				}
			});
			$('.touch-menu #navigation ul.main-menu li a').wipetouch({
				preventDefault : false,
				wipeRight: function(result) {
					var $ul = result.source.closest('ul.main-menu');
					w = $ul.width();
					$ul.animate({'left' : w}, 300, function() {
						$ul.css('left','100%');
						if ($ul.parent().attr('id') == 'navigation') { $('#navigation').hide(); }
					});
				}
			});
		}

		})(jQuery);
	},

	// prepare YouTube links
	prepareYTlinks : function() {
		var href, id, arr, t, $a;
		wsUtil.YTlinksCount = jQuery('a:youtube').length;
		if (wsUtil.YTlinksCount < 1) { return; }

		if (jQuery('#popups').length < 0) { jQuery('#wrapper').append('<aside id="popups" role="complementary"><div class="region region-popups"></div></aside>'); }
		jQuery('#popups .region').append('<div class="block" id="block-wsutil-ytplayer"><div class="popup-close"></div><h2>Video</h2><div class="content"><div id="wsutil-ytplayer"></div></div></div>');
		jQuery('#block-wsutil-ytplayer .popup-close').click(function(){
			wsUtil.unpopBlock('#block-wsutil-ytplayer');
		});

		var tag = document.createElement('script');
		tag.src = "https://www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

		jQuery('a:youtube').each(function(i){
			$a = jQuery(this);
			href = $a.attr('href');
			arr = href.match(/v=([^&]*)/);
			if (arr != null && arr.length > 1) { id = arr[1]; } else { id = null; }
			$a.attr('data-YTid',id);
			wsUtil.YTvideoIds[i] = id;
			if (id) {
				$a.attr('pop-target','#block-wsutil-ytplayer')
				wsUtil.titleYTlink($a,id);
				$a.click(function(event){
					// if (jQuery('html').attr('id') == 'ie7') { return; }
					event.preventDefault();
					wsUtil.playYTlink(jQuery(this));
				});
			}
		});
	},

	titleYTlink : function($a,id) {
		if ( (window.XDomainRequest) || (jQuery('html').attr('id') == 'ie7') ) {
			$a.attr('data-YTtitle','VIDEO');
			return;
		}
		jQuery.get('http://gdata.youtube.com/feeds/api/videos/'+id,function(xml){
			t=jQuery(xml).children('entry').children('title').text();
			$a.attr('data-YTtitle',t);
		},'xml');
	},

	playYTlink : function(a) {
		var href = a.attr('href');
		var id = a.attr('data-YTid');
		var t = a.attr('data-YTtitle');
		var rW = jQuery('body').outerWidth();
		if ( (rW < 768) || (id == null) || (!wsUtil.ytPlayerReady) ) {
			window.open(href,'youtube','');
			return;
		}
		jQuery('#block-wsutil-ytplayer h2').html(t);
		if (id == wsUtil.ytCurrentId) {
			wsUtil.popBlock(a);
			wsUtil.ytplayer.playVideo();
		} else {
			wsUtil.showLoader();
			wsUtil.ytCurrentId = id;
			wsUtil.ytPlayerPlay = true;
			wsUtil.ytplayer.loadVideoById(id);
		}
	},

	onYTPlayerReady : function(event) {
		wsUtil.ytPlayerReady = true;
	},

	onYTPlayerStateChange : function(event) {
		if (wsUtil.currentPopId != '#block-wsutil-ytplayer' && (event.data == YT.PlayerState.PLAYING)) {
			wsUtil.hideLoader();
			wsUtil.popBlockById('#block-wsutil-ytplayer');
		}
	},

	preloadImages : function() {
		var img = new Image();
		for (i=0; i<arguments.length; i++) {
			img.src = Drupal.settings.basePath + 'sites/all/themes/'+Drupal.settings.ajaxPageState.theme+'5/images/'+arguments[i];
		}
	},

	// validate email
	validateEmail : function(form,input) {
		jQuery(form).submit(function(){
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ 
			if (!jQuery(input).val().match(re)) {
				alert(jQuery(input).val() + ' is not a valid email address.');
				return false;
			}
		});
	},

	// load FB SDK
	initFB : function(appId) {
		wsUtil.FBappid = appId;
		window.fbAsyncInit = function() {
			FB.init({
				appId      : appId,
				status     : true, 
				cookie     : true,
				xfbml      : true,
				oauth      : true
			});
			FB.getLoginStatus(wsUtil.checkFB);
			FB.Event.subscribe('auth.statusChange', wsUtil.checkFB);
		};
		(function(d){
			var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
			js = d.createElement('script'); js.id = id; js.async = true;
			js.src = "//connect.facebook.net/en_US/all.js";
			d.getElementsByTagName('head')[0].appendChild(js);
		}(document));
	},

	checkFB : function(response) {
		if (response.status === 'connected') {
			wsUtil.FBuserid = response.authResponse.userID;
			wsUtil.FBaccessToken = response.authResponse.accessToken;
			wsUtil.FBstatus = 2;
		} else if (response.status === 'not_authorized') {
			wsUtil.FBstatus = 1;
		} else {
			wsUtil.FBstatus = 0;
		}
		// code elsewhere can bind to this event to ensure it's not run until after FB asynch init is run
		jQuery(window).trigger('checkFB.wsUtil');
	},

	// wrapper for functions that require FB authorization
	wrapFBaction : function(fn, fbscope) {
		if (wsUtil.FBstatus == 2) {
			fn();
		} else {
			FB.login(function(response){
				if(response.authResponse) {
					fn();
				}
			}, {scope : fbscope});
		}
	},

	loadTwitterScript : function() {
		var js, s = 'script', d = document, id='twitter-wjs', fjs=d.getElementsByTagName(s)[0];
		if(!d.getElementById(id)){
			js=d.createElement(s);
			js.id=id;
			js.src="//platform.twitter.com/widgets.js";
			fjs.parentNode.insertBefore(js,fjs);
		}
	},

	preparePopBlocks : function(mapping) {
		if (!jQuery('#ws-pop-overlay').length) {
			if (!jQuery('#popups .region').length) {
				if (!jQuery('#popups').length) { jQuery('#wrapper').append('<aside id="popups" />'); }
				jQuery('#popups').append('<div class="region region-popups" />');
			}
			jQuery('#popups .region').prepend('<div id="ws-pop-overlay"></div>');
		}
		jQuery('#popups .block').each(function(){
			if (!jQuery(this).children('.popup-close').length) {
				jQuery(this).prepend('<div class="popup-close"></div>');
				jQuery(this).children('.popup-close').click(function(){
					var id = '#'+jQuery(this).parent().attr('id');
					wsUtil.unpopBlock(id);
				});
			}
		});
		wsUtil.currentPopId = '';
		var blockId;
		for (i=0;i<mapping.length;i++) {
			blockId = mapping[i].target;
			if (!jQuery(blockId).length) { continue; }
			jQuery(mapping[i].anchor).click(function(event){
				wsUtil.popBlock(jQuery(this));
				event.preventDefault();
			}).attr('pop-target',blockId);
		}
	},

	popBlock : function(a) {
		var id = a.attr('pop-target');
		var href = a.attr('href');
		wsUtil.popBlockById(id);
		if ( (jQuery(id+' #user-login-form').length > 0) && (href.substr(0,24) == '/user/login?destination=') ) {
			var destination = href.substr(24);
			var action = jQuery(id + ' #user-login-form').attr('action').replace(/\?destination=[^&]+/,'?destination='+destination);
			jQuery(id + ' #user-login-form').attr('action',action);
		}
	},

	popBlockById : function(id) {
		if (wsUtil.currentPopId != '') {
			if (wsUtil.currentPopId == id) { return; }
			wsUtil.unpopBlock(wsUtil.currentPopId);
		}
		$block = jQuery(id);
		var w = $block.outerWidth();
		var t = 50;
		var bodyW = jQuery('body').outerWidth();
		if (w > bodyW) {
			w = bodyW;
			$block.css('width',w+'px');
			t = 0;
		}
		var l = (bodyW - w) / 2;
		jQuery('#ws-pop-overlay').fadeTo(0,0).css({
			display : 'block'
		}).click(function(){
			wsUtil.unpopBlock(id);
		}).fadeTo(100,0.4,function(){
			$block.hide().css({
				left : l+'px',
				top : t+'px'
			}).fadeTo(100,1);
		});
		wsUtil.currentPopId = id;
		if ( (jQuery(id + ' input[type="text"]').length > 0) && jQuery('html').hasClass('no-touch')) {
			jQuery(id + ' input[type="text"]:first').focus();
		}
	},

	unpopBlock : function(id) {
		if (wsUtil.ytplayer && wsUtil.ytplayer.stopVideo) { wsUtil.ytplayer.stopVideo(); }
		jQuery(id).css('left','-999em');
		jQuery('#ws-pop-overlay').unbind('click').fadeTo(200,0,function(){
			jQuery(this).hide();
		});
		wsUtil.currentPopId = '';
	},

	heckleWindow : function(id,delay,cookieName) {
		if (jQuery(id).length < 1) { return; }
		var heckleCookie = wsUtil.getCookie('wsHeckleWindow');
		if (heckleCookie == cookieName) { return; }
		wsUtil.setCookie('wsHeckleWindow',cookieName,365);
		var t = setTimeout(function(){
			wsUtil.popBlockById(id);
		}, delay);
	},

	fixOnScroll : function(sel, maxScroll, addBottomMarginTo) {
		wsUtil.fixOnScrollObj = jQuery(sel);
		wsUtil.fixOnScrollHeight = wsUtil.fixOnScrollObj.outerHeight(true);
		wsUtil.fixOnScrollAMT = jQuery(addBottomMarginTo);
		jQuery(window).scroll(function(){
			var pos = jQuery(window).scrollTop();
			if (pos > maxScroll) {
				wsUtil.fixOnScrollObj.addClass('fixed');
				if (wsUtil.fixOnScrollAMT) { wsUtil.fixOnScrollAMT.css('margin-bottom', wsUtil.fixOnScrollHeight+'px'); }
			} else {
				wsUtil.fixOnScrollObj.removeClass('fixed');
				if (wsUtil.fixOnScrollAMT) { wsUtil.fixOnScrollAMT.css('margin-bottom', '0px'); }
			}
		});
	},

	prepareFinishedReadingBlock : function(id, tolerance, offset) {
		wsUtil.frb = jQuery(id);
		if (wsUtil.frb.length < 1) { return; }
		if (jQuery(window).width() < 1000) { return; }
		if (window.Modernizr.touch) { return; }
		wsUtil.frb.css('position','absolute');
		wsUtil.frb.width(wsUtil.frb.width()+20);
		wsUtil.frbWidth = wsUtil.frb.outerWidth();
		wsUtil.frb.css('position','fixed');
		wsUtil.frb.prepend('<a href="#" class="popup-close">close</a>');
		wsUtil.frbTolerance = tolerance;
		wsUtil.frbOffset = offset;
		wsUtil.frb.remove().addClass('finished-reading-block inactive').css('right', 0 - (wsUtil.frbWidth + wsUtil.frbOffset)).appendTo('#wrapper');
		jQuery(window).scroll(function(event){
			var pos = jQuery(window).scrollTop();
			if ((jQuery('#wrapper').height()-(pos+jQuery(window).height())) < wsUtil.frbTolerance) {
				if (wsUtil.frb.hasClass('inactive')) {
					wsUtil.frb.animate({
						right : (0 - wsUtil.frbOffset)
					},400).removeClass('inactive').addClass('active');
				}
			} else {
				if (wsUtil.frb.hasClass('active')) {
					wsUtil.frb.animate({
						right : (0 - (wsUtil.frbWidth + wsUtil.frbOffset))
					},400).removeClass('active').addClass('inactive');
				}
			}
		});
		jQuery(id+' .popup-close').click(function(event){
			wsUtil.frb.animate({
				right : (0 - (wsUtil.frbWidth + wsUtil.frbOffset))
			},400).removeClass('active inactive');
			event.preventDefault();
		});
	},

	// fixes footer to bottom of the page if the content is not long enough
	// add to ready, load AND resize functions
	fixFooter : function() {
		var $footer = jQuery('#footer');
		var heightOfPage = jQuery(window).height();
		if ($footer.hasClass('fixed')) {
			var totalHeight = jQuery('#header').outerHeight()+jQuery('#wrapper-main').outerHeight()+$footer.outerHeight(); // note: might need to add height to account for top and bottom margins
			if (totalHeight > heightOfPage) { $footer.removeClass('fixed'); jQuery('#utility').removeClass('fixed'); }
		} else {
			var bottomOfFooter = $footer.offset().top + $footer.outerHeight();
			if (bottomOfFooter < heightOfPage) { $footer.addClass('fixed'); jQuery('#utility').addClass('fixed'); }
		}
	},

	// finds links which contain URLs as their text (likely to be long, and break layout on phones)
	// and replaces their inner text with (link)
	fixLongUrls : function() {
		jQuery('a:contains("http"), a:contains("www")').text('(link)');
	}

}

/**
 * 2.1 YouTube API functions
 */

function onYouTubeIframeAPIReady() {
	wsUtil.ytplayer = new YT.Player('wsutil-ytplayer', {
		height: '315',
		width: '560',
		videoId: wsUtil.YTvideoIds[0],
		events: {
			'onReady': wsUtil.onYTPlayerReady,
			'onStateChange': wsUtil.onYTPlayerStateChange
		}
	});
	wsUtil.ytCurrentId = wsUtil.YTvideoIds[0];
}

/**
 * 3.1 jQuery(document).ready
 */

jQuery(document).ready(function($){
	wsUtil.init();
	// wsUtil.prepareYTlinks();
	wsUtil.prepareTouchMenu(767, true); // 767 = menus behave normally above 767 pixels wide; true = set up multi-layered phone menu
	// wsUtil.prepareNavigation(); // use this instead of prepareTouchMenu for navigation that simply drops the whole menu down
	wsUtil.prepareExternalLinks('.btn-share .btn-facebook a, .btn-share .btn-twitter a');
	wsUtil.preparePopBlocks([{
		anchor : 'a[href^="'+Drupal.settings.basePath+'user/login"]',
		target : '#block-user-login'
	}]);
	wsUtil.fixOnScroll('#navigation-wrapper',120,'#header');

	wsUtil.preparePopUps('.btn-share .btn-facebook a',640,480);
	wsUtil.preparePopUps('.btn-share .btn-twitter a',550,450);
	wsUtil.preparePopUps('.print_html a',800,600);

	// validate any forms
	if ($('form').validate) {
		$('form').each(function(){
			$(this).validate();
		});
	}

	// allow users to dismiss messages by clicking them
	jQuery('.messages').prepend('<div class="close" title="(dismiss message)">&times;</div>');
	jQuery('.messages .close').click(function(event){jQuery(this).parent().slideUp();});

	if (jQuery(window).width() < 768) {
		wsUtil.fixLongUrls();
	}

});

/**
 * 3.2 jQuery(window).load
 */

jQuery(window).load(function(){

});

/**
 * 3.3 jQuery(window).smartresize
 */

jQuery(window).smartresize(function(){
	wsUtil.reCenterLoader();
	if (jQuery(window).width() < 768) {
		wsUtil.fixLongUrls();
	}
});
