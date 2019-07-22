function layer_open(){

  var state = $('#event-tab').attr('aria-selected');
  var temp;
  var bg;
  if(state == 'true'){
    temp = $('#layer2');
    bg = temp.prev().hasClass('bg');	//dimmed 레이어를 감지하기 위한 boolean 변수

      if(bg){
        $('#event_addForm').fadeIn();	//'bg' 클래스가 존재하면 레이어가 나타나고 배경은 dimmed 된다.
      }
      else{
          temp.fadeIn();
      }
  }

  else{
    temp = $('#layer3');
    bg = temp.prev().hasClass('bg');	//dimmed 레이어를 감지하기 위한 boolean 변수

      if(bg){
        $('#issue_addForm').fadeIn();	//'bg' 클래스가 존재하면 레이어가 나타나고 배경은 dimmed 된다.
      }
      else{
          temp.fadeIn();
      }
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

  temp.find('#close_addForm').click(function(e){
      if(bg){
        $('.layer').fadeOut(); //'bg' 클래스가 존재하면 레이어를 사라지게 한다.
      }
      else{
        temp.fadeOut();
      }
      $('#eventStYear').val('');
      $('#eventEnYear').val('');
      $('#eventStMon').val('');
      $('#eventEnMon').val('');
      $('#eventStDay').val('');
      $('#eventEnDay').val('');
      $('#eventAdd').val(''); //입력창 초기화
      e.preventDefault();
  });

  $('#event_add_Btn').click(function(e){	//배경을 클릭하면 레이어를 사라지게 하는 이벤트 핸들러
      $('#event_addForm').fadeOut();
      e.preventDefault();
  });

  $('#issue_add_Btn').click(function(e){	//배경을 클릭하면 레이어를 사라지게 하는 이벤트 핸들러
      $('#issue_addForm').fadeOut();
      e.preventDefault();
  });

  $('.layer .bg').click(function(e){	//배경을 클릭하면 레이어를 사라지게 하는 이벤트 핸들러
      $('.layer').fadeOut();
      $('#eventStYear').val('');
      $('#eventEnYear').val('');
      $('#eventStMon').val('');
      $('#eventEnMon').val('');
      $('#eventStDay').val('');
      $('#eventEnDay').val('');
      $('#eventAdd').val(''); //입력창 초기화
      e.preventDefault();
  });

  $('#event_reset').click(function(e){
      $('#eventStYear').val('');
      $('#eventEnYear').val('');
      $('#eventStMon').val('');
      $('#eventEnMon').val('');
      $('#eventStDay').val('');
      $('#eventEnDay').val('');
      $('#eventAdd').val(''); //입력창 초기화
  });

  $('#issue_reset').click(function(e){
      $('#issue_Country_name').val('');
      $('#issue_Operator_name').val('');
      $('#issueYear').val('');
      $('#issueMon').val('');
      $('#issueDay').val('');
      $('#issueAdd').val(''); //입력창 초기화
  });

}
