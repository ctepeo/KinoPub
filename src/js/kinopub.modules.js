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
