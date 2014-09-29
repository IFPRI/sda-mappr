<%@ WebHandler Language="C#" Class="GetAWMValues" %>

using System;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Configuration;
using System.Collections.Generic;

public class GetAWMValues : IHttpHandler
{
    
    public void ProcessRequest (HttpContext context) {
        
        string response = "";
		string subq = "";
        
        try {
            context.Response.ContentType = "application/json"; 
			string column_name = context.Request["column_name"];
          	subq = "SELECT [classLabels], [classColors] FROM [HC_DB_WEB_2].[dbo].indicator_metadata WHERE [varCode] = '" + column_name + "'"; 
			DataTable dt = SearchDB(subq);
			JSON j = new JSON();
			response = j.Serialize(dt);
        }
        catch(Exception e) {
            response = e.ToString() + " : " + subq;
            context.Response.ContentType = "text/plain";
        }
        
	context.Response.Write(response);
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

    private DataTable SearchDB(string input)
    {
        string conString = "Data Source=localhost\\MSSQL2012;Initial Catalog=HC_DB_WEB_2;User Id=etl2;Password=Alsep111$;";
        SqlConnection conn = new SqlConnection(conString);
        conn.Open();
        try
        {
            SqlCommand cmd = new SqlCommand();
            cmd.CommandType = CommandType.Text;
            cmd.CommandText = input;
            cmd.Connection = conn;

            SqlDataAdapter adptC;
            DataSet ds = new DataSet();

            adptC = new SqlDataAdapter(cmd);
            adptC.Fill(ds, "Results");
            return ds.Tables[0];

        }
        catch (Exception ex)
        {
            throw ex;
        }
        finally
        {
            conn.Close();
        }
    }
}