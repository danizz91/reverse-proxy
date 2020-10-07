const express = require("express");
const _ = require('lodash');
const app = express();

const asyncHandler = require('express-async-handler');
const bodyParser = require('body-parser')
const request = require('request');
var mongoose = require('./node_modules/mongoose');
require('./src/db/mongoose')
const ObjectId = require('mongoose').Types.ObjectId;
const Service = require('./src/models/service')
const utils = require('./src/utils/utils')

app.use(bodyParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

getRoutesAndExpose();

app.post('/api/v1/services', asyncHandler(async (req, res) => {
    let url = req.body.url;
    let path = req.body.path;
    let newService = new Service();
    if (path) {
        newService.url = url;
        newService.methods = [];
        newService.paths.push(path)
        newService.createDate = {type: new Date(), default: new Date(0)};
        await newService.save();
        if (newService && newService._id) {
            return res.json({'_id': newService._id});
        } else {
            return res.json({status: "error", errorMessage: "CANNOT_FIND_ID_OR_NEWSERVICE"})
        }
    }

    res.json({result: false, errorMessage: 'Cannot find Paths'});
}))

app.post('/api/v1/services/:serviceId/routes', asyncHandler(async (req, res) => {
    const serviceId = req.params.serviceId;
    const paths = req.body.paths.toString().split(',');
    const methods = req.body.methods.toString().split(',');

    //validation

    //check if service ID Exists
    if (mongoose.isValidObjectId(serviceId)) {
        //check if path + methods sent
        if (!paths || _.isEmpty(paths)) {
            return res.json({result: false, errorMessage: 'Cannot find Paths'});
        }

        //check if path + methods sent
        if (!methods || _.isEmpty(methods)) {
            return res.json({result: false, errorMessage: 'Cannot find Paths'});
        }
        // check if valid method
        if (!utils.isAllowMethods(methods)) {
            return res.json({result: false, errorMessage: 'Not valid methods'});
        }
    } else {
        return res.json({result: false, errorMessage: 'Wrong ObjectID!'});
    }

    console.log('Validation pass!')
    //Update Service
    const resultUpdate = await Service.findOneAndUpdate({_id:serviceId},{paths:paths,methods:methods})
    console.log(resultUpdate)

    if(!resultUpdate){
        return res.json({result: false, errorMessage: 'cant find ID!'});
    }


    res.json({result: true, errorMessage: ''});
}))

async  function  getRoutesAndExpose() {

    let routes = await Service.find({}).select({paths:1});

     for (let indexRoute in routes) {
            let routeRow = routes[indexRoute].paths;
            for (let routeSingleIndex in routeRow){
                let routeSingle = routeRow[routeSingleIndex];
                 genericRoute(routeSingle);
            }
     }
}

async function genericRoute(route) {
    console.log('ROUTE -> ', route);
    app.all(route, asyncHandler(async (req, res) => {
        console.log('ROUTE:', route);
        let serivieRoute =   await Service.findOne({'paths':route});
        if (serivieRoute==null)
            return res.json({result: false, errorMessage: 'cant find service for route -> '+ route});
        console.log('Found Service ID = ' + serivieRoute._id );

        //validate method
        const methods = serivieRoute.methods;
        const url = serivieRoute.url;
        const currentMethod = req.method;
        if (methods.indexOf(currentMethod)===-1){
            return res.json({result: false, errorMessage: 'Method ' + currentMethod + ' Not Allowed'});

        }

        let dist = `${url}${req.originalUrl}`;

        console.log('target -> ' + dist);
        //all validation fine
             const options = {
         url: dist,
         method: req.methods,
         headers: {
            'Accept': 'application/json',
            'Accept-Charset': 'utf-8',
            'User-Agent': req.get('User-Agent')
        }
    }
     request(options, function (err, serverRes, body) {
         const contentType = serverRes.headers['content-type'];
         res.setHeader('content-type', contentType);
         res.send(body);


    })




    }))
}



// app.all('/anythin1g/:id', asyncHandler(async (req, res) => {
//     let urlString = req.url.toString().split('/')
//     const path = urlString[1]
//     const serviceID = req.params.id
//     let clientRes
//
//
//     if (!utils.isNumeric(serviceID)) {
//         return res.json({result: false, errorMessage: 'Wrong input ! can get only numbers!'});
//     }
//
//     console.log(`path: ${path} serviceId: ${serviceID}`)
//     // Check if route is vaild
//
//     let findRoute = await Service.findOne(path: path})
//     console.log(findRoute)
//     let test = findRoute['routeToMethods'].filter(it => it['route'] === path && it['methods'].includes(req.method))
//     if (test === undefined || test.length == 0) {
//         return res.json({result: false, errorMessage: 'That route not support that method!'});
//     }
//     console.log(test)
//     console.log("blala")
//
//     if (!findRoute) {
//         return res.json({result: false, errorMessage: 'Cannot find, Invalid route!'});
//     }
//     // Check if that route have that method
//

//
//     return res.send(clientRes)
// }))






app.listen(3000, '0.0.0.0', () => {
    console.log("Server running on port 3000");
});