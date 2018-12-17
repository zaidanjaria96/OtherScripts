/**
 * This file Helps in maintaining rescheduling mechnasim
 */
var BaseScheduled = /** @class */ (function () {
    function BaseScheduled() {
        this.startTime = (new Date()).getTime();
        this.minutesAfterReschedule = 40;
        this.usageLimit = 1050;
        this.rescheduled = false;
        this.rescheduleParams = null;
    }
    /**
     * Call this method to reschedule current schedule script
     * @param ctx nlobjContext Object
     * @param params
     */
    BaseScheduled.prototype.rescheduleScript = function (ctx, params) {
        nlapiLogExecution('DEBUG', 'RESCHEDULING', "");
        var status = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
        nlapiLogExecution('DEBUG', "rescheduleScript", 'Status: ' + status + ' Params: ' + JSON.stringify(params));
        // Utility.logDebug('ExportCustomerRefunds.rescheduleScript', 'Status: ' + status + ' Params: ' + JSON.stringify(params));
        this.rescheduled = true;
    };
    BaseScheduled.prototype.rescheduleIfNeeded = function () {
        try {
            var context = nlapiGetContext();
            var usageRemaining = context.getRemainingUsage();
            nlapiLogExecution('DEBUG', 'REMAINING USAGE ', usageRemaining);
            if (usageRemaining < this.usageLimit) {
                this.rescheduleScript(context, this.rescheduleParams);
                return true;
            }
            var endTime = (new Date()).getTime();
            var minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;
            nlapiLogExecution('DEBUG', "Time & Usage", 'Usage: ' + usageRemaining + ' Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
            // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error
            if (minutes > this.minutesAfterReschedule) {
                this.rescheduleScript(context, this.rescheduleParams);
                return true;
            }
        }
        catch (e) {
            nlapiLogExecution('ERROR', "Error At rescheduleIfNeeded", e.toString());
        }
        return false;
    };
    BaseScheduled.prototype.isRescheduled = function () {
        return this.rescheduled;
    };
    BaseScheduled.prototype.setRescheduleParams = function (params) {
        this.rescheduleParams = params;
    };
    BaseScheduled.prototype.getScriptParams = function (scriptParams) {
        try {
            var paramsData = {};
            var ctx = nlapiGetContext();
            var params = scriptParams;
            for (var i in params) {
                var param = params[i];
                paramsData[param] = ctx.getSetting("SCRIPT", param) || '';
            }
            nlapiLogExecution('DEBUG', "getScriptParams", JSON.stringify(paramsData));
            return paramsData;
        }
        catch (e) {
            nlapiLogExecution('DEBUG', 'Error in getScriptParams function', e.toString());
        }
    };
    return BaseScheduled;
}());
