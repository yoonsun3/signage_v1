function layer_open2(){

  var state = $('#event-tab').attr('aria-selected');
  var temp;
  var bg;
  if(state == 'true'){
    temp = $('#layer4');
    bg = temp.prev().hasClass('bg');	//dimmed 레이어를 감지하기 위한 boolean 변수

      if(bg){
        $('#event_searchForm').fadeIn();	//'bg' 클래스가 존재하면 레이어가 나타나고 배경은 dimmed 된다.
      }
      else{
          temp.fadeIn();
      }
  }

  else{
    temp = $('#layer5');
    bg = temp.prev().hasClass('bg');	//dimmed 레이어를 감지하기 위한 boolean 변수

      if(bg){
        $('#issue_searchForm').fadeIn();	//'bg' 클래스가 존재하면 레이어가 나타나고 배경은 dimmed 된다.
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

        e.preventDefault();
    });


  $('#event_search_Btn').click(function(e){	//배경을 클릭하면 레이어를 사라지게 하는 이벤트 핸들러
      $('.layer').fadeOut();
      e.preventDefault();
  });

  $('#issue_search_Btn').click(function(e){	//배경을 클릭하면 레이어를 사라지게 하는 이벤트 핸들러
      $('.layer').fadeOut();
      e.preventDefault();
  });


  $('.layer .bg').click(function(e){	//배경을 클릭하면 레이어를 사라지게 하는 이벤트 핸들러
      $('.layer').fadeOut();
      e.preventDefault();
  });

  $('#event_reset2').click(function(e){
      $('#eventStYear2').val('');
      $('#eventEnYear2').val('');
      $('#eventStMon2').val('');
      $('#eventEnMon2').val('');
      $('#eventStDay2').val('');
      $('#eventEnDay2').val('');
      $('#eventSearch').val(''); //입력창 초기화
  });

  $('#issue_reset2').click(function(e){
      $('#issue_Country_name2').val('');
      $('#issue_Operator_name2').val('');
      $('#issueYear2').val('');
      $('#issueMon2').val('');
      $('#issueDay2').val('');
      $('#issueSearch').val('');
  });
}
