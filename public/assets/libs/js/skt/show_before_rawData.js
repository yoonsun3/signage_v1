function show_before_rawData(i, time_offset){
  var json = new Object();

  json.time_offset = time_offset; //서버에 보낼 offset을 전달받은 새로운 offset으로 바꿔줌
  json.MCC = $('#roaming-card-'+i).find('.card-MCC').html();
  json.MNC = $('#roaming-card-'+i).find('.card-MNC').html();

  $.ajax({
    method      : 'GET',
    url         : 'http://localhost:3000/roaming_api/v1/card_subs',
    traditional : true,
    dataType    : 'json',
    data        : {data_checked: '08'+JSON.stringify(json)},
    success     : function(data) {
        console.log(data);
        $("#raw_dataForm-"+i).find(".csOnly").html(data[0].count_CS_Only_string);
        $("#raw_dataForm-"+i).find(".psOnly").html(data[0].count_PS_Only_string);
        $("#raw_dataForm-"+i).find(".w").html(data[0].count_3G_string);
        $("#raw_dataForm-"+i).find(".lte").html(data[0].count_LTE_string);
        $("#raw_dataForm-"+i).find(".date_time").html(data[0].year+"-"+data[0].month+"-"+data[0].day+" "+data[0].hour+"시");
    },
    error       : function(request, status, error) {
        alert("데이터가 없습니다");
    }
  });
}
