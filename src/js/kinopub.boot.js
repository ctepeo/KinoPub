/* ========================================================================
 * KinoPub: kinopub.boot.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
var kp = {
    dev: true,
    version: 0.1,
    appPath: "./kinopub-app/",
    _init: function() {
        this.modules._init(this);
        return this;
    }
};
kp.boot = {
        _parent: false,
        _init: function(_parent) {
            this._parent = _parent;
            if (!this._parent.data.storage.device.name) {
                this._parent.data.store('device', {
                    name: (window.tizen === undefined) ? this._parent.lang.get('device_default_webapp_name') : this._parent.lang.get('device_default_tizenapp_name')
                });
            }
            if (!this._parent.auth.isAuthorized()) {
                this._parent.ui.deviceActivation();
            } else {
                if (this._parent.auth.checkAccessToken()) {
                    this._parent.api.notify();
                    this._parent.modules.transferControl('boot', false);
                    this._parent.ui.deviceActivated();
                } else {
                    this._parent.ui.deviceActivation();
                }
            }
            return this;
            console.log(this._parent.data.storage);
        }
    }
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
$(document).ready(function() {
    var app = kp._init();
});