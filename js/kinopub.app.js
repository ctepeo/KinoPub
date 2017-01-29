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
/* ========================================================================
 * KinoPub: kinopub.lang.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
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

/* ========================================================================
 * KinoPub: kinopub.data.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.data = {
    // vars to load on boot
    boot: {
        device: ['name', 'code', 'expires_in', 'expiry_interval', 'interval', 'user_code', 'verification_uri'],
        token: ['access_token', 'expires_in', 'expiry_interval', 'refresh_token'],
        user: ['profile_avatar', 'profile_name', 'reg_date', 'reg_unix', 'subscription_active', 'subscription_days', 'subscription_end_unix', 'subscription_end_date', 'username'],
        history: ['unwatched']
    },
    storage: {},
    _init: function() {
        for (type in this.boot) {
            var fields = this.boot[type];
            this.restore(type, fields);
        }
    },
    restore: function(source, fields, prefix) {
        if (typeof(prefix) == "undefined") prefix = "kp_";
        if (typeof(kp.data.storage[source]) == "undefined") {
            kp.data.storage[source] = {};
        }
        for (i in fields) {
            var name = fields[i];
            if (typeof(kp.data.storage[source][name]) == "undefined") {
                kp.data.storage[source][name] = null;
            }
            if (Cookies.get(prefix + source + '_' + name) != "") value = Cookies.get(prefix + source + '_' + name);
            if (value == null || value == false) {
                kp.log.add("Data > Restore > Игнорируем значение [" + source + "/" + name + "]");
            } else {
                kp.log.add("Data > Restore > [" + source + "/" + name + "] => " + value);
                kp.data.storage[source][name] = value;
            }
        }
    },
    store: function(type, data, prefix) {
        if (typeof(prefix) == "undefined") prefix = "kp_";
        for (name in data) {
            var value = data[name];
            Cookies.set(prefix + type + '_' + name, value, {
                expires: 180
            });
            kp.data.storage[type][name] = value;
        }
    },
    remove: function(type, fields, prefix) {
        if (typeof(prefix) == "undefined") prefix = "kp_";
        for (i in fields) {
            var name = fields[i];
            Cookies.remove(prefix + type + '_' + name);
            kp.data.storage[type][name] = null;
        }
    },
    wipe: function() {
        return false;
        kp.log.add("Data > Wipe > Удаляем все сохраненные значения");
        for (type in this.boot) {
            var fields = this.boot[type];
            this.remove(type, fields);
        }
    }
}
/* ========================================================================
 * KinoPub: kinopub.tv.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */

kp.device = {
    width: false,
    height: false,
    _init: function() {
        this.width = this.getWidth();
        this.height = this.getHeight();
    },
    getWidth: function() {
        return jQuery(document).width();
    },
    getHeight: function() {
        return jQuery(document).height();
    },
    widthPercent: function(percent) {
        return Math.round(kp.tv.width * (0.01 * percent));
    },
    heightPercent: function(percent) {
        return Math.round(kp.tv.height * (0.01 * percent));
    },
    keys: {
        // default Tizen TV keymap
        N1: 49,
        N2: 50,
        N3: 51,
        N4: 52,
        N5: 53,
        N6: 54,
        N7: 55,
        N8: 56,
        N9: 57,
        N0: 48,
        PRECH: 10190,
        VOL_UP: 448,
        VOL_DOWN: 447,
        MUTE: 449,
        CH_UP: 427,
        CH_DOWN: 428,
        TOOLS: 10135,
        ENTER: 13,
        RETURN: 10009,
        INFO: 457,
        EXIT: 10182,
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        RED: 403,
        GREEN: 404,
        YELLOW: 405,
        BLUE: 406,
        RW: 412,
        PAUSE: 19,
        FF: 417,
        REC: 416,
        PLAY: 415,
        STOP: 413,
        PLAYPAUSE: 10252
    },
    // set default keys handlers
    defaultControls: function() {

    },
    keyHandlers: {},
    eventHandled: {},
    registerKey: function(code, callback) {
        if (jQuery.isArray(code)) {
            for (i in code) {
                var keyCode = code[i];
                this.registerKey(keyCode, callback);
            }
            return;
        }
        if (!isInt(code) && typeof(this.keys[code]) == "undefined") {
            kp.log.add("Device > registerKey > Код не найден [" + code + "]");
            return;
        }
        if (!isInt(code))
            code = this.keys[code];
        this.keyHandlers[code] = callback;
    },
    registerEvent: function(selector, event, callback) {
        var _this = this;
        if (typeof(_this.eventHandled[selector]) == "undefined")
            _this.eventHandled[selector] = {};
        _this.eventHandled[selector][event] = callback;
        jQuery(document).on(event, selector, _this.eventHandled[selector][event]);
    },
    setListeners: function() {
        jQuery(document).on("keyup", function(e) {
            if (typeof(kp.device.keyHandlers[e.which]) != "undefined") {
                kp.log.add("Device > Кнопка #" + e.which);
                kp.device.keyHandlers[e.which]();
            }
        });
    }
}

