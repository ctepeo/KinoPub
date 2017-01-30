/* ========================================================================
 * KinoPub: kinopub.auth.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.auth = {
    _parent: false,
    _init: function(_parent) {
        this._parent = _parent;
        return this;
    },
    isAuthorized: function() {
        return this.hasAccessToken();
    },
    getDeviceCode: function() {
        if (this.hasDeviceCode()) {
            this._parent.log.add("Auth > getDeviceCode > Device код уже есть");
            this.showDeviceCode();
        } else {
            this._parent.data.wipe();
            this._parent.log.add("Auth > getDeviceCode > Получаем новый device код");
            this._parent.api.getDeviceCode();
        }
    },
    // draws device code
    showDeviceCode: function() {
        var data = kp.data.storage.device;
        jQuery("#kp-device-activation .kp-device-activation-code").html("<h1>" + data.user_code + "</h1><div class=\"kp-device-activation-bar\"></div><span>" + this._parent.lang.get('device_activation_description') + "<strong>" + data.verification_uri + "</strong></span>");
        this._parent.log.add("Auth > showDeviceCode > Отобразили код, запускаем таймеры");
        this.deviceCodeBar();
        this.deviceCodeCheck();
    },
    deviceCodeCheck: function() {
        var _this = this;
        if (typeof(this._parent.data.storage.device.intervalCodeChecks) == "undefined" || this._parent.data.storage.device.intervalCodeChecks == false) {
            this._parent.data.storage.device.intervalCodeChecks = setInterval(function() {
                _this.deviceCodeCheck();
            }, (this._parent.data.storage.device.interval * 1000));
        }
        if (this.hasDeviceCode() == false) {
            // re-create code
            this._parent.log.add("Auth > deviceCodeCheck > Код протух, пора брать новый");
            this.getDeviceCode();
            return false;
        }
        // do check 
        this._parent.api.checkDeviceCode();
    },
    // remove all temp values
    cleanUpAfterGettingDeviceCode: function() {
        this._parent.log.add("Auth > CleanUp > Удаляем временные данные");
        clearInterval(this._parent.data.storage.device.intervalCodeChecks);
        clearInterval(this._parent.data.storage.device.intervalProgressBar);
        var fields = [];
        for (i in this._parent.data.storage.device) {
            var name = this._parent.data.storage.device[i];
            if (i != "name") fields.push(i);
        }
        this._parent.data.remove('device', fields);
        this._parent.ui.deviceActivated();
        // notify 
        this._parent.api.notify();
    },
    deviceCodeBar: function() {
        var _this = this;
        if (typeof(this._parent.data.storage.device.intervalProgressBar) == "undefined" || this._parent.data.storage.device.intervalProgressBar == false) {
            this._parent.data.storage.device.intervalProgressBar = setInterval(function() {
                _this.deviceCodeBar();
            }, 300);
        }
        if (!jQuery("#kp-device-activation .kp-device-activation-code .kp-device-activation-bar .progress-bar").length) {
            jQuery("#kp-device-activation .kp-device-activation-code .kp-device-activation-bar").html("<div class=\"progress\"><div class=\"progress-bar progress-bar-success progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"\" aria-valuemin=\"0\" aria-valuemax=\"\"></div></div>");
        }
        var progressBar = jQuery("#kp-device-activation .kp-device-activation-code .kp-device-activation-bar .progress-bar");
        var currentProgress = ((this.deviceCodeExpiresIn() / this._parent.data.storage.device.expiry_interval) * 100).toFixed(2);
        progressBar.css({
            width: currentProgress + "%"
        });
        if (currentProgress < 50) progressBar.removeClass("progress-bar-success progress-bar-danger").addClass("progress-bar-warning");
        if (currentProgress < 10) progressBar.removeClass("progress-bar-success progress-bar-warning").addClass("progress-bar-danger");
        if (currentProgress >= 50) progressBar.removeClass("progress-bar-danger progress-bar-warning").addClass("progress-bar-success");
    },
    // checks is device_code stored locally and it hasn't been expired
    hasDeviceCode: function() {
        if (typeof(this._parent.data.storage.device.code) == "undefined" || !this._parent.data.storage.device.code) return false;
        if ((jQuery.now() / 1000) > this._parent.data.storage.device.expire_in || this.deviceCodeExpiresIn() <= 0) return false;
        this._parent.log.add("Auth > hasDeviceCode > Через " + this.deviceCodeExpiresIn() + " секунд девайс токен умрет");
        return true;
    },
    // returns seconds to expiry of device code
    deviceCodeExpiresIn: function() {
        return (parseInt(this._parent.data.storage.device.expires_in, 10) - parseInt((jQuery.now() / 1000), 10));
    },
    checkAccessToken: function() {
        this._parent.log.add("Auth > checkAccessToken > " + this.accessTokenExpiresIn());
        if (!this.hasAccessToken()) {
            if (typeof(this._parent.data.storage.token.access_token) != "undefined" && this._parent.data.storage.token.access_token != null) {
                this._parent.api.updateAccessToken();
            }
            return false;
        } else {
            return true;
        }
    },
    // checks is access_token available and hasn't expired
    hasAccessToken: function() {
        if (typeof(this._parent.data.storage.token.access_token) == "undefined" || !this._parent.data.storage.token.access_token) return false;
        if ((jQuery.now() / 1000) > this._parent.data.storage.token.expires_in || this.accessTokenExpiresIn() <= 0) this._parent.api.updateAccessToken();
        return true;
    },
    // return seconds to expiry of access_token
    accessTokenExpiresIn: function() {
        if (typeof(this._parent.data.storage.token) == "undefined" || typeof(this._parent.data.storage.token.expires_in) == "undefined" || this._parent.data.storage.token.expires_in == null) return 0;
        return (parseInt(this._parent.data.storage.token.expires_in, 10) - parseInt((jQuery.now() / 1000), 10));
    }
}