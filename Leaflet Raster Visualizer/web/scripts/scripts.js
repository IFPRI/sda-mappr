
var map;

function unPackData(packedData) {
	
    var data = [];
    packedData.forEach(function(row) {
    	var newRow = [];
    	row.forEach(function(v) {
    		if(v === "" || !isNaN(v)) {
    			newRow.push(v);
    		}
    		else if(v['c']) {
    			var count = v['c'];
    			var value = v['v'];
    			for(var i=0;i<count;i++) {
        			newRow.push(value);
    			}
    		}
    	});
    	data.push(newRow);
    });
    return data;
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function loadExtraIndicatorData(prefix, ids, layerObj, callback) {
	
	if(!ids || ids.length === 0) {
		callback();
		return;
	}
	
	var indicator_code = ids.pop()['id'];
	$.getJSON('data/rasters/'+prefix + "_" + indicator_code + '.json', function(result) {
		layerObj['referenceIndicatorData'][indicator_code] = result['data'];
		loadExtraIndicatorData(prefix, ids, layerObj, callback);
	});
}

function executeDomainSummary(prefix, result, layerObj, domainID, domainTitle) {
	
	layerObj['id'] = layerObj['label'];
	layerObj['data'] = result['data'];
	var ids = layerObj['referenceIndicatorDataIds'];
	loadExtraIndicatorData(prefix, ids, layerObj, function() {
		executeDomain(prefix, domainID, layerObj, function(domainResult) {
			$("#analysisResultsTitle").html(domainTitle);
			var html = "";
			for(var indicator in domainResult) {
				html += '<div class="indicatorLabel">'+indicator+"</div>";
				for(var domainClass in domainResult[indicator]) {
					var rawValue = domainResult[indicator][domainClass].toFixed(2);
					var value = addCommas(rawValue);
					html += '<div class="domainResultRow"><span class="domainLabel">'+domainClass+'</span><span class="domainValue">'+value+"</span></div>";
				}
			}
			$("#analysisResultsValues").html(html);
		}); 
	 });
}

function loadLayer(layerObj, callback) {
	
	var prefix = layerObj['prefix'];
	var indicator_code = layerObj['indicator_code'];
	
	$.getJSON('data/rasters/' + prefix + "_" + indicator_code + '.json', function(result) {
		$.getJSON('data/legends/' + indicator_code + '_legend.json', function(legend) {

			var valueClassLabels = legend['lgdlb'];
			var valueClasses = legend['lgdcl'];
			var valueColors = legend['lgdcr'];
			
			var rendererOptions = {
				'classes':valueClasses,
				'colors':valueColors,
				'noDataValue':'',
				'noDataColor':'transparent'
			};
			
			var isCategorized = result['isCategorized'];
			
			var cellRenderer = null;
			if(isCategorized) {
				valueClasses = valueClasses.map(function(v) {
					return parseInt(v);
				});	
				cellRenderer = getCategorizedRasterCellRenderer(rendererOptions);
			}
			else {
				cellRenderer = getRasterCellRenderer(rendererOptions);
			}
			
			var packedData = result['data'];
			var data = unPackData(packedData);
			var formula = layerObj['formula'];
			
			if(formula) {
				$(".domainAnalysis").show();
				$("#analysisResults").show();
			}
			else {
				$(".domainAnalysis").hide();
				$("#analysisResults").hide();
			}
			
			$("#runCountryDomainButton").click(function() {
				executeDomainSummary(prefix, result, layerObj, 'IS03', 'Country Domain Summary');
			});
			$("#runAEZ8DomainButton").click(function() {
				executeDomainSummary(prefix, result, layerObj, 'AEZ8_CLAS', 'AEZ-8 Domain Summary');
			});
			$("#runMarketshedDomainButton").click(function() {
				executeDomainSummary(prefix, result, layerObj, 'MSH_50K_ID', 'Marketsheds 50K Domain Summary');
			});
			$("#runDistrictDomainButton").click(function() {
				executeDomainSummary(prefix, result, layerObj, 'ADM2_CODE', 'District Domain Summary');
			});
			
			
			var options = {
				'renderer':cellRenderer,
				'data':data,
				'cell_height':parseFloat(result['cell_height']),
				'cell_width':parseFloat(result['cell_width']),
				'x_origin':parseFloat(result['x_origin']),
				'y_origin':parseFloat(result['y_origin']),
				'map':map,
				'onClick':function(e) {
					var value = e.pixelValue;
					if(isCategorized) {
						value = valueClassLabels[valueClasses.indexOf(value)];
					}
					else {
						value = value.toFixed(3);
					}
					var html = "<div>Pixel value: "+value+"</div>";
			        L.popup().setLatLng([e.latlng.lat, e.latlng.lng]).setContent(html).openOn(map);
				}
			};
			var rasterCanvasLayer = new L.RasterCanvasLayer(options);
			layerObj['layer'] = rasterCanvasLayer;
			layerObj['layer'].addTo(map);
			layerObj['active'] = 1;
			
			var rangeSliderControls = $("#rangeSliderControls");
			
			if(!isCategorized) {
	
				var onInputChange = function() {
					setTimeout(function() {
						rasterCanvasLayer.setValueRange(parseFloat(minValueInput.val()), parseFloat(maxValueInput.val()));
					}, 250);
				};
				
				var minValueInput = $('#minValue').on("keyup", onInputChange);
				var maxValueInput = $('#maxValue').on('keyup', onInputChange);
				
				var onValueRangeChange = function(min, max) {
					minValueInput.val(parseFloat(min).toFixed(3));
					maxValueInput.val(parseFloat(max).toFixed(3));				
					rasterCanvasLayer.setValueRange(min, max);
				};
				
				var minValue = result['min_value'];
				var maxValue = result['max_value'];
				onValueRangeChange(minValue, maxValue);
				
				var rangeSliderNode = $('<div>').attr("id", "rangeSlider");
				$('#rangeSliderContainer').empty().append(rangeSliderNode).show();
				
				var rangeSlider = rangeSliderNode.noUiSlider({
					range: {'min':minValue, 'max':maxValue},
					start: [minValue, maxValue],
					connect: true,
					step: 1
				});
				rangeSlider.on("slide", function(e) {
					var rangeValues = rangeSlider.val();
					var min = rangeValues[0];
					var max = rangeValues[1];
					onValueRangeChange(min, max);
				});
				rangeSliderControls.show();
			}
			else {
				rangeSliderControls.hide();
			}
			addLegend(isCategorized, valueClasses, valueColors, valueClassLabels, function(selectedValues) {
				rasterCanvasLayer.setActiveClassValues(selectedValues);
			});
			callback();
		});
	});
}

function getSummaryValueForIndicator(data, formula) {
	
	if(formula === "SUM" || formula === "AVG") {
		var sum = 0;
		var totalValues = 0;
		for(var i=0,ll=data.length;i<ll;i++) {		
			var rows = data[i];
			for(var j=0,rl=rows.length;j<rl;j++) {
				var value = rows[j];
				if(value !== '') {
					sum += parseFloat(value); 
					totalValues++;
				}
	 		}
		}
		if(formula === "AVG") {
			return sum/totalValues;
		}
		else {
			return sum;
		}
	}
}

function addLegend(isCategorized, valueClasses, valueColors, valueClassLabels, onClickCallback) {
	
	var activeClassValues = [];
	var classCheckboxes = $("#classCheckboxes");
	classCheckboxes.empty();
	
	valueClassLabels.forEach(function(className, idx) {
		
		var classValue = valueClasses[idx];
		var classColor = valueColors[idx];
		
		var row = $("<div>").addClass("classRow").appendTo(classCheckboxes);

		if(isCategorized) {
			$("<div>").addClass("classCheckbox checkBoxSelected").appendTo(row).click(function() {
				
				if($(this).hasClass("checkBoxSelected")) {				
					if(isCategorized) {
						$(this).removeClass("checkBoxSelected");
						activeClassValues = activeClassValues.filter(function(v) {
							return v !== classValue;
						});	
					}
				}
				else {
					if(isCategorized) {
						$(this).addClass("checkBoxSelected");
						activeClassValues.push(classValue);
					}
				}
				if(isCategorized) {
					onClickCallback(activeClassValues);
				}
			});	
			activeClassValues.push(classValue);
		}
		
		$("<div>").addClass("legendSwatch").css("background", classColor).appendTo(row);
		$("<div>").addClass("classLabel").html(className).appendTo(row);
	});
	if(isCategorized) {
		onClickCallback(activeClassValues);
	}
}
var activeLayer = null;
$(document).ready(function() {
			
	var northEast = L.latLng(11.759814674441921, 4.592285156249999);
	var southWest = L.latLng(4.444997369727273, -6.65771484375);
	var bounds = L.latLngBounds(southWest, northEast);	    		
	map = L.map('map',{
	}).fitBounds(bounds);
	L.tileLayer('http://{s}.tiles.mapbox.com/v3/github.map-xgq2svrz/{z}/{x}/{y}.png', {
		zoom: 7,
	}).addTo(map);
	
	var layerListNode = $("#layerList");
	var controlsNode = $("#controls");
	
	var layers = [];
	layers.push({prefix:'GHA', indicator_code:'TT_50K', label:'Travel time (50K)', formula:'AVG'});
	layers.push({prefix:'GHA', indicator_code:'AEZ5_CLAS', label:'AEZ-5 Class'});
	layers.push({prefix:'GHA', indicator_code:'BMI', label:'Body Mass Index'});
	layers.push({prefix:'GHA', indicator_code:'PN05_RUR', label:'Rural Population 2005',formula:'SUM'});
	layers.push({prefix:'GHA', indicator_code:'LS2012', label:'Land Sat 2012',formula:'SUM'});
	
	var referenceIndicatorDataIds = [{id:'AN05_CATT'}, {id:'AREA_TOTAL'}];
	layers.push({referenceIndicatorData:{}, prefix:'GHA', indicator_code:'AD05_CATT', label:'Cattle Density 2005',formula:'SUM(AN05_CATT)/SUM(AREA_TOTAL)*100', referenceIndicatorDataIds:referenceIndicatorDataIds});

	layers.forEach(function(layerObj) {
		
		var row = $("<div>").addClass("classRow").appendTo(layerListNode);
		$("<div>").addClass("classCheckbox").appendTo(row).click(function() {
			
			if($(this).hasClass("checkBoxSelected")) {
				
				$(this).removeClass("checkBoxSelected");
				map.removeLayer(layerObj['layer']);
				layerObj['active'] = 0;
				controlsNode.hide();
			}
			else {
				
				if(activeLayer) {
					$(this).removeClass("checkBoxSelected");
					map.removeLayer(activeLayer['layer']);
					activeLayer['active'] = 0;
					controlsNode.hide();
				}
				activeLayer = layerObj;
				
				$(".checkBoxSelected").removeClass("checkBoxSelected");
				$(this).addClass("checkBoxSelected");
				loadLayer(layerObj, function() {

					controlsNode.show();
				});
			}
		});
		$("<div>").addClass("classLabel").html(layerObj['label']).appendTo(row);
	});
	
	map.on("click", function(e) {
		layers.forEach(function(layerObj) {
			if(layerObj['active']) {
				layerObj['layer'].highlightPixelsWithSameValue(e);
			}
		});
	});	
});

function getRasterCellRenderer(options) {
	
	var classes = options.classes;
	var colors = options.colors;
	var noDataColor = options.noDataColor;
	var noDataValue = options.noDataValue;

	var funcBody = "if(value === '"+noDataValue+"') { return '"+noDataColor+"'; }";
	funcBody += "else if(value < " + classes[0] + ") { return '"+colors[0]+"'; }";
	for(var i=0, l=classes.length; i<l; i++) {
		funcBody += "else if(value >= " + classes[i] + " && value <= " + classes[i + 1] + ") { return '"+colors[i + 1]+"'; }";
	}
	funcBody += "else if(value > " + classes[classes.length-2] + ") { return '"+colors[classes.length-1]+"'; }";
	funcBody += "else { return '"+noDataColor+"'; }";
		
	return new Function('value', funcBody);
}
function getCategorizedRasterCellRenderer(options) {
	
	var classes = options.classes;
	var colors = options.colors;
	var noDataColor = options.noDataColor;
	var noDataValue = options.noDataValue;

	var funcBody = "if(value === '"+noDataValue+"') { return '"+noDataColor+"'; }";
	for(var i=0, l=classes.length-1; i<l; i++) {
		funcBody += "else if(value == " + classes[i] + ") { return '"+colors[i]+"'; }";
	}
	funcBody += "else { return '"+noDataColor+"'; }";
		
	return new Function('value', funcBody);
}






function processDomainSummary(domainCrossProductToIdxMap, indicatorObjs, callback) {
	
	console.time('processDomainSummary');
	
	var result = {};
	indicatorObjs.forEach(function(indicatorObj) {
		
		var indicatorID = indicatorObj['id'];
		var formula = indicatorObj['formula'];
		var indicatorData = indicatorObj['data'];
		var referenceData = indicatorObj['referenceIndicatorData'];
		
		result[indicatorID] = {};

		for(var key in domainCrossProductToIdxMap) {		
			
			var xyValues = domainCrossProductToIdxMap[key];
			result[indicatorID][key] = 0;
			
			if(formula === 'SUM') {
				result[indicatorID][key] = getSum(indicatorData, xyValues);
			}
			
			else if(formula === 'AVG') {
				
				var sum = getSum(indicatorData, xyValues);
				result[indicatorID][key] = sum / xyValues.length;
			}
			
			else if(formula === 'SUM(AN05_CATT)/SUM(AREA_TOTAL)*100') {
				
				var sum = getSum(indicatorData, xyValues);
				var areaTotalSum = getSum(referenceData['AREA_TOTAL'], xyValues);
				var rVal = (sum / areaTotalSum) * 100;
				result[indicatorID][key] = rVal;
			}
		}
	});
	console.timeEnd('processDomainSummary');
	callback(result);
}

function getSum(indicatorData, xyValues) {
	
	var sum = 0;
	for(var i=0,len=xyValues.length;i<len;i++) {
		var xy = xyValues[i];
		if(indicatorData[xy[1]]) {
			var val = parseFloat(indicatorData[xy[1]][xy[0]]);
			if(!isNaN(val)) {
				sum += val;
			}	
		}				
	}
	return sum;
}

function getDomainIdxCrossProuctsMap(domainObjs) {
	
	var domainClassesToIdxObj = {};
	
	if(domainObjs.length === 1) {
		
		var domainObj1 = domainObjs[0];
		
		for(var domain1Class in domainObj1['classToIdx']) {			
			var listOfListsOfXYsD1 = domainObj1['classToIdx'][domain1Class];
			for(var i=0,len=listOfListsOfXYsD1.length;i<len;i++) {
				if(domainClassesToIdxObj[domain1Class]) {
					domainClassesToIdxObj[domain1Class].push(listOfListsOfXYsD1[i]);
				}	
				else {
					domainClassesToIdxObj[domain1Class] = [];
					domainClassesToIdxObj[domain1Class].push(listOfListsOfXYsD1[i]);
				}
			}
		}
		return domainClassesToIdxObj;
	}
	else if(domainObjs.length === 2) {
		
		var reverseCopy = domainObjs.slice(0);
		reverseCopy.reverse();
				
		var domainCombonationsAlreadyProcessed = {};
		
		for(var i=0; i<domainObjs.length; i++) {
			
			var domainObj1 = domainObjs[i];
			var domain1ID = domainObj1['id'];
			
			for(var j=0; j<reverseCopy.length; j++) {
				
				var domainObj2 = reverseCopy[j];
				var domain2ID = domainObj2['id'];
				var domainComboUID = [domain1ID, domain2ID].sort().join("");

				if(domain1ID !== domain2ID && !domainCombonationsAlreadyProcessed[domainComboUID]) {

					domainCombonationsAlreadyProcessed[domainComboUID] = true;
					
					for(var domain1Class in domainObj1['classToIdx']) {
						
						var listOfListsOfXYsD1 = domainObj1['classToIdx'][domain1Class];										
						for(var domain2Class in domainObj2['classToIdx']) {
						
							var listOfListsOfXYsD2 = domainObj2['classToIdx'][domain2Class];
							for(var k=0, len=listOfListsOfXYsD1.length; k<len; k++) {
								
								var xyD1 = listOfListsOfXYsD1[k];
								for(var h=0, hLen=listOfListsOfXYsD2.length; h<hLen; h++) {
									
									var xyD2 = listOfListsOfXYsD2[h];
									if((xyD1[0] + "" + xyD1[1]) === (xyD2[0] + "" + xyD2[1])) {
										
										var classUID = domain1Class + "_" + domain2Class;
										if(domainClassesToIdxObj[classUID]) {
											domainClassesToIdxObj[classUID].push(xyD1);
										}
										else {
											domainClassesToIdxObj[classUID] = [];
											domainClassesToIdxObj[classUID].push(xyD1);
										}
									}
								}
							}
						}
					}
				}	
			}
		}
	}
	
	else if(domainObjs.length === 3) {
		
		var reverseCopy = domainObjs.slice(0);
		reverseCopy.reverse();
		
		var domainCombonationsAlreadyProcessed = {};
		
		for(var i=0; i<domainObjs.length; i++) {
			
			var domainObj1 = domainObjs[i];
			var domain1ID = domainObj1['id'];
			
			for(var j=0; j<reverseCopy.length; j++) {
				
				var domainObj2 = reverseCopy[j];
				var domain2ID = domainObj2['id'];
				
				for(var z=0; z<domainObjs.length; z++) {
					
					var domainObj3 = domainObjs[z];
					var domain3ID = domainObj3['id'];
					
					var domainComboUID = [domain1ID, domain2ID, domainObj3].sort().join("");

					if(domain1ID !== domain2ID && domain1ID !== domain3ID && domain2ID !== domain3ID && !domainCombonationsAlreadyProcessed[domainComboUID]) {

						domainCombonationsAlreadyProcessed[domainComboUID] = true;
						
						for(var domain1Class in domainObj1['classToIdx']) {
							var listOfListsOfXYsD1 = domainObj1['classToIdx'][domain1Class];		
							
							for(var domain2Class in domainObj2['classToIdx']) {							
								var listOfListsOfXYsD2 = domainObj2['classToIdx'][domain2Class];
								
								for(var domain3Class in domainObj3['classToIdx']) {
									var listOfListsOfXYsD3 = domainObj3['classToIdx'][domain3Class];	
									
									for(var k=0, len=listOfListsOfXYsD1.length; k<len; k++) {
										var xyD1 = listOfListsOfXYsD1[k];
										
										for(var h=0, hLen=listOfListsOfXYsD2.length; h<hLen; h++) {											
											var xyD2 = listOfListsOfXYsD2[h];
											
											for(var y=0, yLen=listOfListsOfXYsD3.length; y<yLen; y++) {
												var xyD3 = listOfListsOfXYsD3[y];
												
												if((xyD1[0] + "" + xyD1[1]) === (xyD2[0] + "" + xyD2[1]) && (xyD1[0] + "" + xyD1[1]) === (xyD3[0] + "" + xyD3[1])) {
													
													var classUID = domain1Class + "_" + domain2Class + "_" + domain3Class;
													
													if(domainClassesToIdxObj[classUID]) {
														domainClassesToIdxObj[classUID].push(xyD1);
													}					
													else {
														domainClassesToIdxObj[classUID] = [];
														domainClassesToIdxObj[classUID].push(xyD1);
													}
												}
											}
										}
									}
								}
							}
						}
					}	
				}
			}
		}		
	}

	return domainClassesToIdxObj;
}


function getIndicatorObj(id, indicatorJSON) {
		
	var IndicatorObj = {};
	IndicatorObj['id'] = id;
	IndicatorObj['data'] = indicatorJSON['data'];
	IndicatorObj['formula'] = "SUM";

	return IndicatorObj;
}

function getDomainObj(prefix, id, callback) {
	
	$.getJSON('data/rasters/' + prefix + "_" + id +'.json', function(domainJSON) {
		
		var domainObj = {};
		domainObj['id'] = id;
		domainObj['data'] = domainJSON['data'];
		domainObj['classToIdx'] = {};
		var uniqueValues = {};
		domainObj['data'].forEach(function(row, y) {
			row.forEach(function(value, x) {
				if(value !== id && !isNaN(parseFloat(value))) {
					if(!domainObj['classToIdx'][value]) {
						domainObj['classToIdx'][value] = [];
					}
					domainObj['classToIdx'][value].push([x, y]);
					uniqueValues[value] = 1;
				}
			});
		});
		domainObj['uniqueClasses'] = Object.keys(uniqueValues);
		callback(domainObj);
	});
}

function executeDomain(prefix, domainID, indicatorObj, callback) {
	
	var indicatorObjs = [indicatorObj];
	getDomainObj(prefix, domainID, function(domainObj) {
		var domainObjs = [domainObj];
		var domainCrossProductToIdxMap = getDomainIdxCrossProuctsMap(domainObjs);
		processDomainSummary(domainCrossProductToIdxMap, indicatorObjs, callback);
	});
}