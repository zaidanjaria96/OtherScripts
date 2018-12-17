
function main(){
    try{

        nlapiLogExecution('DEBUG', "Update SO Items location Sch", "START");
        var context = nlapiGetContext();
        var index;
        if(context.getSetting('SCRIPT', 'custscript_f3_so_loc_upd_index')){
             index = context.getSetting('SCRIPT', 'custscript_f3_so_loc_upd_index');
        }
        nlapiLogExecution('DEBUG', "INDEX ", index);
        var updLocSo = new UpdateItemLocationSO();
        var soList = updLocSo.getSalesOrder();
        nlapiLogExecution('DEBUG', "SALES ORDER IDS TO PROCESSED ", JSON.stringify(soList));

        for(var i =0 ; i < soList.length ;i++){
            this.processorder(soList[i]);
            //reschedule
            nlapiLogExecution('DEBUG', 'REMAINING USAGE after Sales Orders Process '+(i+1), context.getRemainingUsage());
            if(this.isRescheduleNeeded(context)){
                this.reschedule(context);
            }
        }
        nlapiLogExecution('DEBUG', "Update SO Items location Sch", "END");
    }catch(e){
        nlapiLogExecution('ERROR', "Error At Processing SO sch", e.toString());
    }



}

function processorder(soid) {
    try {
        var updLocSo = new UpdateItemLocationSO();
        var id = updLocSo.processOrder(soid);
    }catch(e){
        nlapiLogExecution('ERROR', "Error At Sch Processing SO "+soid, e.toString());
    }

}

function isRescheduleNeeded(context) {

    var remainingunits = parseInt(context.getRemainingUsage());
    if(remainingunits < 1000){
        return true;
    }

    var endTime = (new Date()).getTime();

    var minutes = Math.round(((endTime - this.startTime) / (1000 * 60)) * 100) / 100;
    //Utility.logDebug('Time', 'Minutes: ' + minutes + ' , endTime = ' + endTime + ' , startTime = ' + this.startTime);
    // if script run time greater than 50 mins then reschedule the script to prevent time limit exceed error
    if (minutes > this.minutesAfterReschedule) {
        return true;
    }
    else
        return false;
}
function reschedule(context){
    var status = nlapiScheduleScript(context.getScriptId(), context.getDeploymentId());
    nlapiLogExecution('DEBUG', "Sch Script Status  ", status);
}