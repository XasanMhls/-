package com.chronos.reminder;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;

import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int REQ_POST_NOTIF = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(AlarmPlugin.class);
        super.onCreate(savedInstanceState);

        requestBatteryOptimizationExemption();
        requestPostNotificationsPermission();
    }

    /**
     * Ask the system to exempt this app from battery optimization.
     * Without this, Samsung/Xiaomi/Huawei kill AlarmManager alarms and the
     * BOOT_COMPLETED receiver — making background notifications unreliable.
     */
    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;

        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm == null) return;

        String pkg = getPackageName();
        if (pm.isIgnoringBatteryOptimizations(pkg)) return;

        try {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + pkg));
            startActivity(intent);
        } catch (Exception e) {
            try {
                startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
            } catch (Exception ignored) {}
        }
    }

    /**
     * On Android 13+ (API 33) notifications require the POST_NOTIFICATIONS runtime permission.
     */
    private void requestPostNotificationsPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return;
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                == PackageManager.PERMISSION_GRANTED) return;

        ActivityCompat.requestPermissions(
                this,
                new String[]{ Manifest.permission.POST_NOTIFICATIONS },
                REQ_POST_NOTIF
        );
    }
}
