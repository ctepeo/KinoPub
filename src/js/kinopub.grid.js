/* ========================================================================
 * KinoPub: kinopub.grid.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.grid = {
    _parent: false,
    _init: function(_parent) {
        this._parent = _parent;
        return this;
    },
    _setContainerLoader: function() {
        jQuery(".kp-container").html("<div class=\"kp-loader\"><i class=\"fa fa-cog faa-spin animated vcenter centered\"></i></div>");
        jQuery(".kp-container .kp-loader").css({
            width: jQuery(".kp-container").outerWidth(true) + 'px',
            height: jQuery(".kp-container").outerHeight(true) + 'px',
        });
    },
    // workers
    onGetControl: function(type) {
        switch (type) {
            case 'homepage':
                this._setContainerLoader();
                break;
            default:
                this._parent.log.add("Grid > " + type)
                break;
        }
    }
}