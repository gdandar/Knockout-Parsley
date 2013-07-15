#Knockout Parsley
[Parsley](http://parsleyjs.org) validation for Knockout JS.

License: [MIT](http://www.opensource.org/licenses/mit-license.php)

##Usage
```javascript
//Bind Parsley to a form
$( '#main-form' ).parsley();

//Init the plugin
ko.parsley.init('#main-form');

var viewModel = {
  //Add a simple rule to the observable
  value1:  ko.observable().extend({ required: true }),

  //Add rule with custom message
  value2: ko.observable().extend({
    type: "email",
    message: "This is not a valid email address!"
  });

  //Add rule with condition
  //The condition must be a function returning  a boolean value. If the returned value is false, the validation will not apply.
  value3: ko.observable.extend({
    required: true,
    condition: function(_viewModel) {
      return _viewModel.value1() === 'Some Text';
    }
  });  
};

//Apply Knockout bindings
ko.apllyBindings(viewModel); 

```

##Rules
You can use the following Parsley rules:
* required
* notblank
* minlength
* maxlength
* rangelength
* min
* max
* regexp
* range
* type

Learn more about the rules on the [Parsley Documentation Site](http://http://parsleyjs.org/documentation.html)