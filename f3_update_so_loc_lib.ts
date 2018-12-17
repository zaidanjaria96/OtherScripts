/**
 * This is Library for UpdateSOItemLocation.
 */
class  UpdateItemLocationSO {
    private isprocessed = 'custbody_f3_isprocessed';
    private channelid = 'department';
    private lookuprecord  = 'customrecord_f3_item_location_lookup';

    /**
     * get Sales order list from netsuites to process
     * **/
    public  getSalesOrder(){
        try{
            nlapiLogExecution('DEBUG', "GET SALES ORDER LIST ", "START");
            let salesorderSearch = nlapiSearchRecord("salesorder",null,
                [
                    ["type","anyof","SalesOrd"],
                    "AND",
                    ["mainline","is","T"],
                    "AND",
                    [this.isprocessed,"is","F"],
                    "AND",
                    [this.channelid,"noneof","@NONE@"]
                    // "AND",
                    // ["taxline","is","F"],
                    // "AND",
                    // ["shipping","is","F"]
                ],
                [
                    new nlobjSearchColumn("internalid"),
                ]
            );

            let soIds =[];
            if(!!salesorderSearch){
                nlapiLogExecution('DEBUG', "Total Sales Orders : ", salesorderSearch.length);
                for(var i = 0 ; i< salesorderSearch.length ; i++ ){
                    soIds.push(salesorderSearch[i].getId());
                }
            }
            return soIds;
        }
        catch(e){
            throw "Error at getSalesorder "+e.toString();
        }

    }
    /**
     * Process single sales order and update it's line item location
     * **/
    public processOrder(soid){
        try{
            nlapiLogExecution('DEBUG', "Processing order ", soid);
            let record = nlapiLoadRecord('salesorder',soid);
            let channel = record.getFieldValue(this.channelid);
            let linecount = record.getLineItemCount('item');
            nlapiLogExecution('DEBUG', "Item linecount  ",linecount);

            let loc,item,clas,quantity;
            for(let i=0 ; i< linecount;i++)
            {
                 item = record.getLineItemValue('item', 'item', i+1);
                 clas = record.getLineItemValue('item', 'class', i+1);
                 quantity = parseInt(record.getLineItemValue('item','quantity',i+1));

                if(!!clas && !!channel ){
                    nlapiLogExecution('DEBUG', "Channel & Class",channel+"-- "+ clas);
                     loc = this.getLocationFromCustomRecord(channel,clas);

                    if (!!loc && !!loc.secondary && !!quantity) {
                        nlapiLogExecution('DEBUG', "Secondary location exist", JSON.stringify(loc));
                        let itemrec = nlapiLoadRecord('inventoryitem',item);

                        let locLineNo = itemrec.findLineItemValue('locations','location',loc.primary);
                        nlapiLogExecution("DEBUG","Quantity available primary",itemrec.getLineItemValue('locations','quantityavailable',locLineNo));

                        let qntyavailable = parseInt(itemrec.getLineItemValue('locations','quantityavailable',locLineNo)) || '';
                        nlapiLogExecution("DEBUG","Quantity Available on primary loc|| order quantity", qntyavailable + ' || '+ quantity);
                        if(!!qntyavailable && qntyavailable >= quantity){
                            nlapiLogExecution("DEBUG","Setting primary loc ",loc.primary);
                            record.setLineItemValue('item', 'location', (i + 1), loc.primary);
                            break;
                        }
                        else if(!!loc.secondary){
                            locLineNo = itemrec.findLineItemValue('locations','location',loc.secondary);
                            nlapiLogExecution("DEBUG","Quantity available secondary",itemrec.getLineItemValue('locations','quantityavailable',locLineNo));

                            let qntyavailable = parseInt(itemrec.getLineItemValue('locations','quantityavailable',locLineNo)) || '';
                            nlapiLogExecution("DEBUG","Quantity Available on Sec loc|| order quantity", qntyavailable + ' || '+ quantity);
                            if(!!qntyavailable && qntyavailable >= quantity){
                                nlapiLogExecution("DEBUG","Setting Sec loc ",loc.secondary);
                                record.setLineItemValue('item', 'location', (i + 1), loc.secondary);
                                break;
                            }
                        }
                        record.setLineItemValue('item', 'location', (i + 1), loc.primary);

                    }
                    else if(!!loc){
                        record.setLineItemValue('item', 'location', (i + 1), loc.primary);
                    }

                }
                else
                    nlapiLogExecution('DEBUG', "Enter Class for item "+item,"");
            }
            record.setFieldValue(this.isprocessed,'T');
            let id = nlapiSubmitRecord(record,true);
            nlapiLogExecution('DEBUG', "Record Updated ",id);
            return id;
        }catch(e){
            throw e.toString();
        }

    }

    /**
     *search and get particular location from lookup record on bases of channel and class.
     */
    public getLocationFromCustomRecord(channel,clas){
        try{
            let rec = nlapiSearchRecord(this.lookuprecord,null,
                [
                    ["custrecord_f3_channel","is",channel],
                    "AND",
                    ["custrecord_f3_item_class","is",clas]
                ],
                [
                    new nlobjSearchColumn("custrecord_f3_item_location"),
                    new nlobjSearchColumn("custrecord_f3_item_sec_loc")
                ]
            );
            if(!!rec && rec.length > 0){
                // nlapiLogExecution('DEBUG', " Custom Record Count  ",rec.length);
                var loc = { primary : '', secondary : ''};
                loc.primary = rec[0].getValue('custrecord_f3_item_location');
                loc.secondary = rec[0].getValue('custrecord_f3_item_sec_loc');
                nlapiLogExecution('DEBUG', "Location Search res", JSON.stringify(loc));
                return loc;
                // let loc = rec[0].getValue('custrecord_f3_item_location');
            }
            else
                throw "Location Not found of this combination "+channel+"--"+clas;
        }
        catch(e){
            nlapiLogExecution('ERROR', "Error At Getting Location", e.toString());
        }

    }
}