try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'js/jquery.autoresize.js' */
/*
 * jQuery.fn.autoResize 1.14
 * --
 * https://github.com/jamespadolsey/jQuery.fn.autoResize
 * --
 * This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */ 

(function($){

	var uid = 'ar' + +new Date,

		defaults = autoResize.defaults = {
			onResize: function(){},
			onBeforeResize: function(){return 123},
			onAfterResize: function(){return 555},
			animate: {
				duration: 200,
				complete: function(){}
			},
			extraSpace: 50,
			minHeight: 'original',
			maxHeight: 500,
			minWidth: 'original',
			maxWidth: 500
		};

	autoResize.cloneCSSProperties = [
		'lineHeight', 'textDecoration', 'letterSpacing',
		'fontSize', 'fontFamily', 'fontStyle', 'fontWeight',
		'textTransform', 'textAlign', 'direction', 'wordSpacing', 'fontSizeAdjust',
		'paddingTop', 'paddingLeft', 'paddingBottom', 'paddingRight', 'width'
	];

	autoResize.cloneCSSValues = {
		position: 'absolute',
		top: -9999,
		left: -9999,
		opacity: 0,
		overflow: 'hidden'
	};

	autoResize.resizableFilterSelector = [
		'textarea:not(textarea.' + uid + ')',
		'input:not(input[type])',
		'input[type=text]',
		'input[type=password]',
		'input[type=email]',
		'input[type=url]'
	].join(',');

	autoResize.AutoResizer = AutoResizer;

	$.fn.autoResize = autoResize;

	function autoResize(config) {
		this.filter(autoResize.resizableFilterSelector).each(function(){
			new AutoResizer( $(this), config );
		});
		return this;
	}

	function AutoResizer(el, config) {

		if (el.data('AutoResizer')) {
			el.data('AutoResizer').destroy();
		}
		
		config = this.config = $.extend({}, autoResize.defaults, config);
		this.el = el;

		this.nodeName = el[0].nodeName.toLowerCase();

		this.originalHeight = el.height();
		this.previousScrollTop = null;

		this.value = el.val();

		if (config.maxWidth === 'original') config.maxWidth = el.width();
		if (config.minWidth === 'original') config.minWidth = el.width();
		if (config.maxHeight === 'original') config.maxHeight = el.height();
		if (config.minHeight === 'original') config.minHeight = el.height();

		if (this.nodeName === 'textarea') {
			el.css({
				resize: 'none',
				overflowY: 'hidden'
			});
		}

		el.data('AutoResizer', this);

		// Make sure onAfterResize is called upon animation completion
		config.animate.complete = (function(f){
			return function() {
				config.onAfterResize.call(el);
				return f.apply(this, arguments);
			};
		}(config.animate.complete));

		this.bind();

	}

	AutoResizer.prototype = {

		bind: function() {

			var check = $.proxy(function(){
				this.check();
				return true;
			}, this);

			this.unbind();

			this.el
				.bind('keyup.autoResize', check)
				//.bind('keydown.autoResize', check)
				.bind('change.autoResize', check)
				.bind('paste.autoResize', function() {
					setTimeout(function() { check(); }, 0);
				});
			
			if (!this.el.is(':hidden')) {
				this.check(null, true);
			}

		},

		unbind: function() {
			this.el.unbind('.autoResize');
		},

		createClone: function() {

			var el = this.el,
				clone = this.nodeName === 'textarea' ? el.clone() : $('<span/>');

			this.clone = clone;

			$.each(autoResize.cloneCSSProperties, function(i, p){
				clone[0].style[p] = el.css(p);
			});

			clone
				.removeAttr('name')
				.removeAttr('id')
				.addClass(uid)
				.attr('tabIndex', -1)
				.css(autoResize.cloneCSSValues);

			if (this.nodeName === 'textarea') {
				clone.height('auto');
			} else {
				clone.width('auto').css({
					whiteSpace: 'nowrap'
				});
			}

		},

		check: function(e, immediate) {

			if (!this.clone) {
		this.createClone();
		this.injectClone();
			}

			var config = this.config,
				clone = this.clone,
				el = this.el,
				value = el.val();

			// Do nothing if value hasn't changed
			if (value === this.prevValue) { return true; }
			this.prevValue = value;

			if (this.nodeName === 'input') {

				clone.text(value);

				// Calculate new width + whether to change
				var cloneWidth = clone.width(),
					newWidth = (cloneWidth + config.extraSpace) >= config.minWidth ?
						cloneWidth + config.extraSpace : config.minWidth,
					currentWidth = el.width();

				newWidth = Math.min(newWidth, config.maxWidth);

				if (
					(newWidth < currentWidth && newWidth >= config.minWidth) ||
					(newWidth >= config.minWidth && newWidth <= config.maxWidth)
				) {

					config.onBeforeResize.call(el);
					config.onResize.call(el);

					el.scrollLeft(0);

					if (config.animate && !immediate) {
						el.stop(1,1).animate({
							width: newWidth
						}, config.animate);
					} else {
						el.width(newWidth);
						config.onAfterResize.call(el);
					}

				}

				return;

			}

			// TEXTAREA
			
			clone.width(el.width()).height(0).val(value).scrollTop(10000);
			
			var scrollTop = clone[0].scrollTop;
				
			// Don't do anything if scrollTop hasen't changed:
			if (this.previousScrollTop === scrollTop) {
				return;
			}

			this.previousScrollTop = scrollTop;
			
			if (scrollTop + config.extraSpace >= config.maxHeight) {
				el.css('overflowY', '');
				scrollTop = config.maxHeight;
				immediate = true;
			} else if (scrollTop <= config.minHeight) {
				scrollTop = config.minHeight;
			} else {
				el.css('overflowY', 'hidden');
				scrollTop += config.extraSpace;
			}

			config.onBeforeResize.call(el);
			config.onResize.call(el);

			// Either animate or directly apply height:
			if (config.animate && !immediate) {
				el.stop(1,1).animate({
					height: scrollTop
				}, config.animate);
			} else {
				el.height(scrollTop);
				config.onAfterResize.call(el);
			}

		},

		destroy: function() {
			this.unbind();
			this.el.removeData('AutoResizer');
			this.clone.remove();
			delete this.el;
			delete this.clone;
		},

		injectClone: function() {
			(
				autoResize.cloneContainer ||
				(autoResize.cloneContainer = $('<arclones/>').appendTo('body'))
			).append(this.clone);
		}

	};
	
})(jQuery);

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'js/jquery.ba-resize.js' */
/*!
 * jQuery resize event - v1.1 - 3/14/2010
 * http://benalman.com/projects/jquery-resize-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery resize event
//
// *Version: 1.1, Last updated: 3/14/2010*
// 
// Project Home - http://benalman.com/projects/jquery-resize-plugin/
// GitHub       - http://github.com/cowboy/jquery-resize/
// Source       - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.js
// (Minified)   - http://github.com/cowboy/jquery-resize/raw/master/jquery.ba-resize.min.js (1.0kb)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// This working example, complete with fully commented code, illustrates a few
// ways in which this plugin can be used.
// 
// resize event - http://benalman.com/code/projects/jquery-resize/examples/resize/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-resize/unit/
// 
// About: Release History
// 
// 1.1 - (3/14/2010) Fixed a minor bug that was causing the event to trigger
//       immediately after bind in some circumstances. Also changed $.fn.data
//       to $.data to improve performance.
// 1.0 - (2/10/2010) Initial release

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // A jQuery object containing all non-window elements to which the resize
  // event is bound.
  var elems = $([]),
    
    // Extend $.resize if it already exists, otherwise create it.
    jq_resize = $.resize = $.extend( $.resize, {} ),
    
    timeout_id,
    
    // Reused strings.
    str_setTimeout = 'setTimeout',
    str_resize = 'resize',
    str_data = str_resize + '-special-event',
    str_delay = 'delay',
    str_throttle = 'throttleWindow';
  
  // Property: jQuery.resize.delay
  // 
  // The numeric interval (in milliseconds) at which the resize event polling
  // loop executes. Defaults to 250.
  
  jq_resize[ str_delay ] = 250;
  
  // Property: jQuery.resize.throttleWindow
  // 
  // Throttle the native window object resize event to fire no more than once
  // every <jQuery.resize.delay> milliseconds. Defaults to true.
  // 
  // Because the window object has its own resize event, it doesn't need to be
  // provided by this plugin, and its execution can be left entirely up to the
  // browser. However, since certain browsers fire the resize event continuously
  // while others do not, enabling this will throttle the window resize event,
  // making event behavior consistent across all elements in all browsers.
  // 
  // While setting this property to false will disable window object resize
  // event throttling, please note that this property must be changed before any
  // window object resize event callbacks are bound.
  
  jq_resize[ str_throttle ] = true;
  
  // Event: resize event
  // 
  // Fired when an element's width or height changes. Because browsers only
  // provide this event for the window element, for other elements a polling
  // loop is initialized, running every <jQuery.resize.delay> milliseconds
  // to see if elements' dimensions have changed. You may bind with either
  // .resize( fn ) or .bind( "resize", fn ), and unbind with .unbind( "resize" ).
  // 
  // Usage:
  // 
  // > jQuery('selector').bind( 'resize', function(e) {
  // >   // element's width or height has changed!
  // >   ...
  // > });
  // 
  // Additional Notes:
  // 
  // * The polling loop is not created until at least one callback is actually
  //   bound to the 'resize' event, and this single polling loop is shared
  //   across all elements.
  // 
  // Double firing issue in jQuery 1.3.2:
  // 
  // While this plugin works in jQuery 1.3.2, if an element's event callbacks
  // are manually triggered via .trigger( 'resize' ) or .resize() those
  // callbacks may double-fire, due to limitations in the jQuery 1.3.2 special
  // events system. This is not an issue when using jQuery 1.4+.
  // 
  // > // While this works in jQuery 1.4+
  // > $(elem).css({ width: new_w, height: new_h }).resize();
  // > 
  // > // In jQuery 1.3.2, you need to do this:
  // > var elem = $(elem);
  // > elem.css({ width: new_w, height: new_h });
  // > elem.data( 'resize-special-event', { width: elem.width(), height: elem.height() } );
  // > elem.resize();
      
  $.event.special[ str_resize ] = {
    
    // Called only when the first 'resize' event callback is bound per element.
    setup: function() {
      // Since window has its own native 'resize' event, return false so that
      // jQuery will bind the event using DOM methods. Since only 'window'
      // objects have a .setTimeout method, this should be a sufficient test.
      // Unless, of course, we're throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var elem = $(this);
      
      // Add this element to the list of internal elements to monitor.
      elems = elems.add( elem );
      
      // Initialize data store on the element.
      $.data( this, str_data, { w: elem.width(), h: elem.height() } );
      
      // If this is the first element added, start the polling loop.
      if ( elems.length === 1 ) {
        loopy();
      }
    },
    
    // Called only when the last 'resize' event callback is unbound per element.
    teardown: function() {
      // Since window has its own native 'resize' event, return false so that
      // jQuery will unbind the event using DOM methods. Since only 'window'
      // objects have a .setTimeout method, this should be a sufficient test.
      // Unless, of course, we're throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var elem = $(this);
      
      // Remove this element from the list of internal elements to monitor.
      elems = elems.not( elem );
      
      // Remove any data stored on the element.
      elem.removeData( str_data );
      
      // If this is the last element removed, stop the polling loop.
      if ( !elems.length ) {
        clearTimeout( timeout_id );
      }
    },
    
    // Called every time a 'resize' event callback is bound per element (new in
    // jQuery 1.4).
    add: function( handleObj ) {
      // Since window has its own native 'resize' event, return false so that
      // jQuery doesn't modify the event object. Unless, of course, we're
      // throttling the 'resize' event for window.
      if ( !jq_resize[ str_throttle ] && this[ str_setTimeout ] ) { return false; }
      
      var old_handler;
      
      // The new_handler function is executed every time the event is triggered.
      // This is used to update the internal element data store with the width
      // and height when the event is triggered manually, to avoid double-firing
      // of the event callback. See the "Double firing issue in jQuery 1.3.2"
      // comments above for more information.
      
      function new_handler( e, w, h ) {
        var elem = $(this),
          data = $.data( this, str_data );
        
        // If called from the polling loop, w and h will be passed in as
        // arguments. If called manually, via .trigger( 'resize' ) or .resize(),
        // those values will need to be computed.
        data.w = w !== undefined ? w : elem.width();
        data.h = h !== undefined ? h : elem.height();
        
        old_handler.apply( this, arguments );
      };
      
      // This may seem a little complicated, but it normalizes the special event
      // .add method between jQuery 1.4/1.4.1 and 1.4.2+
      if ( $.isFunction( handleObj ) ) {
        // 1.4, 1.4.1
        old_handler = handleObj;
        return new_handler;
      } else {
        // 1.4.2+
        old_handler = handleObj.handler;
        handleObj.handler = new_handler;
      }
    }
    
  };
  
  function loopy() {
    
    // Start the polling loop, asynchronously.
    timeout_id = window[ str_setTimeout ](function(){
      
      // Iterate over all elements to which the 'resize' event is bound.
      elems.each(function(){
        var elem = $(this),
          width = elem.width(),
          height = elem.height(),
          data = $.data( this, str_data );
        
        // If element size has changed since the last time, update the element
        // data store and trigger the 'resize' event.
        if ( width !== data.w || height !== data.h ) {
          elem.trigger( str_resize, [ data.w = width, data.h = height ] );
        }
        
      });
      
      // Loop.
      loopy();
      
    }, jq_resize[ str_delay ] );
    
  };
  
})(jQuery,this);

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'js/cursores.js' */
// Copyright 2012 Nicolas Venegas <nvenegas@atlassian.com>
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function (window) {

  /**
   * Cursores allows you to get and replace the token under the cursor
   * in a textarea, text input, or string.
   *
   * By default, the token is whitespace delimited with a search
   * window 128 characters either side of the cursor.
   *
   * leftRegex and rightRegex must each define exactly one capturing
   * group. maxLength must be greater than 0.
   */
  function Cursores(leftRegex, rightRegex, maxLength) {
    this.leftRegex = new RegExp((leftRegex || /(?:^|\s)(\S+)/).source + '$');
    this.rightRegex = new RegExp('^' + (rightRegex || /(\S*)/).source);
    this.maxLength = maxLength > 0 ? maxLength : 128;
  }

  Cursores.VERSION = '0.2';

  /**
   * Returns a new instance that matches a whitespace delimited token
   * starting with the provided character.
   */
  Cursores.startsWith = function (c) {
    return new Cursores(
      new RegExp(['(?:^|\\s)(', c, '[^', c, '\\s]*)'].join(''))
    );
  };

  /**
   * Returns an object representing the token under the cursor.
   *
   * There must be matching text to the left of the cursor to be
   * within a token. For example, in 'f|ox' and 'fox|' (where '|'
   * denotes the cursor), the token value is 'fox', but in '|fox',
   * there is no token under the cursor.
   *
   * If there is no token under the cursor, the "value", "prefix", and
   * "suffix" properties of the result are all the empty string.
   */
  Cursores.prototype.token = function (source, cursorIndex) {
    var text;
    if (typeof source === 'string') {
      // (string, cursorIndex)
      text = source;
    } else {
      // (el)
      text = source.value;
      cursorIndex = source.selectionStart;
    }

    var left = text.slice(0, cursorIndex),
        right = text.slice(cursorIndex),
        searchLeft = left.slice(-this.maxLength),
        searchRight = right.slice(0, this.maxLength);

    var match = searchLeft.match(this.leftRegex),
        prefix = match ? match[1] : '',
        suffix = (match = searchRight.match(this.rightRegex)) ? match[1] : '';

    return {
      value: prefix ? prefix + suffix : '',
      prefix: prefix,
      suffix: prefix ? suffix : '',
      toString: function () { return this.value; }
    };
  };

  /**
   * Replace the token under the cursor with the provided replacement
   * text and, if source is an element, move the cursor to the end of
   * the replacement text within the element.
   *
   * If the source is empty (i.e., it has no contents), even though
   * there is no token under the cursor, the replacement always
   * succeeds.
   *
   * If source is a string, returns the resulting text. If source is
   * an element, returns true if a replacement was made else false.
   */
  Cursores.prototype.replace = function (source, cursorIndex, replacement) {
    var text;
    if (typeof source === 'string') {
      // (string, cursorIndex, replacement)
      text = source;
    } else {
      // (el, replacement)
      text = source.value;
      replacement = cursorIndex;
      cursorIndex = source.selectionStart;
    }

    var token = this.token(text, cursorIndex);
    if (text && !token.value) {
      return typeof source === 'string' ? text : false;
    }

    var left = text.slice(0, cursorIndex),
        right = text.slice(cursorIndex);
    var replacedText = [
      left.slice(0, left.length - token.prefix.length),
      replacement,
      right.slice(token.suffix.length)
    ].join('');

    if (typeof source === 'string') {
      return replacedText;
    } else {
      var delta = replacement.length - token.prefix.length;
      source.value = replacedText;
      source.setSelectionRange(cursorIndex + delta, cursorIndex + delta);
      return true;
    }
  };

  window.Cursores = Cursores;

})(this);

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'js/talk-string-helper.js' */
(function($) {
    window.TalkStringHelper = {
        truncateText: function(container, textBox, paddings) {
            var childrenWidth = 0;
            container.children().each(function() {
                if ($(this).css('position') != 'absolute') {
                    childrenWidth += $(this).outerWidth(true);
                }
            });
            childrenWidth -= textBox.outerWidth(true);

            if (textBox.outerWidth(true) >= container.width() - childrenWidth - paddings) {
                var childNodes = textBox.get(0).childNodes;

                for (var j = childNodes.length - 1; j >= 0; j--) {
                    var childNode = childNodes[j];
                    var truncatedChars = 1;
                    var valueAttr = (childNode.nodeType == 3) ? "nodeValue" : "innerHTML";
                    var nodeText = childNode[valueAttr];

                    do {
                        if (truncatedChars <= nodeText.length) {
                            childNode[valueAttr] = nodeText.substr(0, nodeText.length - truncatedChars++);
                        } else {
                            break;
                        }
                    } while (textBox.outerWidth(true) + 10 >= container.width() - childrenWidth - paddings);

                    if (truncatedChars <= nodeText.length) {
                        textBox.append("&#8230;");
                        break;
                    }
                }
            }
        },

        isUrl: function(str) {
            var pattern = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
            return pattern.test(str);
        },

        textDiff: function(first, second) {
            var start = 0;
            while (start < first.length && first[start] == second[start]) {
                ++start;
            }

            var end = 0;
            while (first.length - end > start && first[first.length - end - 1] == second[second.length - end - 1]) {
                ++end;
            }

            end = second.length - end;
            return {
                string: second.substr(start, end - start),
                start: start
            }
        }
    };

    $.fn.insertAtCaret = function(text) {
        var txtarea = this.get(0);
        var scrollPos = txtarea.scrollTop;
        var strPos = 0;
        var br = ((txtarea.selectionStart || txtarea.selectionStart == '0') ?
            "ff" : (document.selection ? "ie" : false ) );
        if (br == "ie") {
            txtarea.focus();
            var range = document.selection.createRange();
            range.moveStart ('character', -txtarea.value.length);
            strPos = range.text.length;
        }
        else if (br == "ff") strPos = txtarea.selectionStart;

        var front = (txtarea.value).substring(0,strPos);
        var back = (txtarea.value).substring(strPos,txtarea.value.length);
        txtarea.value=front+text+back;
        strPos = strPos + text.length;
        if (br == "ie") {
            txtarea.focus();
            range = document.selection.createRange();
            range.moveStart ('character', -txtarea.value.length);
            range.moveStart ('character', strPos);
            range.moveEnd ('character', 0);
            range.select();
        }
        else if (br == "ff") {
            txtarea.selectionStart = strPos;
            txtarea.selectionEnd = strPos;
            txtarea.focus();
        }
        txtarea.scrollTop = scrollPos;
    };

    $.fn.getCursorPosition = function() {
        var el = $(this).get(0);
        var pos = 0;
        if('selectionStart' in el) {
            pos = el.selectionStart;
        } else if('selection' in document) {
            el.focus();
            var Sel = document.selection.createRange();
            var SelLength = document.selection.createRange().text.length;
            Sel.moveStart('character', -el.value.length);
            pos = Sel.text.length - SelLength;
        }
        return pos;
    };

    $.fn.setCursorPosition = function(pos) {
        if ($(this).get(0).setSelectionRange) {
            $(this).get(0).setSelectionRange(pos, pos);
        } else if ($(this).get(0).createTextRange) {
            var range = $(this).get(0).createTextRange();
            range.collapse(true);
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    };
})(AJS.$);

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'js/jquery-textrange.js' */
/**
 * jquery-textrange
 * A jQuery plugin for getting, setting and replacing the selected text in input fields and textareas.
 * See the [wiki](https://github.com/dwieeb/jquery-textrange/wiki) for usage and examples.
 *
 * (c) 2013 Daniel Imhoff <dwieeb@gmail.com> - danielimhoff.com
 */
(function($) {

	var browserType,

	textrange = {

		/**
		 * $().textrange() or $().textrange('get')
		 *
		 * Retrieves an object containing the start and end location of the text range, the length of the range and the
		 * substring of the range.
		 *
		 * @param (optional) property
		 * @return An object of properties including position, start, end, length, and text or a specific property.
		 */
		get: function(property) {
			return _textrange[browserType].get.apply(this, [property]);
		},

		/**
		 * $().textrange('set')
		 *
		 * Sets the selected text of an object by specifying the start and length of the selection.
		 *
		 * The start and length parameters are identical to PHP's substr() function with the following changes:
		 *  - excluding start will select all the text in the field.
		 *  - passing 0 for length will set the cursor at start. See $().textrange('setcursor')
		 *
		 * @param (optional) start
		 * @param (optional) length
		 *
		 * @see http://php.net/manual/en/function.substr.php
		 */
		set: function(start, length) {
			var s = parseInt(start),
			    l = parseInt(length),
			    e;

			if (typeof start === 'undefined') {
				s = 0;
			}
			else if (start < 0) {
				s = this.val().length + s;
			}

			if (typeof length === 'undefined') {
				e = this.val().length;
			}
			else if (length >= 0) {
				e = s + l;
			}
			else {
				e = this.val().length + l;
			}

			_textrange[browserType].set.apply(this, [s, e]);

			return this;
		},

		/**
		 * $().textrange('setcursor')
		 *
		 * Sets the cursor at a position of the text field.
		 *
		 * @param position
		 */
		setcursor: function(position) {
			return this.textrange('set', position, 0);
		},

		/**
		 * $().textrange('replace')
		 * Replaces the selected text in the input field or textarea with text.
		 *
		 * @param text The text to replace the selection with.
		 */
		replace: function(text) {
			_textrange[browserType].replace.apply(this, [text]);

			return this;
		},

		/**
		 * Alias for $().textrange('replace')
		 */
		insert: function(text) {
			return this.textrange('replace', text);
		}
	},

	_textrange = {
		xul: {
			get: function(property) {
				var props = {
					position: this[0].selectionStart,
					start: this[0].selectionStart,
					end: this[0].selectionEnd,
					length: this[0].selectionEnd - this[0].selectionStart,
					text: this.val().substring(this[0].selectionStart, this[0].selectionEnd)
				};

				return typeof property === 'undefined' ? props : props[property];
			},

			set: function(start, end) {
				this[0].selectionStart = start;
				this[0].selectionEnd = end;
			},

			replace: function(text) {
				var start = this[0].selectionStart;
				this.val(this.val().substring(0, this[0].selectionStart) + text + this.val().substring(this[0].selectionEnd, this.val().length));
				this[0].selectionStart = start;
				this[0].selectionEnd = start + text.length;
			}
		},

		msie: {
			get: function(property) {
				var range = document.selection.createRange();

				if (typeof range === 'undefined') {
					return {
						position: 0,
						start: 0,
						end: this[0].val().length,
						length: this[0].val().length,
						text: this.val()
					};
				}

				var rangetext = this[0].createTextRange();
				var rangetextcopy = rangetext.duplicate();

				rangetext.moveToBookmark(range.getBookmark());
				rangetextcopy.setEndPoint('EndToStart', rangetext);

				return {
					position: rangetextcopy.text.length,
					start: rangetextcopy.text.length,
					end: rangetextcopy.text.length + range.text.length,
					length: range.text.length,
					text: range.text
				};
			},

			set: function(start, end) {
				var range = this[0].createTextRange();

				if (typeof range === 'undefined') {
					return this;
				}

				if (typeof start !== 'undefined') {
					range.moveStart('character', start);
					range.collapse();
				}

				if (typeof end !== 'undefined') {
					range.moveEnd('character', end - start);
				}

				range.select();
			},

			replace: function(text) {
				document.selection.createRange().text = text;
			}
		}
	};

	$.fn.textrange = function(method) {
		if (typeof browserType === 'undefined') {
			browserType = 'selectionStart' in this[0] ? 'xul' : document.selection ? 'msie' : 'unknown';
		}

		// I don't know how to support this browser. :c
		if (browserType === 'unknown') {
			return this;
		}

		// Prevents unpleasant behaviour for textareas in IE:
		// If you have a textarea which is too wide to be displayed entirely and therfore has to be scrolled horizontally,
		// then typing one character after another will scroll the page automatically to the right at the moment you reach
		// the right border of the visible part. But calling the focus function causes the page to be scrolled to the left
		// edge of the textarea. Immediately after that jump to the left side, the content is scrolled back to the cursor
		// position, which leads to a flicker page every time you type a character.
		if (document.activeElement !== this[0]) {
			this[0].focus();
		}

		if (typeof method === 'undefined' || typeof method !== 'string') {
			return textrange.get.apply(this);
		}
		else if (typeof textrange[method] === 'function') {
			return textrange[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else {
			$.error("Method " + method + " does not exist in jQuery.textrange");
		}
	};
})(jQuery);

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'js/talk.autocomplete.js' */
(function($) {

    window.TalkAutocomplete = {
        mentionCursor: Cursores.startsWith('@'),
        linkSearchCursor: new Cursores(new RegExp('(?:^|\\s)(\\[[^\\[\\]~]*)'), new RegExp('(.)')),
        linkInsertCursor: new Cursores(new RegExp('(?:^|\\s)(\\[[^\\[\\]]*)'), new RegExp('([^\\].]*)')),
        linkAutoCompleteEnabled: false,

        init: function($textarea) {
            if ($.browser.msie  && parseInt($.browser.version, 10) <= 8) {
                return;
            }

            var t = this;
            $(document).click(function() {
                t.removeSuggestions();
            });

            t.bindTextAreaEvents($textarea);
        },

        bindTextAreaEvents: function($textarea) {
            this.bindTextAreaSuggestionsNavigation($textarea);
            this.bindTextAreaAutocomplete($textarea);
            this.bindTextAreaLinkAutoconvert($textarea);
        },

        bindTextAreaSuggestionsNavigation: function($textarea) {
            $textarea.keydown(function(e) {
                var $suggestions = $('.gd-suggestions');
                if ($suggestions.length > 0) {
                    if ($.inArray(e.which, [13, 27, 38, 40]) >= 0) {
                        e.preventDefault();
                        e.stopPropagation();
                    }

                    // Enter
                    if (e.which == 13) {
                        $('.gd-suggestion-active').find('.gd-suggestion').click();
                    }

                    // Escape
                    if (e.which == 27) {
                        $suggestions.remove();
                    }

                    // Up
                    if (e.which == 38) {
                        var $prev = $('.gd-suggestion-active').removeClass('gd-suggestion-active').prev('li');
                        if ($prev.length == 0) {
                            $prev = $suggestions.find("li:last");
                        }
                        $prev.addClass("gd-suggestion-active");
                    }

                    // Down
                    if (e.which == 40) {
                        var $next = $('.gd-suggestion-active').removeClass('gd-suggestion-active').next('li');
                        if ($next.length == 0) {
                            $next = $suggestions.find("li:first");
                        }
                        $next.addClass("gd-suggestion-active");
                    }
                }
            });
        },

        bindTextAreaAutocomplete: function($textarea) {
            var t = this;

            $textarea.keyup(function(e) {
                if (e.which == 27) {
                    t.linkAutoCompleteEnabled = false;
                    return;
                } else if ($.inArray(e.which, [13, 38, 40]) >= 0) {
                    return;
                } else if (e.which == 219) {
                    var pos = $textarea.getCursorPosition();

                    if ($textarea.val()[pos - 1] == '[') {
                        $textarea.insertAtCaret(']');
                        $textarea.setCursorPosition(pos);
                        t.linkAutoCompleteEnabled = true;
                    }
                }

                var mentionToken = t.mentionCursor.token($textarea[0]);
                var linkToken = t.linkSearchCursor.token($textarea[0]);

                if (mentionToken.value.length > 2) {
                    t.showMentionSuggestions($textarea, mentionToken);
                } else if (t.linkAutoCompleteEnabled && linkToken.value.length > 2) {
                    t.showLinkSuggestions($textarea, linkToken);
                } else {
                    t.removeSuggestions();
                }
            });
        },

        bindTextAreaLinkAutoconvert: function($textarea) {
            $textarea.bind('paste', function() {
                var orig = $textarea.val();
                var selected = $textarea.textrange();

                setTimeout(function () {
                    var pasted = TalkStringHelper.textDiff(orig, $textarea.val());

                    if (TalkStringHelper.isUrl(pasted.string)) {
                        if (selected.length){
                            $textarea.val(orig);
                            $textarea.textrange('set', selected.start, selected.length);
                            $textarea.textrange('replace', "[" + selected.text + "|" + pasted.string + "]");
                            $textarea.setCursorPosition($textarea.textrange().end);
                        } else if (pasted.string.indexOf(AJS.params.baseUrl) == 0) {
                            $.ajax({
                                url: pasted.string,
                                success: function(data) {
                                    var page = $(data);
                                    var meta = page.filter('meta[name="ajs-page-title"]');
                                    var title = meta.length ? meta.attr('content') : page.filter("title").text();

                                    $textarea.val(orig);
                                    $textarea.setCursorPosition(pasted.start);
                                    $textarea.insertAtCaret("[" + title + "|" + pasted.string + "]");
                                }
                            });
                        }
                    }
                }, 100);
            }).bind('drop dragdrop', function(e) {
                if (!$textarea.hasClass('macro-param-input')) {
                    $textarea.focus();

                    var files = e.originalEvent.dataTransfer.files;
                    var selected = $textarea.textrange();

                    if (files.length == 1 && selected.length) {
                        $textarea.textrange('replace', "[" + selected.text + "|" +
                            AJS.params.spaceKey + ":" + AJS.params.pageTitle + "^" + files[0].name  + "]");
                        $textarea.setCursorPosition($textarea.textrange().end);
                    } else {
                        $.each(files, function(i, file) {
                            $textarea.insertAtCaret("[" + AJS.params.spaceKey + ":" + AJS.params.pageTitle + "^" + file.name + "] ");
                        });
                    }

                    $textarea.trigger("keydown").trigger("keyup");


                    $(window).one('beforeunload', function() {
                        setTimeout(function() {
                            window.stop();
                            $textarea.focus();
                        }, 50);
                    });
                }
            });
        },

        bindSuggestionEvent: function($textarea, suggestions, isMention) {
            var t = this;

            suggestions.click(function() {
                var $suggestion = $('.gd-suggestion', this);
                if ($suggestion.length > 0) {
                    var markup = $suggestion.attr('data-wiki-link');
                    if (isMention) {
                        t.mentionCursor.replace($textarea[0], markup);
                    } else {
                        t.linkInsertCursor.replace($textarea[0], markup.substr(0, markup.length - 1));
                        $textarea.setCursorPosition($textarea.getCursorPosition() + 1);
                    }

                    t.removeSuggestions();
                    $textarea.focus();
                }
                return false;
            });

            suggestions.hover(function() {
                $('.gd-suggestion-active').removeClass('gd-suggestion-active');
                $(this).addClass('gd-suggestion-active');
            }, function() {
            });
        },

        showMentionSuggestions: function($textarea, mentionToken) {
            var t = this;

            var query = mentionToken.value.substr(1);
            var data = {
                'max-results': 10,
                'query': query
            };

            t.showSuggestions($textarea, query, '/rest/prototype/1/search/user.json', data, true);
        },

        showLinkSuggestions: function($textarea, linkToken) {
            var t = this;
            var query = linkToken.value.substr(1, linkToken.value.length - 2);
            var spaceKey = "";
            var parts = query.split(':');

            if (parts.length > 1 && parts[0].match(/[^a-zA-Z1-9]+/) == null && parts[0].length + 1 < query.length) {
                spaceKey = parts[0];
                query = query.replace(parts[0] + ":", "");
            }

            query = query.trim();

            if (query.length == 0) {
                return;
            }

            var data = {
                'max-results': 10,
                query: query,
                search: "name",
                preferredSpaceKey: AJS.Meta.get('space-key'),
                spaceKey: spaceKey
            };

            t.showSuggestions($textarea, query, "/rest/prototype/1/search.json", data, false);
        },

        showSuggestions: function($textarea, query, url, data, isMention) {
            var t = this;

            $.ajax({
                type: 'GET',
                cache: false,
                url: Confluence.getContextPath() + url,
                data: data,
                dataType: 'json',
                success: function(data) {
                    t.removeSuggestions();

                    if (isMention) {
                        $('body').append(TalkMention.suggestions({
                            suggestions: data.result,
                            query: query
                        }));
                    } else {
                        var result;
                        if (data.group.length) {
                            var groups = $.grep(data.group, function(group) {
                                return group.name == "content" || group.name == "attachment" || group.name == "spacedesc";
                            });
                            result = groups[0].result;

                            if (groups.length > 1) {
                                $.merge(result, groups[1].result);
                                if (groups.length > 2) {
                                    $.merge(result, groups[2].result);
                                }
                            }
                        } else {
                            result = data.group;
                        }

                        $('body').append(TalkLink.suggestions({
                            suggestions: result,
                            query: query
                        }));
                    }

                    $(".gd-suggestions").css('width', $textarea.innerWidth() + 'px')
                        .offset({
                            top: $textarea.offset().top + $textarea.outerHeight() + 2,
                            left: $textarea.offset().left
                        });

                    var suggestions = $('.gd-suggestions li');
                    var highlighter = new Confluence.Highlighter(query.split(' '));

                    $.each(suggestions, function() {
                        var suggestion = $(this).find('.gd-suggestion');

                        if (suggestion.length) {
                            suggestion.html(highlighter.highlight(suggestion.html()));
                            TalkStringHelper.truncateText($(this), suggestion, 0);
                        }
                    });

                    t.bindSuggestionEvent($textarea, suggestions, isMention);

                    $('.gd-suggestions li:first').addClass("gd-suggestion-active");
                },
                error: function () {
                    t.removeSuggestions();
                    AJS.log("Unable to find " + isMention ? "users" : "pages" + " for query {" + query + "}");                                   }
            });
        },

        removeSuggestions: function() {
            $('.gd-suggestions').remove();
        }
    };

})(AJS.$);
} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'soy/talk.mention.soy' */
// This file was automatically generated from talk.mention.soy.
// Please don't edit this file by hand.

if (typeof TalkMention == 'undefined') { var TalkMention = {}; }


TalkMention.suggestions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="gd-suggestions gd-mention"><ol>');
  if (opt_data.suggestions.length > 0) {
    var suggestionList6 = opt_data.suggestions;
    var suggestionListLen6 = suggestionList6.length;
    for (var suggestionIndex6 = 0; suggestionIndex6 < suggestionListLen6; suggestionIndex6++) {
      var suggestionData6 = suggestionList6[suggestionIndex6];
      output.append('<li><img src="', soy.$$escapeHtml(suggestionData6.thumbnailLink.href), '" class="gd-suggestion-thumbnail"><span class="gd-suggestion" data-wiki-link="[~', soy.$$escapeHtml(suggestionData6.username), ']">', soy.$$escapeHtml(suggestionData6.title), '</span></li>');
    }
  } else {
    output.append('<li><span class="gd-no-results">Found no matching users for <strong>', soy.$$escapeHtml(opt_data.query), '</strong></span></li>');
  }
  output.append('</ol></div>');
  return opt_sb ? '' : output.toString();
};

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'soy/talk-link.soy' */
// This file was automatically generated from talk-link.soy.
// Please don't edit this file by hand.

if (typeof TalkLink == 'undefined') { var TalkLink = {}; }


TalkLink.suggestions = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="gd-suggestions"><ol>');
  if (opt_data.suggestions.length > 0) {
    var suggestionList6 = opt_data.suggestions;
    var suggestionListLen6 = suggestionList6.length;
    for (var suggestionIndex6 = 0; suggestionIndex6 < suggestionListLen6; suggestionIndex6++) {
      var suggestionData6 = suggestionList6[suggestionIndex6];
      output.append('<li>');
      var class__soy8 = new soy.StringBuilder((suggestionData6.type == 'attachment') ? soy.$$escapeHtml(suggestionData6.iconClass) : (suggestionData6.type == 'space') ? 'content-type-spacedesc' : 'content-type-' + soy.$$escapeHtml(suggestionData6.type));
      class__soy8 = class__soy8.toString();
      var title__soy17 = new soy.StringBuilder((suggestionData6.type == 'space') ? soy.$$escapeHtml(suggestionData6.title) : soy.$$escapeHtml(suggestionData6.title) + ' (' + soy.$$escapeHtml(suggestionData6.space.title) + ')');
      title__soy17 = title__soy17.toString();
      output.append('<a class="', soy.$$escapeHtml(class__soy8), ' link-suggestion"><span class="gd-suggestion" title="', soy.$$escapeHtml(title__soy17), '" data-wiki-link="', soy.$$escapeHtml(suggestionData6.wikiLink), '">', soy.$$escapeHtml(suggestionData6.title), '</span></a></li>');
    }
  } else {
    output.append('<li><span class="gd-no-results">Found no matching pages for <strong>', soy.$$escapeHtml(opt_data.query), '</strong></span></li>');
  }
  output.append('</ol></div>');
  return opt_sb ? '' : output.toString();
};

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'js/talk.js' */
(function($) {

    window.Talk = {
    };

    Talk.Events = {

        bindCommentEvents: function(item) {
            var t = this;

            t.bindResolveCommentEvent(item);
            t.bindRestoreCommentEvent(item);
            t.bindAddReplyEvent(item.comment);
            t.bindRepliesEvents(item.comment);
            t.bindResizeCommentEvent(item.comment);
            t.bindUIEvents(item.comment);
            t.bindEditRestrictions(item.comment);
        },

        bindRepliesEvents: function($comment) {
            var t = this;
            $('.gd-reply', $comment).each(function() {
                t.bindReplyEvents($comment, $(this));
            });
        },

        bindReplyEvents: function($comment, $reply) {
            var t = this;
            t.bindEditReplyEvent($comment, $reply);
            t.bindDeleteReplyEvent($comment, $reply);
        },

        bindEditReplyEvent: function($comment, $reply) {
            var t = this;

            var $pane = $('.gd-input', $reply);
            var $textarea = $('.gd-input-textarea', $reply);
            var $previewBtn = $('.gd-input-preview', $reply);
            var $editBtn = $('.gd-input-edit', $reply);
            var $previewPane = $('.gd-reply-preview', $reply);

            t.bindTextareaEvents($textarea);
            t.bindPreviewEvent($reply);

            $('.gd-reply-edit', $reply).click(function() {
                $textarea.val($('.gd-input-textarea-markup', $reply).val());
                $('.gd-reply-control, .gd-reply-body', $reply).hide();
                $pane.addClass('gd-input-typing').show();
                $textarea.show();
//                todo временно отключаем
//                $previewBtn.show();
                $editBtn.hide();
                $textarea.change();
            });

            $('.gd-input-cancel', $reply).click(function() {
                $previewPane.hide();
                $('.gd-reply-body', $reply).show();
                $('.gd-reply-control').css('display', '');
                $pane.removeClass('gd-input-typing').hide();
            });

            var $spinner = $('.gd-input-spinner', $pane);
            $('.gd-input-post', $pane).click(function() {
                var postBtn = $(this);
                if (postBtn.hasClass('gd-button-disabled')) return false;

                postBtn.addClass('gd-button-disabled');

                var data = $textarea.serialize()
                    + "&commentId=" + $comment.attr('id')
                    + "&replyId=" + $reply.attr('id').substring(9)
                    + "&contentId=" + Talk.Comments.getContentId($comment.attr('id'));

                $spinner.show();
                $textarea.attr('disabled', true);

                Talk.REST.send({
                    type: 'POST',
                    resource: "comments/reply/edit",
                    data: data,
                    success: function (data) {
                        var $newReply = $(Talk.reply({
                            reply: data
                        }));

                        t.bindReplyEvents($comment, $newReply);
                        $reply.replaceWith($newReply);
                        Confluence.Binder.userHover();
                    },
                    complete: function() {
                        postBtn.removeClass('gd-button-disabled');
                        $spinner.hide();
                        $textarea.attr('disabled', false);
                    }
                });
            });
        },

        bindDeleteReplyEvent: function($comment, $reply) {
            var t = this;
            $('.gd-reply-delete', $reply).click(function() {

                if ($('[id^="gd-reply-"]', $comment).length == 1) {
                    $('.gd-resolve-button', $comment).click();
                    return;
                }

                t.bindConfirmationEvent({
                    parent: $reply,
                    pane: Talk.deleteReplyConfirmation(),
                    onConfirm: function () {
                        Talk.REST.send({
                            resource: "comments/reply/delete",
                            data: {
                                replyId: $reply.attr('id').substring(9),
                                commentId: $comment.attr('id'),
                                contentId: Talk.Comments.getContentId($comment.attr('id'))
                            },
                            success: function () {
                                $reply.remove();
                                Talk.Compatibility.fixDocumentationTheme();
                            }
                        });
                    }
                });
            });
        },

        bindResolveCommentEvent: function(item) {
            var t = this;
            $('.gd-resolve-button', item.comment).click(function() {
                t.bindConfirmationEvent({
                    parent: item.comment,
                    pane: Talk.resolveCommentConfirmation(),
                    onConfirm: function () {
                        Talk.REST.send({
                            resource: "comments/comment/resolve",
                            data: {
                                commentId: item.comment.attr('id'),
                                contentId: Talk.Comments.getContentId(item.comment.attr('id'))
                            },
                            success: function () {
                                Talk.Comments.removeComment(item);
                            }
                        });
                    },
                    onAlt: function() {
                        Talk.Updater.update(false);

                        Talk.REST.send({
                            resource: "comments/comment/archive",
                            data: {
                                commentId: item.comment.attr('id'),
                                contentId: Talk.Comments.getContentId(item.comment.attr('id')),
                                archive: true
                            },
                            success: function (data) {
                                var $reply = $(Talk.reply({
                                    reply: data
                                }));
                                t.bindReplyEvents(item.comment, $reply);

                                $('.gd-reply-container', item.comment).append($reply);

                                Talk.Compatibility.fixDocumentationTheme();
                                t.styleArchive(item);
                            }
                        });
                    }
                });
            });
        },

        styleArchive: function(item) {
            item.comment.addClass("talk-archived");
            item.icon.addClass("talk-archived");
            item.comment.find('#gd-shadow').remove();
            item.comment.find('.talk-restricted').attr('title',
                "Discussion restricted." + " " +
                    "Click to view restrictions");
            Talk.Events.bindEditRestrictions(item.comment);
        },

        bindRestoreCommentEvent: function(item) {
            var t = this;
            $('.gd-restore-button', item.comment).click(function() {
                t.bindConfirmationEvent({
                    parent: item.comment,
                    pane: Talk.restoreCommentConfirmation(),
                    onConfirm: function() {
                        Talk.Updater.update(false);

                        Talk.REST.send({
                            resource: "comments/comment/archive",
                            data: {
                                commentId: item.comment.attr('id'),
                                contentId: Talk.Comments.getContentId(item.comment.attr('id')),
                                archive: false
                            },
                            success: function (data) {
                                var $reply = $(Talk.reply({
                                    reply: data
                                }));
                                t.bindReplyEvents(item.comment, $reply);

                                $('.gd-reply-container', item.comment).append($reply);

                                Talk.Compatibility.fixDocumentationTheme();
                                t.styleRestore(item);
                            }
                        });
                    }
                });
            });
        },

        styleRestore: function(item) {
            item.comment.removeClass("talk-archived");
            item.icon.removeClass("talk-archived");
            item.comment.find('#gd-shadow').remove();
            item.comment.find('.talk-restricted').attr('title',
                "Discussion restricted." + " " +
                    "Click to view\/edit restrictions");
            Talk.Events.bindEditRestrictions(item.comment);
        },

        bindConfirmationEvent: function(options) {
            var $confirmation = $(options.pane);

            $('#gd-shadow-cancel', $confirmation).click(function() {
                $confirmation.remove();
            });

            $('#gd-shadow-confirm', $confirmation).click(options.onConfirm);

            $('#gd-shadow-alt', $confirmation).click(options.onAlt);

            $confirmation.appendTo(options.parent)
                .width(options.parent.outerWidth())
                .height(options.parent.outerHeight())
                .show();
        },

        bindAddReplyEvent: function($comment) {
            var t = this;
            var $pane = $('.gd-input-pane', $comment);
            var $textarea = $('.gd-input-textarea', $pane);
            var $replyBtn = $('.gd-input-post', $pane);
            var $previewBtn = $('.gd-input-preview', $pane);
            var $editBtn = $('.gd-input-edit', $pane);
            var $previewPane = $('.gd-reply-preview', $pane);

            t.bindTextareaEvents($textarea);
            t.bindPreviewEvent($pane);

            $textarea.focus(function() {
                if (!$pane.hasClass('gd-input-typing')) {
                    $textarea.val("");
                    $pane.addClass('gd-input-typing');
                    $replyBtn.addClass('gd-button-disabled');
                    $editBtn.hide();
//                    todo временно отключаем
//                    $previewBtn.addClass('gd-button-disabled').show();
                }
            });

            $('.gd-input-cancel', $pane).click(function() {
                $textarea.val("Write a comment...").height(26).show();
                $pane.removeClass('gd-input-typing');
                $previewPane.hide();
            });

            var $spinner = $('.gd-input-spinner', $pane);
            $replyBtn.click(function() {
                if ($replyBtn.hasClass('gd-button-disabled')) return false;

                Talk.Updater.update(false);

                $replyBtn.addClass('gd-button-disabled');

                var data = $textarea.serialize()
                    + "&commentId=" + $comment.attr('id')
                    + "&contentId=" + Talk.Comments.getContentId($comment.attr('id'));

                $spinner.show();
                $textarea.attr('disabled', true);

                Talk.REST.send({
                    type: "POST",
                    resource: "comments/reply/add",
                    data: data,
                    success: function (data) {
                        var $reply = $(Talk.reply({
                            reply: data
                        }));
                        t.bindReplyEvents($comment, $reply);

                        $('.gd-reply-container', $comment).append($reply);
                        $('.gd-input-cancel', $pane).click();

                        Talk.Compatibility.fixDocumentationTheme();
                        Confluence.Binder.userHover();
                    },
                    complete: function() {
                        $replyBtn.removeClass('gd-button-disabled');
                        $spinner.hide();
                        $textarea.attr('disabled', false);
                    }
                });
            });
        },

        bindPreviewEvent: function($pane) {
            var $textarea = $('.gd-input-textarea', $pane);
            var $previewBtn = $('.gd-input-preview', $pane);
            var $editBtn = $('.gd-input-edit', $pane);
            var $previewPane = $('.gd-reply-preview', $pane);

            $editBtn.click(function() {
                $(this).hide();
                $previewBtn.show();
                $previewPane.hide();
                $textarea.show();
            });

            $previewBtn.click(function() {
                if ($previewBtn.hasClass('gd-button-disabled')) return false;

                var data = $textarea.serialize() + "&contentId=" + AJS.params.contentId;

                Talk.REST.send({
                    type: 'GET',
                    resource: 'comments/reply/preview',
                    data: data,
                    success: function(data) {
                        $previewBtn.hide();
                        $editBtn.show();
                        $previewPane.html(data.htmlText).show();
                        $textarea.hide();
                    }
                });
            });
        },

        bindTextareaEvents: function($textarea) {
            $textarea.bind("propertychange keyup input paste", function(e) {
                var $btn = $('.gd-input-active', $textarea.parent());

                if ($textarea.val().length > 0) {
                    $btn.removeClass('gd-button-disabled');
                    if (e.ctrlKey && e.keyCode == 13) {
                        $textarea.blur();
                        $('.gd-input-buttons-post', $textarea.parent()).click();
                    }
                } else {
                    $btn.addClass('gd-button-disabled');
                }
            });
            $textarea.autoResize({
                animate: false,
                extraSpace: 26
            });

            TalkAutocomplete.init($textarea);
        },

        bindResizeCommentEvent: function($comment) {
            $comment.resize(function() {
                Talk.Comments.relocateComments(Talk.Comments.getActiveCommentId());
            });
        },

        bindUIEvents: function ($comment) {
            $('.gd-button', $comment).hover(function () {
                $(this).addClass('gd-button-hover');
            }, function () {
                $(this).removeClass('gd-button-hover');
            });
        },

        bindEditRestrictions: function($comment) {
            if (!AJS.params.remoteUser) {
                return;
            }

            var commentId = $comment.attr('id');
            var restrictionsIcon = $('.talk-restrictions', $comment);
            var dialogId = commentId + "-restrictions-dialog";

            var arrowOffsetX = -1;
            if (Talk.Helper.isDefaultTheme()) {
                arrowOffsetX = -10;
            }

            var opts = {hideDelay: 10000000, noBind: true, offsetX: -280, arrowOffsetX: arrowOffsetX, initCallback: Talk.Restrictions.bindEvents};

            var popup = AJS.InlineDialog(restrictionsIcon, dialogId, function(contents, trigger, showPopup) {
                contents.html(Talk.permissionsDialog({commentId: commentId, editable: restrictionsIcon.hasClass('editable') && !$comment.hasClass('talk-archived')})) ;
                showPopup();
            }, opts);

            restrictionsIcon.unbind('click.talk').bind('click.talk', function(e) {
                $comment.click();
                e.stopPropagation();

                if (commentId == 'talk-insert') {
                    Talk.Restrictions.showDialog(popup, Talk.Inserter.commentParams, commentId);
                } else {
                    Talk.REST.send({
                        type: 'GET',
                        resource: 'comments/comment/params',
                        data: {
                            commentId: commentId,
                            contentId: Talk.Comments.getContentId(commentId)
                        },
                        success: function(data) {
                            Talk.Restrictions.showDialog(popup, data, commentId);
                        }
                    });
                }
            });
        }
    };

    Talk.GlobalEvents = {

        init: function() {
            var dim = Talk.Helper.getWindowDimension();
            $(window).bind('resize.talk', function() {
                var newDim = Talk.Helper.getWindowDimension();
                if (dim.width != newDim.width || dim.height != newDim.height) {
                    dim = newDim;
                    Talk.GlobalEvents.resizeEventHandler();
                }
            });

            $(document).bind('click.talk', function(e) {
                if (e.originalEvent !== undefined) {
                    if(!Talk.Helper.isMacroBrowser()) {
                        Talk.URLHelper.removeCommentLinkFromURL();
                    }
                    var activeCommentId = Talk.Comments.getActiveCommentId();
                    Talk.Comments.focus(activeCommentId, false);
                }
            });

            $(window).bind('load.talk', function() {
                Talk.Comments.relocateComments(Talk.Comments.getActiveCommentId());
            });
        },

        destroy: function() {
            $(window).unbind('.talk');
            $(document).unbind('.talk');
        },

        resizeEventHandler: function() {
            Talk.Sidebar.sidebar.parent().offset(Talk.Sidebar.getLocation);
            Talk.Sidebar.relocateHider();
            Talk.Comments.relocateComments(Talk.Comments.getActiveCommentId());
        }
    };

    Talk.Comments = {
        comments: [],
        ids: [],
        activeCommentId: null,
        focusedCommentId: null,
        idToRelocate: null,

        init: function() {
            var t = this;
            var ids = t.getIds();
            if (ids.commentIds.length == 0) {
                return;
            }

            $('#talk-view-item').addClass('talks-on-page');

            var data = ids.commentIds.join("&") + "&" + ids.contentIds.join("&");

            Talk.REST.send({
                resource: "comments/comments-and-user-permissions",
                data: data,
                success: function (data) {
                    Talk.LicenseManager.setLicenseActive(data.licenseAttributes.isLicenseActive);
                    Talk.LicenseManager.setEvalExpiring(data.licenseAttributes.isEvalExpiring);
                    t.insertCommentsToPage(data.comments);
                    Talk.URLHelper.detectCommentInURL();
                    Talk.Compatibility.fix();
                    Confluence.Binder.userHover();
                }
            });
        },

        getContentId: function(commentId) {
            return this.ids[commentId];
        },

        getIds: function() {
            var t = this;
            var commentIds = [];
            var contentIds = [];

            $('[id^="icon-talk-"]').sort(function(comment1, comment2) {
                var top1 = t.getIconPosition($(comment1));
                var top2 = t.getIconPosition($(comment2));

                if (top1 != top2) {
                    return top1 - top2;
                }

                return $(comment1).offset().left - $(comment2).offset().left;
            }).each(function() {
                var commentId = $(this).attr('id').substring(5);
                var contentId = $(this).attr('data-content-id');

                var id = "commentId=" + commentId;
                if ($.inArray(id, commentIds) == -1) {
                    commentIds.push(id);
                    contentIds.push("contentId=" + contentId);
                    t.ids[commentId] = contentId;
                }
            });

            return {
                commentIds: commentIds,
                contentIds: contentIds
            };
        },

        insertCommentsToPage: function(comments) {
            var t = this;
            if (comments.length > 0) {
                Talk.Sidebar.init();

                $.each(comments, function (i, comment) {
                    if (t.idToRelocate == null && !comment.archived) {
                        t.idToRelocate = i;
                    }
                    var params = {
                        comment: comment,
                        isLicenseActive: Talk.LicenseManager.isLicenseActive(),
                        isEvalExpiring: Talk.LicenseManager.isEvalExpiring(),
                        hasEditPermissions: AJS.params.remoteUser && comment.userPermissions.hasEditPermission
                    };
                    t.insertComment(Talk.comment(params));
                });

                t.idToRelocate = t.idToRelocate == null ? 0 : t.idToRelocate;
                t.relocate(t.idToRelocate, false);
                t.focus(t.idToRelocate, false);

                Talk.GlobalEvents.init();
            }
        },

        insertComment: function(comment) {
            var t = this;

            var $comment = $(comment);
            var $icon = $('[id="icon-' + $comment.attr('id') + '"]');

            var item = {
                id: t.comments.length,
                comment: $comment,
                icon: $icon
            };

            if (Talk.Helper.isPage()) {
                t.bindRelocateEvents(item);
                Talk.Events.bindCommentEvents(item);
            }

            t.comments.push(item);
            Talk.Sidebar.addComment($comment);
            if ($comment.hasClass('talk-archived')) {
                $comment.hide();
            }
        },

        removeComment: function(item, isInsert) {
            item.comment.remove();
            item.icon.remove();
            item.resolved = true;
            Talk.Comments.setActiveCommentId(null);
            Talk.URLHelper.removeCommentLinkFromURL();
            Talk.Compatibility.fixDocumentationTheme();
            if (!isInsert) {
                Talk.Compatibility.fixInPlaceEditor();
            }
            if ($('.gd-comment-icon').length == 0) {
                $('#talk-view-item').removeClass('talks-on-page');
                Talk.Sidebar.destroy();
            }
        },

        bindRelocateEvents: function (item) {
            var t = this;

            item.comment.click(function (e) {
                e.stopPropagation();
                t.relocate(item.id, true);
                t.focus(item.id, true);
                Talk.URLHelper.addCommentLinkToURL(item.icon.attr("href"));
            });

            item.icon.click(function (e) {
                e.stopPropagation();
                var focus = !(item.comment.hasClass('talk-archived') && item.comment.hasClass('gd-comment-active'));
                t.relocate(item.id, focus);
                t.focus(item.id, focus);
                Talk.URLHelper.addCommentLinkToURL(item.icon.attr("href"));
            });
        },

        focus: function(index, focused) {
            var t = this;
            if (t.comments.length > 0) {
                var item = this.comments[index];
                if (item.resolved) {
                    return;
                }

                if (focused) {
                    item.comment.show();
                    item.comment.addClass('gd-comment-active');
                    item.icon.addClass('gd-comment-icon-active');

                    if ($('.gd-content-offset-hidden').length) {
                        Talk.Settings.showTalks();
                    }

                    if (t.focusedCommentId != index) {
                        t.focusedCommentId = index;
                        if (!Talk.Helper.isDocumentationTheme()) {
                           $('html, body').animate({
                                scrollTop: t.getIconPosition(item.icon) - 100
                            }, 400);
                        }
                    }
                } else {
                    t.focusedCommentId = null;
                    item.comment.removeClass('gd-comment-active');
                    item.icon.removeClass('gd-comment-icon-active');
                    if(item.comment.hasClass('talk-archived')) {
                        item.comment.hide();
                        if (!$('.gd-pane-view:visible').length) {
                            Talk.Sidebar.hide(true);
                        }
                    }
                }

                item.comment.offset({
                    left: Talk.Sidebar.getLeftPosition() + (focused ? -10 : 10)
                });
            }
        },

        relocate: function(index, active) {
            var t = this;

            if (t.activeCommentId != null && t.activeCommentId == index)
                return;

            if (active)
                t.activeCommentId = index;

            t.relocateComments(index);
        },

        relocateComments: function(index) {
            var t = this;
            if (t.isCommentsExists()) {
                t.relocateFocusedComment(index);
                t.relocateCommentsBelow(index);
                t.relocateCommentsAbove(index);
                Talk.Compatibility.fixDocumentationTheme();
            }
        },

        relocateFocusedComment: function(index) {
            var item = this.comments[index];

            if (item.resolved) {
                return;
            }

            this.showComment(item.comment);

            item.comment.offset({
                top: this.getIconPosition(item.icon)
            });
        },

        relocateCommentsBelow: function (index) {
            var t = this;

            var first = t.comments[index].comment;
            var nextTop = t.getIconPosition(t.comments[index].icon) + first.height() + 20;

            for (var i = index + 1; i < t.comments.length; i++) {
                var item = t.comments[i];
                item.comment.removeClass('gd-comment-active');
                item.icon.removeClass('gd-comment-icon-active');

                if(item.comment.hasClass('talk-archived')) {
                    item.comment.hide();
                } else if (!item.resolved) {
                    t.showComment(item.comment);

                    nextTop = Math.max(nextTop, t.getIconPosition(item.icon));
                    item.comment.offset({
                        left: Talk.Sidebar.getLeftPosition() + 10,
                        top: nextTop
                    });
                    nextTop += item.comment.height() + 20;
                }
            }
        },

        relocateCommentsAbove: function (index) {
            var t = this;
            var navigation = Talk.Helper.isBrikitTheme() ? $('.brikit-title-container') : $('#navigation');

            if (navigation.length > 0) {
                var navigationUl = Talk.Helper.isBrikitTheme() ? [] : navigation.find('ul');
                var navigationUlTop = navigationUl.length > 0 ?
                    parseInt(navigationUl.offset().top) - parseInt(navigationUl.css('margin-top')) : 0;

                var navigationBottom = Math.max(parseInt(navigation.offset().top), navigationUlTop) + 1 +
                    Math.max(navigation.height(), navigationUl.length > 0 ? navigationUl.height() : 0);
            }

            var prevTop = t.comments[index].comment.offset().top - 20;
            var isFirstToHide = true;

            for (var i = index - 1; i >= 0; i--) {
                var item = t.comments[i];

                item.comment.removeClass('gd-comment-active');
                item.icon.removeClass('gd-comment-icon-active');

                if(item.comment.hasClass('talk-archived')) {
                    item.comment.hide();
                } else if (!item.resolved) {
                    t.showComment(item.comment);

                    prevTop -= item.comment.height();
                    prevTop = Math.min(prevTop, t.getIconPosition(item.icon));

                    if (navigation.length > 0 && prevTop <= navigationBottom) {
                        var commentHeight = item.comment.height() - navigationBottom + prevTop;

                        if (isFirstToHide && commentHeight > 0) {
                            var gdAfterOffset = 3;
                            if (item.comment.attr('id') == 'talk-insert') {
                                gdAfterOffset = 0;
                            }

                            item.comment.css('overflow', 'hidden')
                                        .height(commentHeight)
                                        .scrollTop(item.comment[0].scrollHeight)
                                        .addClass('gd-pane-trimmed')
                                        .find('.gd-after').css('top', navigationBottom - prevTop + gdAfterOffset);
                            prevTop = navigationBottom;
                        } else {
                            item.comment.hide();
                        }

                        isFirstToHide = false;
                    }

                    item.comment.offset({
                        left: Talk.Sidebar.getLeftPosition() + 10,
                        top: prevTop
                    });

                    prevTop -= 20;
                }
            }
        },

        isCommentsExists: function() {
            var t = this;
            for (var i = 0; i < t.comments.length; i++) {
                if (!t.comments[i].resolved) {
                    return true;
                }
            }
            return false;
        },

        setActiveCommentId: function(value) {
            this.activeCommentId = value;
        },

        getActiveCommentId: function() {
            return this.activeCommentId != null ? this.activeCommentId : this.idToRelocate;
        },

        showComment: function(comment) {
            comment.css('overflow', '')
                   .removeClass('gd-pane-trimmed')
                   .height("auto")
                   .show();
        },

        getIconPosition: function(icon) {
            var parent = icon;
            while(!parent.is(':visible') && parent.parent().offset()) {
                parent = parent.parent();
            }
            return parent.offset().top;
        }
    };

    Talk.Sidebar = {
        sidebar: null,
        hiderContainer: null,

        init: function() {
            var $content = this.getContent();

            $content.addClass('gd-content-offset');
            $('#blog-sidebar').addClass('gd-content-offset');
            $('#personal-info-sidebar').addClass('gd-content-offset');

            $('<div class="gd-comments-sidebar"/>')
                .append(this.getSidebar())
                .offset(this.getLocation)
                .css('position', '')
                .appendTo('body');

            this.addSidebarHider();
        },

        getContent: function() {
            return Talk.Helper.isZenTheme() ? $('#zen-main') : $('#content');
        },

        addSidebarHider: function() {
            this.hiderContainer = $(Talk.hiderContainer());
            $('.gd-comments-sidebar').append(this.hiderContainer);

            if (Talk.Settings.isHidden) {
                this.hide();
                this.hiderContainer.append(Talk.shower());
            } else {
                this.hiderContainer.append(Talk.hider());
            }

            $('#talk-hider').live('click', function() {
                Talk.Settings.hideTalks();
                return false;
            });

            $('#talk-shower').live('click', function() {
                Talk.Settings.showTalks();
                return false;
            });

            this.relocateHider();
        },

        relocateHider: function() {
            this.hiderContainer.offset({left: this.getLeftPosition() + 260});
            if (Talk.Settings.isHidden) {
                var main = $('.gd-content-offset-hidden');
                this.hiderContainer.offset({left: main.offset().left + main.width()});
            } else {
                this.hiderContainer.offset({left: this.getLeftPosition() + 260});
            }
        },

        addComment: function($comment) {
            this.sidebar.append($comment);
        },
    
        getSidebar: function() {
            this.sidebar = $('<div class="gd-comments gd-comments-layout"><div id="gd-comments-messages"/></div>');
            return this.sidebar;
        },

        getLocation: function() {
            var $content;
            var offsetLeft = 20;
            if (Talk.Helper.isZenTheme()) {
                $content = $('#zen-main');
            } else if (Talk.Helper.isBrikitTheme()) {
                $content = $('#main-content');
                offsetLeft = 5;
            } else {
                $content = $('#content');
            }
            var contentOffset = $content.offset();

            return {
                'left': contentOffset.left + $content.width() + offsetLeft,
                'top': contentOffset.top
            }
        },

        getLeftPosition: function() {
            return this.sidebar.offset().left;
        },

        remove: function() {
            this.sidebar.remove();
        },

        hide: function(hideSHContainer) {
            if (this.sidebar) {
                $('.gd-comments').hide();
                $('#talk-hider').replaceWith(Talk.shower());
                $('.gd-content-offset').removeClass('gd-content-offset').addClass('gd-content-offset-hidden');
                Talk.Compatibility.fixZenWidth();
                $('#zen-main').css('max-width', '');
                $('#expando').unbind('click.talk');
                if (hideSHContainer) {
                    $('#talk-show-hide-container').hide();
                }
            }
        },

        show: function() {
            if (this.sidebar) {
                $('.gd-comments').show();
                $('#talk-show-hide-container').show();
                $('#talk-shower').replaceWith(Talk.hider());
                $('.gd-content-offset-hidden').addClass('gd-content-offset').removeClass('gd-content-offset-hidden');
                Talk.GlobalEvents.resizeEventHandler();
                Talk.Compatibility.fix();
                Talk.Compatibility.fixZenWidth();
            }
        },

        destroy: function() {
            this.sidebar = null;
            $('.gd-comments-sidebar').remove();
            $('.gd-content-offset').removeClass('gd-content-offset');
            Talk.Compatibility.fixZenWidth();
            $('#zen-main').css('max-width', '');
            Talk.GlobalEvents.destroy();
            $('#expando').unbind('click.talk').unbind('click.talk-hider');
        }
    };

    Talk.Helper = {

        isPage: function() {
            return AJS.Meta.get("page-id") != undefined;
        },

        isDocumentationTheme: function() {
            return $('#splitter-content').length > 0;
        },

        isZenTheme: function() {
            return $('#zen-main').length > 0;
        },

        isDefaultTheme: function() {
            return $('body').is('.theme-default');
        },

        isBrikitTheme: function() {
            return $('body').is('.brikit');
        },

        isMacroBrowser: function() {
            return $('body.content-preview').length > 0;
        },

        getWindowDimension: function() {
            return {
                width: $(window).width(),
                height: $(window).height()
            }
        }
    };

    Talk.LicenseManager = {
        licenseActive: null,
        evalExpiring: null,

        isLicenseActive: function() {
            return this.licenseActive;
        },

        setLicenseActive: function(p) {
            this.licenseActive = p;
        },

        isEvalExpiring: function() {
            return this.evalExpiring;
        },

        setEvalExpiring: function(p) {
            this.evalExpiring = p;
        }
    };

    Talk.URLHelper = {

        detectCommentInURL: function() {
            if (window.location.hash) {
                var hash = window.location.hash;
                $("a#icon-" + hash.substring(6).replace("-reply", "")).click();
                if (hash.indexOf("-reply") > 0) {
                    Talk.Comments.comments[Talk.Comments.activeCommentId].comment.find(".gd-input-textarea").focus();
                }
            }
        },

        addCommentLinkToURL: function(link) {
            window.location = link;
        },

        removeCommentLinkFromURL: function() {
            var h = $(document).scrollTop();
            window.location.href = '#';
            $("body, html").scrollTop(h);
        }
    };

    Talk.REST = {
        send: function(options) {
            $.ajax({
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                type: options.type || 'GET',
                async: options.async == undefined ? true : options.async,
                cache: false,
                url: Confluence.getContextPath() + '/rest/talk/1.0/' + options.resource,
                data: options.data,
                dataType: 'json',
                success: options.success,
                error: options.error || function (xhr) {
                    if (Talk.Sidebar.sidebar == null) {
                        Talk.Sidebar.init();
                    }

                    var msg;
                    switch (xhr.responseText) {
                        case "merge": msg = "Merge conflict occurred: please, \u003ca href=\"?\">reload\u003c\/a> page and insert discussion again"; break;
                        case "archived": msg = "The discussion is archived: you have to restore discussion to be able to modify it"; break;
                        default: msg = "An error has occurred in Talk Add-on. See log for details";
                    }

                    var errorContainer = Talk.Comments.activeCommentId == null ? "#gd-comments-messages" :
                        "#error-" + Talk.Comments.comments[Talk.Comments.activeCommentId].comment.attr('id');

                    var dialog = $('.talk-permissions-dialog:visible');
                    if (dialog.length) {
                        errorContainer = dialog;
                        $('#talk-permissions-loader', dialog).hide();
                        $('.talk-save-permissions', dialog).enable();
                    }

                    AJS.messages.warning(errorContainer, {
                        title: "Warning!",
                        body: msg
                    });
                },
                complete: options.complete
            });
        }
    };

    Talk.Compatibility = {

        fixDocumentationTheme: function() {
            if (Talk.Helper.isDocumentationTheme()) {
                var comments = Talk.Comments.comments;
                for (var i = comments.length - 1; i >= 0; i--) {
                    var item = comments[i];
                    if (!item.resolved) {
                        var itemBottom = item.comment.offset().top + item.comment.height() + 120;
                        var $comments = $('#comments-actions');
                        var commentsBottom = $comments.offset().top + $comments.height();

                        var mainHeight = commentsBottom;
                        if (commentsBottom < itemBottom) {
                            mainHeight += (itemBottom - commentsBottom);
                        }

                        var $main = $("#main");
                        mainHeight -= $main.offset().top;
                        $main.css('min-height', mainHeight + "px");
                        break;
                    }
                }
            }
        },

        fixDocumentationScrolling: function() {
            if (Talk.Helper.isDocumentationTheme()) {
                $('#splitter-content').scroll(function() {
                    Talk.Comments.relocateComments(Talk.Comments.getActiveCommentId());

                    if ($('.gd-comment-icon-insert').length > 0) {
                        Talk.Inserter.iconPosition();
                    }
                });

                $('.gd-pane-view').die("mousewheel").live("mousewheel", function(e) {
                    var content = $('#splitter-content');
                    content.scrollTop(content.scrollTop() - e.originalEvent.wheelDelta);
                });
            }
        },

        fix: function() {
            this.fixDocumentationScrolling();

            // Zen - Toggle Full Width Fix
            $('#expando').bind('click.talk', function() {
                Talk.Compatibility.fixZenWidth();

                setTimeout(function() {
                    Talk.GlobalEvents.resizeEventHandler();
                }, 420);
            });

            if (Talk.Helper.isZenTheme()) {
                // Zen in IE fix
                Talk.GlobalEvents.resizeEventHandler();
                this.fixZenTalkHider();
            }

            // Confluence 5 Default theme fir for Quick Page Edit
            AJS.bind("init.rte", function() {
                if (Talk.Helper.isDefaultTheme()) {
                    // Quick Comments workaround
                    var $content = $('.gd-content-offset.edit');
                    if ($content.length > 0) {
                        Talk.Sidebar.remove();
                        $content.removeClass('gd-content-offset');
                        Talk.GlobalEvents.destroy();
                    }
                }
            });
        },

        fixZenWidth: function() {
            if (Talk.Helper.isZenTheme()) {
                var $zen = $('#zen-main');
                var width = parseInt($('#canvas').width()) - parseInt($zen.css('margin-right'));
                $zen.css('max-width', width).css('width', width);
            }
        },

        fixZenTalkHider: function() {
            $('#expando').bind('click.talk-hider', function() {
                setTimeout(function() {
                    Talk.Sidebar.relocateHider();
                }, 420);
            });
        },

        fixInPlaceEditor: function() {
            if (window.InPlaceEditor) {
                window.document.location.reload();
            }
        }
    };

    Talk.Inserter = {
        marker: null,
        lineBreakId: -1,
        timeout: null,
        element: null,
        icon: null,
        commentParams: null,

        init: function() {
            if ($('#talk-insert').length == 0) {
                this.bindEvents();
                this.refresh();
            }
        },

        destroy: function() {
            this.unbindEvents();
            if (this.icon) {
                this.icon.remove();
            }
        },

        refresh: function() {
            this.marker = null;
            if (this.icon) {
                this.icon.remove();
            }
            $(':hover').filter('[talk-marker]').trigger('mouseenter');
        },

        bindEvents: function() {
            var t = this;
            t.timeout = null;
            t.marker = null;
            Talk.Compatibility.fixDocumentationScrolling();

            $("[talk-marker]").bind('mouseover.talk-insert', function() {
                clearTimeout(t.timeout);

                if (t.marker != $(this).attr('talk-marker')) {
                    t.element = $(this);
                    t.timeout = setTimeout(function() {
                        t.showIcon()
                    }, 150);
                }

                return false;
            }).bind('mouseleave.talk-insert', function() {
                clearTimeout(t.timeout);
                t.timeout = setTimeout(function() {
                    t.marker = null;
                    if (t.icon) {
                        t.icon.fadeOut(50, function(){
                            t.icon.remove();
                        });
                    }
                }, 300);

                return false;
            });

            Talk.Sidebar.getContent().bind('resize.talk-insert', function() {
                t.refresh();
            });
        },

        unbindEvents: function() {
            $("[talk-marker]").unbind('mouseover.talk-insert').unbind('mouseleave.talk-insert');
            if (this.icon) {
                this.icon.unbind('click.talk-insert').unbind('mouseenter.talk-insert').unbind('mouseleave.talk-insert');
            }

            Talk.Sidebar.getContent().unbind('resize.talk-insert');
        },

        showIcon: function() {
            var t = this;
            t.marker = t.element.attr('talk-marker');

            if (t.icon) {
                t.icon.fadeOut(50, function() {$(this).remove();});
            }

            t.icon = $(Talk.insertIcon({
                contentId: AJS.Meta.get("content-id")
            }));
            $('body').append(t.icon);
            t.icon.fadeIn(50);

            t.iconPosition();
            t.bindIconEvents();
        },

        iconPosition: function() {
            var left, top;

            if (this.element.hasClass("talk-image")) {
                var innerElement = this.element.find('img');
                left = innerElement.offset().left + innerElement.width() + parseInt(innerElement.css('padding-left'));
                top = innerElement.offset().top + innerElement.height() - 20 + parseInt(innerElement.css('padding-top'));
            } else if (this.element.is('th')) {
                left = this.element.offset().left + this.element.outerWidth();
                top = this.element.offset().top + this.element.height() - 20 + parseInt(this.element.css('padding-top'));
            } else {
                var pointer = $(Talk.insertPointer());
                this.appendToElementWithNoLineBreaks(pointer);

                left = pointer.offset().left + 5;
                top = pointer.offset().top - 16;

                pointer.remove();
            }

            this.icon.offset({
                left: left,
                top: top
            });
        },

        bindIconEvents: function() {
            var t = this;

            t.icon.one('click.talk-insert', function() {
                clearTimeout(t.timeout);
                t.icon.removeClass('gd-comment-icon-insert');
                t.icon.remove();
                t.appendToElementWithNoLineBreaks(t.icon);
                t.unbindEvents();
                t.insertInput();

                if (Talk.Helper.isDocumentationTheme()) {
                    $('#splitter-content').animate({
                        scrollTop: t.icon.offset().top - $('.wiki-content').offset().top
                    }, 200);
                }

                t.icon = null;

                return false;
            }).bind('mouseenter.talk-insert', function() {
                clearTimeout(t.timeout);
            }).bind('mouseleave.talk-insert', function() {
                clearTimeout(t.timeout);
                t.timeout = setTimeout(function() {
                    t.marker = null;
                    t.icon.fadeOut(50, function(){
                        t.icon.remove();
                    });
                }, 300);
            });
        },

        insertInput: function() {
            var t = this;

            if ($('.gd-comments-sidebar').length == 0) {
                Talk.Sidebar.init();
                Talk.GlobalEvents.init();
                Talk.Compatibility.fix();
                Talk.Compatibility.fixZenWidth();
                $('#talk-view-item').addClass('talks-on-page');
            }

            if (Talk.Settings.isHidden) {
                Talk.Settings.showTalks();
            }

            var userFullName;
            var userAvatar;

            $.ajax({
                contentType: "application/x-www-form-urlencoded; charset=utf-8",
                async: false,
                type: 'GET',
                cache: false,
                url: Confluence.getContextPath() + '/rest/prototype/1/user/current',
                dataType: 'json',
                success: function(data) {
                    userFullName = data.displayName;
                    userAvatar = data.avatarUrl;
                }
            });

            var hasPermissions;

            Talk.REST.send({
                type: 'GET',
                async: false,
                resource: "permissions/default-permissions",
                data: {
                    contentId: AJS.params.contentId,
                    spaceKey: AJS.params.spaceKey
                },
                success: function(data) {
                    hasPermissions = data.permissions.users.length > 0 || data.permissions.groups.length > 0;
                    t.commentParams = data;
                }
            });

            var commentItem = {
                id: $.inArray("commentId=talk-insert", Talk.Comments.getIds().commentIds),
                comment: $(Talk.insertInputTemplate({
                    username: userFullName,
                    userAvatar: userAvatar,
                    hasPermissions: hasPermissions,
                    hasEditPermissions: AJS.params.remoteUser
                })),
                icon: $('#icon-talk-insert')
            };

            Talk.Comments.comments.splice(commentItem.id, 0, commentItem);
            $.each(Talk.Comments.comments, function(i, item) {
                if (item.id >= commentItem.id && item != commentItem) {
                    item.id++;
                }
            });

            this.bindInputEvents(commentItem);
        },

        bindInputEvents: function(commentItem) {
            var textarea = $('.gd-input-textarea', commentItem.comment);
            Talk.Events.bindTextareaEvents(textarea);
            Talk.Events.bindPreviewEvent(commentItem.comment);
            Talk.Events.bindResizeCommentEvent(commentItem.comment);
            Talk.Events.bindUIEvents(commentItem.comment);
            Talk.Events.bindEditRestrictions(commentItem.comment);
            Talk.Sidebar.addComment(commentItem.comment);
            Talk.Comments.bindRelocateEvents(commentItem);
            Talk.Comments.setActiveCommentId(commentItem.id);
            Talk.Comments.focus(commentItem.id, true);
            Talk.Comments.relocateComments(commentItem.id);
            Talk.Compatibility.fixDocumentationTheme();
            textarea.focus();

            $('.gd-input-post', commentItem.comment).click(function() {
                Talk.Inserter.saveComment(textarea, $(this), commentItem);
            });

            $('.gd-input-cancel', commentItem.comment).click(function() {
                Talk.Comments.removeComment(commentItem, true);
                Talk.Comments.comments.splice(commentItem.id, 1);
                $.each(Talk.Comments.comments, function(i, item) {
                    if (item.id > commentItem.id) {
                        item.id--;
                    }
                });

                if (Talk.Settings.isInsert) {
                    Talk.Inserter.bindEvents();
                }
            });
        },

        saveComment: function(textarea, postBtn, commentItem) {
            if (postBtn.hasClass('gd-button-disabled')) return;

            postBtn.addClass('gd-button-disabled');

            TalkParams.params = this.commentParams;
            TalkParams.initRestrictions();

            var data = {
                "reply-text": textarea.val(),
                contentId: AJS.Meta.get("content-id"),
                pageVersion: $('meta[name="page-version"]').attr('content'),
                elementId: Talk.Inserter.marker,
                lineBreakId: Talk.Inserter.lineBreakId,
                spaceKey: AJS.Meta.get("space-key"),
                viewableUsers: TalkParams.getNewViewableBy('user'),
                viewableGroups: TalkParams.getNewViewableBy('group')
            };

            var $spinner = $('.gd-input-spinner', commentItem.comment);
            $spinner.show();
            textarea.attr('disabled', true);

            Talk.REST.send({
                type: 'POST',
                resource: "comments/comment/insert",
                data: data,
                success: function(data) {
                    Talk.Inserter.insertNewComment(data, commentItem);
                },
                complete: function() {
                    $spinner.hide();
                    textarea.attr('disabled', false);
                }
            });
        },

        insertNewComment: function(data, commentItem) {
            Talk.LicenseManager.setLicenseActive(data.licenseAttributes.isLicenseActive);
            Talk.LicenseManager.setEvalExpiring(data.licenseAttributes.isEvalExpiring);

            var addedComment = $(Talk.comment({
                comment: data.comments[0],
                isLicenseActive: data.licenseAttributes.isLicenseActive,
                isEvalExpiring: data.licenseAttributes.isEvalExpiring,
                hasEditPermissions: AJS.params.remoteUser && data.comments[0].userPermissions.hasEditPermission
            }));

            commentItem.comment.replaceWith(addedComment);
            commentItem.comment = addedComment;
            commentItem.icon.attr('id', 'icon-' + data.comments[0].id)
                .attr('href', '#link-' + data.comments[0].id).unbind('click');

            Talk.Events.bindCommentEvents(commentItem);
            Talk.Comments.bindRelocateEvents(commentItem);
            Talk.Comments.getIds();
            Talk.Comments.setActiveCommentId(commentItem.id);
            Talk.Comments.focus(commentItem.id, true);
            Talk.Comments.relocateComments(commentItem.id);
            Talk.URLHelper.addCommentLinkToURL(commentItem.icon.attr('href'));
            Talk.Compatibility.fixDocumentationTheme();
            this.bindEvents();
            Confluence.Binder.userHover();
        },

        appendToElementWithNoLineBreaks: function(appendable) {
            var t = this;
            var elBrs = t.element.find('br');
            t.lineBreakId = -1;

            var iterateNodes = function(childNodes) {
                for (var j = childNodes.length - 1; j >= 0; j--) {
                    var childNode = childNodes[j];

                    if (childNode.nodeType == 3 && childNode.data.trim()) {
                        t.element.append(appendable);
                        return true;
                    } else if (childNode.nodeType == 1) {
                        if (childNode.nodeName.toLowerCase() == 'br') {
                            var elBr = elBrs.last();
                            elBr.before(appendable);
                            t.lineBreakId = elBr.filter('[talk-br]').length ? elBr.attr('talk-br') : -1;
                            return true;
                        } else if (childNode.nodeName.toLowerCase() == 'span') {
                            if (iterateNodes(childNode.childNodes)) {
                                return true;
                            }
                        } else {
                            t.element.append(appendable);
                            return true;
                        }
                    }
                }

                return false;
            };

            if (elBrs.length) {
                iterateNodes(t.element.get(0).childNodes);
            } else {
                t.element.append(appendable);
            }
        }
    };

    Talk.Settings = {
        $dialogItem: null,
        $dialog: null,
        $viewCheckbox: null,
        $insertCheckbox: null,
        isInsert: true,
        isHidden: false,
        isFeatureDiscovery: false,
        isLicenseActive: true,
        isEvalExpiring: false,

        init: function() {
            var t = this;
            t.$dialogItem = $('#talk-settings-dialog-item');

            if (Talk.Helper.isZenTheme()) {
                t.$dialogItem.children('span').html('');
                var itemUl = $('#toolbar-menu');
                var dialogItemLi = t.$dialogItem.parent('li');
                dialogItemLi.prev('.spacer').remove();
                dialogItemLi.remove();
                itemUl.prepend(dialogItemLi);
            }

            if (AJS.params.remoteUser) {
                Talk.REST.send({
                    type: 'GET',
                    async: false,
                    resource: "comments/settings",
                    success: function(data) {
                        t.isHidden = !data.isView;
                        t.isInsert = data.isInsert;
                        t.isFeatureDiscovery = data.isFeatureDiscovery;
                        t.isLicenseActive = data.isLicenseActive;
                        t.isEvalExpiring = data.isEvalExpiring;
                    }
                });
            }

            if (t.isInsert) {
                Talk.Inserter.init();
            }

            if (!t.isHidden) {
                Talk.Sidebar.hide();
            }

            t.showFeatureDiscovery();
            t.initDialog();
        },

        showFeatureDiscovery: function() {
            var t = this;

            if (!t.isFeatureDiscovery || t.$dialogItem.length == 0) {
                return;
            }

            var arrowOffsetX = 0;
            if (Talk.Helper.isZenTheme()) {
                arrowOffsetX = -6;
            } else if (Talk.Helper.isDefaultTheme() || Talk.Helper.isDocumentationTheme()) {
                arrowOffsetX = -8;
            }
            var opts = {noBind: true, offsetX: -240, arrowOffsetX: arrowOffsetX, initCallback: t.bindFeatureDiscoveryEvents};

            var popup = AJS.InlineDialog(t.$dialogItem, "talk-feature-discovery", function(contents, trigger, showPopup) {
                contents.html(Talk.featureDiscovery()) ;
                showPopup();
            }, opts);

            popup.show();
        },

        bindFeatureDiscoveryEvents: function() {
            var popup = this;
            $('#talk-feature-close').click(function() {
                popup.hide();
                Talk.REST.send({
                    type: 'POST',
                    resource: "comments/settings/feature-discovery"
                });
                return false;
            });
        },

        initDialog: function() {
            var t = this;

            t.$dialog = $(Talk.settingsDialog({
                viewChecked: t.isHidden ? "" : "checked",
                insertChecked: t.isInsert ? "checked" : "",
                isLicenseActive: t.isLicenseActive,
                isEvalExpiring: t.isEvalExpiring
            }));

            t.$viewCheckbox = t.$dialog.find('#talk-view-checkbox');
            t.$insertCheckbox = t.$dialog.find('#talk-insert-checkbox');

            var arrowOffsetX = Talk.Helper.isZenTheme() ? -6 : 0;
            var opts = {offsetX: -240, arrowOffsetX: arrowOffsetX, initCallback: t.bindDialogEvents};

            AJS.InlineDialog(t.$dialogItem, "talk-settings", function(contents, trigger, showPopup) {
                contents.html(t.$dialog) ;
                showPopup();
            }, opts);
        },

        bindDialogEvents: function() {
            var t = Talk.Settings;

            $('#talk-view-checkbox').bind('change', function() {
                if ($(this).is(':checked')) {
                    t.showTalks();
                } else {
                    t.hideTalks();
                }
            });

            $('#talk-insert-checkbox').bind('change', function() {
                if ($(this).is(':checked')) {
                    t.enableInsert();
                } else {
                    t.disableInsert();
                }
            });
        },

        toggleSidebarVisibility: function() {
            if (this.isHidden) {
                this.showTalks();
            } else {
                this.hideTalks();
            }
        },

        showTalks: function() {
            var t = this;

            t.changeViewSettings(true);
            t.isHidden = false;
            Talk.Sidebar.show();
            t.$viewCheckbox.attr('checked', 'checked');
            Talk.Comments.focus(Talk.Comments.getActiveCommentId(), $('.gd-comment-active').length > 0);
        },

        hideTalks: function() {
            var t = this;

            t.changeViewSettings(false);
            t.isHidden = true;
            Talk.Sidebar.hide();
            t.$viewCheckbox.removeAttr('checked');
        },

        toggleInsertSetting: function() {
            if (this.isInsert) {
                this.disableInsert();
            } else {
                this.enableInsert();
            }
        },

        enableInsert: function() {
            this.changeInsertSettings(true);
            Talk.Inserter.init();
            this.isInsert = true;
            this.$insertCheckbox.attr('checked', 'checked');
        },

        disableInsert: function() {
            this.changeInsertSettings(false);
            Talk.Inserter.destroy();
            this.isInsert = false;
            this.$insertCheckbox.removeAttr('checked');
        },

        changeInsertSettings: function(value) {
            if (!AJS.params.remoteUser) {
                return;
            }

            Talk.REST.send({
                type: 'POST',
                resource: "comments/settings/insert",
                data: {
                    value: value
                }
            });
        },

        changeViewSettings: function(value) {
            if (!AJS.params.remoteUser) {
                return;
            }

            Talk.REST.send({
                type: 'POST',
                resource: "comments/settings/view",
                data: {
                    value: value
                }
            });
        }
    };

    Talk.Restrictions = {

        showDialog: function(popup, params, commentId) {
            $('#talk-restrictions').remove();
            popup.show();
            $('.talk-permissions-dialog', popup).append(TalkPermissions.restrictionContainer());

            var saveBtn = $('.talk-save-permissions', popup);
            saveBtn.disable();

            TalkParams.params = params;
            TalkParams.initRestrictions();
            TalkPermissionManager.restoreRestrictions();
            this.changeRestrictionIcon(commentId);

            $('.remove-restriction', popup).click(function() {
                TalkPermissionManager.removeRestriction($(this));
                $('.talk-save-permissions', popup).enable();
            });

            var initAfterIsShown = function() {
                setTimeout(function() {
                    if (popup.is(':visible')) {
                        TalkPermissionManager.truncateAllRestrictions();
                        $('#talk-permissions-input', popup).focus();
                    } else {
                        initAfterIsShown();
                    }
                }, 100);
            };

            initAfterIsShown();
        },

        bindEvents: function() {
            var popup = this;
            var dialog = popup.popup;

            dialog.click(function() {
                return false;
            });

            $('.talk-save-permissions', dialog).click(function() {
                var commentId = $(this).data("commentId");
                var successIcon = $('#talk-permissions-success', dialog);
                $(this).disable();

                if (commentId == 'talk-insert') {
                    successIcon.show();
                    Talk.Inserter.commentParams = TalkParams.params;
                    Talk.Restrictions.changeRestrictionIcon(commentId);
                    setTimeout(function() {
                        successIcon.hide();
                        popup.hide();
                    }, 500);
                } else {
                    var loaderIcon =$('#talk-permissions-loader', dialog);
                    loaderIcon.show();

                    Talk.REST.send({
                        type: 'Post',
                        resource: "comments/comment/draft",
                        data: {
                            contentId: Talk.Comments.getContentId(commentId),
                            commentId: commentId,
                            viewableUsers: TalkParams.getNewViewableBy("user"),
                            viewableGroups: TalkParams.getNewViewableBy("group"),
                            oldViewableUsers: TalkParams.getOldViewableBy("user"),
                            oldViewableGroups: TalkParams.getOldViewableBy("group"),
                            question: ""
                        },
                        success: function() {
                            loaderIcon.hide();
                            successIcon.show();
                            Talk.Restrictions.changeRestrictionIcon(commentId);
                            setTimeout(function() {
                                successIcon.hide();
                                popup.hide();
                            }, 500);
                        }
                    });
                }
            });

            $('.talk-cancel-permissions', dialog).click(function() {
                popup.hide();
            });

            $('.gd-pane-view, .gd-comment-icon').click(function() {
                popup.hide();
            });

            $('#talk-permissions-input', dialog).bind("selected.autocomplete-user-or-group", function(e, data) {
                if (TalkParams.getRestriction(data.content) == undefined) {
                    $('.talk-save-permissions', dialog).enable();
                }
                TalkPermissionManager.addRestrictions($(this), data);
                $('.remove-restriction', dialog).click(function() {
                    TalkPermissionManager.removeRestriction($(this));
                    $('.talk-save-permissions', dialog).enable();
                });
            }).bind('keydown', function(e) {
                if (e.keyCode == 27){
                    var dropDown = $(this).parent().find('.aui-dropdown');
                    if (dropDown.length && !dropDown.hasClass('hidden')) {
                        dropDown.addClass('hidden');
                        return false;
                    }
                }
            });
        },

        changeRestrictionIcon: function(commentId) {
            var comment = $('#' + commentId);
            var icon = $(".talk-restrictions", comment);
            var permissions = TalkParams.getNewViewableBy("user").length + TalkParams.getNewViewableBy("group").length;

            if ($(".talk-restricted", icon).length) {
                if (permissions == 0) {
                    icon.html(Talk.notRestrictedIcon({hasEditPermission: true}));
                }
            } else if (permissions > 0) {
                icon.html(Talk.restrictedIcon({hasEditPermission: true}));
            }
        }
    };

    Talk.Updater = {

        timeoutValue: 15000,
        timeout: null,

        init: function() {
            this.timeout = setTimeout(this.update, this.timeoutValue);
        },

        update: function(async) {
            var t = Talk.Updater;
            clearTimeout(t.timeout);
            var items = Talk.Comments.comments;
            var contentIds = [];
            var commentIds = [];
            var replyIds = [];

            $.each(items, function(i, item) {
                if (item.resolved) {
                    return;
                }

                var commentId = item.comment.attr('id');
                if (commentId != "talk-insert") {
                    commentIds.push(commentId);
                    contentIds.push(Talk.Comments.getContentId(commentId));
                    replyIds.push(item.comment.find('.gd-reply').last().attr('id').replace('gd-reply-', ''));
                }
            });

            if (replyIds.length) {
                Talk.REST.send({
                    resource: "comments/updates",
                    async: async,
                    data: {
                        contentIds: contentIds,
                        commentIds: commentIds,
                        replyIds: replyIds
                    },
                    success: function(data) {
                        $.each(data, function(i, commentEntity) {
                            var comment = $('#' + commentEntity.id);
                            var replyContainer = comment.find(".gd-reply-container");
                            var height = 0;
                            $.each(commentEntity.replies, function(i, replyEntity) {
                                var reply = $(Talk.reply({reply: replyEntity}));
                                reply.addClass('new-reply');
                                replyContainer.append(reply);
                                Talk.Events.bindReplyEvents(comment, reply);
                                reply.one('mouseover', function() {
                                    reply.removeClass('new-reply');
                                });
                                height += reply.height();
                            });
                            comment.scrollTop(comment[0].scrollHeight);
                            var after = comment.find('.gd-after');
                            after.css('top', after.css('top') + height);

                            comment.find('.gd-input-pane .gd-input-textarea').one('click', function() {
                                comment.find('.new-reply').removeClass('new-reply');
                            });

                            if (commentEntity.archived && !comment.hasClass('talk-archived')) {
                                $.each(items, function(i, item) {
                                    if (item.comment.attr('id') == commentEntity.id) {
                                        Talk.Events.styleArchive(item);
                                        return false;
                                    }
                                });
                            } else if (!commentEntity.archived && comment.hasClass('talk-archived')) {
                                $.each(items, function(i, item) {
                                    if (item.comment.attr('id') == commentEntity.id) {
                                        Talk.Events.styleRestore(item);
                                        return false;
                                    }
                                });
                            }
                        });
                    },
                    error: function(error) {
                        AJS.log(error);
                    },
                    complete: function() {
                        t.init();
                    }
                });
            } else {
                t.init();
            }
        }
    };

    AJS.toInit(function() {
        Talk.Comments.init();
        Talk.Settings.init();
        Talk.Updater.init();
    });

})(jQuery);
} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'soy/talk.soy' */
// This file was automatically generated from talk.soy.
// Please don't edit this file by hand.

