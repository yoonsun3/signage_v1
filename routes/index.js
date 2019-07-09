var express = require('express');
var router = express.Router();
var moment = require('moment');
require('moment-timezone')

var date_seoul = moment().tz('Asia/Seoul').format('MM-DD HH:mm:ss');
var date_ny = moment().tz('America/New_York').format('MM-DD HH:mm:ss')

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  res.render('index', { country1: 'Republic of Korea', operator1 : 'SKTelecom', date1: date_seoul, 
                        country2: 'USA', operator2 : 'AT&T', date2: date_ny,
                        subs_count: '30,000 / 5,000', subs_count_LTE : '30,000', subs_count_3G : '5,000' })

});


module.exports = router;
