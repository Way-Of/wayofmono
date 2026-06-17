import type { OsInfo } from "../detect/types.ts";

export interface DepSuggestion {
  packageName: string;
  installCommand: string;
}

const DEP_MAP: Record<string, Record<string, string>> = {
  ubuntu: {
    "libwebkit2gtk-4.1-dev": "sudo apt install -y libwebkit2gtk-4.1-dev",
    "libgtk-3-dev": "sudo apt install -y libgtk-3-dev",
    "libappindicator3-dev": "sudo apt install -y libappindicator3-dev",
    "librsvg2-dev": "sudo apt install -y librsvg2-dev",
    "patchelf": "sudo apt install -y patchelf",
    "xclip": "sudo apt install -y xclip",
    "wl-clipboard": "sudo apt install -y wl-clipboard",
    "nerd-fonts": "sudo apt install -y fonts-firacode",
  },
  fedora: {
    "libwebkit2gtk-4.1-dev": "sudo dnf install -y webkit2gtk4.1-devel",
    "libgtk-3-dev": "sudo dnf install -y gtk3-devel",
    "libappindicator3-dev": "sudo dnf install -y libappindicator-gtk3-devel",
    "librsvg2-dev": "sudo dnf install -y librsvg2-devel",
    "patchelf": "sudo dnf install -y patchelf",
    "xclip": "sudo dnf install -y xclip",
    "wl-clipboard": "sudo dnf install -a wl-clipboard",
  },
  arch: {
    "libwebkit2gtk-4.1-dev": "sudo pacman -S --noconfirm webkit2gtk",
    "libgtk-3-dev": "sudo pacman -S --noconfirm gtk3",
    "patchelf": "sudo pacman -S --noconfirm patchelf",
    "xclip": "sudo pacman -S --noconfirm xclip",
    "wl-clipboard": "sudo pacman -S --noconfirm wl-clipboard",
  },
  darwin: {
    "brew": '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"',
    "xcode-select": "xcode-select --install",
  },
};

export function getDepSuggestion(os: OsInfo, dep: string): DepSuggestion | null {
  if (os.isMacos) {
    const cmd = DEP_MAP.darwin?.[dep];
    if (cmd) return { packageName: dep, installCommand: cmd };
    return { packageName: dep, installCommand: `brew install ${dep}` };
  }

  if (os.isWindows) {
    return { packageName: dep, installCommand: `winget install ${dep}` };
  }

  const distro = os.distro || "ubuntu";
  const distroDeps = DEP_MAP[distro] || DEP_MAP.ubuntu;
  const cmd = distroDeps[dep];
  if (cmd) return { packageName: dep, installCommand: cmd };

  return { packageName: dep, installCommand: `sudo apt install -y ${dep}` };
}

export function runtimeInstallSuggestion(os: OsInfo, runtime: string): string {
  if (os.isMacos) return `brew install ${runtime}`;
  if (os.isWindows) {
    if (runtime === "node") return "winget install OpenJS.NodeJS.LTS";
    if (runtime === "deno") return "winget install Deno.Deno";
    return `winget install ${runtime}`;
  }
  if (runtime === "node") return "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt install -y nodejs";
  if (runtime === "deno") return "curl -fsSL https://deno.land/install.sh | sh";
  if (runtime === "pnpm") return "npm install -g pnpm";
  return `sudo apt install -y ${runtime}`;
}