if (typeof Talk == 'undefined') { var Talk = {}; }


Talk.comment = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var class__soy3 = new soy.StringBuilder((opt_data.comment.userPermissions.hasEditPermission) ? 'editable' : '');
  class__soy3 = class__soy3.toString();
  var classArchived__soy7 = new soy.StringBuilder((opt_data.comment.archived) ? 'talk-archived' : '');
  classArchived__soy7 = classArchived__soy7.toString();
  output.append('<div id="', opt_data.comment.id, '" class="gd-pane-view ', class__soy3, ' ', classArchived__soy7, '"><div class="gd-arrow-outer"></div><div class="gd-arrow-inner"></div><span class="talk-restrictions ', class__soy3, '">');
  if (opt_data.comment.hasPermissions) {
    Talk.restrictedIcon({hasEditPermission: opt_data.hasEditPermissions && ! classArchived__soy7}, output);
  } else {
    if (opt_data.hasEditPermissions) {
      Talk.notRestrictedIcon(null, output);
    }
  }
  output.append('</span><div class="gd-content gd-reply-container">');
  var replyList29 = opt_data.comment.replies;
  var replyListLen29 = replyList29.length;
  for (var replyIndex29 = 0; replyIndex29 < replyListLen29; replyIndex29++) {
    var replyData29 = replyList29[replyIndex29];
    Talk.reply({reply: replyData29}, output);
  }
  output.append('</div>', (opt_data.comment.userPermissions.hasEditPermission) ? '<div class="gd-manage-button gd-resolve-button"><div class="gd-inline-block gd-button gd-button-standard" title="' + "Mark as resolved and hide discussion" + '">' + "Resolve" + '</div></div><div class="gd-manage-button gd-restore-button"><div class="gd-inline-block gd-button gd-button-standard" title="' + "Restore discussion from archive" + '">' + "Restore" + '</div></div>' : '');
  if (opt_data.comment.userPermissions.hasCreatePermission) {
    Talk.addReply(opt_data, output);
  }
  if (! opt_data.isLicenseActive) {
    Talk.license(null, output);
  }
  output.append('<div id="error-', opt_data.comment.id, '" class="gd-error-container"></div><div class="gd-after"></div></div>');
  return opt_sb ? '' : output.toString();
};


