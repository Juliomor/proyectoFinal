// @ts-nocheck
sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("alight.proyectofinal.controller.Main", {
            onInit: function () {
            },

            /**
             * When click on Firmar Pedido
             */
            onSignOrder: function (oEvent) {
                const url = "https://f1e2b092trial-dev-logaligroup-approuter.cfapps.eu10.hana.ondemand.com";
                window.open(url);
            },

            /**
             * When click on Ver Empleados
             */
            onShowEmployee: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("VerEmpleados", true);
            },

            /**
             * When click Crear Empleado
             */
            onNewEmployee: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CrearEmpleado", true);
            }

        });
    });
