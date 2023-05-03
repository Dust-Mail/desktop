use tauri::{api::shell::open, CustomMenuItem, Manager, Menu, MenuItem, Submenu, WindowMenuEvent};

use crate::{constants::APPLICATION_NAME, info::Info};

pub fn create_menu() -> Menu {
    // Help menu
    let repository = CustomMenuItem::new("repository", "Repository");
    let donate = CustomMenuItem::new("donate", "Donate");
    let report_issue = CustomMenuItem::new("report_issue", "Report Issue");
    let license = CustomMenuItem::new("license", "License");
    let about = CustomMenuItem::new("about", "About");

    let help_submenu = Submenu::new(
        "Help",
        Menu::new()
            // .add_item(MenuItem::About((), ()))
            .add_item(repository)
            .add_native_item(MenuItem::Separator)
            .add_item(donate)
            .add_item(report_issue)
            .add_item(license)
            .add_native_item(MenuItem::Separator)
            .add_item(about),
    );

    Menu::os_default(APPLICATION_NAME).add_submenu(help_submenu)
}

#[derive(Clone, serde::Serialize)]
struct Payload {
    message: String,
}

pub fn menu_event_listener(event: WindowMenuEvent) {
    let shell_scope = event.window().app_handle().shell_scope();

    let info = Info::default();

    match event.menu_item_id() {
        "repository" => {
            open(&shell_scope, info.repo_url(), None).unwrap();
        }
        "donate" => {
            open(&shell_scope, info.donate_url(), None).unwrap();
        }
        "report_issue" => {
            open(&shell_scope, info.issue_url(), None).unwrap();
        }
        "license" => {
            open(&shell_scope, info.license_url(), None).unwrap();
        }
        "about" => {
            event
                .window()
                .emit(
                    "show_about",
                    Payload {
                        message: "Show about".into(),
                    },
                )
                .unwrap();
        }
        _ => {}
    };
}