Talk.reply = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="gd-reply-', opt_data.reply.id, '" class="gd-reply"><img width="24" height="24" src="', opt_data.reply.userInfo.profilePicturePath, '" class="gd-user-icon"><div class="gd-reply-author">', opt_data.reply.userInfo.username, '</div><div class="gd-reply-timestamp">', opt_data.reply.dateTime, '</div><div class="gd-reply-collapsible"><div class="gd-reply-body gd-reply-html">', opt_data.reply.htmlText, '</div><div class="gd-reply-preview gd-reply-html" style="display: none"></div></div>', (opt_data.reply.hasEditPermission) ? '<div class="gd-reply-control gd-inline-block"><div title="' + "Make changes to your comment" + '" class="gd-reply-edit gd-inline-block">' + "Edit" + '</div><div title="' + "Permanently delete your comment" + '" class="gd-reply-delete gd-inline-block">' + "Delete" + '</div></div>' : '', (opt_data.reply.hasEditPermission) ? '<div class="gd-input" style="display: none;"><div style="display: none" class="gd-input-spinner"></div><textarea name="reply-text" class="gd-input-textarea"></textarea><textarea class="gd-input-textarea-markup">' + opt_data.reply.text + '</textarea><div class="gd-input-buttons"><div title="' + "View rendered comment" + '" class="gd-inline-block gd-button gd-button-standard gd-input-preview gd-input-active">' + "Preview" + '</div><div title="' + "Make changes to your comment" + '" class="gd-inline-block gd-button gd-button-standard gd-input-edit">' + "Edit" + '</div><div title="' + "Post comment (Ctrl+Enter)" + '" class="gd-inline-block gd-button gd-button-action gd-input-post gd-input-active"><span class="gd-input-buttons-post">' + "Save" + '</span></div><a title="' + "Discard comment" + '" class="gd-inline-block gd-button gd-input-cancel">' + "Cancel" + '</a></div></div>' : '', '</div>');
  return opt_sb ? '' : output.toString();
};


