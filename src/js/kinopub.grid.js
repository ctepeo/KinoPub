/* ========================================================================
 * KinoPub: kinopub.grid.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.grid = {
    _init: function() {},
    _setLoader: function() {
        jQuery(".kp-container").html("<div class=\"kp-loader\"><i class=\"fa fa-cog faa-spin animated\"></i></div>");
    },
    // workers
    onGetControl: function(type) {
        switch (type) {
            case 'homepage':
                this._setLoader();
                break;
            default:
                kp.log.add("Grid > " + type)
                break;
        }
    }
}