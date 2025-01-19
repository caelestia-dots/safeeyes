# SafeEyes

A simple replacement for [slgobinath/SafeEyes](https://github.com/slgobinath/SafeEyes) because it doesn't use the `layer-shell` protocol.
Thus, it breaks in several ways in wayland, especially on tiling wms. This includes no multi monitor support and being a normal window (which is not above others).

This replacement aims to solve these problems.

Implemented:
- [x] Multi monitor support
- [x] Using layer-shell protocol and therfore being above all windows
- [x] Tray icon (somewhat)

The tray icon is currently extremely buggy, so uhhh... Yeah, I can't fix it.

## Theming

Theming is through the the `style.scss` file and/or the `scss` files in `scheme/`.
This has integration with my caelestia dotfiles, in which the scheme automatically changes based on the system scheme (set through `caelestia scheme <x>`).

## Config

All configs are in `config.ts`.

## Installation

Install dependencies:
- [`aylurs-gtk-shell`](https://github.com/Aylur/ags)
- [`libayatana-appindicator`](https://github.com/AyatanaIndicators/libayatana-appindicator)

Clone this repo.

If using caelestia dots, clone it into `~/.config/caelestia/safeeyes` and it will be autostarted on login.

## Usage

If using caelestia dots and installed to `~/.config/caelestia/safeeyes`, it will be autostarted on login.

Manual starting:
```sh
ags run <PATH/TO/INSTALL>/app.tsx
```