Talk.license = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="gd-input gd-input-pane gd-no-license">', "Talk Add-on license is not active at the moment. Please generate an evaluation license or purchase a commercial license on \x3ca href\x3d\x22https://marketplace.atlassian.com/plugins/com.stiltsoft.confluence.talk.confluence-talk-plugin\x22\x3eAtlassian Marketplace\x3c/a\x3e.", '</div>');
  return opt_sb ? '' : output.toString();
};


Talk.addReply = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div class="gd-input gd-input-pane"><div class="gd-reply-collapsible"><div class="gd-reply-preview gd-reply-html" style="display: none"></div></div>', (opt_data.isEvalExpiring) ? '<div class="gd-eval-expiring">' + "Talk Add-on evaluation license is expiring! If you liked this add-on, you can purchase a commercial license on \x3ca href\x3d\x22https://marketplace.atlassian.com/plugins/com.stiltsoft.confluence.talk.confluence-talk-plugin\x22\x3eAtlassian Marketplace\x3c/a\x3e." + '</div>' : '', '<div style="display: none;" class="gd-input-spinner"></div><textarea name="reply-text" class="gd-input-textarea">', "Write a comment...", '</textarea><div class="gd-input-buttons"><div title="', "View rendered comment", '" class="gd-inline-block gd-button gd-button-standard gd-input-preview gd-input-active gd-button-disabled">', "Preview", '</div><div title="', "Make changes to your comment", '" class="gd-inline-block gd-button gd-button-standard gd-input-edit" style="display: none">', "Edit", '</div><div class="gd-inline-block gd-button gd-button-action gd-input-post gd-input-active gd-button-disabled" title="', "Reply to comment (Ctrl+Enter)", '"><span class="gd-input-buttons-post">', "Reply", '</span></div><a title="', "Discard comment", '" class="gd-inline-block gd-button gd-input-cancel">', "Cancel", '</a></div></div>');
  return opt_sb ? '' : output.toString();
};


