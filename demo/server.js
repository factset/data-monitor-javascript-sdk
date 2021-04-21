const express = require('express');
const {getExternalFieldIds, once} = require('../dist/lib-modules/index');

require('dotenv').config({path: '../.env'});

const app = express();

app.route('/').all((req, res) => {
  const collection = once({
    symbols: ['FDS-USA', 'AMD-USA', 'NIO-USA', 'USDCNY-FX1'],
    fields: ['COMPANY_NAME', 'LAST_PRICE', 'HIGH', 'LOW'],
    options: {
      currency: 'local',
    },
    success: function(message, subscription) {
      console.log('success', message);
    },
    complete: function(error, message, subscription) {
      res.json({
        error,
        message
      });
    },
  })
});

const port = process.env.PORT || 8000;

app.listen(port, () => console.log('listening at port: ', port));

process.on('SIGINT', function() {
  process.exit(0);
});