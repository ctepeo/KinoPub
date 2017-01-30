/* ========================================================================
 * KinoPub: kinopub.user.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.user = {
    _parent: false,
    _init: function(_parent) {
        this._parent = _parent;
        return this;
    },
    getUser: function() {
        this._parent.api.getUser();
    },
    // returns array with user's private menu items
    getUserNav: function() {
        var nav = [];
        for (i in this._parent.config.menues.my) {
            var item = this._parent.config.menues.my[i];
            item.title = this._parent.lang.get(item.lang);
            nav.push(item);
        }
        return nav;
    },
    // returns array with user defined (TODO) nav menu
    getUserCategories: function() {
        var nav = [];
        // TODO -> provide user ability to change the items 
        var source = this._parent.config.menues.categories;
        for (i in source) {
            var item = source[i];
            if (item.lang != false) item.title = this._parent.lang.get(item.lang);
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
                this._parent.data.storage.history.unwatched.serials = {};
                for (i in items) {
                    var item = items[i];
                    total = total + item.new, 10;
                    this._parent.data.storage.history.unwatched.serials[item.id] = item;
                }
                this._parent.data.storage.history.unwatched.total = total;
                break;
            default:
                this._parent.log.add('User > processUnwatched > Тип данных не найден > ' + type);
                break;
        }
        this._parent.ui.updateUnwatched();
    }
}