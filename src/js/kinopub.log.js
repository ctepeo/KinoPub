/* ========================================================================
 * KinoPub: kinopub.log.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.log = {
    _init: function(_parent) {
        this._parent = _parent;
        this.add("Log > _init > Модуль Log загружен");
        return this;
    },
    _parent: false,
    data: {},
    storage: [],
    // last action
    date: false,
    add: function(msg) {
        this.date = new Date();
        var date = this.date.getHours() + ":" + this.date.getHours() + ":" + this.date.getSeconds() + "." + this.date.getMilliseconds();
        this.data[date] = msg;
        this.storage.push(date + " > " + msg);
        if (this._parent.dev) {
            console.log(date + " > " + msg);
        }
        if (!jQuery(".kp-app-logs").length) {
            jQuery("head").append("<div class=\"kp-app-logs hidden\"></div>");
        }
        jQuery(".kp-app-logs").append("<p>" + msg + "</p>");
    }
}