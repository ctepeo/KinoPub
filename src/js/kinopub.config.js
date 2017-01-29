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