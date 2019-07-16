var express = require('express');
var router = express.Router();
var moment = require('moment');
require('moment-timezone')

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

var sql = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, t3.subs_count, t4.dra_name FROM operator_list t1, country_list t2, ob_lte_subs t3, dra_list t4 WHERE t1.MCC = t2.MCC AND (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) AND t1.dra = t4.dra ORDER BY t3.subs_count DESC';
var rows = [];
var rows_c = [];

connection.query(sql+' LIMIT 14;', function(err, rows1, fields){
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


function connection_query_card(sql_para){

  connection.query(sql_para, function(err, rows2, fields){
    if(err){
        console.log(err);
      }

    for(var i=0; i<rows2.length; i++){
        rows2[i].date = moment().tz(rows2[i].LOC1 + "/" + rows2[i].LOC2).format('YY-MM-DD HH:mm:ss'); //지역명을 가지고 날짜 형식으로 바꾸기
        rows2[i].subs_count_string = numberWithCommas(rows2[i].subs_count); //3자리마다 , 넣기 위해 문자열로 바꿈
    }
    console.log(rows2);

    //return rows2; 가 안되길래 rows_c라는 전역변수 하나 만들어 사용함
    rows_c =  rows2;
    rows_c = rows_c.slice(0);
  });
}



/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index.jade', { rows: rows, rows_all: rows});

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

      var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +' order by subs_count desc ;';

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
      var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +' order by subs_count desc ;';

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
      var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +' order by subs_count desc ;';

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
      var sql_para = 'SELECT * FROM (' + sql +') a1 WHERE ' + condition_string +' order by subs_count desc ;';

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

module.exports = router;
