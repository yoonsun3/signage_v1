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
    host : '18.219.212.108', //서버 로컬 IP
    port : 3306,
    user : "skt", //계정 아이디
    password : "skt1234", //계정 비밀번호
    database : "signage_v1" //접속할 DB
})

connection.connect(function(err) {
  if(err){
    console.log(err);
    return;
  }
});

var sql = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count FROM operator_list t1, country_list t2, ob_lte_subs t3 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) ORDER BY t3.subs_count DESC';
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

/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index.jade', { rows: rows, rows_all: rows});

});


router.get('/roaming_api/v1/card_subs', function(req, res, next){

  //var condition = [];
  var cond =[];

  var arr = [];
  var arr_temp = [];
  //var arr_temp2 = [];
  //var result = new Object();
  //var resultAtrr = [];
  console.log(req.query.data);
  var data = JSON.parse(req.query.data);
  console.log(data);
  //arr = totalJson.arr;

  /*
  var req_string = req.query.data;
  console.log(req_string);
  arr_temp = req_string.split('+');

  for(var i=0; i<arr_temp.length; i++){
    arr_temp2 = arr_temp.split('-');
    if(arr_temp2[0] != null) {arr[0].MCC = arr_temp2[0];}
    if(arr_temp2[1] != null) {arr[0].MNC = arr_temp2[1];}
  }*/


  
  for(var i=0; i<Object.keys(data).length; i++){
      var json = new Object();
      arr_temp = data[i].split('-');
      console.log(arr_temp);
      if(arr_temp[0] != null) {json.MCC = arr_temp[0];}
      if(arr_temp[1] != null) {json.MNC = arr_temp[1];}
      arr.push(json);
      console.log(arr);
  }



  for(var i=0; i < arr.length; i++){
      var condition = [];
      if(arr[i].MCC != null) {condition.push("a1.MCC="+arr[i].MCC);}
      if(arr[i].MNC != null) {condition.push("a1.MNC="+arr[i].MNC);}
      cond.push(condition);
      console.log(cond);
  }



  //if (req.query.mcc != null)  { condition.push("a1.MCC="+req.query.mcc)}
  //if (req.query.mnc != null)  { condition.push("a1.MNC="+req.query.mnc)}

  //var mcc2 = req.query.mcc2.toString();
  //var mnc2 = req.query.mnc2.toString();

  //var sql2 = 'SELECT * FROM (' + sql + ') a1 WHERE (a1.MCC=? AND a1.MNC=?) or (a1.MCC=? AND a1.MNC=?)';

  var condition_string = "";
  for(var j=0; j<cond.length;j++){
    for (var i=0; i<cond[j].length; i++) {
      condition_string+=cond[j][i];
      if (i<cond[j].length-1) condition_string+=" AND ";
    }
    if (j<cond.length-1) {condition_string = '(' + condition_string + ") OR (";}
    else {
      for(var k=0; k<cond.length-1; k++)
          condition_string += ")";
    }
    console.log(condition_string);
  }


  var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +'order by subs_count desc ;';

  //var sql2 = 'SELECT * FROM (' + sql + ') a1 WHERE (a1.MCC=? AND a1.MNC=?)';


  connection.query(sql_para, function(err, rows2, fields){
    if(err){
        console.log(err);
      }

      for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              rows2[i].subs_count_string = numberWithCommas(rows2[i].subs_count); //3자리마다 , 넣기 위해 문자열로 바꿈
        }
      console.log(rows2);
      res.render('index.jade', { rows: rows2, rows_all: rows});
    });

});

module.exports = router;
