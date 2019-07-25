var express = require('express');
var router = express.Router();

var moment = require('moment');
require('moment-timezone');

var mysql = require('mysql');
var bodyParser = require('body-parser');
//var async = require('async');

//3자리 콤마 찍는 함수
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var connection = mysql.createConnection({
    host : '18.219.212.108', //서버 로컬 IP
    port : 3306,
    user : "skt", //계정 아이디
    password : "skt1234", //계정 비밀번호
    database : "iris" //접속할 DB
})

connection.connect(function(err) {
  if(err){
    console.log(err);
  }
})

var yy = moment().tz("Asia/Seoul").format('YYYY');
var mm = moment().tz("Asia/Seoul").format('MM');
var dd = moment().tz("Asia/Seoul").format('DD');

var eve_or_iss_state; //0:event, 1:issue
var eve_or_iss_sql = [];
eve_or_iss_sql[0] = 'SELECT * FROM event_tbl WHERE (end_year > '+yy+') OR (end_year = '+yy+' AND end_month > '+mm+') OR (end_year = '+yy+' AND end_month = '+mm+' AND end_day >= '+dd+') ORDER BY start_year, start_month, start_day ASC';
//eve_or_iss_sql[1] = 'SELECT t1.id, t1.MCC, t1.MNC, t1.year, t1.month, t1.day, t1.contents, t2.country_name, t3.operator_name FROM issue_tbl t1, country_list t2, operator_list t3 WHERE t1.MCC=t2.MCC AND (t1.MCC=t3.MCC AND t1.MNC=t3.MNC) ORDER BY year DESC, month DESC, day DESC';
eve_or_iss_sql[1] = 'SELECT id, MCC, MNC, country_name, operator_name, year, month, day, contents FROM issue_tbl ORDER BY year DESC, month DESC, day DESC';

var ob_ib_state=0; //0:OB, 1:IB
var sql= [];
sql[0] = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count AS subs_count_LTE, t5.subs_count AS subs_count_3G, t3.subs_count+t5.subs_count AS subs_count_Total, t4.dra_name FROM operator_list t1, country_list t2, ob_lte_subs t3, dra_list t4, ob_3g_subs t5 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) AND t1.dra = t4.dra AND (t1.MCC = t5.MCC AND t1.MNC = t5.MNC) ORDER BY t3.subs_count+t5.subs_count DESC';
sql[1] = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count AS subs_count_LTE, t5.subs_count AS subs_count_3G, t3.subs_count+t5.subs_count AS subs_count_Total, t4.dra_name FROM operator_list t1, country_list t2, ib_lte_subs t3, dra_list t4, ib_3g_subs t5 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) AND t1.dra = t4.dra AND (t1.MCC = t5.MCC AND t1.MNC = t5.MNC) ORDER BY t3.subs_count+t5.subs_count DESC';

var sql_prev = sql[ob_ib_state]+' LIMIT 14';

var rows = [];
var rows_all = [];
var rows_c = [];
var rows_eve_or_iss = [];
var tmp = [];

var sql_op_all = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count AS ob_subs_count_LTE, t5.subs_count AS ob_subs_count_3G, t6.subs_count AS ib_subs_count_LTE, t7.subs_count AS ib_subs_count_3G, t4.dra_name  FROM operator_list t1, country_list t2, ob_lte_subs t3, dra_list t4, ob_3g_subs t5, ib_lte_subs t6, ib_3g_subs t7 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) AND t1.dra = t4.dra AND (t1.MCC = t5.MCC AND t1.MNC = t5.MNC)  AND (t1.MCC = t6.MCC AND t1.MNC = t6.MNC) AND (t1.MCC = t7.MCC AND t1.MNC = t7.MNC) ORDER BY t3.subs_count DESC';


