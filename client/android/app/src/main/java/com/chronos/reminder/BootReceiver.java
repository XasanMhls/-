package com.chronos.reminder;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import org.json.JSONObject;

import java.util.Map;

/**
 * Fired on device boot / quick-boot.
 *
 * Android wipes all AlarmManager alarms on reboot, so we re-schedule every
 * future reminder that was saved in SharedPreferences by AlarmPlugin.
 */
public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (!Intent.ACTION_BOOT_COMPLETED.equals(action)
                && !"android.intent.action.QUICKBOOT_POWERON".equals(action)
                && !"com.htc.intent.action.QUICKBOOT_POWERON".equals(action)) {
            return;
        }

        SharedPreferences prefs =
                context.getSharedPreferences(AlarmPlugin.PREFS_NAME, Context.MODE_PRIVATE);
        Map<String, ?> all = prefs.getAll();
        long now = System.currentTimeMillis();

        for (Map.Entry<String, ?> entry : all.entrySet()) {
            try {
                JSONObject alarm    = new JSONObject(entry.getValue().toString());
                long       triggerAt = alarm.getLong("triggerAt");
                if (triggerAt <= now) continue; // already past — skip

                String id    = alarm.getString("id");
                String title = alarm.getString("title");
                String body  = alarm.optString("body", "");

                AlarmPlugin.scheduleWithAlarmManager(context, id, title, body, triggerAt);
            } catch (Exception ignored) {
                // Corrupted entry — skip silently
            }
        }
    }
}
