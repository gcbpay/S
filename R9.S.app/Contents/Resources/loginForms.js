(function(sbx) {

	/////// Private	///////
	function inputElementsRepresentLogin(elements) {
		passwordFields = 0;
		for (var j = elements.length - 1; j >= 0; j--) {
			element = elements[j];
			if (element.type == "password") {
				passwordFields++;
			}
		}
		if (passwordFields >= 1) {
			return true;
		}
		return false;
	}

	function fillInputElements(username, password, elements, submit) {
		var passwordField, previousTextField;
		passwordField = previousTextField = undefined;

		for (var j = 0; j < elements.length; j++) {
			var element = elements[j];
			if (element.type == "password") {
				passwordField = element;
				break;
			} else if (element.type == "text" || element.type == "email") {
				previousTextField = element;
			}
		}
		if (passwordField) {

			if (previousTextField) {
				fillInputElement(username, previousTextField, false);
			}

			fillInputElement(password, passwordField, submit);
		}
	}

	function fillInputElement(text, el, commit) {
		el.focus();
		dispatch({
			type: 'beforeinput',
			data: text
		}, el);

		for (var i = 0; i < text.length; ++i) {
			var x = text.charCodeAt(i);
			dispatchKeyEvents(el, x);
		}

		el.value = text;

		dispatch({
			type: 'input',
			data: text
		}, el);

		if (commit) {
			setTimeout(function() {
				console.log("Simulating enter..")
				dispatchKeyEvents(el, 13);
				dispatchKeyEvents(el, 10);
			}, 500);
		} else {
			el.blur();
		}
	}

	function dispatchKeyEvents(el, keyCode) {
		dispatch({
			type: 'keydown',
			keyCode: keyCode,
			which: keyCode,
			charCode: keyCode
		}, el);
		dispatch({
			type: 'keyup',
			keyCode: keyCode,
			which: keyCode,
			charCode: keyCode
		}, el);
		dispatch({
			type: 'keypress',
			keyCode: keyCode,
			which: keyCode,
			charCode: keyCode
		}, el);
	}

	function dispatch(opts, el) {
		opts = opts || {};
		var event = document.createEvent('CustomEvent');
		event.initCustomEvent(opts.type, true, true, opts.detail);

		for (var key in opts) event[key] = opts[key];
		// dispatch event asynchronously (in the sense of on the next turn of the event loop; still should be fired in order of dispatch
		setTimeout(function() {
			el.dispatchEvent(event);
		}, 0);
	}

	// Handle login forms

	function loginForms() {
		var forms = document.getElementsByTagName("form");
		var loginForms = new Array();
		for (var i = forms.length - 1; i >= 0; i--) {
			form = forms[i];
			elements = form.elements;
			if (inputElementsRepresentLogin(elements)) {
				loginForms.push(form);
			}
		}
		return loginForms;
	}


	function hasLoginForms() {
		return loginForms().length > 0;
	}

	function fillLoginForms(username, password, autosubmit) {
		var lfs = loginForms();
		var nLfs = lfs.length
		for (var i = nLfs - 1; i >= 0; i--) {
			var form = lfs[i];
			var elements = form.elements;
			console.log("About to submit");
			fillInputElements(username, password, elements, autosubmit);
			if (autosubmit) {
				setTimeout(function() {
					form.submit()
				}, 1000);
			}
		}
	}


	// Handle orphaned input elements (i.e. <input/> that do not appear inside a form)

	function orphanedInputs() {
		var inputs = document.getElementsByTagName("input");
		var orphanedInputs = new Array();

		for (var i = 0; i < inputs.length; i++) {
			var input = inputs[i];
			if (input.form == null) {
				orphanedInputs.push(input);
			}
		}
		return orphanedInputs;
	}

	function hasOrphanedInputFieldsLogin() {
		return inputElementsRepresentLogin(orphanedInputs());
	}

	function fillOrphanedInputFields(username, password) {
		fillInputElements(username, password, orphanedInputs());
	}


	/////// Public	///////
	sbx.canFillLogin = function() {
		return hasLoginForms() || hasOrphanedInputFieldsLogin();
	}

	sbx.fillLogin = function(username, password, autosubmit) {
		fillOrphanedInputFields(username, password);
		fillLoginForms(username, password, autosubmit);
	}
})(window.sbx_ns = window.sbx_ns || {});


// iOS
var SBXExtensionJavaScriptClass = function() {};

SBXExtensionJavaScriptClass.prototype = {
	run: function(arguments) {
		arguments.completionFunction({
			"url_string": document.baseURI,
			"canFillLogin": sbx_ns.canFillLogin(),
		});
	},

	// Note that the finalize function is only available in iOS.
	finalize: function(arguments) {

		if (arguments["action"] == "fillLogin") {
			sbx_ns.fillLogin(arguments["username"], arguments["password"]);
		}
	}
};

// The JavaScript file must contain a global object named "ExtensionPreprocessingJS".
var ExtensionPreprocessingJS = new SBXExtensionJavaScriptClass;
