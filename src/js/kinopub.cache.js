/* ========================================================================
 * KinoPub: kinopub.cache.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.cache = {
    _parent: false,
    _init: function(_parent) {
        this._parent = _parent;
        return this;
    },
    get: function(keyword) {
        var _this = this;
        _this._parent.log.add("Cache > Get [" + keyword + "]");
        return localStorage.getItem(keyword);
    },
    set: function(keyword, data) {
        var _this = this;
        _this._parent.log.add("Cache > Set [" + keyword + "] \n " + data);
        return localStorage.setItem(keyword, data);
    },
    remove: function(keyword) {
        var _this = this;
        _this._parent.log.add("Cache > Remove [" + keyword + "]");
        localStorage.removeItem(keyword);
    },
    wipe: function() {
        var _this = this;
        _this._parent.log.add("Cache > Wipe!");
        localStorage.clear();
    },
    cacheImage: function(url, keyword) {
        var _this = this;
        _this._parent.log.add("Cache > Image [" + keyword + " @ " + url + " ]");
        _this._toBase64(url, function(base64encoded) {
            _this.set(keyword, base64encoded)
        });
    },
    _toBase64: function(url, callback) {
        var _this = this;
        var xhr = new XMLHttpRequest()
        xhr.open("GET", url);
        xhr.Origin = "https://kino.pub";
        xhr.responseType = "blob";
        xhr.send();
        xhr.addEventListener("load", function() {
            var reader = new FileReader();
            reader.readAsDataURL(xhr.response);
            reader.addEventListener("loadend", function() {
                console.log(reader.result);
            });
        });
    }
}