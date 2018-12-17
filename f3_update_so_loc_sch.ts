/**
 * Schedule script for update item location in NS Sales Order
 * Created By Zaid
 */

///<reference path="./f3_base_sch.ts"/>
///<reference path="./f3_update_so_loc_lib.ts"/>

class UpdateSOItemLocation extends BaseScheduled{

    //Script Start
    public scheduled(args): boolean{
        try{
            nlapiLogExecution('DEBUG', "Update SO Items location Sch", "START");
            let context = nlapiGetContext();
            // let index;
            // if(context.getSetting('SCRIPT', 'custscript_f3_so_loc_upd_index')){
            //     index = context.getSetting('SCRIPT', 'custscript_f3_so_loc_upd_index');
            // }
            // nlapiLogExecution('DEBUG', "INDEX ", index);

            //Getting list of Sales order to process
            let updLocSo = new UpdateItemLocationSO();
            let soList = updLocSo.getSalesOrder();
            nlapiLogExecution('DEBUG', "SALES ORDER IDS TO PROCESSED ", JSON.stringify(soList));

            for(let i =0 ; i < soList.length ;i++){
                this.processorder(soList[i]);
               // reschedule
                if(this.rescheduleIfNeeded())
                   return true;
            }
            nlapiLogExecution('DEBUG', "Update SO Items location Sch", "END");
        }catch(e){
            nlapiLogExecution('ERROR', "Error At Processing SO sch", e.toString());
            return false;
        }
        return true;
    }

     processorder(soid) {
        try {
            let updLocSo = new UpdateItemLocationSO();
            let id = updLocSo.processOrder(soid);
        }catch(e){
            nlapiLogExecution('ERROR', "Error At Processing SO "+soid, e.toString());
        }

    }

    static main(args) {
        let success = (new UpdateSOItemLocation()).scheduled(args);
        if (success) {
            nlapiLogExecution('DEBUG',"Schedule script Status", "SUCCESSFUL");
        }
        else {
            nlapiLogExecution('DEBUG',"Schedule script Status", "FAILED");
        }
    }
}