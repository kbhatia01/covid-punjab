const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false";
const uri = "mongodb+srv://123000:123000@cluster0.f9dhi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const assert = require('assert');
const axios = require('axios');
const baseUlr = 'https://life-api.coronasafe.network/data/'
const urls = ['medicine', 'hospital_clinic_centre', 'oxygen']
let key_values = {
    'medicine': 'medicines',
    'hospital_clinic_centre': 'beds',
    'oxygen': 'oxygen'
}

// var winston = require('winston')
// var WinstonCloudWatch = require('winston-cloudwatch');
// // winston.add(new WinstonCloudWatch({
//     logGroupName: 'testing',
//     logStreamName: 'first'
// }));


var need
var supply
client.connect(err => {
    assert.equal(null, err);
    // winston.debug('Connected successfully to server');


    supply = client.db('covid').collection('supply')


});
async function fetchData() {
    for (let url of urls) {
        res = await axios.get(baseUlr + url + ".json")
        data = res.data
        console.log(url)
        if (data.data && data.data.length > 0) {
            for (let item of data.data) {
                let insert_data = {}
                if (url == "hospital_clinic_centre" && (item.phone1 || item.phone2)) {
                    insert_data.id = item.id
                    insert_data.number = item.phone1 || item.phone2
                    insert_data.name = item.name
                    insert_data.last = item.lastVerifiedOn || new Date()
                    insert_data.time = new Date()
                    if (item.availability)
                        insert_data.active = true
                    else
                        insert_data.active = false
                    insert_data.city = item.district
                    insert_data.state = item.state
                    insert_data.category = key_values[url]
                    insert_data.description = item.description

                }
                if (url == "medicine") {
                    insert_data.id = item.id
                    insert_data.number = item.phone1
                    insert_data.name = item.name
                    insert_data.last = item.lastVerifiedOn || new Date()
                    insert_data.time = new Date()
                    if (item.verifiedBy && !Array.isArray(item.verifiedBy))
                        insert_data.active = true
                    else
                        insert_data.active = false
                    insert_data.city = item.city || item.district
                    insert_data.state = item.state
                    insert_data.category = key_values[url]
                    insert_data.description = item.description
                }
                if (url == "oxygen") {
                    insert_data.id = item.id
                    insert_data.number = item.phone1 || item.phone2
                    insert_data.name = item.name
                    insert_data.last = item.lastVerifiedOn || new Date()
                    insert_data.time = new Date()
                    if (item.availability)
                        insert_data.active = true
                    else
                        insert_data.active = false
                    insert_data.city = item.city || item.district
                    insert_data.state = item.state
                    insert_data.category = key_values[url]
                    insert_data.description = item.description
                }

                if (insert_data && insert_data.number)
                    try{
                   await supply.updateOne({ id: item.id }, { $set: insert_data }, { upsert: true })
                }
                catch(e){
                    console.log(e)
                }
            }
        }
    }
    process.exit(0)
}

 fetchData()
// process.exit(0)