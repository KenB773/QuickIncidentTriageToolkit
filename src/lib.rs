#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|_app| {
      if cfg!(debug_assertions) {
        // Logging removed for now due to unimaginable suffering
        // app.handle().plugin(
        //  tauri_plugin_log::Builder::default()
        //    .level(log::LevelFilter::Info)
        //    .build(),
        // )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
