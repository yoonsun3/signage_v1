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

//오늘 날짜의 변수들 -> 매일 계산해 줘야 함
var korea_time;
var yy;
var mm;
var dd;
//TRMS에서 가져온 가장 최신 raw data의 시각정보 담을 것.
var raw_data_yyyy;
var raw_data_mm;
var raw_data_dd;
var raw_data_hh;

var eve_or_iss_state; //0:event, 1:issue
var eve_or_iss_sql = [];
//eve_or_iss_sql[0]에는 매일 바뀌는 'yy','mm','dd' 변수가 쓰였기 때문에 쿼리 사용할 때마다 계산해줘야함
eve_or_iss_sql[1] = 'SELECT id, MCC, MNC, country_name, operator_name, year, month, day, contents FROM issue_tbl ORDER BY year DESC, month DESC, day DESC';

var ob_ib_state=0; //0:OB, 1:IB
var sql= [];
sql[0] = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count AS subs_count_LTE, t5.subs_count AS subs_count_3G, t3.subs_count+t5.subs_count AS subs_count_Total, t4.dra_name, t1.event FROM operator_list t1, country_list t2, ob_lte_subs t3, dra_list t4, ob_3g_subs t5 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) AND t1.dra = t4.dra AND (t1.MCC = t5.MCC AND t1.MNC = t5.MNC)';
sql[1] = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count AS subs_count_LTE, t5.subs_count AS subs_count_3G, t3.subs_count+t5.subs_count AS subs_count_Total, t4.dra_name, t1.event FROM operator_list t1, country_list t2, ib_lte_subs t3, dra_list t4, ib_3g_subs t5 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) AND t1.dra = t4.dra AND (t1.MCC = t5.MCC AND t1.MNC = t5.MNC)';

var topN=14;
//var today_num_event=0;

var rows = [];
var rows_all = [];
var rows_c = [];
var rows_eve_or_iss = [];
var tmp = [];

var sql_prev = "";
var rows_prev = []; //가장 최근 카드에 보여진 사업자들 = 가장 최근의 card 현황 모습을 담는

var sql_op_all = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, IF(t3.subs_count IS NULL,0, t3.subs_count) AS ob_subs_count_LTE, IF(t5.subs_count IS NULL,0, t5.subs_count) AS ob_subs_count_3G, IF(t6.subs_count IS NULL,0, t6.subs_count) AS ib_subs_count_LTE, IF(t7.subs_count IS NULL,0, t7.subs_count) AS ib_subs_count_3G, t4.dra_name, t1.HDV_available, t8.OfficeHour, t8.out_of_OfficeHour, t8.email FROM country_list AS t2, dra_list AS t4, operator_list AS t1 LEFT JOIN ob_lte_subs AS t3 ON (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) LEFT JOIN ob_3g_subs AS t5 ON (t1.MCC = t5.MCC AND t1.MNC = t5.MNC) LEFT JOIN ib_lte_subs AS t6 ON (t1.MCC = t6.MCC AND t1.MNC = t6.MNC) LEFT JOIN ib_3g_subs AS t7 ON (t1.MCC = t7.MCC AND t1.MNC = t7.MNC) LEFT JOIN contact AS t8 ON (t1.MCC = t8.MCC AND t1.MNC = t8.MNC) WHERE t1.MCC = t2.MCC AND t1.dra = t4.dra ORDER BY t3.subs_count DESC, t5.subs_count DESC, t6.subs_count DESC, t7.subs_count DESC, t1.MCC';


var condition_today_event = "";
var sql_event_reset = 'UPDATE operator_list SET event=0 WHERE event=1';

var sql_today_event_up = ""; //MCC, MNC 값 모두 있는 이벤트 -> 해당 사업자만 이벤트 flag에 1표시
var sql_today_event_up2 = ""; //MNC 값 없는... 즉, 국가코드(MCC)만 있는 이벤트 -> 해당 나라에 있는 사업자 모두의 event 속성값 1로 바꿈

var time_offset = 0;

//UPDATE operator_list SET event=1 WHERE MCC IN (SELECT MCC FROM event_tbl WHERE start_year=2019 AND start_month=07 AND start_day=26 AND MNC is null);
// UPDATE operator_list t1 INNER JOIN event_tbl t2 ON (t1.MCC=t2.MCC AND t1.MNC=t2.MNC) SET event=0 WHERE t2.start_year=2019 AND t2.start_month=7 AND t2.start_day=26;

