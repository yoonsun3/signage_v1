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


router.get('/roaming_api/v1/card_subs', function(req, res, next){
  console.log(req.query.mcc)


});
/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  var sql = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t1.country_name, t1.LOC1, t1.LOC2, t2.subs_count FROM (SELECT op.MCC, op.MNC, op.operator_name, co.country_name, co.LOC1, co.LOC2 FROM operator_list AS op JOIN country_list AS co WHERE op.MCC = co.MCC) t1 LEFT JOIN (SELECT op.MCC, op.MNC, lt.subs_count FROM operator_list AS op JOIN ob_lte_subs AS lt ON op.MNC = lt.MNC AND op.MCC = lt.MCC) t2 ON t1.MCC = t2.MCC AND t1.MNC = t2.MNC ORDER BY t2.subs_count DESC;';

  var temp = [ {
    MCC: '466',
    MNC: '97',
    operator_name: 'Taiwan mobile',
    country_name: '대만',
    LOC1: 'Asia',
    LOC2: 'Taipei',
    subs_count: 40000 },
  {
    MCC: '214',
    MNC: '05',
    operator_name: 'Telefonica Moviles Espana S.A.',
    country_name: '스페인',
    LOC1: 'Europe',
    LOC2: 'Madrid',
    subs_count: 5000 },
   {
    MCC: '262',
    MNC: '06',
    operator_name: 'Telekom Deutschland Tmobile DTAG',
    country_name: '독일',
    LOC1: 'Europe',
    LOC2: 'Berlin',
    subs_count: 4000 },
  {
    MCC: '452',
    MNC: '04',
    operator_name: 'Viettel Telecom',
    country_name: '베트남',
    LOC1: 'Asia',
    LOC2: 'Saigon',
    subs_count: 2300 },
   {
    MCC: '440',
    MNC: '10',
    operator_name: 'NTT DoCoMo',
    country_name: '일본',
    LOC1: 'Asia',
    LOC2: 'Tokyo',
    subs_count: 670 },
   {
    MCC: '460',
    MNC: '01',
    operator_name: 'China Unicom',
    country_name: '중국',
    LOC1: 'Asia',
    LOC2: 'Shanghai',
    subs_count: 600 },
  {
    MCC: '452',
    MNC: '01',
    operator_name: 'Mobifone Corporation',
    country_name: '베트남',
    LOC1: 'Asia',
    LOC2: 'Saigon',
    subs_count: 310 },
   {
    MCC: '440',
    MNC: '20',
    operator_name: 'Softbank Mobile',
    country_name: '일본',
    LOC1: 'Asia',
    LOC2: 'Tokyo',
    subs_count: 100 },
    {
    MCC: '310',
    MNC: '240',
    operator_name: 'T-mobile USA',
    country_name: '미국',
    LOC1: 'America',
    LOC2: 'New_York',
    subs_count: 53 },
    {
    MCC: '310',
    MNC: '410',
    operator_name: 'AT&T',
    country_name: '미국',
    LOC1: 'America',
    LOC2: 'New_York',
    subs_count: null } ]

  connection.query(sql, function(err, rows, fields){
    if(err){
        console.log(err);
        res.render('index.jade', { rows: temp, date1:date_seoul})
      }

    res.render('index.jade', { rows: rows, subs_count: '30,000 / 5,000', subs_count_LTE : '30,000', subs_count_3G : '5,000', date1: date_seoul, date2: date_ny });
    console.log(rows);
  });

});


module.exports = router;
