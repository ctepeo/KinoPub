/* ========================================================================
 * KinoPub: kinopub.log.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */

kp.log = {
    data: {},
    storage: [],
    // last action
    date: false,
    add: function(msg) {
        kp.log.date = new Date();
        var date = kp.log.date.getHours() + ":" + kp.log.date.getHours() + ":" + kp.log.date.getSeconds() + "." + kp.log.date.getMilliseconds();
        kp.log.data[date] = msg;
        kp.log.storage.push(date + " > " + msg);
        if (kp.dev)
            console.log(date + " > " + msg);
    }
}
