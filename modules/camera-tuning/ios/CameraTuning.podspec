Pod::Spec.new do |s|
  s.name             = 'CameraTuning'
  s.version          = '1.0.0'
  s.summary          = 'White balance tuning for the Expo camera session on iOS.'
  s.description      = 'Tunes the AVCaptureDevice that expo-camera already uses. No capture session is created and no camera is opened.'
  s.author           = { 'yxsiwu1' => 'yxsiwu1@users.noreply.github.com' }
  s.homepage         = 'https://github.com/yxsiwu1/camera'
  s.license          = { :type => 'MIT' }
  s.platforms        = { :ios => '15.1' }
  s.source           = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
