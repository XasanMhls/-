package com.chronos.reminder;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

@CapacitorPlugin(name = "ChronosAlarm")
public class AlarmPlugin extends Plugin {

    static final String PREFS_NAME = "chronos_alarms_v1";

    // ── schedule ──────────────────────────────────────────────────────────────
    @PluginMethod
    public void scheduleAlarm(PluginCall call) {
        String id       = call.getString("id");
        String title    = call.getString("title");
        String body     = call.getString("body", "");
        Long triggerAt  = call.getLong("triggerAt");

        if (id == null || title == null || triggerAt == null || triggerAt == 0) {
            call.reject("Missing required fields: id, title, triggerAt");
            return;
        }

        Context ctx = getContext();

        // Persist so BootReceiver can re-schedule after reboot
        try {
            JSONObject alarm = new JSONObject();
            alarm.put("id", id);
            alarm.put("title", title);
            alarm.put("body", body);
            alarm.put("triggerAt", triggerAt);
            ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
               .edit().putString(id, alarm.toString()).apply();
        } catch (JSONException e) {
            call.reject("Serialisation error: " + e.getMessage());
            return;
        }

        scheduleWithAlarmManager(ctx, id, title, body, triggerAt);
        call.resolve();
    }

    // ── cancel one ────────────────────────────────────────────────────────────
    @PluginMethod
    public void cancelAlarm(PluginCall call) {
        String id = call.getString("id");
        if (id == null) { call.reject("Missing id"); return; }

        cancelAlarmById(getContext(), id);
        getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                   .edit().remove(id).apply();
        call.resolve();
    }

    // ── cancel all ────────────────────────────────────────────────────────────
    @PluginMethod
    public void cancelAllAlarms(PluginCall call) {
        Context ctx = getContext();
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        for (String id : prefs.getAll().keySet()) {
            cancelAlarmById(ctx, id);
        }
        prefs.edit().clear().apply();
        call.resolve();
    }

    // ── static helpers (used by AlarmReceiver and BootReceiver too) ───────────

    static void scheduleWithAlarmManager(Context ctx,
                                         String id, String title, String body,
                                         long triggerAt) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        PendingIntent pi = buildPendingIntent(ctx, id, title, body);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            // setExactAndAllowWhileIdle fires even in Doze — critical for sleep-time reminders
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, triggerAt, pi);
        }
    }

    static void cancelAlarmById(Context ctx, String id) {
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        PendingIntent pi = buildPendingIntent(ctx, id, "", "");
        am.cancel(pi);
        pi.cancel();
    }

    private static PendingIntent buildPendingIntent(Context ctx,
                                                    String id, String title, String body) {
        Intent intent = new Intent(ctx, AlarmReceiver.class);
        intent.setAction(AlarmReceiver.ACTION_ALARM);
        intent.putExtra("id", id);
        intent.putExtra("title", title);
        intent.putExtra("body", body != null ? body : "");

        int flags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(ctx, stableCode(id), intent, flags);
    }

    /** Stable, non-negative int code for an alarm ID string. */
    static int stableCode(String id) {
        int h = 0;
        for (char c : (id == null ? "" : id).toCharArray()) {
            h = h * 31 + c;
        }
        return h & 0x7FFFFFFF; // ensure positive
    }
}
