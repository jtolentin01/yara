const wsBatchInit = require('./ws_batch');
const wsUserInit = require('./ws_user');

const wsOnInit = async (data, io) => {
    switch(data.reqType){
        case 1: 
            return await wsUserInit(io,data);
        case 2:
            return await wsBatchInit(io); 
        default:
            console.log('unknown request');     
            return 'unknown request';   
    }
}

module.exports = wsOnInit;
