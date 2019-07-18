var express = require('express');
var router = express.Router();

var moment = require('moment');
require('moment-timezone');

var mysql = require('mysql');
var bodyParser = require('body-parser');

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

var yy = moment().tz("Asia/Seoul").format('YYYY');
var mm = moment().tz("Asia/Seoul").format('MM');
var dd = moment().tz("Asia/Seoul").format('DD');

var eve_or_iss_state; //0:event, 1:issue
var eve_or_iss_sql = [];
eve_or_iss_sql[0] = 'SELECT * FROM event_tbl WHERE (end_year > '+yy+') OR (end_year = '+yy+' AND end_month > '+mm+') OR (end_year = '+yy+' AND end_month = '+mm+' AND end_day >= '+dd+') ORDER BY start_year, start_month, start_day ASC';
eve_or_iss_sql[1] = 'SELECT t1.id, t1.MCC, t1.MNC, t1.year, t1.month, t1.day, t2.country_name, t3.operator_name, t1.contents FROM issue_tbl t1, country_list t2, operator_list t3 WHERE t1.MCC=t2.MCC AND (t1.MCC=t3.MCC AND t1.MNC=t3.MNC) ORDER BY year DESC, month DESC, day DESC LIMIT 5';

var sql = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count AS subs_count_LTE, t5.subs_count AS subs_count_3G, t4.dra_name FROM operator_list t1, country_list t2, ob_lte_subs t3, dra_list t4, ob_3g_subs t5 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) AND t1.dra = t4.dra AND (t1.MCC = t5.MCC AND t1.MNC = t5.MNC) ORDER BY t3.subs_count DESC';
var rows = [];
var rows_all = [];
var rows_c = [];
var rows_eve_or_iss = [];
var tmp = [];

var sql_op_all = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count AS ob_subs_count_LTE, t5.subs_count AS ob_subs_count_3G, t6.subs_count AS ib_subs_count_LTE, t7.subs_count AS ib_subs_count_3G, t4.dra_name  FROM operator_list t1, country_list t2, ob_lte_subs t3, dra_list t4, ob_3g_subs t5, ib_lte_subs t6, ib_3g_subs t7 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) AND t1.dra = t4.dra AND (t1.MCC = t5.MCC AND t1.MNC = t5.MNC)  AND (t1.MCC = t6.MCC AND t1.MNC = t6.MNC) AND (t1.MCC = t7.MCC AND t1.MNC = t7.MNC) ORDER BY t3.subs_count DESC limit 6';

