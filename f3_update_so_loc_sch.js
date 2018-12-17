/**
 * Schedule script for update item location in NS Sales Order
 * Created By Zaid
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
///<reference path="./f3_base_sch.ts"/>
///<reference path="./f3_update_so_loc_lib.ts"/>
var UpdateSOItemLocation = /** @class */ (function (_super) {
    __extends(UpdateSOItemLocation, _super);
    function UpdateSOItemLocation() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    //Script Start
    UpdateSOItemLocation.prototype.scheduled = function (args) {
        try {
            nlapiLogExecution('DEBUG', "Update SO Items location Sch", "START");
            var context = nlapiGetContext();
            // let index;
            // if(context.getSetting('SCRIPT', 'custscript_f3_so_loc_upd_index')){
            //     index = context.getSetting('SCRIPT', 'custscript_f3_so_loc_upd_index');
            // }
            // nlapiLogExecution('DEBUG', "INDEX ", index);
            //Getting list of Sales order to process
            var updLocSo = new UpdateItemLocationSO();
            var soList = updLocSo.getSalesOrder();
            nlapiLogExecution('DEBUG', "SALES ORDER IDS TO PROCESSED ", JSON.stringify(soList));
            for (var i = 0; i < soList.length; i++) {
                this.processorder(soList[i]);
                // reschedule
                if (this.rescheduleIfNeeded())
                    return true;
            }
            nlapiLogExecution('DEBUG', "Update SO Items location Sch", "END");
        }
        catch (e) {
            nlapiLogExecution('ERROR', "Error At Processing SO sch", e.toString());
            return false;
        }
        return true;
    };
    UpdateSOItemLocation.prototype.processorder = function (soid) {
        try {
            var updLocSo = new UpdateItemLocationSO();
            var id = updLocSo.processOrder(soid);
        }
        catch (e) {
            nlapiLogExecution('ERROR', "Error At Processing SO " + soid, e.toString());
        }
    };
    UpdateSOItemLocation.main = function (args) {
        var success = (new UpdateSOItemLocation()).scheduled(args);
        if (success) {
            nlapiLogExecution('DEBUG', "Schedule script Status", "SUCCESSFUL");
        }
        else {
            nlapiLogExecution('DEBUG', "Schedule script Status", "FAILED");
        }
    };
    return UpdateSOItemLocation;
}(BaseScheduled));
