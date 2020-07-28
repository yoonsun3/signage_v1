function create_search_tbl(mno_data){
	for(var i = 0; i < mno_data.length; i++){
		console.log(i);
	}

}

function getRandomArbitrary(min, max) {
	return parseInt(Math.random() * (max - min) + min);
  }

$(document).ready(function(){

    var state=0;
    $('#btn-ob').click(function(){
  		state=0;
  		$(this).addClass('btn-secondary');
  		$(this).removeClass('btn-outline-secondary');
  		$('#btn-ib').addClass('btn-outline-secondary');
		$('#btn-ib').removeClass('btn-secondary');
		$('#btn-dra').addClass('btn-outline-secondary');
		$('#btn-dra').removeClass('btn-secondary');
		  
		if(!$("#cards-container").length){
			$("#dra-container").remove();
			$("#main-panel").prepend("<div id='cards-container'><div class='ecommerce-widget'><div id='cards' class='row'></div></div></div>");
			$("#event-and-total-info-panel").css('display','flex');
		}

		$.ajax({
			url: "/roaming_api/v1/card_subs?data_checked=10",
			dataType    : 'html',
			method: "GET"
  		})
  		.done(function(data){

	        $("#cards").html(data);/*
  				var result = data;
  				for(var i = 0; i < result.length; i++){
					console.log(result[i]);
  					$("#roaming-card-"+i).find(".card-txt-country-name").html(result[i].country_name);
  					$("#roaming-card-"+i).find(".card-txt-operator-name").html(result[i].operator_name);
  					$("#roaming-card-"+i).find(".card-txt-lte-count").html(result[i].subs_count_LTE_string);
  					$("#roaming-card-"+i).find(".card-txt-3g-count").html(result[i].subs_count_3G_string);
  					$("#roaming-card-"+i).find(".card-txt-local-time").html(result[i].date);

        	}//*/
  		});
    });

    $('#btn-ib').click(function(){
  		var state=1;
  		$(this).addClass('btn-secondary');
  		$(this).removeClass('btn-outline-secondary');
  		$('#btn-ob').addClass('btn-outline-secondary');
		$('#btn-ob').removeClass('btn-secondary');
		$('#btn-dra').addClass('btn-outline-secondary');
		$('#btn-dra').removeClass('btn-secondary');
		  
		$.ajax({
  			url: "/roaming_api/v1/card_subs?data_checked=11",
			dataType    : 'html',
			method: "GET"
  		})
  		.done(function(data){
			if(!$("#cards-container").length){
				$("#dra-container").remove();
				$("#main-panel").prepend("<div id='cards-container'><div class='ecommerce-widget'><div id='cards' class='row'></div></div></div>");
				$("#event-and-total-info-panel").css('display','flex');
			}
			$("#cards").html(data);/*
				var result = data;
				for(var i = 0; i < result.length; i++){
					console.log(result[i]);
					$("#roaming-card-"+i).find(".card-txt-country-name").html(result[i].country_name);
					$("#roaming-card-"+i).find(".card-txt-operator-name").html(result[i].operator_name);
					$("#roaming-card-"+i).find(".card-txt-lte-count").html(result[i].subs_count_LTE_string);
					$("#roaming-card-"+i).find(".card-txt-3g-count").html(result[i].subs_count_3G_string);
					$("#roaming-card-"+i).find(".card-txt-local-time").html(result[i].date);
				}
			//*/
  		});
	});
	
	$('#btn-dra').click(function(){
		$(this).addClass('btn-secondary');
  		$(this).removeClass('btn-outline-secondary');
  		$('#btn-ib').addClass('btn-outline-secondary');
		$('#btn-ib').removeClass('btn-secondary');
		$('#btn-ob').addClass('btn-outline-secondary');
		$('#btn-ob').removeClass('btn-secondary');

		$.ajax({
			url: "/roaming_api/v1/card_subs?data_checked=12",
			dataType    : 'html',
			method: "GET"
		})
		.done(function(data){
			if(!$("#dra-container").length){
				$("#cards-container").remove();
				$("#main-panel").prepend("<div id='dra-container'></div>")
				$("#event-and-total-info-panel").css('display','none');
			}
		  	$("#dra-container").html(data);
			$(".dra-search-body").mCustomScrollbar();
			$("#dra-result-body").mCustomScrollbar();

			// 검색 event 할당
			$("#dra-search-input").keydown(function(){
				console.log($("#dra-search-input").val());
				create_search_tbl([1,2,3,4]);
			});

			// 확인 버튼 클릭 시, Hop 정보 확인 Event 할당
			$("#dra-search-btn").click(function(){
				var target = returnDraTarget();
				
				$.ajax({
					url: "/roaming_api/v1/dra_hops",
					dataType    : 'json',
					data : {target: target},
					method: "GET"
				})
				.done(function(data){
					var result = data.result;
					var mcc_mnc = data.mcc_mnc;
					var html_template = '';
					var hop_mnc_dict = {}; // { 'hop' : ['mcc mnc1', 'mcc mnc2', ... ] }
					var hop_id_dict = {}; // { 'hop' : ['hop-row-id-1', 'hop-row-id-2', ... ]}

					$(".hop-row").remove();

					var index = 0;

					for(var i = 0; i < mcc_mnc.length; i++){
						console.log($("td[mcc-mnc='"+mcc_mnc[i]+"']").html());
						
						for(var j = 0; j < result[i].length; j++){
							html_template += '<div class="hop-row" id="hop-row-id-'+index+'">';
							html_template += '<button class="dra-result-txt-mno"><span class="no-overflow">'+$("td[mcc-mnc='"+mcc_mnc[i]+"']").html()+'</span></button>';
							html_template += '<button class="dra-result-txt-num">'+(j+1)+'</button>';
							for(var k = 0; k < result[i][j].length; k++){
								html_template += '<button class="dra-result-txt-hop '+result[i][j][k].split(".").join("")+'"><span class="no-overflow">'+result[i][j][k]+'</span></button>';
								
								// 공통 DRA Hop 확인을 위해 hop_dict에 정리
								if(result[i][j][k] in hop_mnc_dict){
									if(!hop_mnc_dict[result[i][j][k]].includes(mcc_mnc[i])) hop_mnc_dict[result[i][j][k]].push(mcc_mnc[i]);
									hop_id_dict[result[i][j][k]].push('hop-row-id-'+index);
								}
								else{
									hop_mnc_dict[result[i][j][k]] = [mcc_mnc[i]];
									hop_id_dict[result[i][j][k]] = ['hop-row-id-'+index];
								}
							}

							if(!html_template.includes('dra-result-txt-hop')){
								html_template += '<span class="dra-result-txt-alert">DRA 데이터 분석 시간대에 해당 사업자의 트래픽이 존재하지 않습니다.</span>'
								html_template = html_template.replace('<button class="dra-result-txt-num">1</button>','');
							}

							html_template += '</div>';
							$("#dra-result-body").children('.mCustomScrollBox').children('.mCSB_container').append(html_template);
							html_template = '';
							index++;
						}
					}

					var colors = ['#3b2e5a','#394989','#4ea0ae','#99b898','#ff847c','#e84a5f','#006a71','#838383','#848ccf','#93b5e1','#be5683','#6f4a8e','221f3b','#050505'];
					var index = getRandomArbitrary(0,14);

					for(var key in hop_mnc_dict){
						var col = colors[index%14];
						if(hop_mnc_dict[key].length > 1){
							for(var i = 0; i < hop_id_dict[key].length; i++){
								$("#"+hop_id_dict[key][i]).prependTo($("#dra-result-body").children('.mCustomScrollBox').children('.mCSB_container'));
								
								$("#"+hop_id_dict[key][i]).children('.'+key.split('.').join('')).css('background-color',col);
							}
						}

						index++;
					}

				});
			});

		});

	});
});
