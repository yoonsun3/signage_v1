var express = require('express');
var router = express.Router();
var moment = require('moment');
require('moment-timezone')

/*var date_seoul = moment().tz('Asia/Seoul').format('YY-MM-DD HH:mm:ss');
var date_ny = moment().tz('America/New_York').format('YY-MM-DD HH:mm:ss');
*/

var mysql = require('mysql');

//3자리 콤마 찍는 함수
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var connection = mysql.createConnection({
    host : 'localhost', //서버 로컬 IP
    port : 3306,
    user : "root", //계정 아이디
    password : "1234", //계정 비밀번호
    database : "signage_v1" //접속할 DB
})

connection.connect(function(err) {
  if(err){
    console.log(err);
    return;
  }

});

var sql = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t1.country_name, t1.LOC1, t1.LOC2, t2.subs_count FROM (SELECT op.MCC, op.MNC, op.operator_name, co.country_name, co.LOC1, co.LOC2 FROM operator_list AS op JOIN country_list AS co WHERE op.MCC = co.MCC) t1 LEFT JOIN (SELECT op.MCC, op.MNC, lt.subs_count FROM operator_list AS op JOIN ob_lte_subs AS lt ON op.MNC = lt.MNC AND op.MCC = lt.MCC) t2 ON t1.MCC = t2.MCC AND t1.MNC = t2.MNC ORDER BY t2.subs_count DESC';
var rows = [];


connection.query(sql+';', function(err, rows1, fields){
  if(err){
      console.log(err);
    }

  for(var i=0; i<rows1.length; i++){
          rows1[i].date = moment().tz(rows1[i].LOC1 + "/" + rows1[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
          rows1[i].subs_count_string = numberWithCommas(rows1[i].subs_count); //3자리마다 , 넣기 위해 문자열로 바꿈
    }

  //전역 변수인 rows로 옮기기
  rows = rows1;
  rows = rows.slice(0);

});

router.get('/roaming_api/v1/table_subs', function(req, res, next){
  //console.log(req.query.mcc)

  var mcc1 = req.query.mcc1.toString();
  var mnc1 = req.query.mnc1.toString();
  var mcc2 = req.query.mcc2.toString();
  var mnc2 = req.query.mnc2.toString();
  
  var sql2 = 'SELECT * FROM (' + sql + ') a1 WHERE (a1.MCC=? AND a1.MNC=?) or (a1.MCC=? AND a1.MNC=?)';

  connection.query(sql2+';', [mcc1,mnc1,mcc2,mnc2], function(err, rows1, fields){
    if(err){
        console.log(err);
      }

      console.log(rows1);

      for(var i=0; i<rows1.length; i++){
          rows1[i].date = moment().tz(rows1[i].LOC1 + "/" + rows1[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
          rows1[i].subs_count_string = numberWithCommas(rows1[i].subs_count); //3자리마다 , 넣기 위해 문자열로 바꿈
        }

      res.render('index.jade', {rows : rows1});
    });

});
/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index.jade', { rows: rows});

  //res.render('index', { title: 'Express' });
  /*
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
    subs_count: null } ]*/

});


module.exports = router;