/* GET home page. */
router.get('/', function(req, res, next) {
  ob_ib_state = 0;
  eve_or_iss_state = 0;

  connection.query(sql[ob_ib_state]+' LIMIT 14;', function(err, rows1, fields){
    if(err){
        console.log(err);
    }
    else{
      for(var i=0; i<rows1.length; i++){
        rows1[i].date = moment().tz(rows1[i].LOC1 + "/" + rows1[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
        rows1[i].subs_count_LTE_string = numberWithCommas(rows1[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
        rows1[i].subs_count_3G_string = numberWithCommas(rows1[i].subs_count_3G);
        rows1[i].subs_count_Total_string = numberWithCommas(rows1[i].subs_count_Total);
      }
      rows = rows1;
      sql_prev = sql[ob_ib_state]+' LIMIT 14';
    }
  });

  connection.query(eve_or_iss_sql[eve_or_iss_state]+';', function(err, rows1, fields){
    if(err){
      console.log(err);
    }else{
      rows_eve_or_iss = rows1; //전역 변수인 rows_eve_or_iss 로 옮기기
    }
  });

  connection.query(sql_op_all+';', function(err, rows1, fields){
    if(err){
        console.log(err);
      }
    else{
      for(var i=0; i<rows1.length; i++){
              rows1[i].date = moment().tz(rows1[i].LOC1 + "/" + rows1[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              rows1[i].ob_subs_count_LTE_string = numberWithCommas(rows1[i].ob_subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              rows1[i].ob_subs_count_3G_string = numberWithCommas(rows1[i].ob_subs_count_3G);
              rows1[i].ib_subs_count_LTE_string = numberWithCommas(rows1[i].ib_subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              rows1[i].ib_subs_count_3G_string = numberWithCommas(rows1[i].ib_subs_count_3G);
      }

      //전역 변수인 rows_all로 옮기기
      rows_all = rows1;
      res.render('index.jade', { rows: rows, rows_all: rows_all, events : rows_eve_or_iss, issues : tmp});
    }
  });
});


router.get('/roaming_api/v1/card_subs', function(req, res, next){

  var string =  req.query.data_checked;
  var cond = [];

  console.log(string);

  var type = string.substring(0,2); //type만 잘라내려고 앞에서 2개 자름
  console.log(type);

  switch (type) {
    case '00' :
      var result_arr = [];

      connection.query(sql_prev+';', function(err, result, fields){
      if(err){
        console.log(err);
      }
      else{
        for(var i=0; i<result.length; i++){
          result[i].date = moment().tz(result[i].LOC1 + "/" + result[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
          result[i].subs_count_LTE_string = numberWithCommas(result[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
          result[i].subs_count_3G_string = numberWithCommas(result[i].subs_count_3G);
          result[i].subs_count_Total_string = numberWithCommas(result[i].subs_count_Total);
          result_arr.push(result[i]);
        }
        res.send(result_arr);
      }
    });
    break;

    case '01' : //체크박스에서 넘어온 MCC과 MNC
      var jArr = JSON.parse(string.substring(2,string.length)); //JSON.parse()는 string으로 넘어온 데이터를 다시 json형태로 바꿔주는 것

      for(var i=0; i < jArr.length; i++){
          //var condition = [];
          //if(jArr[i].MCC != null) {condition.push("a1.MCC="+arr[i].MCC);}
          //if(jArr[i].MNC != null) {condition.push("a1.MNC="+arr[i].MNC);}
          //cond.push("a1.country_name LIKE \'"+jArr[i].country_name+"\' AND a1.operator_name LIKE \'"+jArr[i].operator_name+"\'");
          //cond.push(condition);
          cond.push("a1.MCC="+jArr[i].MCC+" AND a1.MNC="+jArr[i].MNC);
          console.log(cond);
      }

      var condition_string = "";

      for (var i=0; i<cond.length; i++) {
        condition_string += '(' + cond[i];

        if (i==cond.length-1){ condition_string += ")"; }
        else{ condition_string = condition_string + ") OR "; }


      }
      console.log(condition_string);

      var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ' + condition_string +' order by subs_count_Total desc';

      connection.query(sql_para+';', function(err, rows2, fields){
        if(err){
            console.log(err);
          }
        else{
          for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
              rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
          }
          sql_prev = sql_para;
          res.render('update_card.jade', {rows : rows2});
        }
      });
      break;

    //검색 type == 국가
    case '03' :
      console.log('선택한 값은 국가입니다.');

      var val = string.substring(2,string.length);
      console.log(val);
      var condition_string = "a1.country_name LIKE \'%"+val+"%\'"; // ex)a1.country_name LIKE '%미국%'
      var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ' + condition_string +' order by subs_count_Total desc';

      connection.query(sql_para+';', function(err, rows2, fields){
        if(err){
            console.log(err);
          }
        else{
          for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
              rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
          }
          sql_prev = sql_para;
          res.render('update_card.jade', {rows : rows2});
        }
      });
      break;

    //검색 type == 사업자
    case '04' :
      console.log('선택한 값은 사업자명입니다.');

      var val = string.substring(2,string.length);
      console.log(val);
      var condition_string = "upper(a1.operator_name) LIKE upper(\'%"+val+"%\')"; // t만 치고 검색했을 때 이름에 t 또는 T 가 있는 경우 모두 출력되도록 하기 위함
      var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ' + condition_string +' order by subs_count_Total desc';

      connection.query(sql_para+';', function(err, rows2, fields){
        if(err){
            console.log(err);
          }
        else{
          for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
              rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
          }
          sql_prev = sql_para;
          res.render('update_card.jade', {rows : rows2});
        }
      });
      break;


    case '05' :
      console.log('선택한 값은 중계사업자명입니다.');

      var val = string.substring(2,string.length);
      console.log(val);
      var condition_string = "upper(a1.dra_name) LIKE upper(\'%"+val+"%\')";
      var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ' + condition_string +' order by subs_count_Total desc';

      connection.query(sql_para+';', function(err, rows2, fields){
        if(err){
            console.log(err);
          }
        else{
          for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
              rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
          }
          sql_prev = sql_para;
          res.render('update_card.jade', {rows : rows2});
        }
      });
      break;


    case '06' : // 카드 N개 띄우기

        var val = string.substring(2,string.length);
        console.log(val);
        var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE order by subs_count_Total desc LIMIT '+val;

        connection.query(sql_para+';', function(err, rows2, fields){
          if(err){
              console.log(err);
            }
          else{
            for(var i=0; i<rows2.length; i++){
                rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
                rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
                rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
                rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
            }
            sql_prev = sql_para;
            res.render('update_card.jade', {rows : rows2});
          }
        });
        break;

    case '10' : //OB 선택했을 때
        ob_ib_state = 0;
        var result_arr = [];
        connection.query(sql[ob_ib_state]+' LIMIT 14;', function(err, result, fields){
          if(err){
              console.log(err);
            }
          else{
            for(var i=0; i<result.length; i++){
              result[i].date = moment().tz(result[i].LOC1 + "/" + result[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              result[i].subs_count_LTE_string = numberWithCommas(result[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              result[i].subs_count_3G_string = numberWithCommas(result[i].subs_count_3G);
              result[i].subs_count_Total_string = numberWithCommas(result[i].subs_count_Total);
              result_arr.push(result[i]);
            }
            sql_prev = sql[ob_ib_state]+' LIMIT 14';
            res.send(result_arr);
          }
        });
        break;

    case '11' : //IB 선택했을 때
        ob_ib_state = 1;
        var result_arr = [];
        connection.query(sql[ob_ib_state]+' LIMIT 14;', function(err, result, fields){
          if(err){
              console.log(err);
            }
          else{
            for(var i=0; i<result.length; i++){
              result[i].date = moment().tz(result[i].LOC1 + "/" + result[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              result[i].subs_count_LTE_string = numberWithCommas(result[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              result[i].subs_count_3G_string = numberWithCommas(result[i].subs_count_3G);
              result[i].subs_count_Total_string = numberWithCommas(result[i].subs_count_Total);
              result_arr.push(result[i]);
            }
            sql_prev = sql[ob_ib_state]+' LIMIT 14';
            res.send(result_arr);
          }
        });
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
      connection.query(eve_or_iss_sql[eve_or_iss_state]+';', function(err, rows1, fields){
        if(err){
            console.log(err);
        }
        else{
          res.render('update_events.jade', {events : rows1});
        }

      });
      break;

    case '01' : //이벤트 조회
      var json = JSON.parse(string.substring(2,string.length));
      var json_length = Object.keys(json).length;
      var condition_string = "";
      var i=0;
      var sql_para = "";

      console.log("json 길이 : ");
      console.log(json_length);

      if(json_length == 0){
        sql_para = 'SELECT * FROM event_tbl ORDER BY start_year DESC, start_month DESC, start_day DESC';
      }

      else{
        for(var key in json){
          if(++i == json_length){
            if(key == 'contents'){
              condition_string += "upper(contents) LIKE upper(\'%"+json[key]+"%\')";
              break;
            }
            condition_string += key +"="+ json[key];
            break;
          }
          condition_string += key +"="+ json[key] + " AND ";
        }

        sql_para = 'SELECT * FROM event_tbl WHERE '+condition_string +' ORDER BY start_year, start_month, start_day ASC';
      }

      console.log(sql_para);

      connection.query(sql_para+';', function(err, rows2, fields){
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

        var sql_para = 'INSERT INTO event_tbl(start_year, end_year, start_month, end_month, start_day, end_day, contents) VALUES(' + condition_string + ')';

        console.log(sql_para);

        connection.query(sql_para+';', function(err, rows2, fields){
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
        var condition_string = "";

        for (var i=0; i<json.length; i++) {
          condition_string += 'id =' + json[i].id;
          if (i==json.length-1){ break; }
          else{ condition_string = condition_string + " OR "; }
        }
        console.log(condition_string);

        var sql_para = 'DELETE FROM event_tbl WHERE ' + condition_string;

        console.log(sql_para);

        connection.query(sql_para+';', function(err, rows2, fields){
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
        connection.query(eve_or_iss_sql[eve_or_iss_state]+';', function(err, rows1, fields){
          if(err){
              console.log(err);
          }
          else{
            res.render('update_issue.jade', {issues : rows1});
          }
        });
        break;

      case '01' : //찾고 싶은 이슈 조회
         var json = JSON.parse(string.substring(2,string.length));
         var json_length = Object.keys(json).length;
         var condition_string = "";
         var i=0;
         var sql_para = "";

         console.log("json 길이 : ");
         console.log(json_length);
         if(json_length == 0){
           sql_para = 'SELECT * FROM issue_tbl ORDER BY year DESC, month DESC, day DESC';
         }

         else{
           for(var key in json){
             if(++i == json_length){
               if(key == 'contents'|| key == 'country_name' || key == 'operator_name'){
                 condition_string += "upper("+key+") LIKE upper(\'%"+json[key]+"%\')";
                 break;
               }
               condition_string += key +"="+ json[key];
               break;
             }
             else if(key == 'country_name' || key == 'operator_name'){
               condition_string += "upper("+key+") LIKE upper(\'%"+json[key]+"%\') AND ";
             }
             else{
               condition_string += key +"="+ json[key] + " AND ";
             }

            }
           sql_para = 'SELECT * FROM issue_tbl WHERE '+condition_string+' ORDER BY year DESC, month DESC, day DESC';
         }

         console.log(sql_para);

         connection.query(sql_para+';', function(err, rows2, fields){
           if(err){
               console.log(err);
           }
           else{
             console.log(rows2);
             res.render('update_issue.jade', {issues : rows2});
           }
         });
         break;

      default :
        console.log('선택한 값이 없습니다.');
        break;
  }
});

//이슈 추가, 삭제, 수정(POST)
router.post('/roaming_api/v1/issue', function(req, res, next) {

  var string = req.body.issue_data;

  var type = string.substring(0,2); //type만 잘라내려고 앞에서 2개 자름
  console.log("타입 : " + type);

  var json = JSON.parse(string.substring(2,string.length));

  console.log(json);

  switch(type){
    case '02' : //이슈 추가

        console.log("이슈 추가");
        var sql_para = 'INSERT INTO issue_tbl(MCC, MNC, year, month, day, contents, country_name, operator_name) SELECT '+json.MCC+', '+json.MNC+', '+json.year+', '+json.month+', '+json.day+', \''+json.contents+'\', t1.country_name, t2.operator_name FROM country_list t1, operator_list t2 WHERE t1.MCC='+json.MCC+' AND (t2.MCC='+json.MCC+' AND t2.MNC='+json.MNC+')';

        console.log(sql_para);

        connection.query(sql_para+';', function(err, rows2, fields){
          if(err){
              console.log(err);
              res.send({"성공여부" : 0});
          }
          else{
            res.send({"성공여부" : 1});
          }
        });
        break;


    case '04' : //이슈 삭제
        var condition_string = "";

        for (var i=0; i<json.length; i++) {
          condition_string += 'id =' + json[i].id;
          if (i==json.length-1){ break; }
          else{ condition_string = condition_string + " OR "; }
        }
        console.log(condition_string);

        var sql_para = 'DELETE FROM issue_tbl WHERE ' + condition_string;

        console.log(sql_para);

        connection.query(sql_para+';', function(err, rows2, fields){
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

module.exports = router;
