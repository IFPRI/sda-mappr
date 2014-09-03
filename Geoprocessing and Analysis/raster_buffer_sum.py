import os, sys, gdal, ogr, numpy, osr, psycopg2
from shapely.ops import cascaded_union
from shapely.geometry import Point
import time

def executeSQL(sql_statement, returnRows=False):
    conn = None
    try:
        conn = psycopg2.connect("host='54.212.251.211' port='5432' dbname='fsp' user='fspreader' password='FsPBreadEater'")
        cursor = conn.cursor()
        cursor.execute(sql_statement)
        if(returnRows):
            return [r for r in cursor.fetchall()]
        else:
            conn.commit()
    except Exception as e:
        print("Exception:", e)
    finally:
        conn.close()
        
def numpyArrayToTiff(geotransform, nrows, ncols, array):
    
    output_raster = gdal.GetDriverByName('GTiff').Create('data_mask.tif', ncols, nrows, 1 , gdal.GDT_Float32)
    output_raster.SetGeoTransform(geotransform)
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)
    output_raster.SetProjection(srs.ExportToWkt())
    raster_band = output_raster.GetRasterBand(1)
    raster_band.SetNoDataValue(1.0)
    raster_band.WriteArray(array)
    
def createInputShapefileMethodA(input_shapefile):
    
    input_shapefile_fullpath = os.path.join(sys.path[0], input_shapefile + ".shp")
    
    if os.path.exists(input_shapefile_fullpath):
        return input_shapefile_fullpath
        
    rows = executeSQL("SELECT ST_ASTEXT(ST_Union(ST_transform(ST_BUFFER(ST_transform(geom, 32736), 5000), 4326))) FROM public.tanzania_cicos", returnRows=True)  
    multi_polygon_wkt = rows[0][0]
    multi_polygon = ogr.CreateGeometryFromWkt(multi_polygon_wkt)
    shpDriver = ogr.GetDriverByName("ESRI Shapefile")
    outDataSource = shpDriver.CreateDataSource(input_shapefile_fullpath)  
    outLayer = outDataSource.CreateLayer(input_shapefile, geom_type=ogr.wkbMultiPolygon)
    featureDefn = outLayer.GetLayerDefn()
    outFeature = ogr.Feature(featureDefn)
    outFeature.SetGeometry(multi_polygon)
    outLayer.CreateFeature(outFeature)   
    del outDataSource
    
    return input_shapefile_fullpath
    
def createInputShapefileMethodB(input_shapefile):
    
    input_shapefile_fullpath = os.path.join(sys.path[0], input_shapefile + ".shp")
    
    if os.path.exists(input_shapefile_fullpath):
        return input_shapefile_fullpath
    
    
    iso3 = 'UGA'
    countries = { 'TZA': { "name": 'tanzania', "srid": '32736' }, 'BGD': { "srid": '32645', "name": 'bangladesh' }, 'UGA': { "srid": '32635', "name": 'uganda' }, 'NGA': { "name": 'nigeria', "srid": '32632' }, 'KEN': { "name": 'kenya', "srid": '32636' } };
    
    points = executeSQL("SELECT ST_ASTEXT(ST_TRANSFORM(geom, "+countries[iso3]['srid']+")) FROM public."+countries[iso3]['name']+"_cicos", returnRows=True)    
    points = [r[0].replace("POINT(","").replace(")","").split(" ") for r in points]
    bufferDist = 5000
    polygons = [Point(float(p[0]), float(p[1])).buffer(bufferDist) for p in points]
    multi_polygon = cascaded_union(polygons)
    multi_polygon = ogr.CreateGeometryFromWkt(multi_polygon.wkt)
    sourceSR = osr.SpatialReference()
    sourceSR.ImportFromEPSG(int(countries[iso3]['srid']))
    targetSR = osr.SpatialReference()
    targetSR.ImportFromEPSG(4326)
    coordTrans = osr.CoordinateTransformation(sourceSR, targetSR)
    multi_polygon.Transform(coordTrans)
    shpDriver = ogr.GetDriverByName("ESRI Shapefile")
    outDataSource = shpDriver.CreateDataSource(input_shapefile_fullpath)  
    outLayer = outDataSource.CreateLayer(input_shapefile, geom_type=ogr.wkbMultiPolygon)
    featureDefn = outLayer.GetLayerDefn()
    outFeature = ogr.Feature(featureDefn)
    outFeature.SetGeometry(multi_polygon)
    outLayer.CreateFeature(outFeature)   
    del outDataSource
    
    return input_shapefile_fullpath
    
