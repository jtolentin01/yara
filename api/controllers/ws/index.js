const wsUserInit = require('./ws_user');

const wsOnInit = async (data, io) => {
    switch(data.reqType){
        case 1: 
            return await wsUserInit(io, data);
        default:
            console.log('unknown request');     
            return 'unknown request';   
    }
}

module.exports = wsOnInit;
