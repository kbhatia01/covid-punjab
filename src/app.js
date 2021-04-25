const express = require('express')
const app = express()
const port = 3000
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://123000:123000@cluster0.f9dhi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const assert = require('assert');
var need
var moment = require('moment');
var supply
client.connect(err => {
    assert.equal(null, err);
    console.log('Connected successfully to server');


    need = client.db('covid').collection('need')
    supply = client.db('covid').collection('supply')


});

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

app.get('/need/:city', (req, res) => {
    try {
        var category = req.query.category
        var city = req.params.city
        data = need.find({ city: city, category: category, active:true }).sort({last:-1}).toArray(function (err, docs) {
            assert.equal(err, null);
            return res.json({ data: docs })
        })
    }

    catch (e) {
        console.log("error in get by city and category", e)
        return res.json({ error: "please enter city and categoty" })
    }
})

app.get('/supply/:city', (req, res) => {
    try {
        var category = req.query.category
        var city = req.params.city
        data = supply.find({ city: city, category: category, active:true }).sort({last:-1}).toArray(function (err, docs) {
            assert.equal(err, null);
            return res.json({ data: docs })
        })
    }

    catch (e) {
        console.log("error in get by city and category", e)
        return res.json({ error: "please enter city and category" })
    }
})



app.post('/addsupply', (req, res) => {
    body = req.body

    if (!body.number || !body.name || !body.city || !body.state  || !body.category) {
        console.log(!body.number , !body.name , !body.city ,!body.state  , !body.category)
        return res.status(500).json({ error: "name, category and number required" })
    }
    body.time = new Date()
    body.last = new Date()
    body.active = true

    supply.insertOne(body, (err, data) => {
        if (err) {
            console.log("err at addsupply", err)
            return res.status(500).json({ error: JSON.stringify(err) })
        }
        return res.status(200).json({ data: "added" });
    })

});

app.post('/addneed', (req, res) => {
    body = req.body
    if (!body.number || !body.name || !body.age || !body.category) {
        return res.status(500).json({ error: "name, age, category and number required" })
    }
    body.time = new Date()
    body.last = new Date()
    body.active = true
    need.insertOne(body, (err, data) => {
        if (err) {
            console.log("err at addsupply", err)
            return res.status(500).json({ error: JSON.stringify(err) })
        }
        return res.status(200).json({ data: "added" });
    })

});


app.put('/supply', (req, res) => {
    body = req.body

    if (!body.number || !body.name || !body.city || !body.state  || !body.category) {
        console.log(!body.number , !body.name , !body.city ,!body.state  , !body.category)
        return res.status(500).json({ error: "name, category and number required" })
    }
    body.last = new Date()
    supply.updateOne({_id:body['_id']},body, (err, data) => {
        if (err) {
            console.log("err at update supply", err)
            return res.status(500).json({ error: JSON.stringify(err) })
        }
        return res.status(200).json({ data: "updated" });
    })

});

app.put('/need', (req, res) => {
    body = req.body
    if (!body.id || !body.name || !body.age || !body.category) {
        return res.status(500).json({ error: "name, age, category and number required" })
    }
    body.last = new Date()
    need.updateOne({_id:body['_id']},body, (err, data) => {
        if (err) {
            console.log("err at update need", err)
            return res.status(500).json({ error: JSON.stringify(err) })
        }
        return res.status(200).json({ data: "updated" });
    })

});



app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send(' <h2 style="font-family: Malgun Gothic; color: darkred;">Ooops... Cant find what you are looking for!</h2>');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})