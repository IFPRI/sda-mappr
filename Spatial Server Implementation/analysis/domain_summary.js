
var fs = require("fs");
var path = require('path');

var domainObjs = [];
domainObjs.push(getDomainObj('GHA_msh_50k_id'));
domainObjs.push(getDomainObj('gha_AEZ8_CLAS'));
domainObjs.push(getDomainObj('GHA_adm2_code'));
var domainCrossProductToIdxMap = getDomainIdxCrossProuctsMap(domainObjs);

var indicatorObjs = [];
indicatorObjs.push(getIndicatorObj('GHA_PN05_RUR'));
indicatorObjs.push(getIndicatorObj('GHA_BMI'));
indicatorObjs.push(getIndicatorObj('GHA_TT_50K'));

processDomainSummary(domainCrossProductToIdxMap, indicatorObjs);

function getIndicatorObj(id) {
	
	var indicatorJSONFullpath = __dirname + "/"+id+".json";
	var indicatorJSON = JSON.parse(fs.readFileSync(indicatorJSONFullpath, "utf8"));
	
	var IndicatorObj = {};
	IndicatorObj['id'] = id;
	IndicatorObj['data'] = indicatorJSON['data'];
	IndicatorObj['formula'] = "SUM";

	return IndicatorObj;
}

function getDomainObj(id) {
	
	var domainJSONFullpath = __dirname + "/"+id+".json";
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

function getDomainIdxCrossProuctsMap(domainObjs) {
	
	console.time('getDomainIdxCrossProuctsMap');
		
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
		console.timeEnd('getDomainIdxCrossProuctsMap');
		return domainClassesToIdxObj;
	}
	
	var reverseCopy = domainObjs.slice(0);
	reverseCopy.reverse();
	
	var domainCombonationsAlreadyProcessed = {};
	var domainClassesToIdxObj = {};
	
	for(var i=0; i<domainObjs.length; i++) {
		
		var domainObj1 = domainObjs[i];
		var domain1ID = domainObjs['id'];
		
		for(var j=0; j<reverseCopy.length; j++) {
			
			var domainObj2 = domainObjs[j];
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
	console.timeEnd('getDomainIdxCrossProuctsMap');
	return domainClassesToIdxObj;
}

function processDomainSummary(domainCrossProductToIdxMap, indicatorObjs) {
	
	console.time('processDomainSummary');
	
	var result = {};
	indicatorObjs.forEach(function(indicatorObj) {
		
		var indicatorID = indicatorObj['id'];
		var formula = indicatorObj['formula'];
		var indicatorData = indicatorObj['data'];
		
		result[indicatorID] = {};

		for(var key in domainCrossProductToIdxMap) {		
			
			var sum = 0;
			result[indicatorID][key] = 0;
			domainCrossProductToIdxMap[key].forEach(function(xy) {
				if(indicatorData[xy[1]]) {
					var val = indicatorData[xy[1]][xy[0]];
					if(!isNaN(parseFloat(val))) {
						sum += parseFloat(val);
					}	
				}
			});

			if(formula === 'SUM') {
				result[indicatorID][key] = sum;
			}
			else if(formula === 'AVG') {
				result[indicatorID][key] = sum / idxs.length;
			}
		}
	});
	console.timeEnd('processDomainSummary');
}
