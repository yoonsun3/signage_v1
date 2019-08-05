function show_after_rawData(i, time_offset){
  var json = new Object();

  json.time_offset = time_offset; //서버에 보낼 offset을 전달받은 새로운 offset으로 바꿔줌
  json.MCC = $('#roaming-card-'+i).find('.card-MCC').html();
  json.MNC = $('#roaming-card-'+i).find('.card-MNC').html();

  $.ajax({
    method      : 'GET',
    url         : '/roaming_api/v1/card_subs',
    traditional : true,
    dataType    : 'json',
    data        : {data_checked: '08'+JSON.stringify(json)},
    success     : function(data) {
        console.log(data);
        $("#raw_dataForm-"+i).find(".count_202_200").html(data[0].count_202_200_string);
        $("#raw_dataForm-"+i).find(".count_200_203").html(data[0].count_200_203_string);
        $("#raw_dataForm-"+i).find(".count_202_203").html(data[0].count_202_203_string);
        $("#raw_dataForm-"+i).find(".count_200_204").html(data[0].count_200_204_string);
        $("#raw_dataForm-"+i).find(".count_202_204").html(data[0].count_202_204_string);
        $("#raw_dataForm-"+i).find(".date_time").html(data[0].year+"-"+data[0].month+"-"+data[0].day+" "+data[0].hour+"시");
    },
    error       : function(request, status, error) {
        alert("데이터가 없습니다");
    }
  });
}
