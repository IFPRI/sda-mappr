var pg = require('/Users/D/Documents/githubclones/PGRestAPI/node_modules/pg');
var express = require("/Users/D/Documents/githubclones/PGRestAPI/node_modules/express");
var conString = "postgres://D:''@localhost/World Spatial";
var fs = require('fs');

main();

function main() {
	
//	processLayerMenuObject();
//	createIndicatorLegendJSONFiles();
	createIndicatorMetaDataJSONFiles();
}

function createIndicatorMetaDataJSONFiles() {
	
    var client = new pg.Client(conString);
    client.connect();
   	  
    client.query("SELECT varcode, vardesc, sources FROM indicator_metadata WHERE isDomain = 'False'", function(error, result) {
    	result.rows.forEach(function(obj, idx) {
    		var res = {
               	'source':obj['sources'],
               	'description':obj['vardesc']
            };
            writeResultFileToDisk(obj['varcode'] + "_metadata", res, function() {
        	   			
       	   	});	
    	});
    });
}

function createIndicatorLegendJSONFiles() {
	
    var client = new pg.Client(conString);
    client.connect();
   	  
    client.query("SELECT layername, classes, labels, colors FROM hclayerlegends", function(error, result) {
    	result.rows.forEach(function(obj, idx) {
	    	var result = {
		   		'lgdcl':obj['classes'],
		   		'lgdcr':obj['colors'],
		   		'lgdlb':obj['labels']
		   	};
	    	writeResultFileToDisk(obj['layername'] + "_legend", result, function() {
	    			
	    	});	
    	});
    });
}

function writeResultFileToDisk(fileName, data, callback) {
	
	console.log("creating cached result for ", fileName);
	fs.writeFile('/Users/D/Sites/mappr/web/data/'+fileName+'.json', JSON.stringify(data), function(err) {
	    if(err) {
	      console.log(err);
	    } else {
	      console.log("JSON saved!", fileName);
	    }
	    callback(data);
	}); 
}


function processLayerMenuObject() {
	
    var client = new pg.Client(conString);
    client.connect();
                
	getASAppConfig(client, function(rows) {
		var layerMenuJSON = getFormattedLayersObject(rows);
		writeResultFileToDisk('mappr', layerMenuJSON, function(data) {
			client.end();
		});
	});	
}

function getASAppConfig(client, callback) {
	
    var query_string = "SELECT vi_id AS i, varlabel AS ll, varcode AS ln, cat1, cat2, cat3 FROM indicator_metadata WHERE published = 'True' AND isDomain = 'False'";
    client.query(query_string, function(error, result) {
    	result = result ? result.rows:[];
    	callback(result);
    });
}

function getFormattedLayersObject(rows) {
	
	rows.forEach(function(obj) {
		obj['isTimeConstantMBTiles'] = true;
		obj['MBTileEndPointName'] = obj['ln'];
		obj['g1'] = obj['cat1'];
		obj['g2'] = obj['cat2'];
		obj['g3'] = obj['cat3'];
		delete obj['cat1'];
		delete obj['cat2'];
		delete obj['cat3'];
	});
	
	return createLayerMenuObject(rows);
}

function createLayerMenuObject(indicatorObjs) {
	
	var obj = {};
	indicatorObjs.forEach(function(rowObj) {
					
		var groupLayer = rowObj['g1'] ? rowObj['g1'].trim() : null;
		if(!groupLayer) {
			return;
		}
		var groupLayer2 = rowObj['g2'] ? rowObj['g2'].trim() : null;
		var groupLayer3 = rowObj['g3'] ? rowObj['g3'].trim() : null;
		var groupLayer4 = null;
			
		if(groupLayer && !obj[groupLayer]) {
			obj[groupLayer] = {};
			obj[groupLayer]['name'] = groupLayer;
			obj[groupLayer]['level'] = 1;
			obj[groupLayer]['layers'] = [];
			if(!obj['groupLayers']) {
				obj['groupLayers'] = [];
			}
			obj['groupLayers'].push(groupLayer);
		}
		if(groupLayer && groupLayer2 && !obj[groupLayer][groupLayer2]) {
			obj[groupLayer][groupLayer2] = {};
			obj[groupLayer][groupLayer2]['name'] = groupLayer2;
			obj[groupLayer][groupLayer2]['level'] = 2;
			obj[groupLayer][groupLayer2]['layers'] = [];
			if(!obj[groupLayer]['groupLayers']) {
				obj[groupLayer]['groupLayers'] = [];
			}
			obj[groupLayer]['groupLayers'].push(groupLayer2);
		}
		if(groupLayer && groupLayer2 && groupLayer3 && !obj[groupLayer][groupLayer2][groupLayer3]) {
			obj[groupLayer][groupLayer2][groupLayer3] = {};
			obj[groupLayer][groupLayer2][groupLayer3]['name'] = groupLayer3;
			obj[groupLayer][groupLayer2][groupLayer3]['level'] = 3;
			obj[groupLayer][groupLayer2][groupLayer3]['layers'] = [];
			if(!obj[groupLayer][groupLayer2]['groupLayers']) {
				obj[groupLayer][groupLayer2]['groupLayers'] = [];
			}
			obj[groupLayer][groupLayer2]['groupLayers'].push(groupLayer3);
		}
				
		if(groupLayer && !groupLayer2) {
			obj[groupLayer]['layers'].push(rowObj);
		}
		else if(groupLayer && groupLayer2 && !groupLayer3) {
			obj[groupLayer][groupLayer2]['layers'].push(rowObj);
		}
		else if(groupLayer && groupLayer2 && groupLayer3 && !groupLayer4) {
			obj[groupLayer][groupLayer2][groupLayer3]['layers'].push(rowObj);
		}
	});

	return obj;
}
