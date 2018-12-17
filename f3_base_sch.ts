/**
 * This file Helps in maintaining rescheduling mechnasim
 */
abstract class BaseScheduled {

    protected startTime = (new Date()).getTime();
    protected minutesAfterReschedule = 40;
    protected usageLimit = 1050;
    private rescheduled = false;
    protected rescheduleParams = null;

    constructor() {
    }

    /**
     * Call this method to reschedule current schedule script
     * @param ctx nlobjContext Object
     * @param params
     */
    protected rescheduleScript(ctx, params) {
        nlapiLogExecution('DEBUG','RESCHEDULING',"");
        let status = nlapiScheduleScript(ctx.getScriptId(), ctx.getDeploymentId(), params);
        nlapiLogExecution('DEBUG', "rescheduleScript", 'Status: ' + status + ' Params: ' + JSON.stringify(params));
        // Utility.logDebug('ExportCustomerRefunds.rescheduleScript', 'Status: ' + status + ' Params: ' + JSON.stringify(params));
        this.rescheduled = true;
    }

    protected rescheduleIfNeeded(): boolean {
        try {
            let context = nlapiGetContext();
            let usageRemaining = context.getRemainingUsage();
            nlapiLogExecution('DEBUG', 'REMAINING USAGE ', usageRemaining);
            if (usageRemaining < this.usageLimit) {
                this.rescheduleScript(context, this.rescheduleParams);
                return true;
            }

            let endTime = (new Date()).getTime();

            let minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;
            nlapiLogExecution('DEBUG', "Time & Usage", 'Usage: ' + usageRemaining + ' Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
            // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error
            if (minutes > this.minutesAfterReschedule) {
                this.rescheduleScript(context, this.rescheduleParams);
                return true;
            }

        } catch (e) {
            nlapiLogExecution('ERROR', "Error At rescheduleIfNeeded", e.toString());
        }
        return false;
    }

    protected isRescheduled() {
        return this.rescheduled;
    }

    protected setRescheduleParams(params) {
        this.rescheduleParams = params;
    }

    public getScriptParams(scriptParams) {
        try {
            let paramsData = {} as any;
            let ctx = nlapiGetContext();
            let params = scriptParams;
            for (let i in params) {
                var param = params[i];

                paramsData[param] = ctx.getSetting("SCRIPT", param) || '';
            }
            nlapiLogExecution('DEBUG',"getScriptParams", JSON.stringify(paramsData));
            return paramsData;
        }
        catch (e) {
            nlapiLogExecution('DEBUG','Error in getScriptParams function', e.toString());
        }
    }
}
