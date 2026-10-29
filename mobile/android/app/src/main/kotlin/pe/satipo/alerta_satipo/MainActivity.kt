package pe.satipo.alerta_satipo

import android.media.AudioManager
import android.media.ToneGenerator
import android.os.Handler
import android.os.Looper
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private var tone: ToneGenerator? = null
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "satipo/alerts").setMethodCallHandler { call, result ->
            if (call.method == "emergencyTone") {
                try {
                    tone?.release()
                    val current = ToneGenerator(AudioManager.STREAM_NOTIFICATION, 60)
                    tone = current
                    current.startTone(ToneGenerator.TONE_PROP_BEEP, 350)
                    Handler(Looper.getMainLooper()).postDelayed({
                        if (tone === current) { current.release(); tone = null }
                    }, 500)
                    result.success(null)
                } catch (e: Exception) { result.error("AUDIO", "No se pudo reproducir el sonido", null) }
            } else { result.notImplemented() }
        }
    }
    override fun onDestroy() { tone?.release(); tone = null; super.onDestroy() }
}