/* ========================================================================
 * KinoPub: kinopub.api.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
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
        }).done(function(response) {}).fail(function(jqXHR, textStatus, errorThrown) {
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
            kp.data.store('history', {
                unwatched: {
                    total: 0,
                    items: {}
                }
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            kp.log.add("API > getUser > Ошибочка! " + textStatus);
        });
    },
    getUnwatched: function() {
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
            } else {
                kp.user.processUnwatched(response.items, 'films');
            }
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
            } else {
                kp.user.processUnwatched(response.items, 'serials');
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            kp.log.add("API > getUnwatched > Ошибочка! " + textStatus);
        });
    },
    // API playground function
    getTypes: function() {
        jQuery.ajax({
            method: "GET",
            url: kp.api.apiHostUrl + "types?access_token=" + kp.data.storage.token.access_token,
        }).done(function(response) {
            if (response.status != 200) {
                kp.log.add("API > getUser > Status Error " + response.status);
                return;
            } else {
                kp.config.updateTypes(response.items);
            }
        }).fail(function(jqXHR, textStatus, errorThrown) {
            kp.log.add("API > getUnwatched > Ошибочка! " + textStatus);
        });
    }
}
/* ========================================================================
 * KinoPub: kinopub.user.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.user = {
    _init: function() {},
    getUser: function() {
        kp.api.getUser();
    },
    // returns array with user's private menu items
    getUserNav: function() {
        var nav = [];
        for (i in kp.config.menues.my) {
            var item = kp.config.menues.my[i];
            item.title = lang(item.lang);
            nav.push(item);
        }
        return nav;
    },
    // returns array with user defined (TODO) nav menu
    getUserCategories: function() {
        var nav = [];
        // TODO -> provide user ability to change the items 
        var source = kp.config.menues.categories;
        for (i in source) {
            var item = source[i];
            if (item.lang != false) item.title = lang(item.lang);
            nav.push(item);
        }
        return nav;
    },
    processUnwatched: function(items, type) {
        switch (type) {
            case 'films':
                break;
            case 'serials':
                var total = 0;
                kp.data.storage.history.unwatched.serials = {};
                for (i in items) {
                    var item = items[i];
                    total = total + item.new, 10;
                    kp.data.storage.history.unwatched.serials[item.id] = item;
                }
                kp.data.storage.history.unwatched.total = total;
                break;
            default:
                kp.log.add('User > processUnwatched > Тип данных не найден > ' + type);
                break;
        }
        kp.ui.updateUnwatched();
    }
}
/* ========================================================================
 * KinoPub: kinopub.ui.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.ui = {
    _duration: 10,
    _init: function() {
        this._welcome();
    },
    _welcome: function() {
        var _this = this;
        _this._reset();
        jQuery("body").addClass("kp-welcome").html("<div class=\"kp-logo\"><h2>kino<span>pub</span></h2></div>");
        jQuery(".kp-logo").animate({
            opacity: 1
        }, 15 * _this._duration).promise().then(function() {
            if (!kp.auth.checkAccessToken()) {
                // move upper to provide space for status informer
                jQuery(".kp-logo").animate({
                    marginTop: '-10%'
                }, 10 * _this._duration).promise().then(function() {
                    jQuery("<div class=\"kp-status\"></div>").insertAfter(".kp-logo");
                    _this.setLoader(jQuery(".kp-status"));
                });
            }
        });
    },
    _reset: function() {
        jQuery("body").html("");
    },
    setLoader: function(target) {
        target.html("<i class=\"kp-loader fa fa-beer faa-wrench animated kp-loader\" aria-hidden=\"true\"></i>");
    },
    removeLoader: function(target) {
        target.remove();
    },
    removeLoaders: function() {
        var _this = this;
        jQuery(".kp-loader").each(function(n, loader) {
            _this.removeLoader(jQuery(loader));
        });
    },
    // force device activation dialog
    deviceActivation: function() {
        kp.log.add("UI > Интерфейс активации");
        if (jQuery("#kp-device-activation").length) return false;
        this.removeLoaders();
        kp.modules.transferControl('ui', 'activation');
        jQuery("body").addClass("kp-blurred");
        jQuery("body").append("<div id=\"kp-device-activation\"><div class=\"kp-device-activation-container\"><h3>" + lang('device_activation_header') + "</h3><div class=\"kp-device-activation-code\"></div></div></div>");
        jQuery("#kp-device-activation").css({
            width: kp.device.width + 'px',
            height: kp.device.height + 'px'
        });
        this.setLoader(jQuery("#kp-device-activation .kp-device-activation-code"));
        kp.auth.getDeviceCode();
    },
    // hide activation dialog
    deviceActivated: function() {
        kp.log.add("UI > Скрываем интерфейс активации");
        jQuery("body").removeClass("kp-blurred");
        jQuery("#kp-device-activation").remove();
        var _this = this;
        if (jQuery("body").hasClass("kp-welcome") == true) {
            // init screen!
            jQuery(".kp-welcome .kp-logo").animate({
                marginTop: '0%'
            }, 10 * _this._duration).promise().then(function() {
                jQuery(".kp-logo").animate({
                    opacity: 0
                }).promise().then(function() {
                    kp.user.getUser();
                    jQuery(".kp-logo").remove();
                    jQuery("body").animate({
                        backgroundColor: '#2f373e'
                    }, 7 * _this._duration).promise().then(function() {
                        jQuery("body").removeClass("kp-welcome");
                        jQuery(".kp-logo, .kp-status").remove();
                        kp.ui.drawLayout();
                        kp.modules.transferControl('ui', 'homepage');
                    });
                });
            });
        }
    },
    // load html content from module/template to target block
    load: function(path, callback) {
        jQuery.ajax({
            method: "GET",
            url: kp.appPath + path + ".html"
        }).done(function(response) {
            callback(response);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            kp.log.add("UI > Load > " + path + " (->" + target + ") >  Ошибочка! " + textStatus);
        });
    },
    drawLayout: function() {
        if (!jQuery(".kp-header").length) {
            // build very basics
            kp.ui.load("ui/_header", function(response) {
                jQuery("body").html(response);
                //  set lang
                kp.search._init();
                // update userinfo block
                kp.ui.updateUserinfo();
                // populate menues
                var items = kp.user.getUserNav();
                for (keyword in items) {
                    var item = items[keyword];
                    jQuery(".kp-header .kp-my-categories ul").append(kp.ui.menuItem(item));
                }
                kp.ui.drawMainNav();
                // get updates
                kp.ui.getUnwatched();
                // load main screen
                kp.modules.transferControl('grid', 'homepage');
            });
        }
    },
    drawMainNav: function() {
        var categories = kp.user.getUserCategories();
        jQuery(".kp-header .kp-main-categories ul > *").remove();
        for (keyword in categories) {
            var item = categories[keyword];
            jQuery(".kp-header .kp-main-categories ul").append(kp.ui.menuItem(item));
        }
    },
    // returns HTML for menu item
    menuItem: function(item) {
        var data = "";
        for (i in item) {
            data = data + "data-kp-" + i + "=\"" + item[i] + "\" ";
        }
        return "<li " + data + "><a href=\"#\">" + item.title + "</a></li>";
    },
    // updates i_watch element with the unwatched counter
    getUnwatched: function() {
        // get data
        kp.api.getUnwatched();
    },
    updateUnwatched: function() {
        if (kp.data.storage.history.unwatched.total > 0) {
            jQuery(".kp-top-bar .kp-my-categories ul li[data-kp-keyword='my_watched']").addClass("kp-notify");
            if (jQuery(".kp-top-bar .kp-my-categories ul li.kp-notify .kp-my-notifications").length) {
                jQuery(".kp-top-bar .kp-my-categories ul li.kp-notify .kp-my-notifications").html(kp.data.storage.history.unwatched.total);
            } else {
                jQuery(".kp-top-bar .kp-my-categories ul li.kp-notify a").append("<span class=\"kp-my-notifications\">" + kp.data.storage.history.unwatched.total + "</span>");
            }
        } else {
            jQuery(".kp-top-bar .kp-my-categories ul li.kp-notify .kp-my-notification").remove();
            jQuery(".kp-top-bar .kp-my-categories ul li.kp-notify").removeClass("kp-notify");
        }
    },
    // update userinfo block
    updateUserinfo: function() {
        jQuery(".kp-userinfo .kp-userpic").prop("src", kp.data.storage.user.profile_avatar);
        jQuery(".kp-userinfo .kp-username").html(kp.data.storage.user.username);
        jQuery(".kp-userinfo .kp-user-pro-duration").text(kp.data.storage.user.subscription_days);
        kp.log.add("UI > updateUserinfo > Обновлен UI");
    },
    // key mapping
    onGetControl: function(type) {
        var _this = this;
        switch (type) {
            case 'activation':
                kp.device.registerKey(['ENTER'], function() {
                    kp.api.getDeviceCode();
                });
                kp.device.registerEvent("#kp-device-activation .kp-device-activation-code h1", "dblclick", function() {
                    kp.api.getDeviceCode();
                });
                break;
            case 'homepage':
                //
                break;
            case 'grid':
                break;
            default:
                kp.log.add("UI > onGetControl > Неизвестный тип [" + type + "]");
                break;
        }
    }
}
/* ========================================================================
 * KinoPub: kinopub.auth.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
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
/* ========================================================================
 * KinoPub: kinopub.config.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.config = {
    //  default menues' items
    menues: {
        // user's menu
        my: [{
            module: 'grid',
            method: 'watched',
            lang: 'nav_my_i_watch',
            keyword: 'my_watched'
        }, {
            module: 'bookmarks',
            method: 'index',
            lang: 'nav_my_bookmarks'
        }, {
            module: 'playlists',
            method: 'index',
            lang: 'nav_my_playlists'
        }],
        // default navigation
        categories: [{
            module: 'grid',
            method: 'movie',
            lang: 'nav_categories_movie'
        }, {
            module: 'grid',
            method: 'serial',
            lang: 'nav_categories_serial'
        }, {
            module: 'grid',
            method: 'tvshow',
            lang: 'nav_categories_tvshow'
        }, {
            module: 'grid',
            method: 'ddd',
            lang: 'nav_categories_3d'
        }, {
            module: 'grid',
            method: 'kkkk',
            lang: 'nav_categories_4k'
        }, {
            module: 'grid',
            method: 'concert',
            lang: 'nav_categories_concert'
        }, {
            module: 'grid',
            method: 'documovie',
            lang: 'nav_categories_documovie'
        }, {
            module: 'grid',
            method: 'docuserial',
            lang: 'nav_categories_docuserial'
        }, {
            module: 'grid',
            method: 'picked',
            lang: 'nav_categories_picked'
        }, ]
    },
    // functions
    updateTypes: function(data) {
        var nav = [];
        for (i in data) {
            var item = data[i];
            var navItem = {
                module: 'grid',
                method: item.id,
                lang: false,
                title: item.title
            };
            nav.push(navItem);
        }
        nav.push({
            module: 'grid',
            method: 'picked',
            lang: 'nav_categories_picked'
        });
        kp.config.menues.categories = nav;
    }
}
/* ========================================================================
 * KinoPub: kinopub.modules.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */


