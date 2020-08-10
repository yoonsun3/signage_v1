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
    $(".dra-selection-row").find('button').removeClass('selected-dra-btn');
    $("#"+id).addClass('selected-dra-btn');

    $.ajax({
        url: "/roaming_api/v1/dra_rm",
        data: { dra_operator : dra_operator },
        dataType: "json",
        method: "GET"
    }).done(function(data){
        var result = data.result;
        // sequence가 가입자 순서로 나열된 MCC
        sequence_arr = data.target_mcc;

        $("#dra-smr-txt").show();

        var ob_subs_count = 0;
        // 우선 현재는 OB만 대상으로 보여줌. IB는 추후 개발 여부 결정
        var ib_subs_count = 0;
        var country_count = sequence_arr.length;
        var ob_op_count = 0;

        // Table 초기화
        $("#dra-mno-thead").empty();
        $("#dra-mno-tbody").empty();

        $("#dra-mno-thead").append("<tr><th> No. </th><th> 국가 </th><th> 사업자 </th><th> OB 가입자수 </th><th> IB 가입자수 </th><th> 중계사업자(해외&rarr;SKT) </th><th> 중계사업자(SKT&rarr;해외) </th></tr>");

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
                
                if(result[mcc][key]['dra_in'][0].toUpperCase() == dra_operator.toUpperCase()){
                    html += "<td class='selected-dra'>" + result[mcc][key]['dra_in'][0] + "</td>";
                    ob_op_count += 1;
                    ob_subs_count += result[mcc][key]['ob_lte_subs_cnt'];
                }
                else html += "<td>" + result[mcc][key]['dra_in'][0] + "</td>";
                
                if(result[mcc][key]['dra_out'].toUpperCase() == dra_operator.toUpperCase()) html += "<td class='selected-dra' rowspan='" + dra_span_num + "'>" + result[mcc][key]['dra_out'] + "</td>";
                else html += "<td rowspan='" + dra_span_num + "'>" + result[mcc][key]['dra_out'] + "</td>";
                
                html += "</tr>"

                // dra_in이 1개 초과하는 경우, 추가 row
                for(var k = 1; k < dra_span_num; k++){
                    if(result[mcc][key]['dra_in'][k].toUpperCase() == dra_operator.toUpperCase()){
                        html += "<tr><td class='selected-dra'>" + result[mcc][key]['dra_in'][k] + "</td>";
                        ob_op_count += 1;
                        ob_subs_count += result[mcc][key]['ob_lte_subs_cnt'];
                    }
                    else html += "<tr><td>" + result[mcc][key]['dra_in'][k] + "</td>";
                }

                index++;
            }
        }

        $("#dra-mno-tbody").append(html);
        $("#dra-smr-txt-country").text(country_count);
        $("#dra-smr-txt-opcnt").text(ob_op_count);
        $("#dra-smr-txt-obcnt").text(ob_subs_count);

    });
}

jQuery(document).ready(function($) {
    'use strict';

    // 중계사업자 메뉴에서 "확인" 버튼 클릭 시, hop 정보 확인
    

}); // END OF JQUERY