Talk.resolveCommentConfirmation = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  Talk.confirmation({position: 'top', question: soy.$$escapeHtml("Resolve this comment thread?"), confirmBtn: soy.$$escapeHtml("Remove"), confirmBtnTitle: soy.$$escapeHtml("Mark as resolved and hide discussion"), altActionBtn: soy.$$escapeHtml("Archive"), altActionBtnTitle: soy.$$escapeHtml("Mark as archived and collapse discussion")}, output);
  return opt_sb ? '' : output.toString();
};


Talk.restoreCommentConfirmation = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  Talk.confirmation({position: 'top', question: soy.$$escapeHtml("Restore discussion?"), confirmBtn: soy.$$escapeHtml("Restore"), confirmBtnTitle: soy.$$escapeHtml("Restore discussion from archive")}, output);
  return opt_sb ? '' : output.toString();
};


Talk.deleteReplyConfirmation = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  Talk.confirmation({position: 'bottom', question: soy.$$escapeHtml("Delete this comment?"), confirmBtn: soy.$$escapeHtml("Delete"), confirmBtnTitle: soy.$$escapeHtml("Delete")}, output);
  return opt_sb ? '' : output.toString();
};


Talk.confirmation = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<table id="gd-shadow" class="', soy.$$escapeHtml(opt_data.position), '"><tbody><tr><td><table><tbody><tr><td><div id="gd-shadow-description">', soy.$$escapeHtml(opt_data.question), '</div></td></tr><tr><td><table class="shadow-buttons-table"><tbody><tr><td><div class="gd-inline-block gd-button gd-button-standard" id="gd-shadow-confirm" title="', soy.$$escapeHtml(opt_data.confirmBtnTitle), '">', soy.$$escapeHtml(opt_data.confirmBtn), '</div></td><td><div class="gd-inline-block gd-button gd-button-standard" id="gd-shadow-cancel">', soy.$$escapeHtml("Cancel"), '</div></td</tr>', (opt_data.altActionBtn) ? '<tr><td style="padding-top: 10px"><div class="gd-inline-block gd-button gd-button-standard" id="gd-shadow-alt" title="' + soy.$$escapeHtml(opt_data.altActionBtnTitle) + '">' + soy.$$escapeHtml(opt_data.altActionBtn) + '</div></td><td></td></tr>' : '', '</tbody></table></td></tr></tbody></table></td></tr></tbody></table>');
  return opt_sb ? '' : output.toString();
};


