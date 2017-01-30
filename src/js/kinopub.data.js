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
    _parent: false,
    storage: {},
    _init: function(_parent) {
        this._parent = _parent;
        for (type in this.boot) {
            var fields = this.boot[type];
            this.restore(type, fields);
        }
        return this;
    },
    restore: function(source, fields, prefix) {
        var _this = this;
        if (typeof(prefix) == "undefined") prefix = "kp_";
        if (typeof(this.storage[source]) == "undefined") {
            this.storage[source] = {};
        }
        for (i in fields) {
            var name = fields[i];
            if (typeof(this.storage[source][name]) == "undefined") {
                this.storage[source][name] = null;
            }
            if (Cookies.get(prefix + source + '_' + name) != "") value = Cookies.get(prefix + source + '_' + name);
            if (value == null || value == false) {
                this._parent.log.add("Data > Restore > Игнорируем значение [" + source + "/" + name + "]");
            } else {
                this._parent.log.add("Data > Restore > [" + source + "/" + name + "] => " + value);
                this.storage[source][name] = value;
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
            this.storage[type][name] = value;
        }
    },
    remove: function(type, fields, prefix) {
        if (typeof(prefix) == "undefined") prefix = "kp_";
        for (i in fields) {
            var name = fields[i];
            Cookies.remove(prefix + type + '_' + name);
            this.storage[type][name] = null;
        }
    },
    wipe: function() {
        return false;
        this._parent.log.add("Data > Wipe > Удаляем все сохраненные значения");
        for (type in this.boot) {
            var fields = this.boot[type];
            this.remove(type, fields);
        }
    }
}