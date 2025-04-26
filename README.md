# Quick Incident Triage Toolkit

A sleek, offline desktop toolkit for rapid system triage – built with **Rust**, **Tauri**, and **React**.

📊 **Visualize system activity** including CPU, memory, disk, network throughput, and top processes.

📁 **Export snapshot reports** to JSON with one click.

---

## Features

- Live system stats (CPU usage, memory, disks, network)
- Export data to JSON (`system_report.json`)
- Tabbed navigation for clean UX
- Fully responsive layout with dark theme
- Built entirely offline – no internet required

---

## Built With

- [Rust](https://www.rust-lang.org/)
- [Tauri 1.6.5](https://tauri.app/)
- [React 19](https://react.dev/)
- [Vite 6](https://vitejs.dev/)
- [Recharts](https://recharts.org/)
- [Radix UI Tabs](https://www.radix-ui.com/primitives/docs/components/tabs)
- [A whole lot of these](https://en.wikipedia.org/wiki/Energy_drink) 😂

---

## Installation (for developers)

```bash
git clone https://github.com/KenB773/QuickIncidentTriageToolkit.git
cd QuickIncidentTriageToolkit/quicktriage-rs
npm install --prefix quicktriage-ui
cargo tauri dev
```

> Requires Rust, Node.js, and Tauri CLI

---

## Download (for most users)

MSI build is available on the [Releases](https://github.com/KenB773/QuickIncidentTriageToolkit/releases) page.

---

## License

Licensed under the [MIT License](LICENSE).

---

## Author (hey, that's me!)

**Ken Brigham** ([@KenB773](https://github.com/KenB773))

---

> __Built to save time in incident response & system analysis, and to show what can be done with modern local tooling.__
