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
                this.byId("dniEmpleado").fireLiveChange();
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
                this.byId("dniEmpleado").fireLiveChange();
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
                this.byId("dniEmpleado").fireLiveChange();
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

                this._checkEmployeeDataStep(this._oWizard.getCurrentStep());
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

                this._checkEmployeeDataStep(this._oWizard.getCurrentStep());
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
                    regularExp = /^\d{8}[a-zA-Z]$/,
                    tipo = this.employeeModel.getProperty("/Type");

                if (dni === undefined) {
                    dni = this.byId("dniEmpleado").getValue();
                }

                if (dni === "") {
                    this.byId("dniEmpleado").setValueStateText(this.getI18nText("campoObligatorio"));
                    this.employeeModel.setProperty("/dniState", "Error");
                } else {
                    if (tipo !== 1) {
                        //Se comprueba que el formato es v??lido
                        if (regularExp.test(dni) === true) {
                            //N??mero
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
                    } else {
                        this.employeeModel.setProperty("/dniState", "None");
                    }
                }
                this._checkEmployeeDataStep(this._oWizard.getCurrentStep());
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
                this._checkEmployeeDataStep(this._oWizard.getCurrentStep());
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
                this.byId("ficherosAdicional").destroyItems();
                this.byId("ficherosAdicional").destroyIncompleteItems();
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
            _checkEmployeeDataStep: function (oStepId) {
                var oData = this.employeeModel.getData();
                if (oData.nombreState === "None" &&
                    oData.apellidosState === "None" &&
                    oData.dniState === "None" &&
                    oData.dateState === "None") {

                    this.byId(oStepId).setValidated(true);
                }
                else {
                    this.byId(oStepId).setValidated(false);
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
                            Amount: parseFloat(employeeData.Amount).toString(),
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
                            }.bind(this)
                        });
                    }.bind(this),
                    function (error) {
                        MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("employeeNotCreated") + "\n" + error);

                    }.bind(this));
            },

            /**
             * Upload the files for the employee calling oData service
             */
            _uploadFiles: function (sEmployeeId) {

                var oUploadSet = this.byId("ficherosAdicional"),
                    oPendingFiles = oUploadSet.getIncompleteItems(),
                    oHeaderField;

                for (let index = 0; index < oPendingFiles.length; index++) {
                    if (oPendingFiles.length > 0) {
                        oUploadSet.removeAllHeaderFields();
                        oHeaderField = new sap.ui.core.Item({
                            key: "x-csrf-token",
                            text: this.getView().getModel("oDataEmployee").getSecurityToken()
                        });
                        oUploadSet.addHeaderField(oHeaderField);

                        oHeaderField = new sap.ui.core.Item({
                            key: "slug",
                            text: this.getOwnerComponent().SapId + ";" + sEmployeeId + ";" + oPendingFiles[index].getFileName()
                        });
                        oUploadSet.addHeaderField(oHeaderField);
                        oUploadSet.uploadItem(oPendingFiles[index]);
                    }
                }
            }
        });
    });
