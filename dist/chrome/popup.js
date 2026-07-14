/*globals chrome */
// inject printliminator from popup & control from there.
// Manifest V3: uses chrome.scripting.executeScript / insertCSS instead of
// the removed chrome.tabs.executeScript / insertCSS APIs.
var commands = {
	tabId: null,
	remove : function() {
		chrome.scripting.executeScript({
			target: { tabId: commands.tabId },
			func: () => thePrintliminator.removeGraphics()
		});
	},
	print : function() {
		document.querySelector( 'li.print' ).classList.add( 'busy' );
		// ready state is delayed when a file on the page is not found
		chrome.scripting.executeScript({
			target: { tabId: commands.tabId },
			func: () => document.readyState === 'complete'
		}, function( result ) {
			if ( result && result[ 0 ].result === true ) {
				window.close();
				chrome.scripting.executeScript({
					target: { tabId: commands.tabId },
					func: () => thePrintliminator.print()
				});
			} else {
				// keep checking ready state for 20 seconds
				// if still not ready, abort, but still call print function
				var loopy = function( i ) {
					setTimeout(function () {
						chrome.scripting.executeScript({
							target: { tabId: commands.tabId },
							func: () => document.readyState === 'complete'
						}, function( result ) {
							if ( result && result[ 0 ].result === true || i === 1 ) {
								i = 0;
								window.close();
								chrome.scripting.executeScript({
									target: { tabId: commands.tabId },
									func: () => thePrintliminator.print()
								});
							}
							if ( --i > 0 ) {
								loopy(i);
							}
						});
					}, 1000);
				};
				// repeat 20 times (20 seconds), then just close the popup
				loopy( 20 );
			}
		});
	},
	stylize : function() {
		chrome.scripting.executeScript({
			target: { tabId: commands.tabId },
			func: () => thePrintliminator.stylize()
		});
	},
	keyboard : function() {
		var indx,
			table = document.querySelector( '#keyboard' ),
			mode = table.style.display === 'none';
		table.style.display = mode ? '' : 'none';
		this.innerHTML = chrome.i18n.getMessage( mode ? 'hideKeyboardCommands' : 'viewKeyboardCommands' );
	},
	undo : function() {
		chrome.scripting.executeScript({
			target: { tabId: commands.tabId },
			func: () => thePrintliminator.undo()
		});
	},
	setLanguage : function(){
		// update all text content
		commands.getMsg( document.querySelectorAll( '[i18n-text]' ), 'text' );
		commands.getMsg( document.querySelectorAll( '[i18n-title]' ), 'title' );
	},
	getMsg : function( elms, target ) {
		var indx, msgKey, message,
			len = elms.length;
		for ( indx = 0; indx < len; indx++ ) {
			msgKey = elms[ indx ].getAttribute( 'i18n-' + target );
			message = chrome.i18n.getMessage( msgKey );
			if ( target === 'text' ) {
				elms[ indx ].innerHTML += message;
			} else {
				elms[ indx ].title = message.replace( '<br>', ' ' );
			}
		}
	}
};

chrome.windows.getCurrent( function( win ) {
	chrome.tabs.query({
		windowId : win.id,
		active : true
	}, function( tabArray ) {

		// don't try to open a popup on chrome settings pages
		if ( tabArray && /^chrome/.test( tabArray[ 0 ].url || '' ) ) {
			return false;
		}

		// store tab id for the command methods
		commands.tabId = tabArray[ 0 ].id;

		// inject css & js only on initial click
		// NOTE: MV3 scripting API has no matchAboutBlank equivalent; the
		// Yahoo Mail print-popup edge case is deferred (would need
		// webNavigation + explicit frame targeting).
		chrome.scripting.executeScript({
			target: { tabId: commands.tabId },
			func: () => document.querySelector( "body" ).classList.contains( "_printliminator_enabled" )
		}, function( result ) {
			if ( result && !result[ 0 ].result ) {
				chrome.scripting.insertCSS({
					target: { tabId: commands.tabId },
					files: [ 'printliminator.css' ]
				});

				chrome.scripting.executeScript({
					target: { tabId: commands.tabId },
					files: [ 'printliminator.js' ]
				}, function() {
					chrome.scripting.executeScript({
						target: { tabId: commands.tabId },
						func: () => thePrintliminator.init()
					});
				});
			}
			// update Language
			commands.setLanguage();
		});

		// Remove graphics
		var el = document.querySelector( '.no_graphics' );
		el.removeEventListener( 'click', commands.remove );
		el.addEventListener( 'click', commands.remove );

		// Print
		el = document.querySelector( '.print' );
		el.removeEventListener( 'click', commands.print );
		el.addEventListener( 'click', commands.print );

		// Add print stylesheet
		el = document.querySelector( '.stylize' );
		el.removeEventListener( 'click', commands.stylize );
		el.addEventListener( 'click', commands.stylize );

		// Undo
		el = document.querySelector( '.undo' );
		el.removeEventListener( 'click', commands.undo );
		el.addEventListener( 'click', commands.undo );

		// keyboard
		el = document.querySelector( '.toggle' );
		el.removeEventListener( 'click', commands.keyboard );
		el.addEventListener( 'click', commands.keyboard );

	});
});
