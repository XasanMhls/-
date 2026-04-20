package com.chronos.reminder;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFocusRequest;
import android.media.AudioManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.util.Locale;

/**
 * Foreground service that fires when a reminder alarm triggers.
 *
 * Sequence:
 *  1. Acquire audio focus on STREAM_ALARM.
 *  2. Play the default alarm ringtone for RINGTONE_MS milliseconds.
 *  3. Stop the ringtone and speak the reminder title + body via TTS.
 *  4. Auto-stop after MAX_DURATION_MS regardless.
 */
public class TtsAlarmService extends Service {

    private static final String TAG             = "TtsAlarmService";
    private static final int    NOTIF_ID        = 88881;
    private static final long   RINGTONE_MS     = 8_000;  // 8 s of ringtone
    private static final long   MAX_DURATION_MS = 60_000; // hard stop after 60 s

    private Handler          handler;
    private Ringtone         ringtone;
    private TextToSpeech     tts;
    private AudioFocusRequest focusRequest;   // API 26+
    private String           pendingTitle;
    private String           pendingBody;

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    @Override
    public void onCreate() {
        super.onCreate();
        handler = new Handler(Looper.getMainLooper());
        AlarmReceiver.ensureChannel(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) { stopSelf(); return START_NOT_STICKY; }

        pendingTitle = intent.getStringExtra("title");
        pendingBody  = intent.getStringExtra("body");
        if (pendingTitle == null || pendingTitle.isEmpty()) pendingTitle = "Напоминание";
        if (pendingBody  == null) pendingBody = "";

        // Must call startForeground immediately (within 5 s on API 26+)
        startForeground(NOTIF_ID, buildForegroundNotif(pendingTitle, pendingBody));

        acquireAudioFocus();
        playRingtone();

        handler.postDelayed(this::stopRingtoneAndSpeak, RINGTONE_MS);
        handler.postDelayed(this::stopSelf,             MAX_DURATION_MS);

        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        stopRingtone();
        shutdownTts();
        releaseAudioFocus();
        stopForeground(true);
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    // ── Audio focus ───────────────────────────────────────────────────────────

    private void acquireAudioFocus() {
        AudioManager am = (AudioManager) getSystemService(AUDIO_SERVICE);
        if (am == null) return;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            AudioAttributes attrs = new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build();
            focusRequest = new AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                    .setAudioAttributes(attrs)
                    .setAcceptsDelayedFocusGain(false)
                    .build();
            am.requestAudioFocus(focusRequest);
        } else {
            //noinspection deprecation
            am.requestAudioFocus(null, AudioManager.STREAM_ALARM,
                    AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
        }
    }

    private void releaseAudioFocus() {
        AudioManager am = (AudioManager) getSystemService(AUDIO_SERVICE);
        if (am == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && focusRequest != null) {
            am.abandonAudioFocusRequest(focusRequest);
        } else {
            //noinspection deprecation
            am.abandonAudioFocus(null);
        }
    }

    // ── Ringtone ──────────────────────────────────────────────────────────────

    private void playRingtone() {
        try {
            Uri uri = Settings.System.DEFAULT_ALARM_ALERT_URI;
            if (uri == null) uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
            if (uri == null) uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);

            ringtone = RingtoneManager.getRingtone(this, uri);
            if (ringtone == null) return;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                ringtone.setLooping(false);
            }
            ringtone.play();
        } catch (Exception e) {
            Log.w(TAG, "playRingtone failed: " + e.getMessage());
        }
    }

    private void stopRingtone() {
        try {
            if (ringtone != null && ringtone.isPlaying()) ringtone.stop();
        } catch (Exception ignored) {}
    }

    // ── TTS ───────────────────────────────────────────────────────────────────

    private void stopRingtoneAndSpeak() {
        stopRingtone();

        String text = pendingTitle;
        if (!pendingBody.isEmpty()) text += ". " + pendingBody;
        final String utterance = text;

        tts = new TextToSpeech(this, status -> {
            if (status != TextToSpeech.SUCCESS) { stopSelf(); return; }

            Locale locale = Locale.getDefault();
            int langResult = tts.setLanguage(locale);
            if (langResult == TextToSpeech.LANG_MISSING_DATA
                    || langResult == TextToSpeech.LANG_NOT_SUPPORTED) {
                tts.setLanguage(Locale.ENGLISH); // graceful fallback
            }

            tts.speak(utterance, TextToSpeech.QUEUE_FLUSH, null, "chronos_alarm");
            // Give TTS up to 15 s, then stop
            handler.postDelayed(this::stopSelf, 15_000);
        });
    }

    private void shutdownTts() {
        try {
            if (tts != null) { tts.stop(); tts.shutdown(); tts = null; }
        } catch (Exception ignored) {}
    }

    // ── Notification ──────────────────────────────────────────────────────────

    private Notification buildForegroundNotif(String title, String body) {
        Intent openApp = new Intent(this, MainActivity.class);
        openApp.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int piFlags = PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE;
        PendingIntent pi = PendingIntent.getActivity(this, 0, openApp, piFlags);

        return new NotificationCompat.Builder(this, AlarmReceiver.CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setContentTitle(title)
                .setContentText(body)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setOngoing(true)
                .setContentIntent(pi)
                .build();
    }
}
