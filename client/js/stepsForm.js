/**
 * stepsForm.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
jQuery(document).ready(function () {
    var theForm = document.getElementById( "sc_contact_form" );
    var orderForm = jQuery("#sc_contact_form");
    new stepsForm( theForm, {
        onSubmit : function( form ) {
            // hide form
            var action = orderForm.attr("action");
            orderSubmitForm(theForm, orderForm, action!=undefined ? action : THEMEREX_ajax_url, THEMEREX_ajax_nonce);
        }
    });
});

;( function( window ) {
	
	'use strict';

	var transEndEventNames = {
			'WebkitTransition': 'webkitTransitionEnd',
			'MozTransition': 'transitionend',
			'OTransition': 'oTransitionEnd',
			'msTransition': 'MSTransitionEnd',
			'transition': 'transitionend'
		},
		transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
		support = { transitions : Modernizr.csstransitions };

	function extend( a, b ) {
		for( var key in b ) { 
			if( b.hasOwnProperty( key ) ) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function stepsForm( el, options ) {
		this.el = el;
		this.options = extend( {}, this.options );
  		extend( this.options, options );
  		this._init();
	}

	stepsForm.prototype.options = {
		onSubmit : function() { return false; }
	};

	stepsForm.prototype._init = function() {
		// current question
		this.current = 0;

		// questions
		this.questions = [].slice.call( this.el.querySelectorAll( 'ol.questions > li' ) );
		// total questions
		this.questionsCount = this.questions.length;
		// show first question
		classie.addClass( this.questions[0], 'current' );

        // next question control
		this.ctrlNext = this.el.querySelector( 'button.next' );
		this.ctrlButton = this.el.querySelector( '.continue_button > a' );

		// progress bar
		this.progress = this.el.querySelector( 'div.progress' );
		
		// question number status
		this.questionStatus = this.el.querySelector( 'span.number' );
		// current question placeholder
		this.currentNum = this.questionStatus.querySelector( 'span.number-current' );
		this.currentNum.innerHTML = Number( this.current + 1 );
		// total questions placeholder
		this.totalQuestionNum = this.questionStatus.querySelector( 'span.number-total' );
		this.totalQuestionNum.innerHTML = this.questionsCount;

		// error message
		this.error = this.el.querySelector( 'span.error-message' );
		
		// init events
		this._initEvents();
	};

	stepsForm.prototype._initEvents = function() {
		var self = this,
			// first input
			firstElInput = this.questions[ this.current ].querySelector( 'input' ),
			// focus
			onFocusStartFn = function() {
				firstElInput.removeEventListener( 'focus', onFocusStartFn );
				classie.addClass( self.ctrlNext, 'show' );
			};

		// show the next question control first time the input gets focused
		firstElInput.addEventListener( 'focus', onFocusStartFn );

		// show next question
		this.ctrlNext.addEventListener( 'click', function( ev ) { 
			ev.preventDefault();
			self._nextQuestion(); 
		} );

        this.ctrlButton.addEventListener( 'click', function( ev ) {
            ev.preventDefault();
            self._nextQuestion();
        } );


		// pressing enter will jump to next question
		document.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			// enter
			if( keyCode === 13 ) {
				ev.preventDefault();
				self._nextQuestion();
			}
		} );

		// disable tab
		this.el.addEventListener( 'keydown', function( ev ) {
			var keyCode = ev.keyCode || ev.which;
			// tab
			if( keyCode === 9 ) {
				ev.preventDefault();
			} 
		} );
	};

	stepsForm.prototype._nextQuestion = function() {
		if( !this._validade() ) {
			return false;
		}

		// check if form is filled
		if( this.current === this.questionsCount - 1 ) {
			this.isFilled = true;
		}

		// clear any previous error messages
		this._clearError();

		// current question
		var currentQuestion = this.questions[ this.current ];

		// increment current question iterator
		++this.current;

		// update progress bar
		this._progress();

		if( !this.isFilled ) {
			// change the current question number/status
			this._updateQuestionNumber();

			// add class "show-next" to form element (start animations)
			classie.addClass( this.el, 'show-next' );

			// remove class "current" from current question and add it to the next one
			// current question
			var nextQuestion = this.questions[ this.current ];
			classie.removeClass( currentQuestion, 'current' );
			classie.addClass( nextQuestion, 'current' );
            // todo: dots
            jQuery('.sc_contact_form_order .dots .dot_'+this.current).addClass('answered');
		}

		// after animation ends, remove class "show-next" from form element and change current question placeholder
		var self = this,
			onEndTransitionFn = function( ev ) {
				if( support.transitions ) {
					this.removeEventListener( transEndEventName, onEndTransitionFn );
				}
				if( self.isFilled ) {
					self._submit();
				}
				else {
					classie.removeClass( self.el, 'show-next' );
					self.currentNum.innerHTML = self.nextQuestionNum.innerHTML;
					self.questionStatus.removeChild( self.nextQuestionNum );
					// force the focus on the next input
					nextQuestion.querySelector( 'input' ).focus();
				}
			};

		if( support.transitions ) {
			this.progress.addEventListener( transEndEventName, onEndTransitionFn );
		}
		else {
			onEndTransitionFn();
		}
	}

	// updates the progress bar by setting its width
	stepsForm.prototype._progress = function() {
		this.progress.style.width = this.current * ( 100 / this.questionsCount ) + '%';
	}

	// changes the current question number
	stepsForm.prototype._updateQuestionNumber = function() {
		// first, create next question number placeholder
		this.nextQuestionNum = document.createElement( 'span' );
		this.nextQuestionNum.className = 'number-next';
		this.nextQuestionNum.innerHTML = Number( this.current + 1 );
		// insert it in the DOM
		this.questionStatus.appendChild( this.nextQuestionNum );
	}

	// submits the form
	stepsForm.prototype._submit = function() {
		this.options.onSubmit( this.el );
	}

	// TODO (next version..)
	// the validation function
    stepsForm.prototype._validade = function() {
        // current question´s input
        var input = this.questions[ this.current ].querySelector( 'input' ).value;
        var email = this.el.querySelector('#q3').value;
        var atpos = email.indexOf("@");
        var dotpos = email.lastIndexOf(".");

        if( input === '' ) {
            this._showError( 'EMPTYSTR' );
            return false;
        }

        if (email != ''){
            if (atpos< 1 || dotpos<atpos+2 || dotpos+2>=email.length) {
                this._showError( 'INVALIDEMAIL' );
                return false;
            }
            return true;
        }

        return true;
    };



    // TODO (next version..)
	stepsForm.prototype._showError = function( err ) {
		var message = '';
		switch( err ) {
			case 'EMPTYSTR' : 
				message = 'Please fill the field before continuing';
				break;
			case 'INVALIDEMAIL' : 
				message = 'Please fill a valid email address';
				break;
			// ...
		};
		this.error.innerHTML = message;
		classie.addClass( this.error, 'show' );
	}

	// clears/hides the current error message
	stepsForm.prototype._clearError = function() {
		classie.removeClass( this.error, 'show' );
	}

	// add to global namespace
	window.stepsForm = stepsForm;

})( window );