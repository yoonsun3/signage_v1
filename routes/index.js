var express = require('express');
var router = express.Router();
var moment = require('moment');
require('moment-timezone')

var date_seoul = moment().tz('Asia/Seoul').format('YY-MM-DD HH:mm:ss');
var date_ny = moment().tz('America/New_York').format('YY-MM-DD HH:mm:ss');

var mysql = require('mysql');

var connection = mysql.createConnection({
    host : 'localhost', //서버 로컬 IP
    port : 3306,
    user : "root", //계정 아이디
    password : "", //계정 비밀번호
    database : "signage_v1" //접속할 DB
})

connection.connect(function(err) {
  if(err){
    console.log(err);
    return;
  }

});

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  var sql = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t1.country_name, t1.LOC1, t1.LOC2, t2.subs_count FROM (SELECT op.MCC, op.MNC, op.operator_name, co.country_name, co.LOC1, co.LOC2 FROM operator_list AS op JOIN country_list AS co WHERE op.MCC = co.MCC) t1 LEFT JOIN (SELECT op.MCC, op.MNC, lt.subs_count FROM operator_list AS op JOIN ob_lte_subs AS lt ON op.MNC = lt.MNC AND op.MCC = lt.MCC) t2 ON t1.MCC = t2.MCC AND t1.MNC = t2.MNC ORDER BY t2.subs_count DESC;';

  connection.query(sql, function(err, rows, fields){
    if(err){
        console.log(err);
      }

    res.render('index.jade', { rows: rows, subs_count: '30,000 / 5,000', subs_count_LTE : '30,000', subs_count_3G : '5,000', date1: date_seoul, date2: date_ny });
    console.log(rows);
  });

});


module.exports = router;
