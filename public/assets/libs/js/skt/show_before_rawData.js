function show_before_rawData(i, time_offset){
  var json = new Object();
  var result;

  json.time_offset = time_offset; //서버에 보낼 offset을 전달받은 새로운 offset으로 바꿔줌
  json.MCC = $('#roaming-card-'+i).find('.card-MCC').html();
  json.MNC = $('#roaming-card-'+i).find('.card-MNC').html();
  
  if($(".btn-secondary").html() == "OUTBOUND") json.ob_ib = 0;
  else if($(".btn-secondary").html() == "INBOUND") json.ob_ib = 1;

  $.ajax({
    method      : 'GET',
    url         : '/roaming_api/v1/card_subs',
    traditional : true,
    dataType    : 'json',
    async       : false, //동기화 해줘야함!! result 리턴하기 위해!
    data        : {data_checked: '08'+JSON.stringify(json)},
    success     : function(data) {

        if(data[0].year==0){
          result = 0;
        }
        else{
          $("#raw_dataForm-"+i).find(".count_202_200").html(data[0].count_202_200_string);
          $("#raw_dataForm-"+i).find(".count_200_203").html(data[0].count_200_203_string);
          $("#raw_dataForm-"+i).find(".count_202_203").html(data[0].count_202_203_string);
          $("#raw_dataForm-"+i).find(".count_200_204").html(data[0].count_200_204_string);
          $("#raw_dataForm-"+i).find(".count_202_204").html(data[0].count_202_204_string);
          $("#raw_dataForm-"+i).find(".date_time").html(data[0].year+"-"+data[0].month+"-"+data[0].day+" "+data[0].hour+"시");
          result = 1;
        }
    },
    error       : function(request, status, error) {
        alert("데이터가 없습니다");
    }
  });
  return result;
}
