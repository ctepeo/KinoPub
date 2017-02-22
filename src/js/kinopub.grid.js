/* ========================================================================
 * KinoPub: kinopub.grid.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.grid = {
    _parent: false,
    grid: false,
    _init: function(_parent) {
        this._parent = _parent;
        return this;
    },
    _setContainerLoader: function() {
        jQuery(".kp-container").html("<div class=\"kp-loader\"><i class=\"fa fa-cog faa-spin animated vcenter centered\"></i></div>");
        jQuery(".kp-container .kp-loader").css({
            width: jQuery(".kp-container").outerWidth(true) + 'px',
            height: jQuery(".kp-container").outerHeight(true) + 'px',
        });
    },
    _buildGrid: function(template) {
        var _this = this;
        if (typeof(template) != "string") {
            _this._parent.log.add("Grid > _buildGrid > Шаблон не строка");
        } else {
            _this.grid = jQuery(template);
        }
    },
    _showGrid: function() {
        var _this = this;
        jQuery(".kp-container").html(_this.grid);
    },
    addRow: function(items, title) {
        var _this = this;
        if (typeof(title) != "undefined") {
            _this.grid.append("<div class=\"kp-grid-row kp-grid-row-title\"><h2>" + title + "</h2></div>");
        }
        _this.grid.append("<div class=\"kp-grid-row\" data-width=\"0\" data-height=\"0\" data-loaded=\"0\"><div class=\"kp-grid-row-container\">" + _this.addItems(items) + "</div></div>");
        _this.grid.find(".kp-grid-row:last .kp-grid-item-poster").on("load", function() {
            jQuery(this).addClass("kp-grid-item-poster-loaded");
            _this.normalizeRow(jQuery(this));
        });
    },
    // array to HTML
    addItems: function(items) {
        var html = "";
        var _this = this;
        for (i in items) {
            html = html + _this.addItem(items[i]);
        }
        return html;
    },
    // item to HTML
    addItem: function(item) {
        var _this = this;
        return ["<div class=\"kp-grid-item\">",
            //
            "<a href=\"#\">",
            //
            "<img class=\"kp-grid-item-poster\" src=\"" + _this._getImageSrc(item) + "\">",
            //
            "<div class=\"kp-grid-item-title\">" + _this.shortTitle(item.title) + "</div>", (typeof(item.notification) != "undefined" ?
                // notification block
                "<div class=\"kp-grid-item-notify\">" + item.notification + "</div>" :
                // nothing here
                ""),
            //
            "</a>", "</div>"
        ].join("");
    },
    // normalize covers' heights
    // 
    // calculate average poster's size and set the size to all
    // adapt posters to screen size
    normalizeRow: function(loadedItem) {
        return ;
        var _this = this;
        // averages
        var ttlW = parseInt(loadedItem.closest(".kp-grid-row").data("width"), 10);
        var ttlH = parseInt(loadedItem.closest(".kp-grid-row").data("height"), 10);
        var ttlCnt = parseInt(loadedItem.closest(".kp-grid-row").data("loaded"), 10);
        ttlW = ttlW + loadedItem.prop("naturalWidth");
        ttlH = ttlH + loadedItem.prop("naturalHeight");
        ttlCnt++;
        var itemH = Math.ceil(ttlH / ttlCnt);
        var itemW = Math.ceil(ttlW / ttlCnt);
        // adapt to screen
        var targetWidth = Math.ceil(_this._parent.device.width / _this._parent.config.grid.visibleItems);
        // multiplier
        var k = targetWidth / itemW;
        itemH = Math.floor(itemH * k);
        itemW = Math.floor(itemW * k);
        loadedItem.closest(".kp-grid-row").find(".kp-grid-item").css({
            margin: Math.ceil(itemW * 0.1) + 'px'
        }).find(".kp-grid-item-poster").css({
            width: Math.ceil(itemW) + 'px',
            height: Math.ceil(itemH) + 'px',
        });
        console.log(itemW + "x" + itemH);
        //console.log('cache image!');
        //_this._parent.cache.cacheImage(loadedItem.prop('src'), "xxx");
        loadedItem.css({
            background: "url(" + loadedItem.prop('src') + ")",
            backgroundSize: 'cover'
        });
        //loadedItem.removeProp("src").removeAttr("src");
        if (loadedItem.closest(".kp-grid-row").find(".kp-grid-item-poster-loaded").length == ttlCnt) {
            _this._setGridHandlers(loadedItem.closest(".kp-grid-row"));
        }
    },
    //
    _setGridHandlers: function(row) {},
    // produce shorten title from full one for a tile
    shortTitle: function(title) {
        var _this = this;
        // let's guess! 
        if (title.indexOf(" / ")) {
            title = title.split(" / ")[0];
        }
        if (title.length > _this._parent.config.grid.titleLen) return title.substr(0, _this._parent.config.grid.titleLen - 3) + "&hellip;";
        return title;
    },
    // returns path to image
    _getImageSrc: function(item) {
        return item.poster.replace("https://", "http://");
    },
    // workers
    onGetControl: function(type) {
        var _this = this;
        switch (type) {
            case 'homepage':
                this._setContainerLoader();
                // load items
                _this._parent.ui.load('ui/grid', function(template) {
                    _this._buildGrid(template);
                    _this.addRow(_this._extractUnwatched(_this._parent.data.storage.history.unwatched.serials), "Сериалы");
                    _this._showGrid();
                });
                break;
            default:
                this._parent.log.add("Grid > " + type)
                break;
        }
    },
    // convert data from API responses to Grid
    _extractUnwatched: function(data) {
        var result = [];
        for (i in data) {
            var item = data[i];
            result.push({
                title: item.title,
                id: item.id,
                type: item.type,
                subtype: item.subtype,
                poster: item.posters.big,
                notification: item.new
            });
        }
        return result;
    }
}