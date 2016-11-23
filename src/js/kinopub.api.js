/* ========================================================================
 * KinoPub: kinopub.api.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2016 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */

kp.api = {
    auth: {
        host: "https://api.service-kp.com/oauth2/device",
        refreshHost: "https://api.service-kp.com/oauth2/token",
        client: {
            interval: false,
            id: 'xbmc',
            secret: 'cgg3gtifu46urtfp2zp1nqtba0k2ezxh'
        },
    },
    apiHostUrl: "https://api.service-kp.com/v1/",
    refreshTokenUrl: "https://api.service-kp.com/oauth2/token",
    // request device activation code
    getDeviceCode: function() {
        var _this = this;
        jQuery.ajax({
            method: "POST",
            url: _this.auth.host,
            data: {
                grant_type: 'device_code',
                client_id: _this.auth.client.id,
                client_secret: _this.auth.client.secret
            }
        }).done(function(response) {
            kp.log.add("Api > getDeviceCode > Код устройства получен (" + response['code'] + ")");
            response.expiry_interval = response.expires_in;
            response.expires_in = (jQuery.now() / 1000) + response.expires_in;
            kp.data.store('device', response);
            kp.auth.showDeviceCode();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            kp.log.add("Api > getDeviceCode > Ошибочка! " + textStatus);
        });
    },
    checkDeviceCode: function() {
        var _this = this;
        jQuery.ajax({
            method: "POST",
            url: _this.auth.host,
            data: {
                grant_type: 'device_token',
                client_id: _this.auth.client.id,
                client_secret: _this.auth.client.secret,
                code: kp.data.storage.device.code
            }
        }).done(function(response) {
            response.expiry_interval = response.expires_in;
            response.expires_in = (jQuery.now() / 1000) + response.expires_in;
            kp.data.store('token', response);
            kp.log.add("Auth > deviceCodeCheck > Успешно получили access_token, подметаем половичок");
            kp.auth.cleanUpAfterGettingDeviceCode();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON.error != "authorization_pending") {
                kp.log.add(jqXHR.responseJSON.error);
                kp.log.add(jqXHR.responseJSON.error_description);
            }
        });
    },
    // notify server about current software version
    notify: function() {
        jQuery.ajax({
            method: "POST",
            url: kp.api.apiHostUrl + "device/notify?access_token=" + kp.data.storage.token.access_token,
            data: {
                title: (window.tizen === undefined) ? lang('device_default_webapp_name') + " @ " + window.location : (kp.data.storage.device.name ? kp.data.storage.device.name : lang('device_default_tizenapp_name')),
                hardware: (window.tizen === undefined) ? lang('device_default_webapp_detailed_name') + " v. " + kp.version : "OS v." + webapis.tvinfo.getVersion(),
                software: (window.tizen === undefined) ? lang('device_default_webapp_name') : "KinoPub v." + tizen.application.getAppInfo().version
            }
        }).done(function(response) {

        }).fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON.status != 401) {
                kp.log.add(jqXHR.responseJSON.error);
                kp.log.add(jqXHR.responseJSON.error_description);
            } else {
                kp.api.updateAccessToken();
            }
        });
    },
    updateAccessToken: function() {
        kp.log.add("API > updateAccessToken > Запрашиваем новый access token");
        jQuery.ajax({
            method: "POST",
            url: kp.api.refreshTokenUrl,
            data: {
                grant_type: 'refresh_token',
                client_id: kp.api.auth.client.id,
                client_secret: kp.api.auth.client.secret,
                refresh_token: kp.data.storage.token.refresh_token
            }
        }).done(function(response) {
            kp.log.add("API > updateAccessToken > Access_token обновлен");
            response.expiry_interval = response.expires_in;
            response.expires_in = jQuery.now() + response.expires_in;
            kp.data.store('token', response);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON.status != 401) {
                kp.log.add("API > updateAccessToken > Ошибочка! " + textStatus);
                if (jqXHR.responseJSON.error == "authorization_expired") {
                    kp.data.wipe();
                }
                kp.log.add(jqXHR.responseJSON.error);
                kp.log.add(jqXHR.responseJSON.error_description);

            }
            kp.ui.deviceActivation();
        });
    },
    getUser: function() {
        kp.log.add("API > getUser > Получаем данные пользователя");
        jQuery.ajax({
            method: "GET",
            url: kp.api.apiHostUrl + "user?access_token=" + kp.data.storage.token.access_token,
        }).done(function(response) {
            if (response.status != 200) {
                kp.log.add("API > getUser > Status Error " + response.status);
                return;
            }
            response = response.user;
            kp.data.store('user', {
                profile_avatar: response.profile.avatar,
                profile_name: response.profile.name,
                reg_date: unix2date(response.reg_date),
                reg_unix: response.reg_date,
                subscription_active: response.subscription.active,
                subscription_days: response.subscription.days,
                subscription_end_date: unix2date(response.subscription.end_time),
                subscription_end_unix: response.subscription.end_time,
                username: response.username
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            kp.log.add("API > getUser > Ошибочка! " + textStatus);
        });
    },
    getUnwatched: function(){
        var _this = this;
        //_this.getUnwatchedFilms();
        _this.getUnwatchedSerials();
    },
    getUnwatchedFilms: function() {
        //https://api.service-kp.com/v1/watching/movies
        kp.log.add("API > getUnwatched > Films > Получаем фильмы к просмотру");
        jQuery.ajax({
            method: "GET",
            url: kp.api.apiHostUrl + "watching/movies?access_token=" + kp.data.storage.token.access_token,
        }).done(function(response) {
            if (response.status != 200) {
                kp.log.add("API > getUser > Status Error " + response.status);
                return;
            }
            console.log(response);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            kp.log.add("API > getUnwatched > Ошибочка! " + textStatus);
        });
    },
    getUnwatchedSerials: function() {
        kp.log.add("API > getUnwatched > Serials > Получаем сериалы к просмотру");
        jQuery.ajax({
            method: "GET",
            url: kp.api.apiHostUrl + "watching/serials?access_token=" + kp.data.storage.token.access_token,
        }).done(function(response) {
            if (response.status != 200) {
                kp.log.add("API > getUser > Status Error " + response.status);
                return;
            }
            console.log(response);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            kp.log.add("API > getUnwatched > Ошибочка! " + textStatus);
        });
    }
}
