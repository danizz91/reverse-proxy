
const request = require('request');
const Promise = require('bluebird');



async function doTheRequest(options) {
    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) {
                reject(error)
            }
            if (isJson(body)) {
                resolve(JSON.parse(body))
            } else {
                resolve(body);
            }
        });
    })

    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }


}

function isAllowMethods(methods) {
    const allowMethods = ['GET', 'POST', 'PATCH', 'DELETE', 'PUT']
    let result = true;
    methods.forEach(function(method){
        if (allowMethods.indexOf(method) === -1) {
            result=false;
            return;
        }
    });
    return result;
}


async function MethodRequest(req,url){
    const options = {
        url: url,
        method: req.method,
        headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'User-Agent': 'my-reddit-client'
        }
    };

    request(options, function(err, res, body) {

        let json = JSON.parse(body);
        console.log(json);
    });

}

function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}

module.exports = {
    MethodRequest: MethodRequest,
    isAllowMethods: isAllowMethods,
    isNumeric:isNumeric
}