kp.modules = {
    onBoot: [
        'data',
        'device',
        'ui',
        'user',
        'boot',
        'grid'
    ],
    controlledBy: false,
    // load modules' defaults
    _init: function() {
        for (moduleID in this.onBoot) {
            this.load(this.onBoot[moduleID]);
        }
    },
    load: function(module) {
        if (typeof(kp[module]) == "undefined") {
            kp.log.add("Modules > _init > Модуль не загружен ");
            return;
        }
        kp[module]._init();
        if (typeof(kp.log) != "undefined") {
            kp.log.add("Modules > _init > Загружен модуль " + module);
        }
    },
    // cancels all keyboard/remote control handlers and sets to specified module (with params)
    transferControl: function(module, keyword) {
        kp.log.add("Modules > Управление передано от " + this.controlledBy + " к " + module + "[" + keyword + "]")
            // bye-bye to control?
        if (this.controlledBy != false && typeof(kp[this.controlledBy]['onLostControl']) != "undefined")
            kp[this.controlledBy].onLostControl();
        // remove all handlers
        jQuery(document).off();
        kp.device.keyHandlers = {};
        kp.device.eventHandled = {};
        // set default listeners
        kp.device.defaultControls();
        // remember current module
        this.controlledBy = module;
        // callback
        if (this.controlledBy != false && typeof(kp[module].onGetControl) != "undefined")
            kp[this.controlledBy].onGetControl((typeof(keyword) != "undefined" ? keyword : false));
        kp.device.setListeners();
    }
}

