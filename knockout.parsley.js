ko.parsley = {};

(function(){
	var allowedRules = ['required','notblank', 'minlength', 'maxlength', 'rangelength', 'min', 'max', 'regexp', 'range',  'type'];
	var mainForm;
	//Register the 'validatable' Knockout extender, and the 'validationCore' binding handler for validatable observables
	function initKoAddons() {
		//Extender that makes the observable ready for validate. (Inserts an observableArray into the observable for the validation rules)
		//Each rule in the rules array must have the following structure:
		//	{
		//		rule: <name of the rule>,
		//		params: <rule parameters>,
		//		message: <custom message if the validation fails>,
		//		condition: <function returning  a boolean value, if the returned value is false, the validation will not apply>
		//	}
		//	{
		//		rule: 'minlength',
		//		params: 12,
		//		message: 'This is too short!',
		//		condition: function() { 
		//			return myGroup.myValue() > 6;
		//		}
		//	}
		ko.extenders.validatable = function (observable, enable) {
			if(enable && !observable.rules) {
				observable.rules = ko.observableArray();
			}
		};
		
		ko.bindingHandlers.validationCore=  {

			update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
				var obs = valueAccessor();
				if(obs.rules) {
					var parsleyField = $( element).parsley();
					_.each( obs.rules(), function(rule, key, list) {

						var parsleyAttrName = "data-" + rule.rule;
						var attr = $(element).attr(parsleyAttrName);

						//if the same rule is defined in the html do not override it
						if (typeof attr == 'undefined' || attr === false) {

							if(rule.condition && !rule.condition(viewModel)) {
								$(element).parsley('removeConstraint', rule.rule);
							} else {
								addParsleyConstraint(parsleyField, rule);
								$(mainForm).parsley('addItem', element);	
							}
						}
					});  
				}          
			}
		};
	}

	function addExtender(ruleName) {
		if(!ko.extenders[ruleName]) {
			ko.extenders[ruleName] = function(target, options) {
				if(options.condition || options.message) {
					addRule(target, {rule: ruleName, params: options.params, condition: options.condition, message: options.message});
				} else {
					addRule(target, {rule: ruleName, params: options});	
				}

				return target;
			};	
		}
	}	

	function addParsleyConstraint(parsleyField, rule) {
		var name = rule.rule.toLowerCase();	
		if ( 'function' === typeof parsleyField.Validator.validators[ name ] ) {
			parsleyField.constraints[ name ] = {
				name: name,
				requirements: rule.params,
				valid: null
			};

			if ( name === 'required' ) {
				parsleyField.isRequired = true;
			}
			if(rule.message) {
				parsleyField.Validator.messages[ name ] = rule.message;
			}
			parsleyField.addCustomConstraintMessage( name );
		}

		parsleyField.bindValidationEvents();
	}

	function overrideBinding(handlerName) {

		var update = ko.bindingHandlers[handlerName].update;

		ko.bindingHandlers[handlerName].update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

			update(element, valueAccessor, allBindingsAccessor);

			return ko.bindingHandlers.validationCore.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

		};
	}

	function addRule(observable, rule) {
		observable.extend({validatable: true});
		observable.rules.push(rule);
	}

	this.init = function(_mainForm) {
		mainForm = _mainForm;
		initKoAddons();

		_.each( allowedRules, function(value, key, list) {
			addExtender(value);
		});
		overrideBinding('value');
		overrideBinding('checked');
	};

}).apply(ko.parsley);
