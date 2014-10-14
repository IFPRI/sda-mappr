import os
import gdal
import sys

input_raster_directory = r'/Users/D/Desktop/IFPRI/hc_tiffs'
list_of_rasters = [r for r in os.listdir(input_raster_directory) if r.endswith('tif')]
input_shapefile_fullpath = r"/Users/D/Desktop/ghana/ghana.shp"
output_raster_directory =  r'/Users/D/Desktop/IFPRI/hc_rasters_ghana'

for tiff_name in list_of_rasters:
    
    print "tiff_name",tiff_name
    input_raster_fullpath = os.path.join(input_raster_directory, tiff_name)
    raster = gdal.Open(input_raster_fullpath)
    no_data_value = raster.GetRasterBand(1).GetNoDataValue()
    raster = None
    output_raster_fullpath = os.path.join(output_raster_directory, 'gha_' + tiff_name)
    command = '/Library/Frameworks/GDAL.framework/Versions/1.11/Programs/gdalwarp -srcnodata '+str(no_data_value)+' -dstnodata -9999 -crop_to_cutline -cutline '+input_shapefile_fullpath+' '+input_raster_fullpath+' ' + output_raster_fullpath
    print command
    os.system(command)

