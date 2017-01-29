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