// Constructor function
function Validator(options) {
  var selectorRules = {};

  // Conduct validate
  function validate(inputElement, rule) {
    var errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector);
    var errorMessage;

    // Get rules from the selector
    var rules = selectorRules[rule.selector];

    // Tranverse each rule and check, if the checking has errors -> stop
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"));
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }
      if (errorMessage) {
        break;
      }
    }

    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.closest(options.formGroupSelector).classList.add("invalid");
    } else {
      errorElement.innerText = "";
      inputElement.closest(options.formGroupSelector).classList.remove("invalid");
    }

    return !errorMessage;
  }

  // Get the form element needs validating
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // When submitting form
    formElement.onsubmit = function (event) {
      event.preventDefault();

      var isFormValid = true;

      options.rule.forEach((rule) => {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // In case submit with JavaScript
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll("[name]:not([disabled])");
          var formValues = Array.from(enableInputs).reduce((value, input) => {
            switch (input.type) {
              case "radio":
                value[input.name] = formElement.querySelector(`input[name='${input.name}']:checked`).value;
                break;

              case "checkbox":
                if (!input.matches(":checked")) {
                  value[input.name] = "";
                  return value;
                }

                if (!Array.isArray(value[input.name])) {
                  value[input.name] = [];
                }

                value[input.name].push(input.value);

                break;
              case "file":
                value[input.name] = input.files;
                break;
              default:
                value[input.name] = input.value;
            }
            return value;
          }, {});
          console.log(formValues);
        }
        // In case submit with the default behavior
      } else {
        //         formElement.submit();
      }
    };

    // Tranverse each rule and handle
    options.rule.forEach((rule) => {
      // Save rules for each inputs
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach((inputElement) => {
        if (inputElement) {
          // Cope with the case that blurs out of the input element

          inputElement.onblur = function () {
            validate(inputElement, rule);
          };

          // Deal with the case that the user enters the input element
          inputElement.oninput = function () {
            var errorElement = inputElement.closest(options.formGroupSelector).querySelector(options.errorSelector);
            errorElement.innerText = "";
            inputElement.closest(options.formGroupSelector).classList.remove("invalid");
          };
        }
      });
    });
  }
}

// Define rules
// When there is no error -> return the error message
// When it's resonable -> return nothing (undefined)
Validator.isRequire = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      var pattern = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;
      return pattern.test(value) ? undefined : message || "Trường này phải là email";
    },
  };
};

Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min ? undefined : message || `Mật khẩu tối thiểu ${min} kí tự`;
    },
  };
};

Validator.isConfirmed = function (selector, getConfirmedValue, message) {
  return {
    selector: selector,
    test: function (value) {
      return value === getConfirmedValue() ? undefined : message || "Giá trị nhập vào không chính xác";
    },
  };
};
