// @ts-nocheck
sap.ui.define([
    "alight/proyectofinal/controller/Base.controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "alight/proyectofinal/model/formatter"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Base
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel
     * @param {typeof sap.m.MessageBox} MessageBox
     */
    function (Base, JSONModel, MessageBox, formatter) {
        "use strict";

        return Base.extend("alight.proyectofinal.controller.CrearEmpleado", {
            formatter: formatter,

            onInit: function () {

                this._oWizard = this.byId("empleadoWizard");
                this._oNavContainer = this.byId("wizardNavContainer");
                this._oWizardContentPage = this.byId("crearEmpleado");

                this.employeeModel = new JSONModel();
                this.employeeModel.setData({
                    nombreState: "Error",
                    apellidosState: "Error",
                    dniState: "Error",
                    dateState: "Error"
                });
                this.getView().setModel(this.employeeModel, "employeeModel");

                //Navigation
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                this.oRouter.getRoute("CrearEmpleado").attachPatternMatched(this.onObjectMatched, this);


            },

            /**
             * When navigation is active.
             */
            onObjectMatched: function () {

                //Reset wizard
                this._resetWizard();
            },

            /**
             * When Cancel button is press.
             * Go to main menu.
             */
            onCancel: function (oEvent) {
                this.oRouter.navTo("RouteMain", true);
            },

            /**
             * When press the button for Interno.
             * Unpress other buttons. Set type to 0 and slider settings. Go to next step.
             */
            onInternoPress: function (oEvent) {
                this.byId("autonomo").setPressed(false);
                this.byId("gerente").setPressed(false);
                this.employeeModel.setProperty("/Type", 0);
                this._updateSliderSettings(this.getI18nText("salarioBrutoAnual"), 12000, 80000, 24000, 1000);
                if (this._oWizard.getProgressStep() === this.byId("tipoEmpleado")) {
                    this._oWizard.nextStep();
                }
            },

            /**
             * When press the button for Autonomo.
             * Unpress other buttons. Set type to 1 and slider settings. Go to next step.
             */
            onAutonomoPress: function (oEvent) {
                this.byId("interno").setPressed(false);
                this.byId("gerente").setPressed(false);
                this.employeeModel.setProperty("/Type", 1);
                this._updateSliderSettings(this.getI18nText("precioDiario"), 100, 2000, 400, 50);
                if (this._oWizard.getProgressStep() === this.byId("tipoEmpleado")) {
                    this._oWizard.nextStep();
                }
            },

            /**
             * When press the button for Gerente.
             * Unpress other buttons. Set type to 3 and slider settings. Go to next step.
             */
            onGerentePress: function (oEvent) {
                this.byId("interno").setPressed(false);
                this.byId("autonomo").setPressed(false);
                this.employeeModel.setProperty("/Type", 2);
                this._updateSliderSettings(this.getI18nText("salarioBrutoAnual"), 12000, 80000, 24000, 1000);
                if (this._oWizard.getProgressStep() === this.byId("tipoEmpleado")) {
                    this._oWizard.nextStep();
                }
            },

            /**
             * When Nombre input change.
             * Validate the state and check if the step can be validated.
             */
            onNombreChange: function (oEvent) {
                if (!oEvent.getSource().getValue()) {
                    this.employeeModel.setProperty("/nombreState", "Error");
                } else {
                    this.employeeModel.setProperty("/nombreState", "None");
                }

                this._checkEmployeeDataStep();
            },

            /**
             * When Apellidos input change.
             * Validate the state and check if the step can be validated.
             */
            onApellidosChange: function (oEvent) {
                if (!oEvent.getSource().getValue()) {
                    this.employeeModel.setProperty("/apellidosState", "Error");
                } else {
                    this.employeeModel.setProperty("/apellidosState", "None");
                }

                this._checkEmployeeDataStep();
            },

            /**
             * When Dni/Cif input change.
             * Validate the state and check if the step can be validated.
             */
            onDniChange: function (oEvent) {
                var dni = oEvent.getParameter("value"),
                    number,
                    letter,
                    letterList,
                    regularExp = /^\d{8}[a-zA-Z]$/;

                if (!dni) {
                    this.byId("dniEmpleado").setValueStateText(this.getI18nText("campoObligatorio"));
                    this.employeeModel.setProperty("/dniState", "Error");
                } else {

                    //Se comprueba que el formato es válido
                    if (regularExp.test(dni) === true) {
                        //Número
                        number = dni.substr(0, dni.length - 1);
                        //Letra
                        letter = dni.substr(dni.length - 1, 1);
                        number = number % 23;
                        letterList = "TRWAGMYFPDXBNJZSQVHLCKET";
                        letterList = letterList.substring(number, number + 1);
                        if (letterList !== letter.toUpperCase()) {
                            this.employeeModel.setProperty("/dniState", "Error");
                            this.byId("dniEmpleado").setValueStateText(this.getI18nText("dniIncorrecto"));
                        } else {
                            this.employeeModel.setProperty("/dniState", "None");
                        }
                    } else {
                        this.employeeModel.setProperty("/dniState", "Error");
                        this.byId("dniEmpleado").setValueStateText(this.getI18nText("dniIncorrecto"));
                    }
                }
                this._checkEmployeeDataStep();
            },

            /**
             * When DP Fecha incorporacion change.
             * Validate the state and check if the step can be validated.
             */
            onDateChange: function (oEvent) {
                if (!oEvent.getSource().getValue()) {
                    this.employeeModel.setProperty("/dateState", "Error");
                } else {
                    this.employeeModel.setProperty("/dateState", "None");
                }

                this._checkEmployeeDataStep();
            },

            /**
             * When all wizard steps are completed.
             * Get incomplete files list and navigate to review page.
             */
            onWizardComplete: function (oEvent) {
                var oPendingFiles = this.byId("ficherosAdicional").getIncompleteItems(),
                    sFileNames = "";

                if (oPendingFiles.length > 0) {
                    for (let index = 0; index < oPendingFiles.length; index++) {
                        sFileNames = sFileNames + oPendingFiles[index].getFileName() + "\n";
                    }
                }
                this.employeeModel.setProperty("/fileList", sFileNames);
                this._oNavContainer.to(this.byId("wizardReviewPage"));
            },

            /**
             * When edit step one.
             * Go to step one.
             */
            editStepOne: function () {
                this._handleNavigationToStep(0);
            },

            /**
             * When edit step two.
             * Go to step two.
             */
            editStepTwo: function () {
                this._handleNavigationToStep(1);
            },

            /**
             * When edit step three.
             * Go to step three.
             */
            editStepThree: function () {
                this._handleNavigationToStep(2);
            },

            /**
             * When cancel from review page.
             * Reset wizard with a confirmation dialog
             */
            onWizardCancel: function (oEvent) {
                MessageBox.warning(this.getI18nText("cancelarMsg"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._resetWizard();
                        }
                    }.bind(this)
                });
            },

            /**
             * When submit the wizard.
             * Call the create function for the oData service
             */
            onWizardSubmit: function (oEvent) {
                MessageBox.warning(this.getI18nText("submitMsg"), {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            this._saveEmployee();
                        }
                    }.bind(this)
                });
            },




            /*****************************************************
             * PRIVATE FUNCTIONS
             ****************************************************/

            /**
             * Reset all wizard items.
             */
            _resetWizard: function () {
                this._handleNavigationToStep(0);
                this._oWizard.discardProgress(this._oWizard.getSteps()[0]);
                this.byId("tipoEmpleado").setValidated(false);
                this.byId("interno").setPressed(false);
                this.byId("autonomo").setPressed(false);
                this.byId("gerente").setPressed(false);
                this.employeeModel.setData({
                    nombreState: "Error",
                    apellidosState: "Error",
                    dniState: "Error",
                    dateState: "Error"
                });
            },

            /**
             * Set wizard to a corresponding step number (input parameter).
             */
            _handleNavigationToStep: function (iStepNumber) {
                var fnAfterNavigate = function () {
                    this._oWizard.goToStep(this._oWizard.getSteps()[iStepNumber]);
                    this._oNavContainer.detachAfterNavigate(fnAfterNavigate);
                }.bind(this);

                this._oNavContainer.attachAfterNavigate(fnAfterNavigate);
                this._oNavContainer.backToPage(this._oWizardContentPage.getId());
            },

            /**
             * Update the slider settings with input parameters.
             */
            _updateSliderSettings: function (sText, iMin, iMax, iValue, iStep) {
                this.employeeModel.setProperty("/sliderText", sText);
                this.employeeModel.setProperty("/sliderMin", iMin);
                this.employeeModel.setProperty("/sliderMax", iMax);
                this.employeeModel.setProperty("/Amount", iValue);
                this.employeeModel.setProperty("/sliderStep", iStep);
            },

            /**
             * Check Employee Data step if all states are None
             */
            _checkEmployeeDataStep: function () {
                var oData = this.employeeModel.getData();
                if (oData.nombreState === "None" &&
                    oData.apellidosState === "None" &&
                    oData.dniState === "None" &&
                    oData.dateState === "None") {

                    this.byId("datosEmpleado").setValidated(true);
                }
                else {
                    this.byId("datosEmpleado").setValidated(false);
                }
            },

            /**
             * Save employee with create oData function
             */
            _saveEmployee: function () {
                var employeeData = this.employeeModel.getData();

                var body = {
                    SapId: this.getOwnerComponent().SapId,
                    Type: employeeData.Type.toString(),
                    FirstName: employeeData.FirstName,
                    LastName: employeeData.LastName,
                    Dni: employeeData.Dni,
                    CreationDate: employeeData.CreationDate,
                    Comments: employeeData.Comments,
                    UserToSalary: [
                        {
                            Ammount: parseFloat(employeeData.Amount).toString(),
                            Comments: employeeData.Comments,
                            Waers: "EUR"
                        }
                    ]
                }

                new Promise((resolve, reject) => {
                    this.getView().getModel("oDataEmployee").create("/Users", body, {
                        success: function (data) {
                            resolve(data);
                        },
                        error: function (error) {
                            reject(error);
                        }
                    });
                }).then(
                    function (data) {
                        this._uploadFiles(data.EmployeeId);
                        MessageBox.success(this.getView().getModel("i18n").getResourceBundle().getText("EmployeeCreated") + ": " + data.EmployeeId, {
                            onClose: function () {
                                this.oRouter.navTo("RouteMain", true);
                            }
                        });
                    },
                    function (error) {
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("employeeNotCreated") + "\n" + error);

                    });
            },



            /**
             * Upload the files for the employee calling oData service
             */
            _uploadFiles: function (sEmployeeId) {

                var oUploadSet = this.byId("ficherosAdicional"),
                    oPendingFiles = oUploadSet.getIncompleteItems();

                if (oPendingFiles.length > 0) {
                    var oHeaderField = new sap.ui.core.Item({
                        text: "x-csrf-token",
                        key: this.employeeModel.getSecurityToken()
                    });
                    oUploadSet.addHeaderParameter(oHeaderField);

                    for (let index = 0; index < oPendingFiles.length; index++) {
                        oHeaderField = new sap.ui.core.Item({
                            text: "slug",
                            key: this.getOwnerComponent().SapId + ";" + sEmployeeId + ";" + oPendingFiles[index].getFileName()
                        });
                        oUploadSet.addHeaderParameter(oHeaderField);
                    }
                    oUploadSet.upload();
                }
            }
        });
    });
