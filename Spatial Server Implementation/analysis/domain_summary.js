
var fs = require("fs");
var path = require('path');

//AD05_CATT
//"#ffffff|#fcdd5d|#f7ba3e|#d68522|#9e4410|#6b0601";
//"";
//""

//http://apps.harvestchoice.org/HarvestChoiceApi/0.3/api/cellvalues?indicatorIds=70&domainIds=25&domainIds=30&domainIds=27&countryIds=GHA

function main() {
	
	var prefix = 'GHA';

	var domainObjs = [];
	domainObjs.push(getDomainObj(prefix, 'MSH_50K_ID'));
//	domainObjs.push(getDomainObj(prefix, 'AEZ8_CLAS'));
//	domainObjs.push(getDomainObj(prefix, 'PSH_ID'));
	domainObjs.push(getDomainObj(prefix, 'ADM2_CODE'));
	
	console.time('getDomainIdxCrossProuctsMap');
	var domainCrossProductToIdxMap = getDomainIdxCrossProuctsMap(domainObjs);
	console.timeEnd('getDomainIdxCrossProuctsMap');

	var indicatorObjs = [];
//	indicatorObjs.push(getIndicatorObj(prefix, 'PN05_RUR', 'SUM'));
//	indicatorObjs.push(getIndicatorObj(prefix, 'BMI', 'SUM'));
//	indicatorObjs.push(getIndicatorObj(prefix, 'TT_50K', 'AVG'));
//	indicatorObjs.push(getIndicatorObj(prefix, 'AREA_TOTAL', 'SUM'));
	indicatorObjs.push(getIndicatorObj(prefix, 'AN05_CATT', 'SUM(AN05_CATT)/SUM(AREA_TOTAL)*100', [getIndicatorObj(prefix, 'AREA_TOTAL', 'SUM')]));

	console.time('processDomainSummary');
	var result = getDomainSummaryResult(domainCrossProductToIdxMap, indicatorObjs);
	console.timeEnd('processDomainSummary');
	
	console.log(result);
}
main();

function getIndicatorObj(prefix, id, formula, referenceIndicators) {
	
	var indicatorJSONFullpath = __dirname + "/" + prefix + "_" + id + ".json";
	var indicatorJSON = JSON.parse(fs.readFileSync(indicatorJSONFullpath, "utf8"));
	
	var IndicatorObj = {};
	IndicatorObj['id'] = id;
	IndicatorObj['data'] = indicatorJSON['data'];
	IndicatorObj['formula'] = formula;
	if(referenceIndicators) {
		IndicatorObj['referenceIndicatorData'] = {};
		referenceIndicators.forEach(function(obj) {
			IndicatorObj['referenceIndicatorData'][obj['id']] = obj['data'];
		});
	}

	return IndicatorObj;
}

function getDomainObj(prefix, id) {
	
	var domainJSONFullpath = __dirname + "/" + prefix + "_" + id + ".json";
	var domainJSON = JSON.parse(fs.readFileSync(domainJSONFullpath, "utf8"));
	
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

	return domainObj
}

function cartProd(paramArray) {

	function addTo(curr, args) {

		var i, copy, rest = args.slice(1), last = !rest.length, result = [];

		for(i = 0; i < args[0].length; i++) {

			copy = curr.slice();
			copy.push(args[0][i]);

			if(last) {
				result.push(copy);

			} else {
				result = result.concat(addTo(copy, rest));
			}
		}

		return result;
	}

	return addTo([], Array.prototype.slice.call(arguments));
}

function getDomainIdxCrossProuctsMap(domainObjs) {
	
	if(domainObjs.length === 1) {
		
		var domainObj1 = domainObjs[0];
		var domainClassesToIdxObj = {};
		
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
		var domainClassesToIdxObj = {};
		
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
		var domainClassesToIdxObj = {};
		
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
													console.log(classUID)
													
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

function getDomainSummaryResult(domainCrossProductToIdxMap, indicatorObjs) {
	
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
	return result;
}
