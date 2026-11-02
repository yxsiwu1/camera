import AVFoundation
import ExpoModulesCore
import Foundation

// Tunes the AVCaptureDevice that expo-camera already owns.
// No capture session is created here, only device properties are changed.
public class CameraTuningModule: Module {
  // iPhone lenses have a fixed aperture and no contrast/tone-curve control.
  private static let presetNames = ["daylight", "cloudy", "tungsten", "fluorescent"]

  // Temperatures are Kelvin, tint is the green/magenta shift.
  private static let whiteBalancePresets: [String: (temperature: Float, tint: Float)] = [
    "daylight": (5500, 0),
    "cloudy": (6500, 0),
    "tungsten": (2850, 0),
    "fluorescent": (4000, 12)
  ]

  public func definition() -> ModuleDefinition {
    Name("CameraTuning")

    AsyncFunction("capabilities") { (facing: String) throws -> [String: Any] in
      let device = try self.device(for: facing)
      return self.capabilities(for: device, facing: facing)
    }

    AsyncFunction("apply") { (facing: String, cameraId: String, aperture: Double?, contrast: Double?, whiteBalance: String, promise: Promise) in
      do {
        try self.applyTuning(
          facing: facing,
          cameraId: cameraId,
          aperture: aperture,
          contrast: contrast,
          whiteBalance: whiteBalance
        )
        promise.resolve()
      } catch {
        promise.reject("CAMERA_TUNING_FAILED", error.localizedDescription)
      }
    }

    AsyncFunction("reset") { (facing: String, promise: Promise) in
      do {
        let device = try self.device(for: facing)
        try device.lockForConfiguration()
        defer { device.unlockForConfiguration() }

        if device.isWhiteBalanceModeSupported(.continuousAutoWhiteBalance) {
          device.whiteBalanceMode = .continuousAutoWhiteBalance
        }
        promise.resolve()
      } catch {
        promise.reject("CAMERA_TUNING_FAILED", error.localizedDescription)
      }
    }
  }

  // MARK: - Capabilities

  private func capabilities(for device: AVCaptureDevice, facing: String) -> [String: Any] {
    var result: [String: Any] = [:]

    result["native"] = true
    result["cameraId"] = self.cameraId(for: device, facing: facing)
    // Lenses are fixed, so there is no aperture range to advertise.
    result["apertures"] = [Double]()
    result["contrast"] = false

    var presets: [String] = []
    if device.isWhiteBalanceModeSupported(.continuousAutoWhiteBalance) {
      presets.append("auto")
    }
    // Presets need locked mode with custom gains, which is what setWhiteBalance() uses.
    if device.isWhiteBalanceModeSupported(.locked),
       device.isLockingWhiteBalanceWithCustomDeviceGainsSupported {
      presets.append(contentsOf: CameraTuningModule.presetNames)
    }
    result["whiteBalance"] = presets

    return result
  }

  // MARK: - Apply

  private func applyTuning(
    facing: String,
    cameraId: String,
    aperture: Double?,
    contrast: Double?,
    whiteBalance: String
  ) throws {
    if aperture != nil {
      throw CameraTuningModule.failure("Aperture is fixed on this lens")
    }
    if contrast != nil {
      throw CameraTuningModule.failure("Contrast control is unavailable on iOS")
    }

    let device = try self.device(for: facing)

    guard self.cameraId(for: device, facing: facing) == cameraId else {
      throw CameraTuningModule.failure("Camera changed before settings were applied")
    }

    try device.lockForConfiguration()
    defer { device.unlockForConfiguration() }

    try self.setWhiteBalance(whiteBalance, on: device)
  }

  private func setWhiteBalance(_ preset: String, on device: AVCaptureDevice) throws {
    if preset == "auto" || preset == "keep" {
      // Nothing to force when the device cannot run continuous auto white balance.
      if device.isWhiteBalanceModeSupported(.continuousAutoWhiteBalance) {
        device.whiteBalanceMode = .continuousAutoWhiteBalance
      }
      return
    }

    guard let values = CameraTuningModule.whiteBalancePresets[preset] else {
      throw CameraTuningModule.failure("Unsupported white balance preset: \(preset)")
    }
    guard device.isWhiteBalanceModeSupported(.locked),
          device.isLockingWhiteBalanceWithCustomDeviceGainsSupported else {
      throw CameraTuningModule.failure("Locked white balance is unavailable on this camera")
    }

    let temperatureAndTint = AVCaptureDevice.WhiteBalanceTemperatureAndTintValues(
      temperature: values.temperature,
      tint: values.tint
    )
    // Round-trip through chromaticity so the gains stay inside the range reported by the device.
    let chromaticity = device.chromaticityValues(for: device.deviceWhiteBalanceGains(for: temperatureAndTint))
    let gains = device.deviceWhiteBalanceGains(for: chromaticity)
    let maximum = device.maxWhiteBalanceGain

    let clamped = AVCaptureDevice.WhiteBalanceGains(
      redGain: CameraTuningModule.clampGain(gains.redGain, maximum: maximum),
      greenGain: CameraTuningModule.clampGain(gains.greenGain, maximum: maximum),
      blueGain: CameraTuningModule.clampGain(gains.blueGain, maximum: maximum)
    )

    device.whiteBalanceMode = .locked
    // The completion-handler variant is the gain-based locked API available on iOS 15.
    device.setWhiteBalanceModeLocked(with: clamped, completionHandler: nil)
  }

  // MARK: - Device lookup

  private func device(for facing: String) throws -> AVCaptureDevice {
    guard let position = CameraTuningModule.position(for: facing) else {
      throw CameraTuningModule.failure("Invalid facing: \(facing)")
    }
    guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: position) else {
      throw CameraTuningModule.failure("No \(facing) camera is available")
    }
    return device
  }

  private static func position(for facing: String) -> AVCaptureDevice.Position? {
    switch facing {
    case "front":
      return .front
    case "back":
      return .back
    default:
      return nil
    }
  }

  // Position based identifier: stable across launches and not deprecated like uniqueID.
  private func cameraId(for device: AVCaptureDevice, facing: String) -> String {
    return "ios-\(facing)-\(device.position.rawValue)"
  }

  // MARK: - Helpers

  private static func clampGain(_ gain: Float, maximum: Float) -> Float {
    guard gain.isFinite else {
      return 1.0
    }
    let upperBound = Swift.max(maximum, 1.0)
    return Swift.min(Swift.max(gain, 1.0), upperBound)
  }

  private static func failure(_ message: String) -> NSError {
    return NSError(domain: "CameraTuning", code: 1, userInfo: [NSLocalizedDescriptionKey: message])
  }
}
