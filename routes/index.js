var express = require('express');
var router = express.Router();

var moment = require('moment');
require('moment-timezone');

var mysql = require('mysql');
var bodyParser = require('body-parser');
//var async = require('async');

const ConfigParser = require('configparser');
const config = new ConfigParser();

//3자리 콤마 찍는 함수
function numberWithCommas(x) {
  if( x == null ){
    x=0;
  }
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** DB 연동 정보 Read */
config.read('config/db.conf');
var host = config.get('mariadb','host');
var port = config.get('mariadb','port');
var user = config.get('mariadb','user');
var password = config.get('mariadb','password');
var database = config.get('mariadb','database');

var connection = mysql.createConnection({
  host : host, //서버 로컬 IP
  port : parseInt(port),
  user : user, //계정 아이디
  password : password,
  database : database, //접속할 DB

  multipleStatements: true
});

connection.connect(function(err) {
  if(err){
    console.log(err);
  }
});


const OB = 0;
const IB = 1;
const topN = 14;

var sql = [];

sql[OB] = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, IF(t3.subs_count IS NULL, 0, t3.subs_count) AS subs_count_LTE,'+
          ' IF(t5.subs_count IS NULL, 0, t5.subs_count) AS subs_count_3G, IF(t3.subs_count IS NULL, 0, t3.subs_count)+IF(t5.subs_count IS NULL, 0, t5.subs_count)'+
          ' AS subs_count_Total, t4.dra_name, t6.dra_name AS dra_name_3g, t1.event  FROM country_list t2, dra_list t4, 3g_dra_list t6, operator_list t1 '+
          'LEFT JOIN ob_lte_subs AS t3 ON (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) LEFT JOIN ob_3g_subs AS t5 ON (t1.MCC = t5.MCC AND t1.MNC = t5.MNC) '+
          'WHERE t1.MCC = t2.MCC AND t1.dra = t4.dra AND t1.3g_dra = t6.dra';

sql[IB] = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, IF(t3.subs_count IS NULL, 0, t3.subs_count) AS subs_count_LTE,'+
          ' IF(t5.subs_count IS NULL, 0, t5.subs_count) AS subs_count_3G, IF(t3.subs_count IS NULL, 0, t3.subs_count)+IF(t5.subs_count IS NULL, 0, t5.subs_count)'+
          ' AS subs_count_Total, t4.dra_name, t6.dra_name AS dra_name_3g, t1.event  FROM country_list t2, dra_list t4, 3g_dra_list t6, operator_list t1 '+
          'LEFT JOIN ib_lte_subs AS t3 ON (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) LEFT JOIN ib_3g_subs AS t5 ON (t1.MCC = t5.MCC AND t1.MNC = t5.MNC) '+
          'WHERE t1.MCC = t2.MCC AND t1.dra = t4.dra AND t1.3g_dra = t6.dra';

const sql_in = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, IF(t3.subs_count IS NULL, 0, t3.subs_count) AS subs_count_LTE, '+
            'IF(t5.subs_count IS NULL, 0, t5.subs_count) AS subs_count_3G, IF(t3.subs_count IS NULL, 0, t3.subs_count)+IF(t5.subs_count IS NULL, 0, t5.subs_count) '+
            'AS subs_count_Total, t4.dra_name, t6.dra_name AS dra_name_3g, t1.event  FROM country_list t2, dra_list t4, 3g_dra_list t6, operator_list t1 '+
            'LEFT JOIN ob_lte_subs AS t3 ON (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) LEFT JOIN ob_3g_subs AS t5 ON (t1.MCC = t5.MCC AND t1.MNC = t5.MNC) '+
            'WHERE t1.MCC = t2.MCC AND (t1.dra_in = t4.dra OR t1.dra_in_2 = t4.dra) AND t1.3g_dra = t6.dra;';

const sql_op_all = 'SELECT t1.MCC, t1.MNC, t1.operator_name, t2.country_name, t2.LOC1, t2.LOC2, IF(t3.subs_count IS NULL,0, t3.subs_count) AS ob_subs_count_LTE, '+
                'IF(t5.subs_count IS NULL,0, t5.subs_count) AS ob_subs_count_3G, IF(t6.subs_count IS NULL,0, t6.subs_count) AS ib_subs_count_LTE, '+
                'IF(t7.subs_count IS NULL,0, t7.subs_count) AS ib_subs_count_3G, t4.dra_name, t9.dra_name AS dra_name_3g, t1.HDV_available, t8.OfficeHour, t8.out_of_OfficeHour, t8.email '+
                'FROM country_list AS t2, dra_list AS t4, 3g_dra_list AS t9, operator_list AS t1 LEFT JOIN ob_lte_subs AS t3 ON (t1.MCC = t3.MCC AND t1.MNC = t3.MNC) '+
                'LEFT JOIN ob_3g_subs AS t5 ON (t1.MCC = t5.MCC AND t1.MNC = t5.MNC) LEFT JOIN ib_lte_subs AS t6 ON (t1.MCC = t6.MCC AND t1.MNC = t6.MNC) LEFT JOIN ib_3g_subs '+
                'AS t7 ON (t1.MCC = t7.MCC AND t1.MNC = t7.MNC) LEFT JOIN contact AS t8 ON (t1.MCC = t8.MCC AND t1.MNC = t8.MNC) WHERE t1.MCC = t2.MCC AND t1.dra = t4.dra '+
                'AND t1.3g_dra = t9.dra ORDER BY t3.subs_count DESC, t5.subs_count DESC, t6.subs_count DESC, t7.subs_count DESC, t1.MCC;';

const sql_temp = "(select sum(subs_count) as count from ob_lte_subs) UNION (select sum(subs_count) as count from ob_3g_subs);";
const sql_temp_ib = "(select sum(subs_count) as count from ib_lte_subs) UNION (select sum(subs_count) as count from ib_3g_subs);";

// 모든 사업자 정보 조회 SQL (국가명으로 Sorting)
const sql_mno_info = "select A.country_name, A.MCC, B.operator_name, B.MNC from country_list A, operator_list B where A.MCC=B.MCC order by A.country_name;";

// 필요한 SQL Query문을 return하는 함수 (yy:연도, mm:월, dd:일, limit: top N 개수)
function returnSQL(sqlname,yy=null,mm=null,dd=null,limit=null){

  var condition_today_event = '((start_year<'+yy+') OR (start_year='+yy+' AND start_month<'+mm+') OR (start_year='+yy+' AND start_month='+mm+' AND start_day<='+dd+
                              ')) AND ((end_year > '+yy+') OR (end_year = '+yy+' AND end_month > '+mm+') OR (end_year = '+yy+' AND end_month = '+mm+' AND end_day >= '+dd+'))';
  
  switch(sqlname){
    case 'eve_or_iss_sql':
      return 'SELECT * FROM event_tbl WHERE (end_year > '+yy+') OR (end_year = '+yy+' AND end_month > '+mm+') OR (end_year = '+yy+' AND end_month = '+mm+
      ' AND end_day >= '+dd+') ORDER BY start_year, start_month, start_day ASC;';
    
    case 'ob_rank_sql':
      return sql[OB] + ' AND (t3.subs_count IS NOT NULL OR t5.subs_count IS NOT NULL) ORDER BY t1.event DESC, t3.subs_count+t5.subs_count DESC LIMIT '+ limit +';';

    case 'ib_rank_sql':
      return sql[IB] + ' AND (t3.subs_count IS NOT NULL OR t5.subs_count IS NOT NULL) ORDER BY t1.event DESC, t3.subs_count+t5.subs_count DESC LIMIT '+ limit +';';

    case 'event_update_mno_sql':
      return 'UPDATE operator_list t1 INNER JOIN event_tbl t2 ON (t1.MCC=t2.MCC AND t1.MNC=t2.MNC) SET event=1 WHERE '+ condition_today_event +';';

    case 'event_update_country_sql':
      return 'UPDATE operator_list SET event=1 WHERE MCC IN (SELECT MCC FROM event_tbl WHERE '+ condition_today_event +' AND MNC is null);';

    case 'event_reset_sql':
      return 'UPDATE operator_list SET event=0 WHERE event=1;';
  }

  return null;
}

router.get('/', function(req,res,next){
  var yy = moment().tz("Asia/Seoul").format('YYYY');
  var mm = moment().tz("Asia/Seoul").format('MM');
  var dd = moment().tz("Asia/Seoul").format('DD');
  var korea_time = moment().tz("Asia/Seoul").format('YY-MM-DD HH:mm:ss');

  //eve_or_iss_sql에는 매일 바뀌는 'yy','mm','dd' 변수가 쓰였기 때문에 쿼리 사용할 때마다 계산해줘야함
  var eve_or_iss_sql = returnSQL('eve_or_iss_sql',yy=yy,mm=mm,dd=dd);

  console.log("topN : " + topN);
  console.log("OB : " + OB);
  console.log("IB : " + IB);

  var ob_rank_sql = returnSQL('ob_rank_sql',yy,mm,dd,limit=topN);

  //오늘 날짜에 이벤트 있는 사업자들 event flag에 '1'표시
  var sql_today_event_up = returnSQL('event_update_mno_sql',yy=yy,mm=mm,dd=dd);
  
  //MNC없이 MCC 값만 있는 이벤트에 해당되는 국가의 사업자들 event flag에 '1'표시
  var sql_today_event_up2 = returnSQL('event_update_country_sql',yy=yy,mm=mm,dd=dd);

  //event가 1이었던 사업자들 0으로 리셋하기
  var sql_event_reset = returnSQL('event_reset_sql');

  var total_data, total_data_ib, total_string, total_string_ib;

  //                      rows[0]             rows[1]             rows[2]         rows[3]        rows[4]        rows[5]      rows[6]      rows[7]
  connection.query(sql_event_reset + sql_today_event_up + sql_today_event_up2 + ob_rank_sql + eve_or_iss_sql + sql_op_all + sql_temp + sql_temp_ib, function(err, rows){
    if(err){
      console.log(err);
    }
    else{
      for(var i = 0; i < rows[3].length; i++){
        rows[3][i].date = moment().tz(rows[3][i].LOC1 + "/" + rows[3][i].LOC2).format('MM-DD HH:mm:ss');
        rows[3][i].subs_count_LTE_string = numberWithCommas(rows[3][i].subs_count_LTE);
        rows[3][i].subs_count_3G_string = numberWithCommas(rows[3][i].subs_count_3G);
        rows[3][i].subs_count_Total_string = numberWithCommas(rows[3][i].subs_count_Total);
      }

      for(var i = 0; i < rows[5].length; i++){
        //rows5[i].date = moment().tz(rows5[i].LOC1 + "/" + rows5[i].LOC2).format('YY-MM-DD HH:mm:ss');
        rows[5][i].ob_subs_count_LTE_string = numberWithCommas(rows[5][i].ob_subs_count_LTE);
        rows[5][i].ob_subs_count_3G_string = numberWithCommas(rows[5][i].ob_subs_count_3G);
        rows[5][i].ib_subs_count_LTE_string = numberWithCommas(rows[5][i].ib_subs_count_LTE);
        rows[5][i].ib_subs_count_3G_string = numberWithCommas(rows[5][i].ib_subs_count_3G);
      }

      total_data = '';
      total_data_ib = '';
      total_string = 'OB    LTE: ';
      total_string_ib = "IB    LTE: "

      for(var i = 0; i < rows[6].length; i++){
        total_string += numberWithCommas(rows[6][i].count);
        if(i==0) total_string += "  3G: ";
      }

      total_data = total_string;

      for(var i = 0; i < rows[7].length; i++){
        total_string_ib += numberWithCommas(rows[7][i].count);
        if(i==0) total_string_ib += "  3G: ";
      }

      total_data_ib = total_string_ib;
      res.render('index.jade', {korea_time: korea_time, total_data: total_data,total_data_ib: total_data_ib, rows: rows[3], rows_all: rows[5], events : rows[4], issues : [] });
    }

  });
});

router.get('/roaming_api/v1/card_subs', function(req,res,next){
  var data_checked = req.query.data_checked;
  var cond = [];
  var type = data_checked.substring(0,2);
  var yy = moment().tz("Asia/Seoul").format('YYYY');
  var mm = moment().tz("Asia/Seoul").format('MM');
  var dd = moment().tz("Asia/Seoul").format('DD');
  var korea_time = moment().tz("Asia/Seoul").format('YY-MM-DD HH:mm:ss');

  //event가 1이었던 사업자들 0으로 리셋하기
  var sql_event_reset = returnSQL('event_reset_sql');

  //오늘 날짜에 이벤트 있는 사업자들 event flag에 '1'표시
  var sql_today_event_up = returnSQL('event_update_mno_sql',yy=yy,mm=mm,dd=dd);

  //MNC없이 MCC 값만 있는 이벤트에 해당되는 국가의 사업자들 event flag에 '1'표시
  var sql_today_event_up2 = returnSQL('event_update_country_sql',yy=yy,mm=mm,dd=dd);

  switch(type){

    // OB 변경 시, Card rendering
    case '10':
    // IB 변경 시, Card rendering
    case '11':
    // OB 선택 시, 카드 정보 업데이트
    case '00':
    // IB 선택 시, 카드 정보 업데이트
    case '99':

      var rank_sql;
      var mode; // mode = render 또는 mode = send

      // 상위 N개 사업자 정보 반환
      if(type == '10' || type == '00') rank_sql = returnSQL('ob_rank_sql',yy,mm,dd,limit=topN); 
      else if(type=='11' || type == '99') rank_sql = returnSQL('ib_rank_sql',yy,mm,dd,limit=topN);

      if(type == '10' || type == '11') mode = 'render';
      else if(type == '00' || type == '99') mode = 'send';

      connection.query(sql_event_reset + sql_today_event_up + sql_today_event_up2 + rank_sql, function(err, rows){
        if(err){
          console.log(err);
        }
        else{
          for(var i = 0; i < rows[3].length; i++){
            rows[3][i].date = moment().tz(rows[3][i].LOC1 + "/" + rows[3][i].LOC2).format('MM-DD HH:mm:ss');
            rows[3][i].subs_count_LTE_string = numberWithCommas(rows[3][i].subs_count_LTE);
            rows[3][i].subs_count_3G_string = numberWithCommas(rows[3][i].subs_count_3G);
            rows[3][i].subs_count_Total_string = numberWithCommas(rows[3][i].subs_count_Total);
          }
          rows[3][0].korea_time = korea_time;
          
          if(mode == 'render') res.render('update_card.jade', {rows : rows[3] });
          else if(mode == 'send') res.send(rows[3]);
        }

      });
      break;


    // Dashboard Card에서 사업자명 클릭 시, 망 별 가입자 정보 Display
    case '08':
      var json = JSON.parse(data_checked.substring(2,data_checked.length));

      connection.query('SELECT year, month, day, hour FROM subs_data WHERE bound='+json.ob_ib+' ORDER BY year DESC, month DESC, day DESC, hour DESC LIMIT 1;', function(err, rows0, fields){
        if(err){
          console.log(err);
        }
        else{
          raw_data_yyyy = rows0[0].year;
          raw_data_mm = rows0[0].month;
          raw_data_dd = rows0[0].day;
          raw_data_hh = rows0[0].hour;

          var current_time = raw_data_yyyy+'-'+raw_data_mm+'-'+raw_data_dd+' '+raw_data_hh+':00:00'; //'2019-07-31 14:00:00' 형식으로!
          var y = moment(current_time,"YYYY-MM-DD HH:mm:ss").add(json.time_offset, 'hours').format('YYYY');
          var m = moment(current_time,"YYYY-MM-DD HH:mm:ss").add(json.time_offset, 'hours').format('MM');
          var d = moment(current_time,"YYYY-MM-DD HH:mm:ss").add(json.time_offset, 'hours').format('DD');
          var h = moment(current_time,"YYYY-MM-DD HH:mm:ss").add(json.time_offset, 'hours').format('HH');
  
          console.log(y+m+d+h);
          var sql_para = 'SELECT SUM(IF(cs_net=202 AND ps_net=200,count,0)) AS count_202_200, SUM(IF(cs_net=200 AND ps_net=203,count,0)) AS count_200_203, SUM(IF(cs_net=202 AND ps_net=203,count,0)) AS count_202_203  ,SUM(IF(cs_net=200 AND ps_net=204,count,0)) AS count_200_204, SUM(IF(cs_net=202 AND ps_net=204,count,0)) AS count_202_204 FROM subs_data WHERE bound='+json.ob_ib+' AND MCC=\''+json.MCC+'\' AND MNC=\''+json.MNC+'\' AND year='+y+' AND month='+m+' AND day='+d+' AND hour='+h;
  
          connection.query('SELECT * FROM subs_data WHERE bound='+json.ob_ib+' AND year='+y+' AND month='+m+' AND day='+d+' AND hour='+h+';', function(err, rows2, fields){
            if(err){
              console.log(err);
            }
            else{
              if(rows2.length == 0){ //해당 날짜의 데이터가 없을 경우
                rows2.push({'year': 0});
                res.send(rows2);
              }
              else{
                connection.query(sql_para+';', function(err, rows1, fields){
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
              }
            }
          });
        }});

      break;

    // Dashboard에서 중계사업자 버튼 클릭 시, 중계사업자 정보 Display (Render)
    case '12':
      connection.query(sql_mno_info, function(err, rows){
        if(err){
          console.log(err);
        }
        else{
          var result = [];
          var temp_arr = [];
          for(var i = 0; i < rows.length; i++){
            if(i%2 == 0){
              temp_arr.push(rows[i].country_name+' '+rows[i].operator_name);
              temp_arr.push(rows[i].MCC + ' ' + rows[i].MNC);
            }
            else{
              temp_arr.push(rows[i].country_name+' '+rows[i].operator_name);
              temp_arr.push(rows[i].MCC + ' ' + rows[i].MNC);
              result.push(temp_arr);
              temp_arr = [];
            }
          }
          if(temp_arr != []){
            result.push(temp_arr);
          }

          res.render('dra_main', {rows:result});
        }
      });
      
      break;

  }

});

function returnHopSql(mcc,mnc){
  return "SELECT * FROM hop WHERE mcc="+mcc+" AND mnc="+mnc+" ORDER BY hash_num, seq_num;"
}

router.get('/roaming_api/v1/dra_hops',function(req, res, next){
  var target = req.query.target;
  var hop_sql = "";
  var result = [];
  var mcc_mnc = [];
  
  for(var i = 0; i < target.length; i++){
    hop_sql += returnHopSql(target[i].split(" ")[0], target[i].split(" ")[1]);
    mcc_mnc.push(target[i]);
  }

  console.log(hop_sql);

  connection.query(hop_sql, function(err, rows){
    if(err){
      console.log(err)
    }
    else{
      console.log(rows);
      if(target.length == 1) rows = [rows];
      for(var i = 0; i < rows.length; i++){
        var prev_hash = null;
        var hop_temp=[];
        var temp=[];
        for(var j = 0; j < rows[i].length; j++){
          if(prev_hash == null){
            temp.push(rows[i][j].hop_name);
            prev_hash = rows[i][j].hash_num;
          }
          else if(prev_hash != rows[i][j].hash_num){
            hop_temp.push(temp);
            temp = [];
            prev_hash = rows[i][j].hash_num;
          }
          else{
            temp.push(rows[i][j].hop_name);
          }
        }
        if(temp != []) hop_temp.push(temp);
        result.push(hop_temp);
      }
      res.send({result:result, mcc_mnc:mcc_mnc});
    }
  });
});

module.exports = router;