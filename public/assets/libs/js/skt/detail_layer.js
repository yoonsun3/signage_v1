function detail_layer_open(i){
  var tr = $('#detail-btn-'+i).parent().parent();
  var td = tr.children();

  var mcc = td.eq(9).text();
  var mnc = td.eq(10).text();

  var temp;
  var bg;

  temp = $('#detail-info-layer-'+i);
  bg = temp.prev().hasClass('bg');	//dimmed 레이어를 감지하기 위한 boolean 변수

  if(bg){
    $('#detail-info-'+i).fadeIn();	//'bg' 클래스가 존재하면 레이어가 나타나고 배경은 dimmed 된다.
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

  temp.find('#close_detail_layerForm').click(function(e){
      if(bg){
        $('#detail-info-'+i).fadeOut(); //'bg' 클래스가 존재하면 레이어를 사라지게 한다.
      }
      else{
        temp.fadeOut();
      }
      e.preventDefault();
  });


}
