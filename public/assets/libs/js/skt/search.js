$(document).ready(function(){

  function executePeriodicalFunc(func, delay){
		func();
		setInterval(func,delay);
  }
  
  function showSearchRes(){
    var input = $("#search").val();
    var option = $("#search_option").val();
    console.log(option+input);

    $.ajax({
      method      : 'GET',
      url         : '/roaming_api/v1/card_subs',
      traditional : true,
      dataType    : 'html',
      data        : {data_checked: option+input},
      success     : function(data) {

        if(!data){alert("검색결과가 없습니다.")} //넘어온 데이터가 비어있을 경우 알람띄우게 함
        else{ $("#cards").html(data);}
        //$('#search').val(''); //검색 후 검색창 초기화

        console.log(data);

      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });

    console.log("fin");
  }

  executePeriodicalFunc(showSearchRes, 10000);

});
