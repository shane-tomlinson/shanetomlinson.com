/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var AuthenticationForm = (function() {
  "use strict";

  var Module = {
    init: function(options) {
      options = options || {};

      // Use an injected request function for testing, use jQuery's xhr
      // function as a default.
      this.ajax = options.ajax || $.ajax;

      // If unit tests are run multiple times, it is important to be able to
      // detach events so that one test run does not interfere with another.
      this.submitHandler = onFormSubmit.bind(this);
      $("#authentication_form").on("submit", this.submitHandler);
    },

    teardown: function() {
      // detach event handlers so that subsequent test runs do not interfere
      // with each other.
      $("#authentication_form").off("submit", this.submitHandler);
    },

    // BEGIN TESTING API
    // A build script could strip this out to save bytes.
    submitForm: submitForm,
    checkAuthentication: checkAuthentication
    // END TESTING API
  };

  return Module;

  // Separate the submit handler from the actual action. This allows submitForm
  // to be called programatically without worrying about handling the event.
  function onFormSubmit(event) {
    event.preventDefault();

    submitForm.call(this);
  }

  // checkAuthentication is asynchronous but the unit tests need to
  // perform their checks after all actions are complete. "done" is an optional
  // callback that is called once all other actions complete.
  function submitForm(done) {
    var username = $("#username").val();
    var password = $("#password").val();

    if (username && password) {
      checkAuthentication.call(this, username, password, function(error, user) {
        if (error) {
          $("#authentication_error").show();
        } else {
          updateAuthenticationStatus(user);
        }

        // surface any errors so tests can be done.
        done && done(error);
      });
    }
    else {
      $("#username_password_required").show();

      // pass back an error message that can be used for testing.
      done && done("username_password_required");
    }
  }

  // checkAuthentication makes use of the ajax mock for unit testing.
  function checkAuthentication(username, password, done) {
    this.ajax({
      type: "POST",
      url: "/authenticate_user",
      data: {
        username: username,
        password: password
      },
      success: function(resp) {
        var user = null;
        if (resp.success) {
          user = {
            username: resp.username,
            userid: resp.userid
          };
        }

        done && done(null, user);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        done && done(errorThrown);
      }
    });
  }

  function updateAuthenticationStatus(user) {
    if (user) {
      $("#authentication_success").show();
    }
    else {
      $("#authentication_failure").show();
    }
  }
}());
