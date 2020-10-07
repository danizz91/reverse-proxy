const mongoose = require('mongoose')
const moment = require('moment');
var now = moment()
let currettime = now.add(3, 'hours')


const Service = mongoose.model('Service', {
    paths:{type:[String]},
    methods:{type:[String]},
    url: {
        type: String
    },
    createdDate: {
        type: Date,
        default: currettime
    }
})


module.exports = Service