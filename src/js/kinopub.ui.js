/* ========================================================================
 * KinoPub: kinopub.ui.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2016 Egor "ctepeo" Sazanovich.
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
        jQuery(".kp-logo").animate({ opacity: 1 }, 15 * _this._duration).promise().then(function() {
            if (!kp.auth.checkAccessToken()) {
                // move upper to provide space for status informer
                jQuery(".kp-logo").animate({ marginTop: '-10%' }, 10 * _this._duration).promise().then(function() {
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
        if (jQuery("#kp-device-activation").length)
            return false;
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
            });
        }
    },
    // key mapping
    onGetControl: function(type) {
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
                kp.api.getUnwatched();
                break;
            default:
                kp.log.add("UI > onGetControl > Неизвестный тип [" + type + "]");
                break;
        }
    }
}