Talk.insertPointer = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<span id="talk-insert-pointer"></span>');
  return opt_sb ? '' : output.toString();
};


Talk.insertIcon = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<a id="icon-talk-insert" href="#link" class="gd-comment-icon gd-comment-icon-active gd-comment-icon-insert" data-content-id="', soy.$$escapeHtml(opt_data.contentId), '"></a>');
  return opt_sb ? '' : output.toString();
};


Talk.insertInputTemplate = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="talk-insert" class="gd-pane-view gd-comment-active"><div class="gd-arrow-outer"></div><div class="gd-arrow-inner"></div><span class="talk-restrictions editable">');
  if (opt_data.hasPermissions) {
    Talk.restrictedIcon({hasEditPermission: opt_data.hasEditPermissions}, output);
  } else {
    Talk.notRestrictedIcon(null, output);
  }
  output.append('</span><div class="gd-reply"><img width="24" height="24" src="', soy.$$escapeHtml(opt_data.userAvatar), '" class="gd-user-icon"><div class="gd-reply-author">', soy.$$escapeHtml(opt_data.username), '</div><div class="gd-reply-collapsible"><div class="gd-reply-preview gd-reply-html" style="display: none"></div></div></div><div class="gd-input gd-input-pane gd-input-typing" style="display: block"><div style="display: none" class="gd-input-spinner"></div><textarea name="reply-text" class="gd-input-textarea"></textarea><div class="gd-input-buttons"><div title="', soy.$$escapeHtml("View rendered comment"), '" class="gd-inline-block gd-button gd-button-standard gd-input-preview gd-input-active gd-button-disabled">', soy.$$escapeHtml("Preview"), '</div><div title="', soy.$$escapeHtml("Make changes to your comment"), '" class="gd-inline-block gd-button gd-button-standard gd-input-edit" style="display: none">', soy.$$escapeHtml("Edit"), '</div><div title="', soy.$$escapeHtml("Post comment (Ctrl+Enter)"), '" class="gd-inline-block gd-button gd-button-action gd-input-post gd-input-active gd-button-disabled"><span class="gd-input-buttons-post">', soy.$$escapeHtml("Save"), '</span></div><a title="', soy.$$escapeHtml("Discard comment"), '" class="gd-inline-block gd-button gd-input-cancel">', soy.$$escapeHtml("Cancel"), '</a></div></div><div id="error-talk-insert" class="gd-error-container"></div><div class="gd-after"></div></div>');
  return opt_sb ? '' : output.toString();
};


