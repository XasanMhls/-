package com.chronos.reminder;

import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestBatteryOptimizationExemption();
    }

    /**
     * Ask the system to exempt this app from battery optimization.
     * Without this, Samsung/Xiaomi/Huawei kill AlarmManager alarms and the
     * BOOT_COMPLETED receiver — making background notifications unreliable.
     * Shows a one-time system dialog: "Allow Chronos to always run in background?"
     */
    private void requestBatteryOptimizationExemption() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) return;

        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm == null) return;

        String pkg = getPackageName();
        if (pm.isIgnoringBatteryOptimizations(pkg)) return; // already granted

        try {
            Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
            intent.setData(Uri.parse("package:" + pkg));
            startActivity(intent);
        } catch (Exception e) {
            // Fallback: open general battery optimization settings
            try {
                startActivity(new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS));
            } catch (Exception ignored) { /* device doesn't support this */ }
        }
    }
}
