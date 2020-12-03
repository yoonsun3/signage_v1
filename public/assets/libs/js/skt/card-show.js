$(document).ready(function(){

	//3자리 콤마 찍는 함수
	function numberWithCommas(x) {
		if( x == null ){
		x=0;
		}
		return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	// Repeat function in every second
	function repeat(func, times) {
		func();
		times && --times && setTimeout(repeat, 1000, func, times);
	}

	// Card 및 header에 있는 시간 갱신 (서버 질의는 showCards에서 10초마다, 시간 갱신은 1초마다)
	function refreshTime(){
		var targets = $(".card-txt-local-time");
		for(var i = 0; i < targets.length; i++){
			$(targets[i]).html(moment($(targets[i]).html()).add(1,'seconds').format("MM-DD HH:mm:ss"));
		}
		$(".korea-time").html(moment($(".korea-time").html(), 'YY-MM-DD HH:mm:ss').add(1,'seconds').format("YY-MM-DD HH:mm:ss"));
	}

	function showCards(){
		var data_checked;

		if($(".btn-secondary").html() == "OUTBOUND") data_checked = "00";
		else if($(".btn-secondary").html() == "INBOUND") data_checked = "99";

		if($(".btn-secondary").html() == "OUTBOUND" || $(".btn-secondary").html() == "INBOUND"){
			var url = "/roaming_api/v1/card_subs?data_checked=" + data_checked;
			$.ajax({
				url: url,
				method: "GET"
			})
			.done(function(data){
				var result = data;
				for(var i = 0; i < result.length; i++){
					$("#roaming-card-"+i).find(".card-txt-country-name").html(result[i].country_name);
					$("#roaming-card-"+i).find(".card-txt-operator-name").html(result[i].operator_name);
					$("#roaming-card-"+i).find(".card-txt-lte-count").html(result[i].subs_count_LTE_string);
					$("#roaming-card-"+i).find(".card-txt-3g-count").html(result[i].subs_count_3G_string);
					$("#roaming-card-"+i).find(".card-txt-local-time").html(result[i].date);
					$("#roaming-card-"+i).find(".card-txt-total-count").html(result[i].subs_count_Total_string+'명');
					$("#roaming-card-"+i).find(".card-loc").html(result[i].loc);
					$("#roaming-card-"+i).find(".card-MCC").html(result[i].MCC);
					$("#roaming-card-"+i).find(".card-MNC").html(result[i].MNC);
					if(result[i].event){
						$("#roaming-card-"+i).css('background-color','#b2cce6');//#4a4ab1 .card-txt-operator-name   color #ff407b
					}
					else{
						$("#roaming-card-"+i).css('background-color','#333366');
						//$("#roaming-card-"+i).find(".roaming-card-body").css('background-color','#333366');//#ff9900
					}
				}
				$("#navbarSupportedContent").find(".korea-time").html(result[0].korea_time);
				repeat(refreshTime, 10);
			});
		}
	}

	function getTotalInfo(){
		$.ajax({
			url: "/roaming_api/v1/total_info",
			method: "GET"
		}).done(function(data){
			var ob_lte_cnt = 0;
			var ob_3g_cnt = 0;
			var ib_lte_cnt = 0;
			var ib_3g_cnt = 0;

			for(var i = 0; i < data.length; i++){
				$("#total-info-"+data[i].MCC+"-"+data[i].MNC).find(".ob-lte-subs-cnt").html(data[i].ob_subs_count_LTE_string);
				$("#total-info-"+data[i].MCC+"-"+data[i].MNC).find(".ob-3g-subs-cnt").html(data[i].ob_subs_count_3G_string);
				$("#total-info-"+data[i].MCC+"-"+data[i].MNC).find(".ib-lte-subs-cnt").html(data[i].ib_subs_count_LTE_string);
				$("#total-info-"+data[i].MCC+"-"+data[i].MNC).find(".ib-3g-subs-cnt").html(data[i].ib_subs_count_3G_string);
				ob_lte_cnt += data[i].ob_subs_count_LTE;
				ob_3g_cnt += data[i].ob_subs_count_3G;
				ib_lte_cnt += data[i].ib_subs_count_LTE;
				ib_3g_cnt += data[i].ib_subs_count_3G;
			}

			$(".total_data").html("OB LTE: " + numberWithCommas(ob_lte_cnt) + "<br>3G: " + numberWithCommas(ob_3g_cnt));
			$(".total_data_ib").html("IB LTE: " + numberWithCommas(ib_lte_cnt) + "<br>3G: " + numberWithCommas(ib_3g_cnt));
			
		});
	}


	function executePeriodicalFunc(func, delay){
		func();
		setInterval(func,delay);
	}

	executePeriodicalFunc(showCards, 10000);
	executePeriodicalFunc(getTotalInfo, 10000);

});