Talk.hiderContainer = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="talk-show-hide-container"></div>');
  return opt_sb ? '' : output.toString();
};


Talk.hider = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="talk-hider" title="', soy.$$escapeHtml("Hide Talks ( ] )"), '"></div>');
  return opt_sb ? '' : output.toString();
};


Talk.shower = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div id="talk-shower" title="', soy.$$escapeHtml("Show Talks ( ] )"), '"></div>');
  return opt_sb ? '' : output.toString();
};


Talk.restrictedIcon = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var title__soy227 = new soy.StringBuilder((opt_data.hasEditPermission) ? soy.$$escapeHtml("Discussion restricted.") + ' ' + soy.$$escapeHtml("Click to view/edit restrictions") : soy.$$escapeHtml("Discussion restricted.") + ' ' + soy.$$escapeHtml("Click to view restrictions"));
  title__soy227 = title__soy227.toString();
  output.append('<span class="talk-restriction-icon talk-restricted" title="', soy.$$escapeHtml(title__soy227), '"></span>');
  return opt_sb ? '' : output.toString();
};


Talk.notRestrictedIcon = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<span class="talk-restriction-icon talk-not-restricted" title="', soy.$$escapeHtml("Discussion not restricted. Click to add restrictions"), '"></span>');
  return opt_sb ? '' : output.toString();
};


