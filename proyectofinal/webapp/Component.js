sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "alight/proyectofinal/model/models"
],
    function (UIComponent, Device, models) {
        "use strict";

        return UIComponent.extend("alight.proyectofinal.Component", {
            metadata: {
                manifest: "json"
            },

            SapId: "julio.morales@ngahr.com",

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
            }
        });
    }
);