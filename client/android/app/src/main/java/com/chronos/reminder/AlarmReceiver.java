package com.chronos.reminder;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

import androidx.core.app.NotificationCompat;

/**
 * Receives the AlarmManager broadcast and:
 *  1. Shows a full-screen / heads-up notification (wakes the lock screen).
 *  2. Starts TtsAlarmService to play a ringtone and then speak the reminder text.
 */
public class AlarmReceiver extends BroadcastReceiver {

    static final String ACTION_ALARM = "com.chronos.reminder.ALARM";
    static final String CHANNEL_ID   = "chronos_alarms_v2";

    @Override
    public void onReceive(Context context, Intent intent) {
        String id    = intent.getStringExtra("id");
        String title = intent.getStringExtra("title");
        String body  = intent.getStringExtra("body");
        if (title == null || title.isEmpty()) return;

        ensureChannel(context);

        // Start the foreground service that plays ringtone + TTS
        Intent svcIntent = new Intent(context, TtsAlarmService.class);
        svcIntent.putExtra("id",    id    != null ? id    : "");
        svcIntent.putExtra("title", title);
        svcIntent.putExtra("body",  body  != null ? body  : "");
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(svcIntent);
        } else {
            context.startService(svcIntent);
        }

        // Build a full-screen intent to wake the screen
        Intent openApp = new Intent(context, MainActivity.class);
        openApp.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        int reqCode = id != null ? AlarmPlugin.stableCode(id) : 0;
        PendingIntent fullScreenPi = PendingIntent.getActivity(context, reqCode, openApp, piFlags);

        NotificationCompat.Builder nb = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setAutoCancel(true)
                .setContentIntent(fullScreenPi)
                .setFullScreenIntent(fullScreenPi, true); // wake the screen

        NotificationManager nm =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            nm.notify(reqCode, nb.build());
        }
    }

    /**
     * Creates (or no-ops if already exists) the alarm notification channel.
     * Uses STREAM_ALARM so it plays even when the ringer is silent.
     */
    static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null || nm.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID,
                "Хронос Напоминания",
                NotificationManager.IMPORTANCE_HIGH);
        ch.setDescription("Срабатывание напоминаний");
        ch.enableVibration(true);
        ch.enableLights(true);
        ch.setLightColor(0xFFB9FF66);
        ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);

        // Alarm URI plays even in silent / DND mode
        Uri alarmUri = Settings.System.DEFAULT_ALARM_ALERT_URI;
        if (alarmUri == null) alarmUri = Settings.System.DEFAULT_RINGTONE_URI;
        AudioAttributes attrs = new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build();
        ch.setSound(alarmUri, attrs);

        nm.createNotificationChannel(ch);
    }
}
