/* ========================================================================
 * KinoPub: kinopub.api.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.api = {
    _parent: false,
    _init: function(_parent) {
        this._parent = _parent;
        return this;
    },
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
            _this._parent.log.add("Api > getDeviceCode > Код устройства получен (" + response['code'] + ")");
            response.expiry_interval = response.expires_in;
            response.expires_in = (jQuery.now() / 1000) + response.expires_in;
            _this._parent.data.store('device', response);
            _this._parent.auth.showDeviceCode();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            _this._parent.log.add("Api > getDeviceCode > Ошибочка! " + textStatus);
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
                code: _this._parent.data.storage.device.code
            }
        }).done(function(response) {
            response.expiry_interval = response.expires_in;
            response.expires_in = (jQuery.now() / 1000) + response.expires_in;
            _this._parent.data.store('token', response);
            _this._parent.log.add("Auth > deviceCodeCheck > Успешно получили access_token, подметаем половичок");
            _this._parent.auth.cleanUpAfterGettingDeviceCode();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON.error != "authorization_pending") {
                _this._parent.log.add(jqXHR.responseJSON.error);
                _this._parent.log.add(jqXHR.responseJSON.error_description);
            }
        });
    },
    // notify server about current software version
    notify: function() {
        var _this = this;
        jQuery.ajax({
            method: "POST",
            url: _this.apiHostUrl + "device/notify?access_token=" + _this._parent.data.storage.token.access_token,
            data: {
                title: (window.tizen === undefined) ? _this._parent.lang.get('device_default_webapp_name') + " @ " + window.location : (_this._parent.data.storage.device.name ? _this._parent.data.storage.device.name : _this._parent.lang.get('device_default_tizenapp_name')),
                hardware: (window.tizen === undefined) ? _this._parent.lang.get('device_default_webapp_detailed_name') + " v. " + _this._parent.version : "OS v." + webapis.tvinfo.getVersion(),
                software: (window.tizen === undefined) ? _this._parent.lang.get('device_default_webapp_name') : "KinoPub v." + tizen.application.getAppInfo().version
            }
        }).done(function(response) {}).fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON.status != 401) {
                _this._parent.log.add(jqXHR.responseJSON.error);
                _this._parent.log.add(jqXHR.responseJSON.error_description);
            } else {
                _this.updateAccessToken();
            }
        });
    },
    updateAccessToken: function() {
        var _this = this;
        _this._parent.log.add("API > updateAccessToken > Запрашиваем новый access token");
        jQuery.ajax({
            method: "POST",
            url: _this.refreshTokenUrl,
            data: {
                grant_type: 'refresh_token',
                client_id: _this.auth.client.id,
                client_secret: _this.auth.client.secret,
                refresh_token: _this._parent.data.storage.token.refresh_token
            }
        }).done(function(response) {
            _this._parent.log.add("API > updateAccessToken > Access_token обновлен");
            response.expiry_interval = response.expires_in;
            response.expires_in = jQuery.now() + response.expires_in;
            _this._parent.data.store('token', response);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            if (jqXHR.responseJSON.status != 401) {
                _this._parent.log.add("API > updateAccessToken > Ошибочка! " + textStatus);
                if (jqXHR.responseJSON.error == "authorization_expired") {
                    _this._parent.data.wipe();
                }
                _this._parent.log.add(jqXHR.responseJSON.error);
                _this._parent.log.add(jqXHR.responseJSON.error_description);
            }
            _this._parent.ui.deviceActivation();
        });
    },
    getUser: function() {
        var _this = this;
        _this._parent.log.add("API > getUser > Получаем данные пользователя");
        jQuery.ajax({
            method: "GET",
            url: _this.apiHostUrl + "user?access_token=" + _this._parent.data.storage.token.access_token,
        }).done(function(response) {
            if (response.status != 200) {
                _this._parent.log.add("API > getUser > Status Error " + response.status);
                return;
            }
            response = response.user;
            _this._parent.data.store('user', {
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
            _this._parent.data.store('history', {
                unwatched: {
                    total: 0,
                    items: {}
                }
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            _this._parent.log.add("API > getUser > Ошибочка! " + textStatus);
        });
    },
    getUnwatched: function() {
        var _this = this;
        //_this.getUnwatchedFilms();
        _this.getUnwatchedSerials();
    },
    getUnwatchedFilms: function() {
        var _this = this;
        //https://api.service-kp.com/v1/watching/movies
        _this._parent.log.add("API > getUnwatched > Films > Получаем фильмы к просмотру");
        jQuery.ajax({
            method: "GET",
            url: _this.apiHostUrl + "watching/movies?access_token=" + _this._parent.data.storage.token.access_token,
        }).done(function(response) {
            if (response.status != 200) {
                _this._parent.log.add("API > getUser > Status Error " + response.status);
                return;
            } else {
                _this._parent.user.processUnwatched(response.items, 'films');
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            _this._parent.log.add("API > getUnwatched > Ошибочка! " + textStatus);
        });
    },
    getUnwatchedSerials: function() {
        var _this = this;
        this._parent.log.add("API > getUnwatched > Serials > Получаем сериалы к просмотру");
        jQuery.ajax({
            method: "GET",
            url: _this.apiHostUrl + "watching/serials?access_token=" + _this._parent.data.storage.token.access_token,
        }).done(function(response) {
            if (response.status != 200) {
                _this._parent.log.add("API > getUser > Status Error " + response.status);
                return;
            } else {
                kp.user.processUnwatched(response.items, 'serials');
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            _this._parent.log.add("API > getUnwatched > Ошибочка! " + textStatus);
        });
    },
    // API playground function
    getTypes: function() {
        var _this = this;
        jQuery.ajax({
            method: "GET",
            url: _this.apiHostUrl + "types?access_token=" + _this._parent.data.storage.token.access_token,
        }).done(function(response) {
            if (response.status != 200) {
                _this._parent.log.add("API > getUser > Status Error " + response.status);
                return;
            } else {
                _this._parent.config.updateTypes(response.items);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            _this._parent.log.add("API > getUnwatched > Ошибочка! " + textStatus);
        });
    }
}