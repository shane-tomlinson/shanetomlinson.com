/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
AjaxMock = (function() {
  "use strict";

  /*
   * The AjaxMock object type is a controllable XHR module used for unit
   * testing. It is injected into the AuthenticationForm so that real XHR
   * requests are not made. Instead, we use mock returns with expected values.
   * The AjaxMock mimicks the relevant portions of the $.ajax functionality.
   * See http://api.jquery.com/jQuery.ajax/
   */
  var AjaxMock = {
    // The only jQuery function used for ajax requests
    ajax: function(options) {
      this.type = options.type;
      this.url = options.url;
      this.data = options.data;

      if ("successValue" in this) {
        // Neither our code nor our tests make use of jqXHR or textStatus
        if (options.success) options.success(this.successValue);
      }
      else if ("errorValue" in this) {
        // Neither our code nor our tests make use of jqXHR or textStatus
        if (options.error) options.error(null, 500, this.errorValue);
      }
      else {
        throw new Error("setSuccess or setError must be called before ajax");
      }
    },

    // What follows are non standard functions used for testing.
    setSuccess: function(successValue) {
      this.successValue = successValue;
    },

    setError: function(errorValue) {
      this.errorValue = errorValue;
    },

    getLastType: function() {
      return this.type;
    },

    getLastURL: function() {
      return this.url;
    },

    getLastData: function() {
      return this.data;
    }
  };

  return AjaxMock;

}());

