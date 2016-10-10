/* ========================================================================
 * KinoPub: kinopub.ui.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2016 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */

kp.ui = {
    _init: function() {
        this._welcome();
    },
    _welcome: function() {
        var _this = this;
        _this._reset();
        jQuery("body").addClass("kp-welcome").html("<div class=\"kp-logo\"><h2>kino<span>pub</span></h2></div>");
        jQuery(".kp-logo").animate({ opacity: 1 }, 150).promise().then(function() {
            if (!kp.auth.checkAccessToken()) {
                // move upper to provide space for status informer
                jQuery(".kp-logo").animate({ marginTop: '-10%' }, 100).promise().then(function() {
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
        if (jQuery("body").hasClass("kp-welcome") == true) {
            // init screen!
            jQuery(".kp-welcome .kp-logo").animate({
                marginTop: '0%'
            }, 1000).promise().then(function() {
                jQuery(".kp-logo").animate({
                    opacity: 0
                }).promise().then(function() {
                    kp.user.getUser();
                    jQuery(".kp-logo").remove();
                    jQuery("body").animate({
                        backgroundColor: '#2f373e'
                    }, 700).promise().then(function() {
                        jQuery("body").removeClass("kp-welcome");
                        jQuery(".kp-logo, .kp-status").remove();
                    });
                });
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
                kp.device.registerEvent("#kp-device-activation .kp-device-activation-code strong", "click", function(el) {
                    jQuery("body").append("<form class=\"kp-device-activation-tmp-form\" action=\"" + jQuery(el.target).text() + "\" target=\"_blank\"></form>");
                    jQuery("form.kp-device-activation-tmp-form").submit().remove();
                });
                break;
            default:
                kp.log.add("UI > onGetControl > Неизвестный тип [" + type + "]");
                break;
        }
    }
}
