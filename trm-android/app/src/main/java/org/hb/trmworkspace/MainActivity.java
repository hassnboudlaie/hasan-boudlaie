package org.hb.trmworkspace;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Button;
import android.net.Uri;
import android.webkit.JavascriptInterface;
import android.provider.MediaStore;
import android.os.Build;
import android.os.Environment;
import android.content.ContentValues;
import android.content.ContentResolver;
import android.util.Base64;
import android.widget.Toast;
import java.io.OutputStream;
import java.io.File;
import java.io.FileOutputStream;

public class MainActivity extends Activity {
  private WebView web;
  private static final String URL="https://hassnboudlaie.github.io/hasan-boudlaie/trm-workspace/";
  @Override public void onCreate(Bundle b) {
    super.onCreate(b);
    getWindow().setStatusBarColor(Color.rgb(10,41,42));
    getWindow().setNavigationBarColor(Color.rgb(10,41,42));
    web = new WebView(this);
    web.setBackgroundColor(Color.rgb(247,244,236));
    WebSettings settings=web.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setAllowFileAccess(false);
    settings.setAllowContentAccess(false);
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
    settings.setCacheMode(WebSettings.LOAD_DEFAULT);
    web.setWebChromeClient(new WebChromeClient());
    // Export of explicit user-created backups; app may only navigate within the owned origin.
    web.addJavascriptInterface(new Object(){
      @JavascriptInterface public void saveFile(final String requestedName, final String mime, final String data) {
        runOnUiThread(()->{
          String safe=requestedName.replaceAll("[^a-zA-Z0-9._-]","_");
          if(safe.length()==0 || safe.equals(".") || safe.equals(".."))safe="trm-backup.json";
          try {
            byte[] decoded=Base64.decode(data,Base64.DEFAULT);
            if(decoded.length>20000000) throw new Exception("file too large");
            OutputStream stream;
            if(Build.VERSION.SDK_INT>=29){
              ContentValues v=new ContentValues();
              v.put(MediaStore.Downloads.DISPLAY_NAME,safe);
              v.put(MediaStore.Downloads.MIME_TYPE,mime);
              v.put(MediaStore.Downloads.RELATIVE_PATH,Environment.DIRECTORY_DOWNLOADS+"/TRMWorkspace");
              Uri uri=getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI,v);
              if(uri==null)throw new Exception("storage unavailable");
              stream=getContentResolver().openOutputStream(uri);
            }else{
              File d=getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS);if(d==null)throw new Exception("no directory");
              stream=new FileOutputStream(new File(d,safe));
            }
            if(stream==null)throw new Exception("no output stream");
            try(OutputStream out=stream){out.write(decoded);}
            Toast.makeText(MainActivity.this,"TRM: فایل ذخیره شد",Toast.LENGTH_LONG).show();
          }catch(Exception e){Toast.makeText(MainActivity.this,"ذخیره فایل ممکن نشد",Toast.LENGTH_LONG).show();}
        });
      }
    }, "TRMNative");
    web.setWebViewClient(new WebViewClient() {
       @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
         Uri uri = request.getUrl();
         if ("hassnboudlaie.github.io".equals(uri.getHost()) && uri.getPath()!=null && uri.getPath().startsWith("/hasan-boudlaie/trm-workspace/")) return false;
         Intent intent=new Intent(Intent.ACTION_VIEW,uri);startActivity(intent);return true;
       }
       @Override public void onReceivedError(WebView view, WebResourceRequest request, android.webkit.WebResourceError error) {
         if(request.isForMainFrame()) showOffline();
       }
    });
    setContentView(web);
    web.loadUrl(URL);
  }
  private void showOffline(){
    LinearLayout panel=new LinearLayout(this);panel.setPadding(40,90,40,30);panel.setOrientation(LinearLayout.VERTICAL);
    panel.setBackgroundColor(Color.rgb(247,244,236));
    TextView msg=new TextView(this);msg.setText("ارتباط اینترنت برقرار نیست. برای ورود به TRM اتصال را بررسی کنید.");msg.setTextSize(22);msg.setTextDirection(View.TEXT_DIRECTION_RTL);
    Button retry=new Button(this);retry.setText("تلاش دوباره");retry.setOnClickListener(v->{setContentView(web);web.loadUrl(URL);});
    panel.addView(msg);panel.addView(retry);setContentView(panel);
  }
  @Override public void onBackPressed(){ if(web!=null&&web.canGoBack()) web.goBack(); else super.onBackPressed(); }
  @Override protected void onDestroy(){if(web!=null){web.destroy();web=null;}super.onDestroy();}
}