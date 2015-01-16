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

// autopopulate form inputs with labels, and clear when text is entered
jQuery.support.placeholder = (function(){
    var i = document.createElement('input');
    return 'placeholder' in i;
})();

function populateInputs(sel) {
	jQuery(sel).each(function() {
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
}
//fix footer to screen bottom
	function fixFooter() {
		var $footer = jQuery('#zone-footer-wrapper');
		var heightOfPage = jQuery(window).height();
		if ($footer.hasClass('fixed')) {
			var totalHeight = jQuery('#section-header').outerHeight()+jQuery('#section-content').outerHeight()+$footer.outerHeight(); // note: might need to add height to account for top and bottom margins
			if (totalHeight > heightOfPage) { $footer.removeClass('fixed');
			}
		} else {
			var bottomOfFooter = $footer.offset().top + $footer.outerHeight();
			if (bottomOfFooter < heightOfPage) { $footer.addClass('fixed'); 
			}
		}
	}

// fix sidebar height
function fixSidebarHeight() {
  if (jQuery(window).width() < [739]) { jQuery('#region-sidebar-second').css('height','auto'); return; }
  var h = jQuery('#region-content').outerHeight();
  if (jQuery('#region-sidebar-second').outerHeight() < h) {
    jQuery('#region-sidebar-second').height(h-60);
  }
}

jQuery(document).ready(function(){
	//invokes the function to populate inputs with their labels
	populateInputs('.region-sidebar-second .form-item .form-text');

	//change link text to "link"
    jQuery('.quicktabs-tabpage a:contains("http"), .quicktabs-tabpage a:contains("www")').text('(link)');

	//mobile dropdown... insert icon, hide/show on click, etc
		jQuery('<div id="navicon"><i class="fa fa-bars"></i>&nbsp; Navigation</div>').insertBefore('#om-menu-mega-menu');
		jQuery('ul.om-menu').addClass('collapsed');
		jQuery('#navicon').click(function(){
			if (jQuery('#om-menu-mega-menu').hasClass('collapsed')) {
				jQuery('#om-menu-mega-menu').removeClass('collapsed').addClass('expanded');
			} else {
				jQuery('#om-menu-mega-menu').removeClass('expanded').addClass('collapsed');
				}

//			var h = jQuery('#om-menu-mega-menu').height();
//			if (jQuery('#om-menu-mega-menu ul.om-menu').height() < h) { jQuery('#om-maximenu-main-menu ul.om-menu').css('min-height',h+'px'); }
		
			// jQuery('#om-menu-mega-menu ul.om-menu').animate({'left':0},300);
		});
/*
		jQuery('#om-menu-mega-menu ul.om-menu li.close').click(function(){
			var w = jQuery('#om-menu-mega-menu').width();
			jQuery('#om-menu-mega-menu ul.om-menu').animate({'left':w},300,function(){
				jQuery('#om-menu-mega-menu').addClass('collapsed');
			});
		});
*/

	//for accordian effect in mobile menu
	jQuery('.om-maximenu .om-maximenu-content .block h3').click(function(){
		var $content = jQuery(this).next('.content');
		var closeThis = $content.hasClass('expanded');
		jQuery('.om-maximenu .om-maximenu-content .block .content').removeClass('expanded');
		if (!closeThis) { $content.addClass('expanded'); }
	});

	// put a responsive wrapper around any iframes in the content (for videos)
	jQuery('#block-system-main .content iframe').each(function(){
		var $self = jQuery(this);
		var w = $self.width();
		var h = $self.height();
		var ratio = Math.round(h/w*10000)/100;
		$self.wrap('<div style="width: 100%; height: 0; margin-bottom: 30px; padding-bottom:'+ratio+'%; position: relative;" />');
		$self.css({height:'100%',width:'100%',position:'absolute',top:0,left:0}).addClass('processed');
	});

	// fixes footer to bottom of the page if the content is not long enough
	// add to ready, load AND resize functions
	fixFooter();
	fixSidebarHeight();
});

jQuery(window).load(function(){
	fixFooter();
	fixSidebarHeight();
});

jQuery(window).smartresize(function(){
	fixFooter();
	fixSidebarHeight();
});
