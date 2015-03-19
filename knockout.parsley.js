/// Knockout Parsley validation plugin v2.0.1
/// (c) 2013 Gabor Dandar
/// License: MIT (http://www.opensource.org/licenses/mit-license.php)
(function (factory) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        // CommonJS & Node
        factory(require("knockout"), require("jquery"), require("parsleyjs"), exports);
    } else if (typeof define === "function" && define.amd) {
        // RequireJS
        define(["knockout", "jquery", "parsleyjs", "exports"], factory);
    } else {
        // Simple script include
        factory(ko, jQuery, ko.parsley = {});
    }

}(function (ko, $, exports) {

    if (typeof (ko) === undefined) {
        throw 'KnockoutJS not found!';
    }
    if (typeof ($().parsley) === undefined) {
        throw 'Parsley not found!';
    }

    var allowedRules = ['required', 'minlength', 'maxlength', 'length', 'min', 'max', 'pattern', 'range', 'type'];
    var mainForm;

    ko.parsley = exports;

    var util = (function () {
        return {
            nativeForEach: Array.prototype.forEach,

            isArray: Array.isArray || function (obj) {
                return toString.call(obj) == '[object Array]';
            },

            each: function (obj, iterator, context) {
                if (obj === null) return;
                if (util.nativeForEach && obj.forEach === util.nativeForEach) {
                    obj.forEach(iterator, context);
                } else if (util.isArray(obj)) {
                    for (var i = 0, l = obj.length; i < l; i++) {
                        iterator.call(context, obj[i], i, obj);
                    }
                } else {
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            iterator.call(context, obj[key], key, obj);
                        }
                    }
                }
            }
        };
    }());

    //Register the 'validatable' Knockout extender, and the 'validationCore' binding handler for validatable observables

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
        if (enable && !observable.rules) {
            observable.rules = ko.observableArray();
        }
    };

    ko.bindingHandlers.validationCore = {

        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var obs = valueAccessor();
            if (obs.rules) {
                var parsleyField = $(element).parsley();
                util.each(obs.rules(), function (rule, key, list) {

                    var parsleyAttrName = "data-" + rule.rule;
                    var attr = $(element).attr(parsleyAttrName);

                    //if the same rule is defined in the html do not override it
                    if (typeof attr == 'undefined' || attr === false) {

                        if (rule.condition && !rule.condition(bindingContext.$root)) {
                            parsleyField.removeConstraint(rule.rule);
                        } else {
                            parsleyField.addConstraint(rule.rule, rule.params, undefined, false);
                        }
                    }
                });
            }
        }
    };


    function addExtender(ruleName) {
        if (!ko.extenders[ruleName]) {
            ko.extenders[ruleName] = function (target, options) {
                if (options.condition || options.message) {
                    addRule(target, {
                        rule: ruleName,
                        params: options.params,
                        condition: options.condition,
                        message: options.message
                    });
                } else {
                    addRule(target, {
                        rule: ruleName,
                        params: options
                    });
                }

                return target;
            };
        }
    }

    function overrideBinding(handlerName) {

        var update = ko.bindingHandlers[handlerName].update;

        ko.bindingHandlers[handlerName].update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

            update(element, valueAccessor, allBindingsAccessor);

            return ko.bindingHandlers.validationCore.update(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);

        };
    }

    function addRule(observable, rule) {
        observable.extend({
            validatable: true
        });
        observable.rules.push(rule);
    }

    var api = (function () {
        return {
            init: function (_mainForm) {
                mainForm = _mainForm;
                $(mainForm).parsley();

                util.each(allowedRules, function (value, key, list) {
                    addExtender(value);
                });
                overrideBinding('value');
                overrideBinding('checked');
            }
        };

    }());

    ko.utils.extend(exports, api);

}));