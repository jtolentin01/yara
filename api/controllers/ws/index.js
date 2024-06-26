const wsBatchInit = require('./ws_batch');

const wsOnInit = async (data, io) => {
    switch(data.reqType){
        case 1: 
            console.log('request for user!');
            return 'request for user!';
        case 2:
            return await wsBatchInit(io); 
        default:
            console.log('unknown request');     
            return 'unknown request';   
    }
}

module.exports = wsOnInit;
