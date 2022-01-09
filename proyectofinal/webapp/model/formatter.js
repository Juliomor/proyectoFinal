// @ts-nocheck
sap.ui.define([], function () {
    "use strict";
    return {
        dateFormat: function (date) {
            if (date) {
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "dd MMM YYYY" });
                return dateFormat.format(date);
            }
        }
    };
});