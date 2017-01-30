/* ========================================================================
 * KinoPub: kinopub.search.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.search = {
    _parent: false,
    _init: function(_parent) {
        this._parent = _parent;
        var _this = this;
        jQuery(".kp-top-bar .kp-top-searchbar .kp-searchbox").data("placeholder", _this._parent.lang.get('search_placeholder')).val(_this._parent.lang.get('search_placeholder'));
        jQuery(".kp-top-bar").on("focus", ".kp-top-searchbar .kp-searchbox", function() {
            var input = jQuery(this);
            input.closest(".kp-top-searchbar").addClass("active");
            if (input.val() == input.data("placeholder")) {
                input.val("");
            }
        });
        jQuery(".kp-top-bar").on("blur", ".kp-top-searchbar .kp-searchbox", function() {
            var input = jQuery(this);
            input.closest(".kp-top-searchbar").removeClass("active");
            if (jQuery.trim(input.val()).length == 0) {
                input.val(input.data("placeholder"));
            };
        });
        return this;
    }
}