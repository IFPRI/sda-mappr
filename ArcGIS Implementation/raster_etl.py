import os
import shutil
import pyodbc 
import zipfile
import arcpy
import sys

arcpy.env.workspace = sys.path[0]
arcpy.env.overwriteOutput = True

DB_OPTIONS = {
    'host':'localhost\MSSQL2012',
    "user_name":"etl2",
    "password":"Alsep111$"
}

def executeSQL(sql_statement, database_name, db_options, get_result_as_list=False):
    
    conn = None
    try:
        conn = pyodbc.connect('DRIVER={SQL Server};SERVER='+db_options['host']+';DATABASE='+database_name+';UID='+db_options['user_name']+';PWD='+db_options['password'])
        cursor = conn.cursor()
        cursor.execute(sql_statement)
        return [r for r in cursor] if get_result_as_list else None
        
    except Exception as e:
        print "EXCEPTION:executeSQL:",str(e)
        sys.exit()
        
    finally:
        
        if conn:
            conn.commit()
            conn.close()

def getVarCodeToMXDMap():
    
    sql_statement = "SELECT [varCode], [mxdName] FROM indicator_metadata WHERE [published] = 1 AND [genRaster] = 1 AND mxdName IS NOT NULL"
    rows = executeSQL(sql_statement, "HC_DB_WEB_2", DB_OPTIONS, get_result_as_list=True)
    
    column_name_to_mxd_name = {}
    for row in rows:
        column_name_to_mxd_name[str(row.varCode)] = str(row.mxdName)
                
    return column_name_to_mxd_name
    
def getListOfExtractedRasterDirectories():
    
    zip_folders = []
   
    zip_file_directory = r"D:\HC ETL v3\hc_input_rasters"
    zip_files = [f for f in os.listdir(zip_file_directory) if f.endswith("zip")]
    
    for zip_file_name in zip_files:
    
        output_folder_name = zip_file_name.split(".zip")[0]
        output_folder_fullpath = os.path.join(zip_file_directory, output_folder_name)
        
        if os.path.exists(output_folder_fullpath):
            shutil.rmtree(output_folder_fullpath)
            
        os.mkdir(output_folder_fullpath)
        zip_file_fullpath = os.path.join(zip_file_directory, zip_file_name)

        with zipfile.ZipFile(zip_file_fullpath, "r") as z:
            z.extractall(output_folder_fullpath)
            zip_folders.append(output_folder_fullpath)
            
    return zip_folders

def getVarCodesFromRasterDirectory(directory):
    return list(set([f.split(".tif")[0] for f in os.listdir(directory) if ".tif" in f])) 
  
def processMXD(var_code_objs, mxd_basepath, mxd_name):    
      
    try:
        mxd = None
        df = None
        out_layer_basepath = r'D:\HC ETL v3\hc_raster_layers'
        mxd_fullpath = os.path.join(mxd_basepath, mxd_name + ".mxd")

        if arcpy.Exists(mxd_fullpath):
            
            print "Deleting existing MXD"
            r = arcpy.Delete_management(mxd_fullpath)
            print "Delete_management",r.status

        print "Creating MXD..."
        mxd = arcpy.mapping.MapDocument(os.path.join(sys.path[0], "blank.mxd"))
        mxd.saveACopy(mxd_fullpath)
        del mxd
        mxd = arcpy.mapping.MapDocument(mxd_fullpath)
        print "MXD created"
                            
        df = arcpy.mapping.ListDataFrames(mxd, "Layers")[0]
        print "created mxd and data frame objects"
        
        print "processing var_code_objs..."
        for var_code_obj in var_code_objs:
            
            var_code = var_code_obj['var_code']
            raster_dir = var_code_obj['raster_dir']
        
            in_raster_name = var_code + ".tif"
            in_raster_fullpath = os.path.join(raster_dir, in_raster_name)
            print "out_raster_fullpath",in_raster_fullpath
            
            in_memory_layer = var_code
            r = arcpy.MakeRasterLayer_management(in_raster_fullpath, in_memory_layer)   
            print "MakeRasterLayer_management",r.status
            
            out_layer_name = var_code + ".lyr"
            out_layer_fullpath = os.path.join(out_layer_basepath, out_layer_name)
            print "out_layer_fullpath",out_layer_fullpath
            
            r = arcpy.SaveToLayerFile_management(in_memory_layer, out_layer_fullpath)
            print "SaveToLayerFile_management",r.status
                
            layer_to_add = arcpy.mapping.Layer(out_layer_fullpath)
            arcpy.mapping.AddLayer(df, layer_to_add)
            print "added layer to mxd"
            
        mxd.save()
        print "saved MXD"                
        print "processing var_code_objs...COMPLETE"
            
    except Exception as e:
        
        print "EXCEPTION:",str(e)
        sys.exit()
        
    finally:
        
        del mxd
        del df
        

def main():

    # Steps for processing rasters with multiple SChEF versions:
    # Step 1: Ensure all zip files are located in 'hc_input_rasters'
    # Step 2: For each zip file, extract it as a folder into 'hc_input_rasters'
    # Step 3: For each extracted folder, copy and paste all contents (rasters) into the folder 'all_rasters'
    # NOTE: You must start the copy and paste workflow from the first version of SChEF folders (ex: r2.3_1) and then to the last (ex: r2.5_7). This is to ensure a raster gets overwritten if it has a more recent version.
    # Step 4: Once all files have been manually copied to 'all_rasters', execute this script.
    # Step 5: Once this script has finished, For each MXD in 'hc_output_mxds', open it in ArcMap and repeat the following steps below.
    # 5a) Uncheck the visibility of all layers and then save the MXD.
    # 5b) Once the MXD is saved, re-publish the Map Service for the MXD (you may need to overwrite the existing one)
        
    # Note: If all rasters being processed belong to only a single SChEF version, then use 'raster_dirs = getListOfExtractedRasterDirectories()' below. You would then execute this script and once finished start from Step 5 above.
        
    mxd_to_raster_objs = {}
    mxd_basepath = r'D:\HC ETL v3\hc_output_mxds'
    var_code_to_mxd = getVarCodeToMXDMap()
    
    print "buidling mxd_to_raster_objs..."
    
#     raster_dirs = getListOfExtractedRasterDirectories() 
    raster_dirs = ['D:\\HC ETL v3\\hc_input_rasters\\all_rasters']
    
    for raster_dir in raster_dirs:        
        print "processing raster_dir: ",raster_dir
        var_codes = [v for v in getVarCodesFromRasterDirectory(raster_dir) if str(v) in var_code_to_mxd]
        print "number of var_codes: ",len(var_codes)
        print "adding raster_objs for raster_dir"
        for var_code in var_codes:       
            mxd_name = var_code_to_mxd[var_code]
            if not mxd_name in mxd_to_raster_objs:
                mxd_to_raster_objs[mxd_name] = []
            mxd_to_raster_objs[mxd_name].append({'var_code':var_code,'raster_dir':raster_dir})
    print "buidling mxd_to_raster_objs...COMPLETE"

    print "processing mxd_to_raster_objs..."
    for mxd_name in mxd_to_raster_objs:
        print "mxd_name: ",mxd_name
        raster_objs = mxd_to_raster_objs[mxd_name]
        processMXD(raster_objs, mxd_basepath, mxd_name)
        print "processed MXD"

main()    

