package expo.modules.cameratuning

import android.hardware.camera2.CameraCharacteristics as Characteristics
import android.hardware.camera2.CaptureRequest as Request
import android.hardware.camera2.params.TonemapCurve
import android.view.View
import android.view.ViewGroup
import androidx.annotation.OptIn
import androidx.camera.camera2.interop.Camera2CameraControl
import androidx.camera.camera2.interop.Camera2CameraInfo
import androidx.camera.camera2.interop.CaptureRequestOptions
import androidx.camera.camera2.interop.ExperimentalCamera2Interop
import androidx.camera.core.Camera
import androidx.core.content.ContextCompat
import expo.modules.camera.ExpoCameraView
import expo.modules.kotlin.Promise
import expo.modules.kotlin.functions.Queues
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.pow

// Uses the existing Expo camera session; never opens a second camera or unbinds it.
@OptIn(ExperimentalCamera2Interop::class)
class CameraTuningModule : Module() {
  private val whiteBalanceModes = mapOf(
    "auto" to Request.CONTROL_AWB_MODE_AUTO,
    "daylight" to Request.CONTROL_AWB_MODE_DAYLIGHT,
    "cloudy" to Request.CONTROL_AWB_MODE_CLOUDY_DAYLIGHT,
    "tungsten" to Request.CONTROL_AWB_MODE_INCANDESCENT,
    "fluorescent" to Request.CONTROL_AWB_MODE_FLUORESCENT
  )

  override fun definition() = ModuleDefinition {
    Name("CameraTuning")
    AsyncFunction("capabilities") { facing: String ->
      val camera = activeCamera(facing)
      val info = Camera2CameraInfo.from(camera.cameraInfo)
      val modes = info.getCameraCharacteristic(Characteristics.CONTROL_AWB_AVAILABLE_MODES) ?: intArrayOf()
      val toneModes = info.getCameraCharacteristic(Characteristics.TONEMAP_AVAILABLE_TONE_MAP_MODES) ?: intArrayOf()
      val keys = info.getCameraCharacteristic(Characteristics.REQUEST_AVAILABLE_CAPABILITIES) ?: intArrayOf()
      // Tone curves require manual post-processing; AWB uses reported presets.
      val manualPost = keys.contains(Characteristics.REQUEST_AVAILABLE_CAPABILITIES_MANUAL_POST_PROCESSING)
      mapOf(
        "native" to true, "cameraId" to info.cameraId,
        // AE is intentionally left enabled. Camera2 overrides LENS_APERTURE in
        // AE ON, so do not advertise independently writable aperture values.
        "apertures" to emptyList<Double>(),
        "whiteBalance" to whiteBalanceModes.filter { modes.contains(it.value) }.keys.toList(),
        "contrast" to (manualPost && toneModes.contains(Request.TONEMAP_MODE_CONTRAST_CURVE) && (info.getCameraCharacteristic(Characteristics.TONEMAP_MAX_CURVE_POINTS) ?: 0) >= 2)
      )
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("apply") { facing: String, cameraId: String, aperture: Double?, contrast: Double?, whiteBalance: String, promise: Promise ->
      val camera = activeCamera(facing)
      val info = Camera2CameraInfo.from(camera.cameraInfo)
      require(info.cameraId == cameraId) { "Camera changed before settings were applied" }
      val options = CaptureRequestOptions.Builder()
      require(aperture == null) { "Aperture is managed by the lens and automatic exposure" }
      if (whiteBalance != "keep") {
        val mode = requireNotNull(whiteBalanceModes[whiteBalance]) { "Unknown white balance" }
        val available = info.getCameraCharacteristic(Characteristics.CONTROL_AWB_AVAILABLE_MODES) ?: intArrayOf()
        require(available.contains(mode)) { "Unsupported white balance" }
        options.setCaptureRequestOption(Request.CONTROL_AWB_MODE, mode)
      }
      if (contrast != null) {
        require(contrast.isFinite() && contrast in 0.8..1.2) { "Contrast outside supported range" }
        val modes = info.getCameraCharacteristic(Characteristics.TONEMAP_AVAILABLE_TONE_MAP_MODES) ?: intArrayOf()
        val capabilities = info.getCameraCharacteristic(Characteristics.REQUEST_AVAILABLE_CAPABILITIES) ?: intArrayOf()
        require(capabilities.contains(Characteristics.REQUEST_AVAILABLE_CAPABILITIES_MANUAL_POST_PROCESSING) && modes.contains(Request.TONEMAP_MODE_CONTRAST_CURVE)) { "Tone curves unavailable" }
        val count = minOf(32, info.getCameraCharacteristic(Characteristics.TONEMAP_MAX_CURVE_POINTS) ?: 0)
        require(count >= 2) { "Tone curve point count unavailable" }
        // Sensor input is linear; output curve includes display gamma.
        val points = FloatArray(count * 2)
        for (i in 0 until count) {
          val x = i.toDouble() / (count - 1)
          val encoded = x.pow(1.0 / 2.2)
          val y = ((encoded - 0.5) * contrast + 0.5).coerceIn(0.0, 1.0)
          points[i * 2] = x.toFloat(); points[i * 2 + 1] = y.toFloat()
        }
        options.setCaptureRequestOption(Request.TONEMAP_MODE, Request.TONEMAP_MODE_CONTRAST_CURVE)
        options.setCaptureRequestOption(Request.TONEMAP_CURVE, TonemapCurve(points, points, points))
      }
      val future = Camera2CameraControl.from(camera.cameraControl).setCaptureRequestOptions(options.build())
      future.addListener({
        try { future.get(); promise.resolve(null) }
        catch (error: Exception) { promise.reject("CAMERA_TUNING_FAILED", "Camera settings could not be applied", error) }
      }, ContextCompat.getMainExecutor(requireNotNull(appContext.reactContext)))
    }.runOnQueue(Queues.MAIN)

    AsyncFunction("reset") { facing: String, promise: Promise ->
      val future = Camera2CameraControl.from(activeCamera(facing).cameraControl).clearCaptureRequestOptions()
      future.addListener({
        try { future.get(); promise.resolve(null) }
        catch (error: Exception) { promise.reject("CAMERA_RESET_FAILED", "Camera settings could not be reset", error) }
      }, ContextCompat.getMainExecutor(requireNotNull(appContext.reactContext)))
    }.runOnQueue(Queues.MAIN)
  }

  private fun activeCamera(facing: String): Camera {
    require(facing == "front" || facing == "back") { "Invalid facing" }
    val found = mutableListOf<Camera>()
    fun visit(view: View) {
      if (view is ExpoCameraView && view.isAttachedToWindow && view.visibility == View.VISIBLE) view.camera?.let { found.add(it) }
      if (view is ViewGroup) for (i in 0 until view.childCount) visit(view.getChildAt(i))
    }
    visit(requireNotNull(appContext.currentActivity).window.decorView)
    val camera = found.singleOrNull() ?: error("Exactly one active camera is required")
    val lens = Camera2CameraInfo.from(camera.cameraInfo).getCameraCharacteristic(Characteristics.LENS_FACING)
    require(lens == if (facing == "front") Characteristics.LENS_FACING_FRONT else Characteristics.LENS_FACING_BACK) { "Camera lens changed" }
    return camera
  }
}
