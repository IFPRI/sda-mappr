
var fs = require("fs");
var path = require('path');

var domainJSONFullpath = __dirname + "/gha_FS_2012.json";
var domainJSON = (JSON.parse(fs.readFileSync(domainJSONFullpath, "utf8")));

var indicatorJSONFullpath = __dirname + "/GHA_PN05_RUR.json";
var indicatorJSON = (JSON.parse(fs.readFileSync(indicatorJSONFullpath, "utf8")));

// DOMAIN 1 ==============================
var Domain1ID = 'AEZ-8 Class';
var D1ND = "";
var Domain1Data = domainJSON['data'];
//Domain1Data.push(["D1C1", "D1C2", "D1C2", "D1C2"]);
//Domain1Data.push(["D1C1", 'D1C2', "D1C2", "D1C2"]);
//Domain1Data.push(["D1C1", "D1C1", "D1C1", "D1C2"]);
//Domain1Data.push(["D1C1", "D1C1", "D1C1", 'D1C2']);
var domain1Obj = {};
domain1Obj['id'] = Domain1ID;
domain1Obj['data'] = Domain1Data;
domain1Obj['classToIdx'] = {};
domain1Obj['uniqueClasses'] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
domain1Obj['uniqueClasses'].forEach(function(value){
	if(value !== D1ND) {
		domain1Obj['classToIdx'][value] = [];
	}
});
domain1Obj['data'].forEach(function(row, y) {
	row.forEach(function(value, x) {
		if(value !== D1ND && !isNaN(parseFloat(value))) {
			domain1Obj['classToIdx'][value].push([x, y]);
		}
	});
});

//DOMAIN 2 ==============================
//var Domain2ID = 'D2';
//var D2ND = '-999';
//var Domain2Data = [];
//Domain2Data.push(["D2C1", "D2C1", "D2C1", "D2C1"]);
//Domain2Data.push(["D2C1", 'D2C1', 'D2C1', "D2C1"]);
//Domain2Data.push(["D2C2", 'D2C2', 'D2C2', "D2C2"]);
//Domain2Data.push(["D2C2", "D2C2", "D2C2", "D2C2"]);
//var domain2Obj = {};
//domain2Obj['id'] = Domain2ID;
//domain2Obj['data'] = Domain2Data;
//domain2Obj['noDataValue'] = D2ND;
//domain2Obj['classToIdx'] = {};
//domain2Obj['uniqueClasses'] = ["D2C1", "D2C2"];
//domain2Obj['uniqueClasses'].forEach(function(value) {
//	domain2Obj['classToIdx'][value] = [];
//});
//domain2Obj['data'].forEach(function(row, y) {
//	row.forEach(function(value, x) {
//		if(value !== D2ND) {
//			domain2Obj['classToIdx'][value].push([x, y]);
//		}
//	});
//});

//INDICATOR 1 ==============================
var Indicator1Obj = {};
Indicator1Obj['id'] = "Rural Population 2005";
Indicator1Obj['data'] = indicatorJSON['data'];
Indicator1Obj['formula'] = "SUM";
//Indicator1Obj['data'].push([3, 1, 1, 1]);
//Indicator1Obj['data'].push([2, 1, 1, 1]);
//Indicator1Obj['data'].push([1, 1, 1, 1]);
//Indicator1Obj['data'].push([1, 1, 1, 1]);

//INDICATOR 2 ==============================
//var Indicator2Obj = {};
//Indicator2Obj['id'] = "I2";
//Indicator2Obj['formula'] = "AVG";
//Indicator2Obj['data'] = [];
//Indicator2Obj['data'].push([1, 1, 1, 1]);
//Indicator2Obj['data'].push([1, 1, 1, 1]);
//Indicator2Obj['data'].push([1, 1, 1, 1]);
//Indicator2Obj['data'].push([1, 1, 1, 1]);

var domainObjs = [domain1Obj];
var indicatorObjs = [Indicator1Obj];

function getDomainIdxCrossProuctsMap(domainObjs) {
	
	if(domainObjs.length === 1) {
		
		var domainObj1 = domainObjs[0];
		var domainClassesToIdxObj = {};
		
		for(var domain1Class in domainObj1['classToIdx']) {
			
			var listOfListsOfXYsD1 = domainObj1['classToIdx'][domain1Class];
			
			listOfListsOfXYsD1.forEach(function(xyD1) {
				
				var classUID = domain1Class;
				if(!domainClassesToIdxObj[classUID]) {
					domainClassesToIdxObj[classUID] = [];
				}	
				domainClassesToIdxObj[classUID].push(xyD1);
			});
		}
		
		return domainClassesToIdxObj;
	}
	
	var reverseCopy = domainObjs.slice(0);
	reverseCopy.reverse();
	
	var domainCombonationsAlreadyProcessed = {};
	var domainClassesToIdxObj = {};
	
	domainObjs.forEach(function(domainObj1) {
		
		var domain1ID = domainObj1['id'];
		reverseCopy.forEach(function(domainObj2) {
			
			var domain2ID = domainObj2['id'];
			var domainComboUIDs = [domain1ID, domain2ID];
			domainComboUIDs.sort();
			domainComboUID = domainComboUIDs.join("");
			
			if(domain1ID !== domain2ID && !domainCombonationsAlreadyProcessed[domainComboUID]) {

				domainCombonationsAlreadyProcessed[domainComboUID] = true;
				for(var domain1Class in domainObj1['classToIdx']) {
					
					var listOfListsOfXYsD1 = domainObj1['classToIdx'][domain1Class];										
					for(var domain2Class in domainObj2['classToIdx']) {
					
						var listOfListsOfXYsD2 = domainObj2['classToIdx'][domain2Class];
						listOfListsOfXYsD1.forEach(function(xyD1) {
							
							listOfListsOfXYsD2.forEach(function(xyD2) {
								
								if(xyD1.join("") === xyD2.join("")) {
									
									var classUID = domain1Class + "_" + domain2Class;
									if(!domainClassesToIdxObj[classUID]) {
										domainClassesToIdxObj[classUID] = [];
									}									
									domainClassesToIdxObj[classUID].push(xyD1);
								}
							});
						});
					}
				}
			}
		});
	});
	
	return domainClassesToIdxObj;
}

var domainCrossProductToIdxMap = getDomainIdxCrossProuctsMap(domainObjs);

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
			var val = indicatorData[xy[1]][xy[0]];
			if(!isNaN(parseFloat(val)))
			sum += parseFloat(val);
		});

		if(formula === 'SUM') {
			result[indicatorID][key] = sum;
		}
		else if(formula === 'AVG') {
			result[indicatorID][key] = sum / idxs.length;
		}
	}
});

console.log(result)
