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

            onAfterRendering: function () {
                // Error en el framework: Al agregar la dirección URL de "Firmar pedidos", el componente GenericTile debería navegar directamente a dicha URL, // pero no funciona en la versión 1.78. Por tanto, una solución encontrada es eliminando la propiedad id del componente por jquery
                var genericTileFirmarPedido = this.byId("firmarPedido");
                //Id del dom
                var idGenericTileFirmarPedido = genericTileFirmarPedido.getId();
                //Se vacía el id
                jQuery("#" + idGenericTileFirmarPedido).id = "";
            },

            onSignOrder: function (oEvent) {
                const url = "https://f1e2b092trial-dev-logaligroup-approuter.cfapps.eu10.hana.ondemand.com";
                window.open(url);
            },

            onShowEmployee: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("VerEmpleados", true);
            },

            onNewEmployee: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CrearEmpleado", true);
            }

        });
    });
