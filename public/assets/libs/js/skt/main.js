function returnDraTarget(){
    var target_list = $($("input:checked"));
    var mcc_mnc = [];

    for(var i = 0; i < target_list.length; i++){
        mcc_mnc.push($(target_list[i]).parent().attr("mcc-mnc"));
    }

    return mcc_mnc;
}

jQuery(document).ready(function($) {
    'use strict';

    // 중계사업자 메뉴에서 "확인" 버튼 클릭 시, hop 정보 확인
    

}); // AND OF JQUERY