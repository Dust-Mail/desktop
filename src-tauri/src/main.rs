#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod hash;
mod keyring;
mod sessions;

mod constants;
mod identifier;
mod info;
mod menu;
mod parse;
mod tray;
mod types;
mod utils;

use menu::menu_event_listener;
use sessions::Sessions;
use tray::tray_event_listener;

fn main() {
    let menu = menu::create_menu();
    let tray = tray::create_tray();

    env_logger::init();

    tauri::Builder::default()
        .menu(menu)
        .system_tray(tray)
        .manage(Sessions::new())
        .on_menu_event(menu_event_listener)
        .on_system_tray_event(tray_event_listener)
        .invoke_handler(tauri::generate_handler![
            commands::detect_config,
            commands::login,
            commands::logout,
            commands::get,
            commands::messages,
            commands::get_message,
            commands::list
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
