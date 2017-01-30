/* ========================================================================
 * KinoPub: kinopub.modules.js v0.1
 * https://github.com/ctepeo/KinoPub/
 * ========================================================================
 * Copyright 2011-2017 Egor "ctepeo" Sazanovich.
 * Licensed under GPL-3.0 (https://github.com/ctepeo/KinoPub/blob/master/LICENSE)
 * ======================================================================== */
kp.modules = {
    onBoot: ['log', 'lang', 'data', 'device', 'api', 'ui', 'auth', 'user', 'search', 'grid', 'boot'],
    controlledBy: false,
    _parent: false,
    // load modules' defaults
    _init: function(_parent) {
        this._parent = _parent;
        for (moduleID in this.onBoot) {
            this.load(this.onBoot[moduleID]);
        }
    },
    load: function(module) {
        if (typeof(this._parent.log.add) != "undefined") {
            this._parent.log.add("Modules > _init > Загрузка модуля " + module);
        }
        if (typeof(kp[module]) == "undefined") {
            this._parent.log.add("Modules > _init > Модуль не загружен ");
            return;
        }
        this._parent[module] = kp[module]._init(this._parent);
        if (typeof(this._parent.log.add) != "undefined") {
            this._parent.log.add("Modules > _init > Модуль " + module + " загружен");
        }
    },
    // cancels all keyboard/remote control handlers and sets to specified module (with params)
    transferControl: function(module, keyword) {
        this._parent.log.add("Modules > Управление передано от " + this.controlledBy + " к " + module + "[" + keyword + "]")
            // bye-bye to control?
        if (this.controlledBy != false && typeof(this._parent[this.controlledBy]['onLostControl']) != "undefined") this._parent[this.controlledBy].onLostControl();
        // remove all handlers
        jQuery(document).off();
        this._parent.device.keyHandlers = {};
        this._parent.device.eventHandled = {};
        // set default listeners
        this._parent.device.defaultControls();
        // remember current module
        this.controlledBy = module;
        // callback
        if (this.controlledBy != false && typeof(this._parent[module].onGetControl) != "undefined") this._parent[this.controlledBy].onGetControl((typeof(keyword) != "undefined" ? keyword : false));
        this._parent.device.setListeners();
    }
}