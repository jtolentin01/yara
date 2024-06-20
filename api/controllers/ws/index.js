const wsOnInit = async (data) => {
    
    switch(data.reqType){
        case 1: 
            console.log('request for user!');
            return 'request for user!';
        case 2:
            console.log('request for something!');
            return 'request for something!';
        default:
            console.log('unknown request');     
            return 'unknown request';   
    }
}

module.exports = wsOnInit;