Talk.permissionsDialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  var class__soy245 = new soy.StringBuilder((! opt_data.editable) ? 'not-editable' : '');
  class__soy245 = class__soy245.toString();
  output.append('<div class="talk-permissions-dialog ', soy.$$escapeHtml(class__soy245), '">', (opt_data.editable) ? '<input id="talk-permissions-input" class="autocomplete-user-or-group talk-macro-field" type=\'text\' data-none-message="' + soy.$$escapeHtml("Not found") + '" placeholder="' + soy.$$escapeHtml("Enter user or group name") + '"/><div class="talk-permissions-dialog-buttons"><button class="aui-button aui-button-primary talk-save-permissions" data-comment-id="' + soy.$$escapeHtml(opt_data.commentId) + '">' + soy.$$escapeHtml("Apply") + '</button><a href="#" class="talk-cancel-permissions">' + soy.$$escapeHtml("Cancel") + '</a><div id="talk-permissions-loader" class="talk-action-status aui-icon-wait"></div><div id="talk-permissions-success" class="talk-action-status aui-icon aui-icon-success"></div></div>' : soy.$$escapeHtml("Only users and user groups listed below can view the current discussion:"), '</div>');
  return opt_sb ? '' : output.toString();
};

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


try {
/* module-key = 'com.stiltsoft.confluence.talk.confluence-talk-plugin:talk-resources', location = 'soy/talk-dialog.soy' */
// This file was automatically generated from talk-dialog.soy.
// Please don't edit this file by hand.

if (typeof Talk == 'undefined') { var Talk = {}; }


Talk.settingsDialog = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div><h2>', "Talk settings", '</h2><p>', "These are your personal Talk settings:", '</p></div><form class="aui"><div class="checkbox"><input class="checkbox" type="checkbox" id="talk-view-checkbox" ', opt_data.viewChecked, '><label for="talk-view-checkbox">', "Show comments sidebar ( ] )", '</label></div><div class="checkbox"><input class="checkbox" type="checkbox" id="talk-insert-checkbox" ', opt_data.insertChecked, '><label for="talk-insert-checkbox">', "Enable adding of discussions (d)", '</label></div><br><a href="https://docs.stiltsoft.com/display/Talk/Getting+Started?from=on-page-settings" target="_blank">', "Learn more", '</a><a href="http://feedback.stiltsoft.com/" target="_blank" style="float: right">', "Request a feature", '</a>', (! opt_data.isLicenseActive) ? '<div class="talk-dialog-no-license">' + "Talk Add-on license is not active at the moment. Please generate an evaluation license or purchase a commercial license on \x3ca href\x3d\x22https://marketplace.atlassian.com/plugins/com.stiltsoft.confluence.talk.confluence-talk-plugin\x22\x3eAtlassian Marketplace\x3c/a\x3e." + '</div>' : '', (opt_data.isEvalExpiring) ? '<div class="talk-dialog-no-license">' + "Talk Add-on evaluation license is expiring! If you liked this add-on, you can purchase a commercial license on \x3ca href\x3d\x22https://marketplace.atlassian.com/plugins/com.stiltsoft.confluence.talk.confluence-talk-plugin\x22\x3eAtlassian Marketplace\x3c/a\x3e." + '</div>' : '', '</form>');
  return opt_sb ? '' : output.toString();
};


Talk.featureDiscovery = function(opt_data, opt_sb) {
  var output = opt_sb || new soy.StringBuilder();
  output.append('<div><h2>', "What\x27s new in Talk?", '</h2>', "\x3cp\x3eCongratulations! Now you are able to:\x3c/p\x3e\x3cul\x3e\x3cli\x3eArchive a discussion instead of remove.\x3cbr/\x3e\x3cem\x3eClick Archive when resolving a discussion.\x3c/em\x3e\x3c/li\x3e\x3cli\x3eInsert comments from view mode.\x3cbr/\x3e\x3cem\x3eYou can enable this option from \x27Talk\x27 menu above.\x3c/em\x3e\x3c/li\x3e\x3cli\x3eManage discussion permissions.\x3cbr/\x3e\x3cem\x3eClick lock-icon while creating a discussion.\x3c/em\x3e\x3c/li\x3e\x3c/ul\x3e", '</div><form class="aui"><button id="talk-feature-close" class="aui aui-button">', "Close", '</button><a href="https://docs.stiltsoft.com/display/Talk/Getting+Started?from=feature-discovery" target="_blank" style="float: right; line-height: 30px">', "What is Talk?", '</a></form>');
  return opt_sb ? '' : output.toString();
};

} catch (err) {
    if (console && console.log && console.error) {
        console.log("Error running batched script.");
        console.error(err);
    }
}


