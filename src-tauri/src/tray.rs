use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

const SHOW_BUTTON_ID: &str = "show";
const HIDE_BUTTON_ID: &str = "hide";
const QUIT_BUTTON_ID: &str = "quit";

pub fn create_tray() -> SystemTray {
    let show = CustomMenuItem::new(SHOW_BUTTON_ID, "Show");
    let hide = CustomMenuItem::new(HIDE_BUTTON_ID, "Hide");
    let quit = CustomMenuItem::new(QUIT_BUTTON_ID, "Quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

pub fn tray_event_listener(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            HIDE_BUTTON_ID => {
                let window = app.get_window("main").unwrap();

                window.hide().unwrap();
            }
            SHOW_BUTTON_ID => {
                let window = app.get_window("main").unwrap();

                window.show().unwrap();
            }
            QUIT_BUTTON_ID => {
                std::process::exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}
