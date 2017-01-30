/* ========================================================================
 * KinoPub: kinopub.lang.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.lang = {
    _parent: false,
    _init: function(_parent) {
        this._parent = this;
        return this;
    },
    locale: 'ru',
    get: function(keyword) {
        if (typeof(kp.lang[this.locale]) == "undefined") {
            this._parent.log.add("Lang > String > Locale " + this.locale + " не найдена");
            return "!" + keyword;
        }
        if (typeof(kp.lang[this.locale][keyword]) == "undefined") {
            this._parent.add("Lang > String > Определение " + keyword + " не найдено в локали " + this.locale);
            return "?" + keyword;
        }
        return kp.lang[this.locale][keyword];
    }
}