const express = require('express');
const {once, dataPoint} = require('../dist/lib-modules/index');

require('dotenv').config({path: '../.env'});

const app = express();
app.use(express.json());

app.route('/').get((req, res) => {
  const collection = once({
    symbols: ['FDS-USA', 'AMD-USA', 'NIO-USA', 'USDCNY-FX1'],
    fields: ['COMPANY_NAME', 'LAST_PRICE', 'HIGH', 'LOW'],
    options: {
      currency: 'local',
    },
    complete: function(error, message, subscription) {
      res.json({
        error,
        message
      });
    },
    error: function(err) {
      console.log(err);
    }
  })

  console.log(collection);
});

app.route('/get-fields').post(async(req, res) => {
  const fields = req.body.fields;
  const resolvedFields = await dataPoint.get(fields);
  
  res.json({
    fields: resolvedFields,
  })
})

app.route('/register').post((req, res) => {
  console.log(req.body);
  const fields = req.body.fields;

  dataPoint.register(fields);
  res.send('registered');
})

const port = process.env.PORT || 8000;

app.listen(port, () => console.log('listening at port: ', port));

process.on('SIGINT', function() {
  process.exit(0);
});