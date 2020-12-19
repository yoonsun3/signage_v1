$(document).ready(function(){

  // Search Flag On & Off
  var SF = true;

  function executePeriodicalFunc(func, delay){
		func();
		setInterval(func,delay);
  }

  // Card 및 header에 있는 시간 갱신 (서버 질의는 showSearchRes에서 10초마다, 시간 갱신은 1초마다)
  function refreshTimePopup(){
		var targets = $(".card-txt-local-time");
		for(var i = 0; i < targets.length; i++){
			$(targets[i]).html(moment($(targets[i]).html()).add(1,'seconds').format("MM-DD HH:mm:ss"));
		}
  }
  
  // Repeat function in every second
	function repeat(func, times) {
		func();
		times && --times && setTimeout(repeat, 1000, func, times);
	}
  
  function showSearchRes(){
    if(SF){
      var input = $("#search").val();
      var option = $("#search_option").val();
      console.log("test1 : "+option+input);

      if($(".btn-secondary").html() == "OUTBOUND") option = option;
      else if($(".btn-secondary").html() == "INBOUND") option = parseInt(option) + 10;
      console.log("test2 : "+option+input);

      $.ajax({
        method      : 'GET',
        url         : '/roaming_api/v1/card_subs',
        traditional : true,
        dataType    : 'html',
        data        : {data_checked: option+input},
        success     : function(data) {

          if(!data){
            $("#cards").empty();
            SF = false;
            alert("검색결과가 없습니다.");
          } //넘어온 데이터가 비어있을 경우 알람띄우게 함
          else{ 
            $("#cards").html(data);
            repeat(refreshTimePopup, 10);
          }
          //$('#search').val(''); //검색 후 검색창 초기화
          
        },
        error       : function(request, status, error) {
            //alert(error);
        }
      });
    }

    console.log("fin");
  }

  function showSearchResAfterChgBound(){
    var input = $("#search").val();
    var option = $("#search_option").val();

    if($(".btn-secondary").html() == "OUTBOUND") option = option;
    else if($(".btn-secondary").html() == "INBOUND") option = parseInt(option) + 10;

    $.ajax({
      method      : 'GET',
      url         : '/roaming_api/v1/card_subs',
      traditional : true,
      dataType    : 'html',
      data        : {data_checked: option+input},
      success     : function(data) {

        if(!data){
          $("#cards").empty();
          alert("검색결과가 없습니다.");
          SF = false;
        } //넘어온 데이터가 비어있을 경우 알람띄우게 함
        else{ 
          $("#cards").html(data);
        }
        //$('#search').val(''); //검색 후 검색창 초기화
      },
      error       : function(request, status, error) {
          //alert(error);
      }
    });
  }

  executePeriodicalFunc(showSearchRes, 10000);


  // IB - OB Selection
  $('#btn-ob').click(function(){
    state=0;
    $(this).addClass('btn-secondary');
    $(this).removeClass('btn-outline-secondary');
    $('#btn-ib').addClass('btn-outline-secondary');
    $('#btn-ib').removeClass('btn-secondary');
    $('#btn-dra').addClass('btn-outline-secondary');
    $('#btn-dra').removeClass('btn-secondary');

    showSearchResAfterChgBound();
  });


  $('#btn-ib').click(function(){
    var state=1;
    $(this).addClass('btn-secondary');
    $(this).removeClass('btn-outline-secondary');
    $('#btn-ob').addClass('btn-outline-secondary');
    $('#btn-ob').removeClass('btn-secondary');
    $('#btn-dra').addClass('btn-outline-secondary');
    $('#btn-dra').removeClass('btn-secondary');
      
    showSearchResAfterChgBound();
  });

  // Search Btn Event
  $("#search-btn").click(function(){
    SF = true;
    showSearchResAfterChgBound();
  });

  // Search Keydown Event
  $("#search").keydown(function(key) {
    if (key.keyCode == 13){
      SF = true;
      showSearchResAfterChgBound();
    }
  });

});
