import os
import gdal
import sys
import json
import osr
import numpy

input_raster_directory = 'output/rasters/'
list_of_rasters = [r for r in os.listdir(input_raster_directory) if r.endswith('tif')]
output_json_directory =   'output/json/'

categorizedRasters = []

for tiff_name in list_of_rasters:
    
    print "processing...",tiff_name
    
    isCategorizedRaster = tiff_name in categorizedRasters   

    input_raster_fullpath = os.path.join(input_raster_directory, tiff_name)
    raster = gdal.Open(input_raster_fullpath)
    
    wgs84 = osr.SpatialReference()
    wgs84.ImportFromEPSG(3857) 
    wgs84_wkt = wgs84.ExportToWkt()
    raster.SetProjection(wgs84_wkt)
    
    raster_band = raster.GetRasterBand(1)
    raster_transform = raster.GetGeoTransform() #(left_value, delta_x, rotation_x, top_value, rotation_y, delta_y)
    raster_x_origin = raster_transform[0]
    raster_y_origin = raster_transform[3]
    raster_cell_width = raster_transform[1]
    raster_cell_height = raster_transform[5]
    
    raster_values_array = raster_band.ReadAsArray()
    raster_shape = raster_values_array.shape;
    raster_values_array_list = raster_values_array.tolist()
    no_data_value = raster_band.GetNoDataValue()
    
#     optimized_raster_values_array = []
#     for row in raster_values_array_list:
#         
#         num_similar_values = 0
#         previous_value = row[0]
#         new_row = []
#         
#         for value in row:
#             
#             if value == previous_value:
#                 num_similar_values += 1
#                 
#             else:
#                 
#                 if num_similar_values > 1:
#                     new_row.append({"c":num_similar_values, "v":previous_value})
#                     
#                 new_row.append(value)
#                 previous_value = value
#                 num_similar_values = 0
#                 
#         optimized_raster_values_array.append(new_row)
                 
    result = {}
    result['data'] = raster_values_array_list
    result['x_origin'] = raster_x_origin
    result['y_origin'] = raster_y_origin
    result['cell_width'] = raster_cell_width
    result['cell_height'] = raster_cell_height
    result['isCategorized'] = isCategorizedRaster
            
    result_str = ""

    if isCategorizedRaster:
        
        result_str = json.dumps(result)
        result_str = result_str.replace(str(int(no_data_value)), '""')
        
    else:
        
        raster_values_array = raster_values_array[numpy.where(raster_values_array > no_data_value)]
        min_value = numpy.min(raster_values_array)
        max_value = numpy.max(raster_values_array)
                
        result['min_value'] = min_value
        result['max_value'] = max_value
        
        result_str = json.dumps(result)
        result_str = result_str.replace(str(no_data_value), '""')
                                        
    output_json_fullpath = os.path.join(output_json_directory, tiff_name.split(".tif")[0] + ".json")
    
    with open(output_json_fullpath, 'wb') as json_file:        
        json_file.write(result_str)

