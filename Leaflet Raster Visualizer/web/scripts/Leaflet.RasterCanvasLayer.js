if(typeof(L) !== 'undefined') {

	L.RasterCanvasLayer = L.CanvasLayer.extend({
		
		options: {
			
			renderer:function(){},
			data:[],
			cell_height:0,
			cell_width:0,
			x_origin:0,
			y_origin:0,
			map:null,
			cellSizeForLat:{},
			fillStyleForValue:{},
			pixelValueToSimilarCells:[],
			pixelBBoxes:[],
			currentPixelsValueSelected:{}
		},

		initialize:function(options) {
			
			L.CanvasLayer.prototype.initialize.call(this, options);
			this.getPXPointFromGEOPoint = this.getPXPointFromGEOPoint.bind(this);    
			this.getCellSizeForGEOPoint = this.getCellSizeForGEOPoint.bind(this);    
			this.getCellSizeForGEOPoint = this.getCellSizeForGEOPoint.bind(this); 
			this.highlightPixelsWithSameValue = this.highlightPixelsWithSameValue.bind(this); 
			
			var map = this.options.map;
			map.addEventListener('click', this.highlightPixelsWithSameValue, false);
		},  
		
		highlightPixelsWithSameValue:function(e) {
			
			var point = e.containerPoint;
			var px = point.x;
			var py = point.y;
			
			var self = this;
			
			var canvas = self.getCanvas();
			var context = canvas.getContext('2d');
			context.strokeWidth = 1.0;
			context.lineWidth = 1.0;
						
			this.options.pixelBBoxes.forEach(function(bbox) {

				var x = bbox[1];
				var y = bbox[2];
				
				var cellSizeX = bbox[3];
				var cellSizeY = bbox[4];
								
				var w = x + cellSizeX;
				var h = y + cellSizeY;
													
				if((x <= px && px <= w) && (y <= py && py <= h)) {
										
					var value = bbox[0];
					var highlight = true;
					if(self.options.currentPixelsValueSelected[value]) {
						highlight = false;
						self.options.currentPixelsValueSelected[value] = false;
					}
					else {
						self.options.currentPixelsValueSelected[value] = true;
					}				
					
					console.log("Value:",value, e.latlng);
					
					self.options.pixelValueToSimilarCells[value].forEach(function(b) {
						
						var x2 = b[1];
						var y2 = b[2];
						
						var cellSizeX2 = b[3];
						var cellSizeY2 = b[4];
						
						var fillStyle = highlight ? "yellow":bbox[5];
						
						context.rect(x2, y2, cellSizeX2, cellSizeY2);
						context.fillStyle = fillStyle;
						context.fillRect(x2, y2, cellSizeX2, cellSizeY2);					
						context.strokeStyle = fillStyle;
						context.strokeRect(x2, y2, cellSizeX2, cellSizeY2);

					});
				}
			});
		},
		
		getPXPointFromGEOPoint:function(geoY, geoX) {
			return this.options.map.latLngToContainerPoint([geoY, geoX], true);
		},

		getCellSizeForGEOPoint:function(geoY, geoX, delta, zoom) {
			
			var cellSizeForLat = this.options.cellSizeForLat;
			
			var key = [geoY, geoX, delta, zoom].join("-");
			if(cellSizeForLat[key]) {
				return cellSizeForLat[key];
			}
						
			var rasterCellHeightGEO = this.options.cell_height;
			var rasterCellWidthGEO = this.options.cell_width;

			var cellHeightDeltaGEO_Y_1 = geoY + (rasterCellHeightGEO * delta);
			var cellWidthDeltaGEO_X_1 = geoX + (rasterCellWidthGEO * delta);
			
			var cellHeightDeltaGEO_Y_2 = geoY + (rasterCellHeightGEO * (delta + 1.0));
			var cellWidthDeltaGEO_X_2 = geoX + (rasterCellWidthGEO * (delta + 1.0));
			
			var rasterCellDeltaPX_1 = this.getPXPointFromGEOPoint(cellHeightDeltaGEO_Y_1, cellWidthDeltaGEO_X_1);
			var rasterCellDeltaPX_2 = this.getPXPointFromGEOPoint(cellHeightDeltaGEO_Y_2, cellWidthDeltaGEO_X_2);
			var cellSizeYPX = rasterCellDeltaPX_2.y - rasterCellDeltaPX_1.y;
			var cellSizeXPX = rasterCellDeltaPX_2.x - rasterCellDeltaPX_1.x;
			
			var cellSize = [cellSizeYPX, cellSizeXPX];
			cellSizeForLat[key] = cellSize;
			
			return cellSize;
		},

		render:function() {
		
			var canvas = this.getCanvas();
			canvas.width = canvas.width;
			var context = canvas.getContext('2d');
			
			context.strokeWidth = 1.0;
			context.lineWidth = 1.0;

			var renderer = this.options.renderer;
			var fillStyleForValue = this.options.fillStyleForValue;
			var getPXPointFromGEOPoint = this.getPXPointFromGEOPoint;
			var getCellSizeForGEOPoint = this.getCellSizeForGEOPoint;
			
			this.options.pixelBBoxes = [];
			this.options.pixelValueToSimilarCells = {};

			var rasterOriginGEO_Y = this.options.y_origin;
			var rasterOriginGEO_X = this.options.x_origin;
			var rasterOriginPX = getPXPointFromGEOPoint(rasterOriginGEO_Y, rasterOriginGEO_X);

			var data = this.options.data;
			var y = rasterOriginPX.y;
			
			var zoom = this.options.map.getZoom();
						
			for(var i=0,ll=data.length;i<ll;i++) {
				
				var cellSizeForLatAndLon = getCellSizeForGEOPoint(rasterOriginGEO_Y, rasterOriginGEO_X, i, zoom);	
				var cellSizeYPX = cellSizeForLatAndLon[0];
				var cellSizeXPX = cellSizeForLatAndLon[1];
				
				var rows = data[i];
				var x = rasterOriginPX.x;		
				
				for(var j=0,rl=rows.length;j<rl;j++) {
					
					var value = rows[j];
					var fillStyle = fillStyleForValue[value] ? fillStyleForValue[value]:renderer(value);
					fillStyleForValue[value] = fillStyle;
					fillStyle = this.options.currentPixelsValueSelected[value] ? 'yellow':fillStyle;
					
					context.rect(x, y, cellSizeXPX, cellSizeYPX);
					context.fillStyle = fillStyle;
					context.fillRect(x, y, cellSizeXPX, cellSizeYPX);					
					context.strokeStyle = fillStyle;
					context.strokeRect(x, y, cellSizeXPX, cellSizeYPX);
				
					var pixelObj = [value, x, y, cellSizeXPX, cellSizeYPX, fillStyle];
					
					this.options.pixelBBoxes.push(pixelObj);
					
					if(!this.options.pixelValueToSimilarCells[value]) {
						this.options.pixelValueToSimilarCells[value] = [];
					}
					this.options.pixelValueToSimilarCells[value].push(pixelObj);
					
					x += cellSizeXPX;
				}
				y += cellSizeYPX;
			}
		}

	});
}