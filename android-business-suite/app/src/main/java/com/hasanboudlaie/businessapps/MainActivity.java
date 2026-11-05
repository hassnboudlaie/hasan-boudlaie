package com.hasanboudlaie.businessapps;

import android.app.Activity;
import android.app.PrintManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.print.PrintAttributes;
import android.util.Base64;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.widget.Toast;
import java.io.OutputStream;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final int OPEN_FILE = 1201;
    private static final int SAVE_FILE = 1202;
    private static final int MAX_TRANSFER_BYTES = 12 * 1024 * 1024;
    private WebView web;
    private ValueCallback<Uri[]> fileChooser;
    private byte[] pendingBytes;
    private String pendingName;
    private String pendingMime;
    private String startUrl;
    private String allowedPrefix;

    private static final String DOWNLOAD_AND_PRINT_SCRIPT = """
        (function() {
          if (window.__hbAndroidBridgeInstalled) return;
          window.__hbAndroidBridgeInstalled = true;
          document.addEventListener('click', function(event) {
            var target = event.target;
            var link = target && target.closest ? target.closest('a[download]') : null;
            if (!link) return;
            var href = link.href || '';
            if (!href.startsWith('blob:')) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            fetch(href).then(function(response) { return response.blob(); }).then(function(blob) {
              var reader = new FileReader();
              reader.onload = function() {
                var result = String(reader.result || '');
                var comma = result.indexOf(',');
                if (comma < 0) return;
                window.HBAndroid.saveBase64(
                  result.slice(comma + 1),
                  link.download || 'report.html',
                  blob.type || 'application/octet-stream');
              };
              reader.readAsDataURL(blob);
            }).catch(function(e) { console.warn('File save failed',e); });
          }, true);
          window.print = function() { window.HBAndroid.printCurrentPage(); };
        })();
        """;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        startUrl = getString(R.string.start_url);
        allowedPrefix = getString(R.string.allowed_prefix);
        getWindow().setStatusBarColor(Color.rgb(19, 62, 52));
        getWindow().setNavigationBarColor(Color.rgb(19, 62, 52));

        web = new WebView(this);
        web.setBackgroundColor(Color.WHITE);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        setContentView(web);

        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(false);
        settings.setSupportMultipleWindows(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (Build.VERSION.SDK_INT >= 26) settings.setSafeBrowsingEnabled(true);

        web.addJavascriptInterface(new NativeBridge(), "HBAndroid");
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return routeLink(request.getUrl());
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return routeLink(Uri.parse(url));
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (isAllowed(Uri.parse(url))) view.evaluateJavascript(DOWNLOAD_AND_PRINT_SCRIPT, null);
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view,
                    ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileChooser != null) fileChooser.onReceiveValue(null);
                fileChooser = callback;
                try {
                    Intent intent = params.createIntent();
                    startActivityForResult(intent, OPEN_FILE);
                    return true;
                } catch (Exception e) {
                    fileChooser = null;
                    Toast.makeText(MainActivity.this,"انتخاب فایل امکان‌پذیر نیست",Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });
        if (state == null) web.loadUrl(startUrl);
        else web.restoreState(state);
    }

    private boolean isAllowed(Uri uri) {
        if (uri == null) return false;
        return "https".equalsIgnoreCase(uri.getScheme())
            && "hassnboudlaie.github.io".equalsIgnoreCase(uri.getHost())
            && uri.getPath() != null
            && uri.getPath().startsWith(allowedPrefix);
    }

    private boolean routeLink(Uri uri) {
        if (isAllowed(uri)) return false;
        if (uri == null) return true;
        String scheme = uri.getScheme();
        if ("blob".equalsIgnoreCase(scheme) || "data".equalsIgnoreCase(scheme)) return true;
        if (scheme == null) return true;
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            startActivity(intent);
        } catch (ActivityNotFoundException ex) {
            Toast.makeText(this,"برای بازکردن این پیوند برنامه‌ای یافت نشد",Toast.LENGTH_SHORT).show();
        } catch (Exception ex) {
            Toast.makeText(this,"بازکردن پیوند امکان‌پذیر نیست",Toast.LENGTH_SHORT).show();
        }
        return true;
    }

    private final class NativeBridge {
        @JavascriptInterface public void saveBase64(String base64, String fileName, String mimeType) {
            if (web == null || !isAllowed(Uri.parse(web.getUrl()))) return;
            if (base64 == null || base64.length() > MAX_TRANSFER_BYTES * 1.38) {
                showMessage("حجم فایل بیشتر از حد مجاز است"); return;
            }
            final byte[] bytes;
            try {
                bytes = Base64.decode(base64, Base64.DEFAULT);
                if (bytes.length > MAX_TRANSFER_BYTES) {
                    showMessage("حجم فایل بیشتر از حد مجاز است");return;
                }
            } catch (Exception ex) {
                showMessage("خواندن فایل ناموفق بود");return;
            }
            String safe = fileName == null ? "report.html" : fileName;
            safe = safe.replaceAll("[\\\\/:*?\\\"<>|\\r\\n]", "-");
            safe = safe.length() > 120 ? safe.substring(0, 120) : safe;
            if (safe.isEmpty()) safe = "report.html";
            final String finalName = safe;
            final String finalMime = mimeType != null && mimeType.contains("json") ?
                "application/json" : "text/html";
            new Handler(Looper.getMainLooper()).post(() -> {
                pendingBytes = bytes;
                pendingName = finalName;
                pendingMime = finalMime;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.setType(pendingMime);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.putExtra(Intent.EXTRA_TITLE, pendingName);
                try { startActivityForResult(intent, SAVE_FILE); }
                catch (Exception e) { showMessage("ذخیره فایل امکان‌پذیر نیست"); }
            });
        }

        @JavascriptInterface public void printCurrentPage() {
            new Handler(Looper.getMainLooper()).post(() -> {
                if (web == null) return;
                PrintManager printer = (PrintManager) getSystemService(Context.PRINT_SERVICE);
                if (printer == null) return;
                printer.print(getString(R.string.app_name),
                    web.createPrintDocumentAdapter(getString(R.string.app_name)),
                    new PrintAttributes.Builder().build());
            });
        }
    }

    private void showMessage(String message) {
        new Handler(Looper.getMainLooper()).post(
            () -> Toast.makeText(MainActivity.this,message,Toast.LENGTH_LONG).show());
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode,resultCode,data);
        if (requestCode == OPEN_FILE) {
            if (fileChooser != null) {
                Uri[] result = resultCode == RESULT_OK ?
                    WebChromeClient.FileChooserParams.parseResult(resultCode,data) : null;
                fileChooser.onReceiveValue(result);
                fileChooser = null;
            }
        } else if (requestCode == SAVE_FILE) {
            if (resultCode == RESULT_OK && data != null && data.getData() != null && pendingBytes != null) {
                try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                    if (output == null) throw new Exception("Cannot open output");
                    output.write(pendingBytes);
                    Toast.makeText(this,"فایل ذخیره شد",Toast.LENGTH_SHORT).show();
                } catch (Exception e) {
                    Toast.makeText(this,"ذخیره فایل انجام نشد",Toast.LENGTH_LONG).show();
                }
            }
            pendingBytes = null;
            pendingName = null;
            pendingMime = null;
        }
    }

    @Override public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        if (web != null) web.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override protected void onDestroy() {
        if (web != null) {
            web.removeJavascriptInterface("HBAndroid");
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
