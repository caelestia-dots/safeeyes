# SafeEyes

A simple replacement for [slgobinath/SafeEyes](https://github.com/slgobinath/SafeEyes) because it doesn't use the `layer-shell` protocol.
Thus, it breaks in several ways in wayland, especially on tiling wms. This includes no multi monitor support and being a normal window (which is not above others).

This replacement aims to solve these problems.

Implemented:

-   [x] Multi monitor support
-   [x] Using layer-shell protocol and therfore being above all windows
-   [x] Tray icon
-   [x] Sound on break end
-   [x] Inhibit on fullscreen windows (Hyprland only)

## Theming

Theming is through the the `style.scss` file. Colours are in the `scss` files in `scheme/`.
This has integration with my caelestia dotfiles, in which the scheme automatically changes based on the system scheme (set through `caelestia scheme <x>`).

## Config

All configs are in `config.ts`.

## Installation

Install [`caelestia-scripts`](https://github.com/caelestia-dots/scripts.git),
then run `caelestia install safeeyes`.

## Usage

It gets autostarted on login if installed from `caelestia-scripts` and using
[`caelestia-hypr`](https://github.com/caelestia-dots/hypr.git).

Manual starting:

```sh
ags run -d <PATH/TO/INSTALL>
```
