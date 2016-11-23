/* ========================================================================
 * KinoPub: kinopub.auth.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2016 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.auth = {
    isAuthorized: function() {
        return this.hasAccessToken();
    },
    getDeviceCode: function() {
        if (this.hasDeviceCode()) {
            kp.log.add("Auth > getDeviceCode > Device код уже есть");
            this.showDeviceCode();
        } else {
            kp.data.wipe();
            kp.log.add("Auth > getDeviceCode > Получаем новый device код");
            kp.api.getDeviceCode();
        }
    },
    // draws device code
    showDeviceCode: function() {
        var data = kp.data.storage.device;
        jQuery("#kp-device-activation .kp-device-activation-code").html("<h1>" + data.user_code + "</h1><div class=\"kp-device-activation-bar\"></div><span>" + lang('device_activation_description') + "<strong>" + data.verification_uri + "</strong></span>");
        kp.log.add("Auth > showDeviceCode > Отобразили код, запускаем таймеры");
        this.deviceCodeBar();
        this.deviceCodeCheck();
    },
    deviceCodeCheck: function() {
        if (typeof(kp.data.storage.device.intervalCodeChecks) == "undefined" || kp.data.storage.device.intervalCodeChecks == false) {
            kp.data.storage.device.intervalCodeChecks = setInterval('kp.auth.deviceCodeCheck();', (kp.data.storage.device.interval * 1000));
        }
        if (this.hasDeviceCode() == false) {
            // re-create code
            kp.log.add("Auth > deviceCodeCheck > Код протух, пора брать новый");
            this.getDeviceCode();
            return false;
        }
        // do check 
        kp.api.checkDeviceCode();
    },
    // remove all temp values
    cleanUpAfterGettingDeviceCode: function() {
        kp.log.add("Auth > CleanUp > Удаляем временные данные");
        clearInterval(kp.data.storage.device.intervalCodeChecks);
        clearInterval(kp.data.storage.device.intervalProgressBar);
        var fields = [];
        for (i in kp.data.storage.device) {
            var name = kp.data.storage.device[i];
            if (i != "name") fields.push(i);
        }
        kp.data.remove('device', fields);
        kp.ui.deviceActivated();
        // notify 
        kp.api.notify();
    },
    deviceCodeBar: function() {
        if (typeof(kp.data.storage.device.intervalProgressBar) == "undefined" || kp.data.storage.device.intervalProgressBar == false) {
            kp.data.storage.device.intervalProgressBar = setInterval('kp.auth.deviceCodeBar();', 300);
        }
        if (!jQuery("#kp-device-activation .kp-device-activation-code .kp-device-activation-bar .progress-bar").length) {
            jQuery("#kp-device-activation .kp-device-activation-code .kp-device-activation-bar").html("<div class=\"progress\"><div class=\"progress-bar progress-bar-success progress-bar-striped active\" role=\"progressbar\" aria-valuenow=\"\" aria-valuemin=\"0\" aria-valuemax=\"\"></div></div>");
        }
        var progressBar = jQuery("#kp-device-activation .kp-device-activation-code .kp-device-activation-bar .progress-bar");
        var currentProgress = ((this.deviceCodeExpiresIn() / kp.data.storage.device.expiry_interval) * 100).toFixed(2);
        progressBar.css({
            width: currentProgress + "%"
        });
        if (currentProgress < 50) progressBar.removeClass("progress-bar-success progress-bar-danger").addClass("progress-bar-warning");
        if (currentProgress < 10) progressBar.removeClass("progress-bar-success progress-bar-warning").addClass("progress-bar-danger");
        if (currentProgress >= 50) progressBar.removeClass("progress-bar-danger progress-bar-warning").addClass("progress-bar-success");
    },
    // checks is device_code stored locally and it hasn't been expired
    hasDeviceCode: function() {
        if (typeof(kp.data.storage.device.code) == "undefined" || !kp.data.storage.device.code) return false;
        if ((jQuery.now() / 1000) > kp.data.storage.device.expire_in || this.deviceCodeExpiresIn() <= 0) return false;
        kp.log.add("Auth > hasDeviceCode > Через " + this.deviceCodeExpiresIn() + " секунд девайс токен умрет");
        return true;
    },
    // returns seconds to expiry of device code
    deviceCodeExpiresIn: function() {
        return (parseInt(kp.data.storage.device.expires_in, 10) - parseInt((jQuery.now() / 1000), 10));
    },
    checkAccessToken: function() {
        kp.log.add("Auth > checkAccessToken > " + this.accessTokenExpiresIn());
        if (!this.hasAccessToken()) {
            if (typeof(kp.data.storage.token.access_token) != "undefined" && kp.data.storage.token.access_token != null) {
                kp.api.updateAccessToken();
            }
            return false;
        } else {
            return true;
        }
    },
    // checks is access_token available and hasn't expired
    hasAccessToken: function() {
        if (typeof(kp.data.storage.token.access_token) == "undefined" || !kp.data.storage.token.access_token) return false;
        if ((jQuery.now() / 1000) > kp.data.storage.token.expires_in || this.accessTokenExpiresIn() <= 0) kp.api.updateAccessToken();
        return true;
    },
    // return seconds to expiry of access_token
    accessTokenExpiresIn: function() {
        if (typeof(kp.data.storage.token) == "undefined" || typeof(kp.data.storage.token.expires_in) == "undefined" || kp.data.storage.token.expires_in == null) return 0;
        return (parseInt(kp.data.storage.token.expires_in, 10) - parseInt((jQuery.now() / 1000), 10));
    }
}