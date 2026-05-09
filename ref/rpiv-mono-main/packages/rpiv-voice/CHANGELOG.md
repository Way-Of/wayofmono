# Changelog

All notable changes to `@juicesharp/rpiv-voice` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.3.0] - 2026-05-08

### Added
- `/voice` command for local speech-to-text dictation backed by sherpa-onnx Whisper, with mic capture, live transcript overlay, and settings screen.
- Rolling partial transcript shown in real time while speaking.
- Download progress indicator with percent and byte counter on the model splash screen.
- Configurable keybinding support for the cancel action (no longer hardcoded to Escape).

### Changed
- Package marked `private: true` (opt-in install only; not part of the auto-install bundle).
- Internal constants and helper functions extracted for readability (magic numbers named, idioms centralized).

### Fixed
- Whisper spurious terminal punctuation reduced via longer VAD hangover and trailing-silence padding.
- Partial model installs are rolled back on failure; stale model directories detected and re-downloaded automatically.
- STT recognition failures logged to `~/.config/rpiv-voice/errors.log` instead of being silently swallowed.
- Download splash text uses a simplified Whisper model name.
