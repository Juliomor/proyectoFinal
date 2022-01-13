// @ts-nocheck
sap.ui.define([
    "alight/proyectofinal/controller/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Base
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.m.MessageBox} MessageBox
     * @param {typeof sap.ui.model.Filter} Filter
     * @param {typeof sap.ui.model.FilterOperator} FilterOperator
     */
    function (Base, JSONModel, MessageBox, Filter, FilterOperator) {
        "use strict";

        return Base.extend("alight.proyectofinal.controller.VerEmpleados", {
            onInit: function () {

                this._oSplitApp = this.byId("verEmpleados");

                this.employeeModel = new JSONModel();
                this.getView().setModel(this.employeeModel, "employeeModel");

                //Navigation
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getRoute("VerEmpleados").attachPatternMatched(this.onObjectMatched, this);
            },

            /**
             * When navigation is active.
             */
            onObjectMatched: function () {

                //Reset detail
                this._oSplitApp.toDetail(this.byId("detail"));

                //Read employees
                this._readEmployeesOData();
            },

            /**
             * When click on nav button.
             * Navigate to home page.
             */
            onNavBack: function (oEvent) {
                this.oRouter.navTo("RouteMain", true);
            },

            /**
             * 
             */
            onSearch: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var filter = new Filter({
                        filters: [
                            new Filter({
                                path: 'FirstName',
                                operator: FilterOperator.Contains,
                                value1: sQuery
                            }),
                            new Filter({
                                path: 'LastName',
                                operator: FilterOperator.Contains,
                                value1: sQuery
                            }),
                            new Filter({
                                path: 'Dni',
                                operator: FilterOperator.Contains,
                                value1: sQuery
                            })
                        ],
                        and: false
                    })
                    aFilters.push(filter);
                }

                // update list binding
                var oList = this.byId("listaEmpleados");
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, "Application");
            },

            /**
             * When an employee is pressed.
             * Show all details of the employee
             */
            onDetailsEmployee: function (oEvent) {
                var path = oEvent.getSource().getBindingContext("employeeModel").getPath();

                this.byId("employeeDetail").bindElement("employeeModel>" + path);
                this._readEmployeeFiles(oEvent.getSource().getBindingContext("employeeModel").getObject().EmployeeId);
                this._oSplitApp.toDetail(this.byId("employeeDetail"));

            },

            /**
             * When click on the button for employee leave.
             * Show confirmation popup and send delete call to oData service when applicable.
             */
            onBajaEmployee: function (oEvent) {
                var contextObj = oEvent.getSource().getBindingContext("employeeModel").getObject();

                MessageBox.confirm(this.getI18nText("deleteEmployee"), {
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            this._deleteEmployee(contextObj.EmployeeId).bind(this);
                        }
                    }.bind(this)
                });
            },

            /**
             * When click on the button for promotion.
             * Show popup to fill promotion info
             */
            onAscenderEmployee: function (oEvent) {

                if (!this._oDialogPromotion) {
                    this._oDialogPromotion = sap.ui.xmlfragment("alight.proyectofinal.fragment.DialogAscender", this);
                    this.getView().addDependent(this._oDialogPromotion);
                }

                this._oDialogPromotion.open();
            },



            /*****************************************************
             * PRIVATE FUNCTIONS
             ****************************************************/

            /**
             * Read /Users entity from oData service.
             */
            _readEmployeesOData: function () {
                this.getView().getModel("oDataEmployee").read("/Users", {
                    filters: [
                        new sap.ui.model.Filter("SapId", "EQ", this.getOwnerComponent().SapId)
                    ],
                    success: function (data) {
                        this.employeeModel.setProperty("/Users", data.results);
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(this.getI18nText("oDataSaveKO"));
                    }.bind(this)
                });
            },

            /**
             * Read /Attachments entity from oData service for the corresponding employee id.
             */
            _readEmployeeFiles: function (sEmployeeId) {
                this.getView().byId("ficherosEmpleado").bindAggregation("items", {
                    path: "oDataEmployee>/Attachments",
                    filters: [
                        new Filter("SapId", FilterOperator.EQ, this.getOwnerComponent().SapId),
                        new Filter("EmployeeId", FilterOperator.EQ, sEmployeeId)],
                    template: new sap.m.upload.UploadSetItem({
                        visibleEdit: false,
                        fileName: "{oDataEmployee>DocName}",
                        url: "/sap/opu/odata/sap/ZEMPLOYEES_SRV/Attachments(AttId='" + "{oDataEmployee>AttId}" + "',SapId='" + "{oDataEmployee>SapId}" + "',EmployeeId='" + sEmployeeId + "')/$value"
                    })
                });
            },

            _deleteEmployee: function (sEmployeeId) {
                if (sEmployeeId) {
                    //Delete files first
                    if (this.byId("ficherosEmpleado").getItems().length > 0) {
                        /**this.getView().getModel("oDataEmployee").remove("/IncidentsSet(IncidenceId='" + data.IncidenceId + "',SapId='" + data.SapId + "',EmployeeId='" + data.EmployeeId + "')", {
                            success: function () {
                                this.onReadODataIncidence.bind(this)(data.EmployeeId);
                                sap.m.MessageToast.show(oResourceBundle.getText("oDataDeleteOK"));
                            }.bind(this),
                            error: function (e) {
                                sap.m.MessageToast.show(oResourceBundle.getText("oDataDeleteKO"));
                            }.bind(this)
                        });*/
                    }

                    //Delete employee
                    this.getView().getModel("oDataEmployee").remove("/Users(EmployeeId='" + sEmployeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                        success: function () {
                            this._readEmployeesOData();
                            sap.m.MessageToast.show(this.getI18nText("oDataDeleteOK"));
                            this._oSplitApp.toDetail(this.byId("detail"));
                        }.bind(this),
                        error: function (e) {
                            sap.m.MessageToast.show(this.getI18nText("oDataDeleteKO"));
                        }.bind(this)
                    });


                }
            }

        });
    });
