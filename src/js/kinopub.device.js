/* ========================================================================
 * KinoPub: kinopub.tv.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.device = {
    width: false,
    height: false,
    _parent: false,
    _init: function(_parent) {
        this._parent = _parent;
        this.width = this.getWidth();
        this.height = this.getHeight();
        return this;
    },
    getWidth: function() {
        return jQuery(document).width();
    },
    getHeight: function() {
        return jQuery(document).height();
    },
    widthPercent: function(percent) {
        return Math.round(this.width * (0.01 * percent));
    },
    heightPercent: function(percent) {
        return Math.round(this.height * (0.01 * percent));
    },
    keys: {
        // default Tizen TV keymap
        N1: 49,
        N2: 50,
        N3: 51,
        N4: 52,
        N5: 53,
        N6: 54,
        N7: 55,
        N8: 56,
        N9: 57,
        N0: 48,
        PRECH: 10190,
        VOL_UP: 448,
        VOL_DOWN: 447,
        MUTE: 449,
        CH_UP: 427,
        CH_DOWN: 428,
        TOOLS: 10135,
        ENTER: 13,
        RETURN: 10009,
        INFO: 457,
        EXIT: 10182,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        RED: 403,
        GREEN: 404,
        YELLOW: 405,
        BLUE: 406,
        RW: 412,
        PAUSE: 19,
        FF: 417,
        REC: 416,
        PLAY: 415,
        STOP: 413,
        PLAYPAUSE: 10252
    },
    // set default keys handlers
    defaultControls: function() {},
    keyHandlers: {},
    eventHandled: {},
    registerKey: function(code, callback) {
        if (jQuery.isArray(code)) {
            for (i in code) {
                var keyCode = code[i];
                this.registerKey(keyCode, callback);
            }
            return;
        }
        if (!isInt(code) && typeof(this.keys[code]) == "undefined") {
            this._parent.log.add("Device > registerKey > Код не найден [" + code + "]");
            return;
        }
        if (!isInt(code)) code = this.keys[code];
        this.keyHandlers[code] = callback;
    },
    registerEvent: function(selector, event, callback) {
        var _this = this;
        if (typeof(_this.eventHandled[selector]) == "undefined") _this.eventHandled[selector] = {};
        _this.eventHandled[selector][event] = callback;
        jQuery(document).on(event, selector, _this.eventHandled[selector][event]);
    },
    setListeners: function() {
        var _this = this;
        jQuery(document).on("keyup", function(e) {
            if (typeof(_this.keyHandlers[e.which]) != "undefined") {
                _this._parent.log.add("Device > Кнопка #" + e.which);
                _this.keyHandlers[e.which]();
            }
        });
    }
}