connection.query(sql_op_all+';', function(err, rows1, fields){
  if(err){
      console.log(err);
    }

  for(var i=0; i<rows1.length; i++){
          rows1[i].date = moment().tz(rows1[i].LOC1 + "/" + rows1[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
          rows1[i].ob_subs_count_LTE_string = numberWithCommas(rows1[i].ob_subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
          rows1[i].ob_subs_count_3G_string = numberWithCommas(rows1[i].ob_subs_count_3G);
          rows1[i].ib_subs_count_LTE_string = numberWithCommas(rows1[i].ib_subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
          rows1[i].ib_subs_count_3G_string = numberWithCommas(rows1[i].ib_subs_count_3G);
    }

  //전역 변수인 rows로 옮기기
  rows_all = rows1;
  rows_all = rows_all.slice(0);
});

connection.query(sql+' LIMIT 14;', function(err, rows1, fields){
  if(err){
      console.log(err);
    }

  for(var i=0; i<rows1.length; i++){
          rows1[i].date = moment().tz(rows1[i].LOC1 + "/" + rows1[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
          rows1[i].subs_count_LTE_string = numberWithCommas(rows1[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
          rows1[i].subs_count_3G_string = numberWithCommas(rows1[i].subs_count_3G);
    }

  //전역 변수인 rows로 옮기기
  rows = rows1;
  rows = rows.slice(0);

});

function connection_query_EVE_or_ISS(){
  connection.query(eve_or_iss_sql[eve_or_iss_state]+';', function(err, rows1, fields){
    if(err){
        console.log(err);
      }
    rows_eve_or_iss = rows1;
    rows_eve_or_iss = rows_eve_or_iss.slice(0);
  });
}

function connection_query_card(sql_para){

  connection.query(sql_para, function(err, rows2, fields){
    if(err){
        console.log(err);
      }

    for(var i=0; i<rows2.length; i++){
        rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
        rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
        rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
    }
    console.log(rows2);

    //return rows2; 가 안되길래 rows_c라는 전역변수 하나 만들어 사용함
    rows_c =  rows2;
    rows_c = rows_c.slice(0);
  });
}



/* GET home page. */
router.get('/', function(req, res, next) {
  eve_or_iss_state = 0;
  connection_query_EVE_or_ISS();
  setTimeout(function(){
     res.render('index.jade', { rows: rows, rows_all: rows_all, events : rows_eve_or_iss, issues : tmp});
     console.log(rows_all)
  }, 1000);


});


router.get('/roaming_api/v1/card_subs', function(req, res, next){

  var string =  req.query.data_checked;
  var cond = [];

  console.log(string);

  var type = string.substring(0,2); //type만 잘라내려고 앞에서 2개 자름
  console.log(type);

  switch (type) {
    case '01' : //체크박스에서 넘어온 MCC와 MNC
      var jArr = JSON.parse(string.substring(2,string.length)); //JSON.parse()는 string으로 넘어온 데이터를 다시 json형태로 바꿔주는 것

      for(var i=0; i < jArr.length; i++){
          //var condition = [];
          //if(jArr[i].MCC != null) {condition.push("a1.MCC="+arr[i].MCC);}
          //if(jArr[i].MNC != null) {condition.push("a1.MNC="+arr[i].MNC);}
          cond.push("a1.MCC="+jArr[i].MCC+" AND a1.MNC="+jArr[i].MNC);
          //cond.push(condition);
          console.log(cond);
      }

      var condition_string = "";

      for (var i=0; i<cond.length; i++) {
        condition_string += '(' + cond[i];

        if (i==cond.length-1){ condition_string += ")"; }
        else{ condition_string = condition_string + ") OR "; }

        console.log(condition_string);
      }

      var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +' order by subs_count_LTE desc ;';

      connection_query_card(sql_para);
      //connection_query_card하는데 시간이 좀 걸려서 바로 res.render하는 경우 빈 값이 넘어가서 1초 강제로 기다린 후 동작하게 만들었음
      setTimeout(function(){
         res.render('update_card.jade', {rows : rows_c});
      }, 1000);

      break;

    //검색 type == 국가
    case '03' :
      console.log('선택한 값은 국가입니다.');

      var val = string.substring(2,string.length);
      console.log(val);
      var condition_string = "a1.country_name LIKE \'%"+val+"%\'"; // ex)a1.country_name LIKE '%미국%'
      var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +' order by subs_count_LTE desc ;';

      connection_query_card(sql_para);
      //connection_query_card하는데 시간이 좀 걸려서 바로 res.render하는 경우 빈 값이 넘어가서 1초 강제로 기다린 후 동작하게 만들었음
      setTimeout(function(){
         res.render('update_card.jade', {rows : rows_c});
      }, 1000);

      break;

    //검색 type == 사업자
    case '04' :
      console.log('선택한 값은 사업자명입니다.');

      var val = string.substring(2,string.length);
      console.log(val);
      var condition_string = "upper(a1.operator_name) LIKE upper(\'%"+val+"%\')"; // t만 치고 검색했을 때 이름에 t 또는 T 가 있는 경우 모두 출력되도록 하기 위함
      var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +' order by subs_count_LTE desc ;';

      connection_query_card(sql_para);
      //connection_query_card하는데 시간이 좀 걸려서 바로 res.render하는 경우 빈 값이 넘어가서 1초 강제로 기다린 후 동작하게 만들었음
      setTimeout(function(){
         res.render('update_card.jade', {rows : rows_c});
      }, 1000);

      break;


    case '05' :
      console.log('선택한 값은 중계사업자명입니다.');

      var val = string.substring(2,string.length);
      console.log(val);
      var condition_string = "upper(a1.dra_name) LIKE upper(\'%"+val+"%\')";
      var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +' order by subs_count_LTE desc ;';

      connection_query_card(sql_para);
      //connection_query_card하는데 시간이 좀 걸려서 바로 res.render하는 경우 빈 값이 넘어가서 1초 강제로 기다린 후 동작하게 만들었음
      setTimeout(function(){
         res.render('update_card.jade', {rows : rows_c});
      }, 1000);

      break;


    default :
      console.log('선택한 값이 없습니다.');
      break;
  }
});

//이벤트 조회(GET)
router.get('/roaming_api/v1/event', function(req, res, next) {

  var string = req.query.event_data;

  var type = string.substring(0,2); //type만 잘라내려고 앞에서 2개 자름
  console.log(type);

  switch(type){
    case '00' :
      eve_or_iss_state = 0;
      connection_query_EVE_or_ISS();
      setTimeout(function(){
         res.render('update_events.jade', {events : rows_eve_or_iss});
      }, 1000);
      break;

    case '01' : //이벤트 조회
      var json = JSON.parse(string.substring(2,string.length));
      var json_length = Object.keys(json).length;
      var condition_string = "";
      var i=0;

      for(var key in json){
        if(++i == json_length){
          if(key == 'contents'){
            condition_string += "upper(contents) LIKE upper(\'%"+json[key]+"%\')" ;
            break;
          }
          condition_string += key +"="+ json[key];
          break;
        }
        condition_string += key +"="+ json[key] + " AND ";
      }

      var sql_para = 'SELECT * FROM event_tbl WHERE '+condition_string+ ";";

      console.log(sql_para);

      connection.query(sql_para, function(err, rows2, fields){
        if(err){
            console.log(err);
            //res.send(rows2);
        }
        else{
          console.log(rows2);
          res.render('update_events.jade', {events : rows2});
        }
      });

      break;


    case '02' : //이벤트 전체 조회
      var sql_para = "SELECT * FROM event_tbl;";

      connection.query(sql_para, function(err, rows2, fields){
        if(err){
            console.log(err);
            //res.send(rows2);
        }
        else{
          console.log(rows2);
          res.render('update_events.jade', {events : rows2});
        }
      });

      break;

    default :
      console.log('선택한 값이 없습니다.');
      break;
  }

});

//이벤트 추가, 삭제, 수정(POST)
router.post('/roaming_api/v1/event', function(req, res, next) {

  var string = req.body.event_data;

  var type = string.substring(0,2); //type만 잘라내려고 앞에서 2개 자름
  console.log("타입 : " + type);

  var json = JSON.parse(string.substring(2,string.length));

  console.log(json);

  switch(type){
    case '02' : //이벤트 추가
        var condition_string = "";

        for(var key in json){
          if(key == 'contents'){
            condition_string += "\'"+ json[key] + "\'";
            break;
          }
          condition_string += json[key] + ", ";
        }

        console.log(condition_string);

        var sql_para = 'INSERT INTO event_tbl(start_year, end_year, start_month, end_month, start_day, end_day, contents) VALUES(' + condition_string + ');';

        console.log(sql_para);

        connection.query(sql_para, function(err, rows2, fields){
          if(err){
              console.log(err);
              res.send({"성공여부" : 0});
          }
          else{
            res.send({"성공여부" : 1});
          }
        });

        break;


    case '03' : //이벤트 수정
        var condition_string = "";

        for(var key in json){
          if(key == 'id'){
            continue;
          }

          if(key == 'contents'){
            condition_string += "contents=\'"+ json[key] + "\'";
            break;
          }
          condition_string += key+"="+json[key]+", ";
        }

        console.log(condition_string);

        var sql_para = 'UPDATE event_tbl SET ' + condition_string + ' WHERE id='+json.id+';';

        console.log(sql_para);

        connection.query(sql_para, function(err, rows2, fields){
          if(err){
              console.log(err);
              res.send({"성공여부" : 0});
          }
          else{
            res.send({"성공여부" : 1});
          }
        });

        break;

    case '04' : //이벤트 삭제

        var sql_para = 'DELETE FROM event_tbl WHERE id=' + json.id + ';';

        console.log(sql_para);

        connection.query(sql_para, function(err, rows2, fields){
          if(err){
              console.log(err);
              res.send({"성공여부" : 0});
          }
          else{
            res.send({"성공여부" : 1});
          }
        });

        break;

    default :
      console.log('선택한 값이 없습니다.');
      break;
  }

});

//issue 조회
router.get('/roaming_api/v1/issue', function(req, res, next) {

  var string = req.query.issue_data;

  var type = string.substring(0,2); //type만 잘라내려고 앞에서 2개 자름
  console.log(type);

  switch(type){
      case '00' :
        eve_or_iss_state = 1;
        connection_query_EVE_or_ISS();
        setTimeout(function(){
           res.render('update_issue.jade', {issues : rows_eve_or_iss});
        }, 1000);
        break;

      default :
        console.log('선택한 값이 없습니다.');
        break;
    }

  });

module.exports = router;
