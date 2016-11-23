/* ========================================================================
 * KinoPub: kinopub.boot.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2016 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
var kp = {
    dev: true,
    version: 0.1,
    appPath: "./kinopub-app/",
    _init: function() {
        kp.modules._init();
    }
};
kp.boot = {
    _init: function() {
        if (!kp.data.storage.device.name) {
            kp.data.store('device', {
                name: (window.tizen === undefined) ? lang('device_default_webapp_name') : lang('device_default_tizenapp_name')
            });
        }
        if (!kp.auth.isAuthorized()) {
            kp.ui.deviceActivation();
        } else {
            if (kp.auth.checkAccessToken()) {
                kp.api.notify();
                kp.modules.transferControl('boot', false);
                kp.ui.deviceActivated();
            } else {
                kp.ui.deviceActivation();
            }
        }
        console.log(kp.data.storage);
    }
}
jQuery(document).ready(function() {
    kp._init();
});
/* global helpers */
function isInt(value) {
    return !isNaN(value) && (function(x) {
        return (x | 0) === x;
    })(parseFloat(value))
}

function unix2date(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
    return time;
}