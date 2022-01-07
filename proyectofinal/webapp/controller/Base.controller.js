// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
	/**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("alight.proyectofinal.controller.Base", {

            onInit: function () {
            },

            getI18nText: function (sText) {
                return this.getView().getModel("i18n").getResourceBundle().getText(sText);
            }


        });
    });
