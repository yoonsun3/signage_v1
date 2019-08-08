function show_rawData(i){
  var temp;
  var bg;

  var json = new Object();
  var time_offset = 0;

  json.time_offset = time_offset;
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
        if(data[0].year==0){
          alert("데이터가 더이상 없습니다");
          return;
        }
        else{
          $("#raw_dataForm-"+i).find(".count_202_200").html(data[0].count_202_200_string);
          $("#raw_dataForm-"+i).find(".count_200_203").html(data[0].count_200_203_string);
          $("#raw_dataForm-"+i).find(".count_202_203").html(data[0].count_202_203_string);
          $("#raw_dataForm-"+i).find(".count_200_204").html(data[0].count_200_204_string);
          $("#raw_dataForm-"+i).find(".count_202_204").html(data[0].count_202_204_string);
          $("#raw_dataForm-"+i).find(".date_time").html(data[0].year+"-"+data[0].month+"-"+data[0].day+" "+data[0].hour+"시");
        }
    },
    error       : function(request, status, error) {
        alert(error);
    }
  });

  temp = $('#layer_raw_dataForm-'+i);
  bg = temp.prev().hasClass('bg');

  if(bg){
    $('#raw_dataForm-'+i).fadeIn();
  }
  else{
    temp.fadeIn();
  }

  // 화면의 중앙에 레이어를 띄운다.
  if (temp.outerHeight() < $(document).height() )
    temp.css('margin-top', '-'+temp.outerHeight()/2+'px');
  else
    temp.css('top', '0px');

  if (temp.outerWidth() < $(document).width() )
    temp.css('margin-left', '-'+temp.outerWidth()/2+'px');
  else
    temp.css('left', '0px');


  temp.find('#close_raw_dataForm').click(function(e) {
    $('#raw_dataForm-'+i).fadeOut();
    time_offset = 0;
    e.preventDefault();
  });

  temp.find('#date_time_before').click(function(e){
      time_offset -= 1; //1시간 전으로
      if(show_before_rawData(i,time_offset)==0){ //데이터가 없다면
        time_offset += 1;
        alert("데이터가 더이상 없습니다");
        return;
      }
  });

  temp.find('#date_time_after').click(function(e){
      time_offset += 1; //1시간 후로
      if(time_offset > 0){ //0이 가장 최신 데이터 이므로 0보다 클 수 없음
        time_offset -= 1;
        alert("데이터가 더이상 없습니다");
        return;
      }

      show_after_rawData(i,time_offset);

  });
}