def main():
    
    inital_time = time.clock()
    
    input_shapefile_fullpath = createInputShapefileMethodB('buffer')
    output_raster_fullpath = os.path.join(sys.path[0], 'raster_buffer.tif')
    data_raster_fullpath = os.path.join(sys.path[0], 'UGA_ppp_v2b_2010_UNadj.tif')
    
    data_raster = gdal.Open(data_raster_fullpath)
    data_raster_band = data_raster.GetRasterBand(1)
    data_raster_transform = data_raster.GetGeoTransform() #(left_value, delta_x, rotation_x, top_value, rotation_y, delta_y)
    data_raster_x_origin = data_raster_transform[0]
    data_raster_y_origin = data_raster_transform[3]
    data_raster_pixel_width = data_raster_transform[1]
    data_raster_pixel_height = abs(data_raster_transform[5])
    data_raster_array = data_raster_band.ReadAsArray()
    data_raster_array_shape = data_raster_array.shape
    dW = data_raster_array_shape[1]
    dH = data_raster_array_shape[0]
            
    pixel_size_x = data_raster_pixel_width
    pixel_size_y = data_raster_pixel_height
    
    shapefile = ogr.Open(input_shapefile_fullpath)
    shapefile_layer = shapefile.GetLayer()
    x_min, x_max, y_min, y_max = shapefile_layer.GetExtent()
    x_res = int((x_max - x_min) / pixel_size_x)
    y_res = int((y_max - y_min) / pixel_size_y)
    
    input_raster = gdal.GetDriverByName('GTiff').Create(output_raster_fullpath, x_res, y_res, 1, gdal.GDT_Float32)
    input_raster.SetGeoTransform(data_raster_transform)
    input_raster_band = input_raster.GetRasterBand(1)
    input_raster_band.SetNoDataValue(1.0)    
    gdal.RasterizeLayer(input_raster, [1], shapefile_layer, None, None, [0.0], ['ALL_TOUCHED=TRUE'])
    
    input_raster_array = input_raster_band.ReadAsArray()
    input_raster_array_shape = input_raster_array.shape
    input_raster_transform = input_raster.GetGeoTransform()
    input_raster_x_origin = input_raster_transform[0]
    input_raster_y_origin = input_raster_transform[3]
    iW = input_raster_array_shape[1]
    iH = input_raster_array_shape[0]
    
    x_offset = abs(int((data_raster_x_origin - input_raster_x_origin) / data_raster_pixel_width))
    y_offset = abs(int((data_raster_y_origin - input_raster_y_origin) / data_raster_pixel_height))
    
    mask_array = numpy.zeros((dH, dW), dtype=numpy.float32)
    mask_array.fill(1.0)
    mask_array[
        y_offset:y_offset + iH, 
        x_offset:x_offset + iW
    ] = input_raster_array
        
    total_array = numpy.ma.masked_array(data_raster_array, mask=mask_array)
    total_array = total_array[total_array >= 0.0]
    total_value = numpy.sum(total_array)
    
    print(total_value)
    print time.clock() - inital_time

main()

# Method A unprimed dataset 
# 1.39919e+07
# ~ 30 seconds

# Method A primed dataset 
# 1.39919e+07
# ~ 8 seconds

# Method B unprimed dataset 
# 14,007,800
# ~ 17 seconds

# Method B primed dataset 
# 14,007,800
# ~ 7 seconds


# 3.07822e+07



