/* ========================================================================
 * KinoPub: kinopub.lang.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2016 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */

kp.lang = {
    locale: 'ru',
    string: function(keyword) {
        if (typeof(kp.lang[kp.lang.locale]) == "undefined") {
            kp.log.add("Lang > String > Locale " + kp.lang.locale + " не найдена");
            return "!" + keyword;
        }
        if (typeof(kp.lang[kp.lang.locale][keyword]) == "undefined") {
            kp.log.add("Lang > String > Определение " + keyword + " не найдено в локали " + kp.lang.locale);
            return "?" + keyword;
        }
        return kp.lang[kp.lang.locale][keyword];
    }
}

function lang(string) {
    return kp.lang.string(string);
}
