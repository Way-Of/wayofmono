---
title: Find and Document All System Dependencies for Opticat
labels: [enh documentation, dependencies, system-info]
assignees: []
status: Closed
---

## Description

This ticket aims to comprehensively identify and document all system dependencies required for the Opticat application. This includes, but is not limited to, Flutter/Dart packages, native operating system libraries, external tools, and any other components necessary for building, running, and developing Opticat.

A clear and complete understanding of these dependencies is crucial for onboarding new developers, ensuring consistent build environments, troubleshooting issues, and maintaining the project effectively.

## Scope

This ticket focuses on identifying dependencies for the primary Opticat application and its direct sub-projects (e.g., `chat_server`), but not necessarily for external tools like WayOfMono, unless they become a direct dependency of Opticat itself.

## Acceptance Criteria

-   A detailed, categorized list of all Flutter/Dart package dependencies, including their versions, extracted from `pubspec.yaml` files.
-   Identification and documentation of any native system libraries or tools required for compilation or runtime (e.g., `clang`, `make`, specific `apt` packages on Linux, Visual Studio components on Windows, Xcode on macOS).
-   Documentation of any required global CLI tools (e.g., `flutter`, `dart`, `deno`, `git`) and their recommended installation methods/versions.
-   Identification of any specific environment variables or configuration settings necessary for development or deployment.
-   The documented dependencies are accurate and sufficient to set up a functional development environment from scratch.

## Technical Considerations

*   **Discovery Methods:** Utilize `pubspec.yaml` for Dart/Flutter dependencies. For native dependencies, investigation of platform-specific build files (`android/build.gradle`, `ios/Podfile`, `linux/CMakeLists.txt`, `windows/runner/CMakeLists.txt`) will be necessary.
*   **Version Pinning:** Recommend best practices for version pinning to ensure reproducibility.
*   **Categorization:** Organize dependencies logically (e.g., build-time, runtime, development tools, OS-specific).
*   **Documentation Format:** Consider adding a new section to the main `README.md` or creating a dedicated `docs/DEPENDENCIES.md` file.
*   **Automation:** Explore if any existing tools can automate the discovery or verification of these dependencies.

## References
- Opticat `pubspec.yaml`
- Platform-specific build configurations (Android, iOS, Linux, Windows, Web)
- Main `README.md`

## Updates & Resolution
- **Completed**: Comprehensively identified and documented all system, native compiler/build-tool, package, and IDE configurations.
- **Documentation Created**: Created a dedicated, detailed dependencies manual at [docs/DEPENDENCIES.md](file:///home/zerwiz/CodeP/Opticat/docs/DEPENDENCIES.md).
- **README Integration**: Updated the main [README.md](file:///home/zerwiz/CodeP/Opticat/README.md) to point new users directly to the dependencies guide.
- **LSP / Zed Fix**: Included instructions in the manual on how to configure the Dart LSP binary path in Zed's `settings.json` to resolve standard "Dart not found" / "LSP not configured" editor messages.
- **Automation Scripts**: Created [setup.sh](file:///home/zerwiz/CodeP/Opticat/setup.sh) (Linux) and [setup.bat](file:///home/zerwiz/CodeP/Opticat/setup.bat) (Windows) to automatically check for, install, and update system dependencies, the Flutter/Dart SDK, and local packages.
