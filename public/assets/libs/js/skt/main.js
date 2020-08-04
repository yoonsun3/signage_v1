function returnDraTarget(){
    var target_list = $($("input:checked"));
    var mcc_mnc = [];

    for(var i = 0; i < target_list.length; i++){
        mcc_mnc.push($(target_list[i]).parent().attr("mcc-mnc"));
    }

    return mcc_mnc;
}

function viewRmInfo(id){
    var dra_operator = id.split('-').slice(-1)[0];
    dra_operator = dra_operator.toUpperCase();
    
    $("#selected-operator").text(dra_operator);

    $.ajax({
        url: "/roaming_api/v1/dra_rm",
        data: { dra_operator : dra_operator },
        dataType: "json",
        method: "GET"
    }).done(function(data){
        result = data.result;
        // sequence가 가입자 순서로 나열된 MCC
        sequence_arr = data.target_mcc;
        
        // Table 초기화
        $("#dra-mno-thead").empty();
        $("#dra-mno-tbody").empty();

        $("#dra-mno-thead").append("<tr><th> No. </th><th> 국가 </th><th> 사업자 </th><th> OB 가입자수 </th><th> IB 가입자수 </th><th> 중계사업자 </th></tr>")

        var html = "";
        for(var i = 0; i < sequence_arr.length; i++){
            var mcc = parseInt(sequence_arr[i]);
            var index = 0;
            var country_span_num = 0;

            for(var key in result[mcc]){
                country_span_num += result[mcc][key]['dra_in'].length;
            }

            for(var key in result[mcc]){
                var dra_span_num = result[mcc][key]['dra_in'].length;
                
                if(index == 0){
                    html += "<tr class='dra-mno-top-tr'>"
                    html += "<td rowspan='" + country_span_num + "'>" + (i+1) + "</td>";
                    html += "<td rowspan='" + country_span_num + "'>" + result[mcc][key]['country_name'] + "</td>";
                }
                else{
                    html += "<tr>"
                }

                html += "<td rowspan='" + dra_span_num + "'>" + result[mcc][key]['operator_name'] + "</td>";
                html += "<td rowspan='" + dra_span_num + "'>" + result[mcc][key]['ob_lte_subs_cnt'] + "</td>";
                html += "<td rowspan='" + dra_span_num + "'>" + result[mcc][key]['ib_lte_subs_cnt'] + "</td>";
                
                if(result[mcc][key]['dra_in'][0].toUpperCase() == dra_operator.toUpperCase()) html += "<td class='selected-dra'>" + result[mcc][key]['dra_in'][0] + "</td>";
                else html += "<td>" + result[mcc][key]['dra_in'][0] + "</td>";
                
                html += "</tr>"

                // dra_in이 1개 초과하는 경우, 추가 row
                for(var k = 1; k < dra_span_num; k++){
                    if(result[mcc][key]['dra_in'][k].toUpperCase() == dra_operator.toUpperCase()) html += "<tr><td class='selected-dra'>" + result[mcc][key]['dra_in'][k] + "</td>";
                    else html += "<tr><td>" + result[mcc][key]['dra_in'][k] + "</td>";
                }

                index++;
            }
        }

        $("#dra-mno-tbody").append(html);

    });
}

jQuery(document).ready(function($) {
    'use strict';

    // 중계사업자 메뉴에서 "확인" 버튼 클릭 시, hop 정보 확인
    

}); // END OF JQUERY