/* GET home page. */
router.get('/', function(req, res, next) {
  ob_ib_state = 0;
  eve_or_iss_state = 0;

  yy = moment().tz("Asia/Seoul").format('YYYY');
  mm = moment().tz("Asia/Seoul").format('MM');
  dd = moment().tz("Asia/Seoul").format('DD');

  //eve_or_iss_sql[0]에는 매일 바뀌는 'yy','mm','dd' 변수가 쓰였기 때문에 쿼리 사용할 때마다 계산해줘야함
  eve_or_iss_sql[0] = 'SELECT * FROM event_tbl WHERE (end_year > '+yy+') OR (end_year = '+yy+' AND end_month > '+mm+') OR (end_year = '+yy+' AND end_month = '+mm+' AND end_day >= '+dd+') ORDER BY start_year, start_month, start_day ASC';
  topN = 14;
  sql_prev = sql[ob_ib_state]+' ORDER BY t1.event DESC, t3.subs_count+t5.subs_count DESC LIMIT '+topN;

  condition_today_event = '((start_year<'+yy+') OR (start_year='+yy+' AND start_month<'+mm+') OR (start_year='+yy+' AND start_month='+mm+' AND start_day<='+dd+')) AND ((end_year > '+yy+') OR (end_year = '+yy+' AND end_month > '+mm+') OR (end_year = '+yy+' AND end_month = '+mm+' AND end_day >= '+dd+'))';

  //up은 MCC, MNC 값 모두 있는 이벤트 -> 해당 사업자만 이벤트 flag에 1표시
  sql_today_event_up = 'UPDATE operator_list t1 INNER JOIN event_tbl t2 ON (t1.MCC=t2.MCC AND t1.MNC=t2.MNC) SET event=1 WHERE '+condition_today_event;
  //up2는 MNC 값 없는... 즉, 국가코드(MCC)만 있는 이벤트 -> 해당 나라에 있는 사업자 모두의 event 속성값 1로 바꿈
  sql_today_event_up2 = 'UPDATE operator_list SET event=1 WHERE MCC IN (SELECT MCC FROM event_tbl WHERE '+condition_today_event+' AND MNC is null)';

  connection.query(sql_event_reset+';', function(err, rows1, fields){ //event가 1이었던 사업자들 0으로 리셋하기
    if(err){
        console.log(err);
    }
    else{
      connection.query(sql_today_event_up+';', function(err, rows2, fields){ //오늘 날짜에 이벤트 있는 사업자들 event flag에 '1'표시
        if(err){
            console.log(err);
        }
        else{
          connection.query(sql_today_event_up2+';', function(err, rows2, fields){ //MNC없이 MCC 값만 있는 이벤트에 해당되는 국가의 사업자들 event flag에 '1'표시
            if(err){
                console.log(err);
            }
            else{
              connection.query(sql_prev+';', function(err, rows3, fields){ //topN개의 카드 띄우기(1.event 있는 순 -> 2.총 가입자 순)
                if(err){
                    console.log(err);
                }
                else{
                  rows_prev=[]; //rows_prev 초기화
                  for(var i=0; i<rows3.length; i++){
                    rows3[i].date = moment().tz(rows3[i].LOC1 + "/" + rows3[i].LOC2).format('MM-DD HH:mm:ss');
                    rows3[i].subs_count_LTE_string = numberWithCommas(rows3[i].subs_count_LTE);
                    rows3[i].subs_count_3G_string = numberWithCommas(rows3[i].subs_count_3G);
                    rows3[i].subs_count_Total_string = numberWithCommas(rows3[i].subs_count_Total);
                    rows_prev.push(rows3[i]); //가장 최근의 card 현황 모습을 담는 rows_prev이므로 결과 push하기
                  }
                  rows = rows3;

                  connection.query(eve_or_iss_sql[eve_or_iss_state]+';', function(err, rows4, fields){ //아직 종료되지 않은 이벤트들 select
                    if(err){
                      console.log(err);
                    }else{
                      rows_eve_or_iss = rows4; //전역 변수인 rows_eve_or_iss 로 옮기기

                      connection.query(sql_op_all+';', function(err, rows5, fields){ //전체 사업자들 select
                        if(err){
                            console.log(err);
                          }
                        else{
                          for(var i=0; i<rows5.length; i++){
                                  //rows5[i].date = moment().tz(rows5[i].LOC1 + "/" + rows5[i].LOC2).format('YY-MM-DD HH:mm:ss');
                                  rows5[i].ob_subs_count_LTE_string = numberWithCommas(rows5[i].ob_subs_count_LTE);
                                  rows5[i].ob_subs_count_3G_string = numberWithCommas(rows5[i].ob_subs_count_3G);
                                  rows5[i].ib_subs_count_LTE_string = numberWithCommas(rows5[i].ib_subs_count_LTE);
                                  rows5[i].ib_subs_count_3G_string = numberWithCommas(rows5[i].ib_subs_count_3G);
                          }

                          //전역 변수인 rows_all로 옮기기
                          rows_all = rows5;
                          korea_time = moment().tz("Asia/Seoul").format('YY-MM-DD HH:mm:ss');
                          res.render('index.jade', {korea_time: korea_time, rows: rows, rows_all: rows_all, events : rows_eve_or_iss, issues : tmp});
                          //res.render('layout.jade', {korea_time: korea_time});
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
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
      for(var i=0; i<rows_prev.length; i++){
        rows_prev[i].date = moment().tz(rows_prev[i].LOC1 + "/" + rows_prev[i].LOC2).format('MM-DD HH:mm:ss'); //시간 업데이트
        if(i==0){
          korea_time = moment().tz("Asia/Seoul").format('YY-MM-DD HH:mm:ss');
          rows_prev[0].korea_time = korea_time; //첫번째 row에만 korea_time 끼워서 전송함
        }
      }
      res.send(rows_prev);
    break;

    //체크박스에서 체크한 사업자만 보여주기
    case '01' :
      var jArr = JSON.parse(string.substring(2,string.length)); //JSON.parse()는 string으로 넘어온 데이터를 다시 json형태로 바꿔주는 것

      for(var i=0; i < jArr.length; i++){
          cond.push("a1.MCC=\'"+jArr[i].MCC+"\' AND a1.MNC=\'"+jArr[i].MNC+'\'');
          console.log(cond);
      }

      var condition_string = "";

      for (var i=0; i<cond.length; i++) {
        condition_string += '(' + cond[i];

        if (i==cond.length-1){ condition_string += ")"; }
        else{ condition_string = condition_string + ") OR "; }


      }
      console.log(condition_string);

      var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ' + condition_string+' ORDER BY event DESC, subs_count_Total DESC';

      connection.query(sql_para+';', function(err, rows2, fields){
        if(err){
            console.log(err);
          }
        else{
          rows_prev=[];
          for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('MM-DD HH:mm:ss');
              rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE);
              rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
              rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
              rows_prev.push(rows2[i]);
              //console.log(rows2[i]);
          }
          sql_prev = sql_para;
          res.render('update_card.jade', {rows : rows2});
        }
      });
      break;

    //검색 type == 국가
    case '03' :
      var val = string.substring(2,string.length); //사용자가 검색한 국가명이 들어갈 것
      console.log(val);

      var condition_string = "a1.country_name LIKE \'%"+val+"%\'"; // ex)a1.country_name LIKE '%미국%'
      var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ' + condition_string +' ORDER BY event DESC, subs_count_Total DESC';

      connection.query(sql_para+';', function(err, rows2, fields){
        if(err){
            console.log(err);
          }
        else{
          rows_prev=[];
          for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
              rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
              rows_prev.push(rows2[i]);
          }
          sql_prev = sql_para;
          res.render('update_card.jade', {rows : rows2});
        }
      });
      break;

    //검색 type == 사업자
    case '04' :
      var val = string.substring(2,string.length); //사용자가 검색한 사업자명
      console.log(val);

      var condition_string = "upper(a1.operator_name) LIKE upper(\'%"+val+"%\')"; // t만 치고 검색했을 때 이름에 t 또는 T 가 있는 경우 모두 출력되도록 하기 위함
      var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ' + condition_string +' ORDER BY event DESC, subs_count_Total DESC';

      connection.query(sql_para+';', function(err, rows2, fields){
        if(err){
            console.log(err);
          }
        else{
          rows_prev=[];
          for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
              rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
              rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
              rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
              rows_prev.push(rows2[i]);
          }
          sql_prev = sql_para;
          res.render('update_card.jade', {rows : rows2});
        }
      });
      break;


    case '05' :
      var val = string.substring(2,string.length); //사용자가 검색한 중계사업자 이름
      console.log(val);

      var condition_string = "upper(a1.dra_name) LIKE upper(\'%"+val+"%\')";
      var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ' + condition_string +' ORDER BY event DESC, subs_count_Total DESC';

      connection.query(sql_para+';', function(err, rows2, fields){
        if(err){
            console.log(err);
          }
        else{
          rows_prev=[];
          for(var i=0; i<rows2.length; i++){
              rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('MM-DD HH:mm:ss');
              rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE);
              rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
              rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
              rows_prev.push(rows2[i]);
          }
          sql_prev = sql_para;
          res.render('update_card.jade', {rows : rows2});
        }
      });
      break;


    case '06' : // 카드 N개 띄우기
        topN = string.substring(2,string.length);
        var sql_para = 'SELECT * FROM (' + sql[ob_ib_state] +') a1 WHERE ORDER BY event DESC, subs_count_Total DESC LIMIT '+topN;

        connection.query(sql_para+';', function(err, rows2, fields){
          if(err){
              console.log(err);
            }
          else{
            rows_prev = [];
            for(var i=0; i<rows2.length; i++){
                rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
                rows2[i].subs_count_LTE_string = numberWithCommas(rows2[i].subs_count_LTE); //3자리마다 , 넣기 위해 문자열로 바꿈
                rows2[i].subs_count_3G_string = numberWithCommas(rows2[i].subs_count_3G);
                rows2[i].subs_count_Total_string = numberWithCommas(rows2[i].subs_count_Total);
                rows_prev.push(rows2[i]);
            }
            sql_prev = sql_para;
            res.render('update_card.jade', {rows : rows2});
          }
        });
        break;


    case '10' : //OB 선택했을 때
        ob_ib_state = 0;
        sql_prev = sql_prev.replace(/ib_/g,'ob_'); //이 전에 수행했던 조건은 그대로 두고 sql_prev에 있던 'ib_'만 'ob_'로 대체
        connection.query(sql_prev+';', function(err, result, fields){
          if(err){
              console.log(err);
            }
          else{
            rows_prev = [];
            for(var i=0; i<result.length; i++){
              result[i].date = moment().tz(result[i].LOC1 + "/" + result[i].LOC2).format('MM-DD HH:mm:ss');
              result[i].subs_count_LTE_string = numberWithCommas(result[i].subs_count_LTE);
              result[i].subs_count_3G_string = numberWithCommas(result[i].subs_count_3G);
              result[i].subs_count_Total_string = numberWithCommas(result[i].subs_count_Total);
              rows_prev.push(result[i]);
            }
            res.render('update_card.jade', {rows : result});
          }
        });
        break;

    case '11' : //IB 선택했을 때
        ob_ib_state = 1;
        sql_prev = sql_prev.replace(/ob_/g,'ib_'); //이 전에 수행했던 조건은 그대로 두고 sql_prev에 있던 'ob'만 'ib'로 대체
        connection.query(sql_prev+';', function(err, result, fields){
          if(err){
              console.log(err);
            }
          else{
            rows_prev = [];
            for(var i=0; i<result.length; i++){
              result[i].date = moment().tz(result[i].LOC1 + "/" + result[i].LOC2).format('MM-DD HH:mm:ss');
              result[i].subs_count_LTE_string = numberWithCommas(result[i].subs_count_LTE);
              result[i].subs_count_3G_string = numberWithCommas(result[i].subs_count_3G);
              result[i].subs_count_Total_string = numberWithCommas(result[i].subs_count_Total);
              rows_prev.push(result[i]);
            }
            res.render('update_card.jade', {rows : result});
          }
        });
        break;

    //이벤트 변화(추기, 제거 등)에 따른 카드 창 리셋
    case '07' :
      yy = moment().tz("Asia/Seoul").format('YYYY');
      mm = moment().tz("Asia/Seoul").format('MM');
      dd = moment().tz("Asia/Seoul").format('DD');
      condition_today_event = '((start_year<'+yy+') OR (start_year='+yy+' AND start_month<'+mm+') OR (start_year='+yy+' AND start_month='+mm+' AND start_day<='+dd+')) AND ((end_year > '+yy+') OR (end_year = '+yy+' AND end_month > '+mm+') OR (end_year = '+yy+' AND end_month = '+mm+' AND end_day >= '+dd+'))';
      //MCC, MNC 값 모두 있는 이벤트 -> 해당 사업자만 이벤트 flag에 1표시
      sql_today_event_up = 'UPDATE operator_list t1 INNER JOIN event_tbl t2 ON (t1.MCC=t2.MCC AND t1.MNC=t2.MNC) SET event=1 WHERE '+condition_today_event;
      //MNC 값 없는... 즉, 국가코드(MCC)만 있는 이벤트 -> 해당 나라에 있는 사업자 모두의 event 속성값 1로 바꿈
      sql_today_event_up2 = 'UPDATE operator_list SET event=1 WHERE MCC IN (SELECT MCC FROM event_tbl WHERE '+condition_today_event+' AND MNC is null)';

      connection.query(sql_event_reset+';', function(err, rows1, fields){ //event가 1이었던 사업자들 0으로 리셋하기
        if(err){
            console.log(err);
        }
        else{
          console.log("이벤트 flag 초기화 완료");
          connection.query(sql_today_event_up+';', function(err, rows2, fields){ //MNC 값도 있을 때 up 수행
            if(err){
              console.log(err);
            }
            else{
              console.log("MCC,MNC값 둘다 있을 경우 이벤트 flag 1로 바꾸기 완료");
              connection.query(sql_today_event_up2+';', function(err, rows2, fields){ //MNC 값 없을 때는 up2 수행
                if(err){
                  console.log(err);
                }
                else{
                  console.log("MCC값만 있는 이벤트 flag 1로 바꾸기 완료");
                  connection.query(sql_prev+';', function(err, result, fields){ //이벤트 추가된 것 반영하기 위해 가장 최근 수행한 sql 수행하고 rows_prev에도 업데이트해주기
                    if(err){
                        console.log(err);
                      }
                    else{
                      rows_prev=[]; //전 rows 비우기
                      for(var i=0; i<result.length; i++){
                        result[i].date = moment().tz(result[i].LOC1 + "/" + result[i].LOC2).format('MM-DD HH:mm:ss');
                        result[i].subs_count_LTE_string = numberWithCommas(result[i].subs_count_LTE);
                        result[i].subs_count_3G_string = numberWithCommas(result[i].subs_count_3G);
                        result[i].subs_count_Total_string = numberWithCommas(result[i].subs_count_Total);
                        rows_prev.push(result[i]);
                      }
                      console.log(rows_prev); //저장된 값들 보기
                      res.render('update_card.jade', {rows : result});
                   }
                 });
                }
              });
            }
          });
        }
      });

      break;

  //카드 눌렀을 때 raw data 보여주기
  case '08':
    //var btn_type = string.substring(2,3); //0: 처음에 눌렀을 때, 1:before, 2:after, 3:close
    var json = JSON.parse(string.substring(2,string.length));
    //var current_time = moment().tz("Asia/Seoul").format('YYYY-MM-DD HH:mm:ss');

    raw_data_yyyy = '2019'; //지금은 임의로 설정하지만, 앞으로 TRMS에서 1시간 단위로 데이터 뽑아오면 이 전역변수 값 바꿔주고 사용해야 함
    raw_data_mm = '07';
    raw_data_dd = '31';
    raw_data_hh = '14';

    var current_time = raw_data_yyyy+'-'+raw_data_mm+'-'+raw_data_dd+' '+raw_data_hh+':00:00'; //'2019-07-31 14:00:00' 형식으로!
    var y = moment(current_time).add(json.time_offset, 'hours').format('YYYY');
    var m = moment(current_time).add(json.time_offset, 'hours').format('MM');
    var d = moment(current_time).add(json.time_offset, 'hours').format('DD');
    var h = moment(current_time).add(json.time_offset, 'hours').format('HH');
    console.log(y+m+d+h);
    var sql_para = 'SELECT SUM(IF(cs_net=202 AND ps_net=200,count,0)) AS count_202_200, SUM(IF(cs_net=200 AND ps_net=203,count,0)) AS count_200_203, SUM(IF(cs_net=202 AND ps_net=203,count,0)) AS count_202_203  ,SUM(IF(cs_net=200 AND ps_net=204,count,0)) AS count_200_204, SUM(IF(cs_net=202 AND ps_net=204,count,0)) AS count_202_204 FROM subs_data WHERE bound='+ob_ib_state+' AND MCC=\''+json.MCC+'\' AND MNC=\''+json.MNC+'\' AND year='+y+' AND month='+m+' AND day='+d+' AND hour='+h;

    connection.query( sql_para+';', function(err, rows1, fields){
      if(err){
        console.log(err);
      }
      else{
        rows1[0].year = y;
        rows1[0].month = m;
        rows1[0].day = d;
        rows1[0].hour = h;
        rows1[0].count_202_200_string = numberWithCommas(rows1[0].count_202_200);
        rows1[0].count_200_203_string = numberWithCommas(rows1[0].count_200_203);
        rows1[0].count_202_203_string = numberWithCommas(rows1[0].count_202_203);
        rows1[0].count_200_204_string = numberWithCommas(rows1[0].count_200_204);
        rows1[0].count_202_204_string = numberWithCommas(rows1[0].count_202_204);
        res.send(rows1);
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

      yy = moment().tz("Asia/Seoul").format('YYYY');
      mm = moment().tz("Asia/Seoul").format('MM');
      dd = moment().tz("Asia/Seoul").format('DD');

      //eve_or_iss_sql[0]에는 매일 바뀌는 'yy','mm','dd' 변수가 쓰였기 때문에 쿼리 사용할 때마다 계산해줘야함
      eve_or_iss_sql[0] = 'SELECT * FROM event_tbl WHERE (end_year > '+yy+') OR (end_year = '+yy+' AND end_month > '+mm+') OR (end_year = '+yy+' AND end_month = '+mm+' AND end_day >= '+dd+') ORDER BY start_year, start_month, start_day ASC';

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

      if(json_length == 0){
        sql_para = 'SELECT * FROM event_tbl ORDER BY start_year DESC, start_month DESC, start_day DESC';
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
            condition_string += key +"=\'"+ json[key] + "\' AND ";
          }

         }
        sql_para = 'SELECT * FROM event_tbl WHERE '+condition_string+' ORDER BY start_year DESC, start_month DESC, start_day DESC';
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
        var sql_para = "";

        //이벤트 추가 시 사업자(MNC)도 입력했을 경우
        if(json.hasOwnProperty('MNC')){
          sql_para = 'INSERT INTO event_tbl(MCC, MNC, start_year, end_year, start_month, end_month, start_day, end_day, contents, country_name, operator_name) SELECT \''+json.MCC+'\', \''+json.MNC+'\', '+json.start_year+', '+json.end_year+', '+json.start_month+', '+json.end_month+', '+json.start_day+', '+json.end_day+', \''+json.contents+'\', t1.country_name, t2.operator_name FROM country_list t1, operator_list t2 WHERE t1.MCC=\''+json.MCC+'\' AND (t2.MCC=\''+json.MCC+'\' AND t2.MNC=\''+json.MNC+'\')';
        }
        //이벤트 추가 시 국가(MCC)만 입력했을 경우
        else {
          sql_para = 'INSERT INTO event_tbl(MCC, start_year, end_year, start_month, end_month, start_day, end_day, contents, country_name) SELECT \''+json.MCC+'\', '+json.start_year+', '+json.end_year+', '+json.start_month+', '+json.end_month+', '+json.start_day+', '+json.end_day+', \''+json.contents+'\', t1.country_name FROM country_list t1 WHERE t1.MCC=\''+json.MCC+'\'';
        }

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
          condition_string += 'id=' + json[i].id;
          if (i==json.length-1){ break; }
          else{ condition_string = condition_string + " OR "; }
        }

        console.log(condition_string);

        var sql_para = 'DELETE FROM event_tbl WHERE ' + condition_string;

        console.log(sql_para);

        connection.query(sql_para+';', function(err, rows2, fields){ //해당 이벤트 삭제 수행
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
               condition_string += key +"=\'"+ json[key]+'\'';
               break;
             }
             else if(key == 'country_name' || key == 'operator_name'){
               condition_string += "upper("+key+") LIKE upper(\'%"+json[key]+"%\') AND ";
             }
             else{
               condition_string += key +"=\'"+ json[key] + "\' AND ";
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
        var sql_para = "";
        console.log("이슈 추가");
        if(json.hasOwnProperty('MNC')){
          sql_para = 'INSERT INTO issue_tbl(MCC, MNC, year, month, day, contents, country_name, operator_name) SELECT \''+json.MCC+'\', \''+json.MNC+'\', '+json.year+', '+json.month+', '+json.day+', \''+json.contents+'\', t1.country_name, t2.operator_name FROM country_list t1, operator_list t2 WHERE t1.MCC=\''+json.MCC+'\' AND (t2.MCC=\''+json.MCC+'\' AND t2.MNC=\''+json.MNC+'\')';
        }else {
          sql_para = 'INSERT INTO issue_tbl(MCC, year, month, day, contents, country_name) SELECT \''+json.MCC+'\', '+json.year+', '+json.month+', '+json.day+', \''+json.contents+'\', t1.country_name FROM country_list t1 WHERE t1.MCC=\''+json.MCC+'\'';
        }

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
