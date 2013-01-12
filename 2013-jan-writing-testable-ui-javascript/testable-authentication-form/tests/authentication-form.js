/*global $:true, ok: true, start: true, asyncTest: true, AuthenticationForm: true, module: true, AjaxMock: true */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
(function() {
  "use strict";

  var ajaxMock,
      authenticationForm;

  module("testable-authentication-form", {
    setup: function() {
      // create a mock XHR object to inject into the authenticationForm for
      // testing.
      ajaxMock = Object.create(AjaxMock);
      authenticationForm = Object.create(AuthenticationForm);
      authenticationForm.init({
        // Inject the ajax mock for unit testing.
        ajax: ajaxMock.ajax.bind(ajaxMock)
      });
    },
    teardown: function() {
      // tear down the authenticationForm so that subsequent test runs do not
      // interfere with each other.
      authenticationForm.teardown();
      authenticationForm = null;
    }
  });

  asyncTest("submitForm with valid username and password", function() {
    $("#username").val("testuser");
    $("#password").val("password");

    ajaxMock.setSuccess({
      success: true,
      username: "testuser",
      userid: "userid"
    });

    authenticationForm.submitForm(function(error) {
      equal(error, null);

      ok($("#authentication_success").is(":visible"));

      start();
    });
  });

  asyncTest("submitForm with invalid username and password", function() {
    $("#username").val("testuser");
    $("#password").val("invalidpassword");

    ajaxMock.setSuccess({
      success: false
    });

    authenticationForm.submitForm(function(error) {
      equal(error, null);

      ok($("#authentication_failure").is(":visible"));

      start();
    });
  });

  asyncTest("submitForm with missing username and password", function() {
    $("#username").val("");
    $("#password").val("");

    authenticationForm.submitForm(function(error) {
      equal(error, "username_password_required");

      ok($("#username_password_required").is(":visible"));

      start();
    });
  });

  asyncTest("submitForm with XHR error", function() {
    $("#username").val("testuser");
    $("#password").val("password");

    ajaxMock.setError("could not complete");

    authenticationForm.submitForm(function(error) {
      equal(error, "could not complete");

      ok($("#authentication_error").is(":visible"));

      start();
    });
  });

  asyncTest("checkAuthentication with valid user", function() {
    ajaxMock.setSuccess({
      success: true,
      username: "testuser",
      userid: "userid"
    });

    authenticationForm.checkAuthentication("testuser", "password", function(error, user) {
      equal(error, null);

      equal(ajaxMock.getLastType(), "POST");
      equal(ajaxMock.getLastURL(), "/authenticate_user");

      var data = ajaxMock.getLastData();
      equal(data.username, "testuser");
      equal(data.password, "password");

      equal(user.username, "testuser");
      equal(user.userid, "userid");

      start();
    });
  });

  asyncTest("checkAuthentication with missing XHR error", function() {
    ajaxMock.setError("could not complete");
    authenticationForm.checkAuthentication("testuser", "password", function(error) {
      equal(error, "could not complete");

      start();
    });
  });

}());
