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
                var path = oEvent.getSource().getBindingContext("oDataEmployee").getPath();

                this.byId("employeeDetail").bindElement("oDataEmployee>" + path);
                this._oSplitApp.toDetail(this.byId("employeeDetail"));
                this._EmployeeId = oEvent.getSource().getBindingContext("oDataEmployee").getObject().EmployeeId;
            },

            /**
             * When click on the button for employee leave.
             * Show confirmation popup and send delete call to oData service when applicable.
             */
            onBajaEmployee: function (oEvent) {
                var contextObj = oEvent.getSource().getBindingContext("oDataEmployee").getObject();

                MessageBox.confirm(this.getI18nText("deleteEmployee"), {
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            this._deleteEmployee(contextObj.EmployeeId);
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
                    this._oDialogPromotion = this.loadFragment({
                        name: "alight.proyectofinal.view.DialogAscender"
                    });
                }
                this._oDialogPromotion.then(function (oDialog) {
                    var oModel = new JSONModel([]);
                    oDialog.setModel(oModel, "ascenderModel");
                    oDialog.open();
                }.bind(this));
            },

            /**
             * When click on cancel button on promotion dialog.
             * Close the dialog
             */
            onCancelarAscenso: function (oEvent) {
                this.byId("ascenderDialog").close();
            },

            /**
             * When click on accept button 
             */
            onAceptarAscenso: function (oEvent) {
                var oModel = this.byId("ascenderDialog").getModel("ascenderModel"),
                    oData = oModel.getData(),
                    body = {
                        Amount: parseFloat(oData.Amount).toString(),
                        CreationDate: oData.CreationDate,
                        Comments: oData.Comments,
                        SapId: this.getOwnerComponent().SapId,
                        EmployeeId: this._EmployeeId
                    }

                this.getView().getModel("oDataEmployee").create("/Salaries", body, {
                    success: function (data) {
                        sap.m.MessageToast.show(this.getI18nText("oDataAscensoOK"));
                        this.byId("ascenderDialog").close();
                        oModel.setData(null);
                    }.bind(this),
                    error: function (error) {
                        sap.m.MessageToast.show(this.getI18nText("oDataAscensoKO"));
                    }.bind(this)
                });
            },

            /**
             * When remove an item from the file list.
             * Call the oData remove function over /Attachments entity
             */
            onItemRemoved: function (oEvent) {
                var sPath = oEvent.getParameter("item").getBindingContext("oDataEmployee").getPath();

                this.getView().getModel("oDataEmployee").remove(sPath, {
                    success: function (oData) {
                        sap.m.MessageToast.show(this.getI18nText("fileDeleteOK"));
                    }.bind(this),
                    error: function (e) {
                        sap.m.MessageToast.show(this.getI18nText("fileDeleteKO"));
                    }.bind(this)
                });

            },

            /**
             * When new item is added to the file list.
             * Add header parameters for the item
             */
            onItemAdded: function (oEvent) {
                var oItem = oEvent.getParameter("item"),
                    sEmployeeId = oItem.getBindingContext("oDataEmployee").getObject().EmployeeId,
                    oToken = new sap.ui.core.Item({
                        key: "x-csrf-token",
                        text: this.getView().getModel("oDataEmployee").getSecurityToken()
                    }),
                    oSlug = new sap.ui.core.Item({
                        key: "slug",
                        text: this.getOwnerComponent().SapId + ";" + sEmployeeId + ";" + oItem.getFileName()
                    });
                oItem.addHeaderField(oToken).addHeaderField(oSlug);
                oItem.setVisibleEdit(false);
            },

            onUploadCompleted: function (oEvent) {

            },

            /**
             * When click on and item to download it.
             * Fix the name of the downloading item to the proper filename
             * Code from https://blogs.sap.com/2021/08/18/my-journey-towards-using-ui5-uploadset-with-cap-backend/
             */
            onOpenPressed: function (oEvent) {
                oEvent.preventDefault();
                var item = oEvent.getSource();
                this._fileName = item.getFileName();
                this._download(item)
                    .then((blob) => {
                        var url = window.URL.createObjectURL(blob);

                        //download
                        var link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', this._fileName);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            },

            _download: function (item) {
                var settings = {
                    url: item.getUrl(),
                    method: "GET",
                    xhrFields: {
                        responseType: "blob"
                    }
                }

                return new Promise((resolve, reject) => {
                    $.ajax(settings)
                        .done((result, textStatus, request) => {
                            resolve(result);
                        })
                        .fail((err) => {
                            reject(err);
                        })
                });
            },


            /*****************************************************
             * PRIVATE FUNCTIONS
             ****************************************************/

            /**
             * Delete from /Users entity the corresponding input employee id.
             */
            _deleteEmployee: function (sEmployeeId) {
                if (sEmployeeId) {
                    this.getView().getModel("oDataEmployee").remove("/Users(EmployeeId='" + sEmployeeId + "',SapId='" + this.getOwnerComponent().SapId + "')", {
                        success: function () {
                            sap.m.MessageToast.show(this.getI18nText("oDataDeleteOK"));
                            this.byId("listaEmpleados").getBinding("items").refresh();
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