/* ========================================================================
 * KinoPub: kinopub.search.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.search = {
    _init: function() {
        jQuery(".kp-top-bar .kp-top-searchbar .kp-searchbox").data("placeholder", lang('search_placeholder')).val(lang('search_placeholder'));
        jQuery(".kp-top-bar").on("focus", ".kp-top-searchbar .kp-searchbox", function() {
            var input = jQuery(this);
            input.closest(".kp-top-searchbar").addClass("active");
            if (input.val() == input.data("placeholder")) {
                input.val("");
            }
        });
        jQuery(".kp-top-bar").on("blur", ".kp-top-searchbar .kp-searchbox", function() {
            var input = jQuery(this);
            input.closest(".kp-top-searchbar").removeClass("active");
            if (jQuery.trim(input.val()).length == 0) {
                input.val(input.data("placeholder"));
            };
        });
    }
}
/* ========================================================================
 * KinoPub: kinopub.grid.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.grid = {
    _init: function() {},
    _setLoader: function() {
        jQuery(".kp-container").html("<div class=\"kp-loader\"><i class=\"fa fa-cog faa-spin animated\"></i></div>");
    },
    // workers
    onGetControl: function(type) {
        switch (type) {
            case 'homepage':
                this._setLoader();
                break;
            default:
                kp.log.add("Grid > " + type)
                break;
        }
    }
}
/* ========================================================================
 * KinoPub: kinopub.lang.ru.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.lang.ru = {
    device_default_webapp_name: "WebApp",
    device_default_webapp_detailed_name: "WebApp by ctepeo",
    device_default_tizenapp_name: "Мой TizenTV",
    device_activation_header: "Активация устройства",
    device_activation_description: "Введите указанный код на сайте",
    // search
    search_placeholder: "Поиск",
    // menues
    nav_my_i_watch: "Я смотрю",
    nav_my_bookmarks: "Закладки",
    nav_my_playlists: "Плейлисты",
    nav_categories_movie: "Фильмы",
    nav_categories_serial: "Сериалы",
    nav_categories_tvshow: "ТВ Шоу",
    nav_categories_3d: "3D",
    nav_categories_4k: "4K",
    nav_categories_concert: "Концерты",
    nav_categories_documovie: "Докуфильмы",
    nav_categories_docuserial: "Докусериалы",
    nav_categories_picked: "Подборки"
}