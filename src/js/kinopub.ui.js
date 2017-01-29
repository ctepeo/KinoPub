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