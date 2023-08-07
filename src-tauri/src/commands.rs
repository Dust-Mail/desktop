use dust_mail::{
    detect::{Config, DetectClient},
    types::{MailBox, Message, Preview},
};

use crate::{
    identifier::Identifier,
    keyring,
    parse::to_json,
    sessions::Sessions,
    types::{LoginConfig, Result},
};

use tauri::State;

#[tauri::command(async)]
pub async fn detect_config(email_address: String) -> Result<Config> {
    Ok(DetectClient::from_email(&email_address).await?)
}

#[tauri::command(async)]
pub async fn login(
    login_configuration: LoginConfig,
    session_handler: State<'_, Sessions>,
) -> Result<String> {
    let identifier = Identifier::from(&login_configuration);

    let hash = identifier.hash()?;

    let credentials_json = to_json(&login_configuration)?;

    keyring::set(&hash, credentials_json)?;

    // Connect and login to the mail servers using the user provided credentials.
    let client = login_configuration.create_client().await?;

    session_handler.insert(&hash, client);

    // Return the key and nonce to the frontend so it can verify its session later.
    Ok(hash)
}

#[tauri::command(async)]
/// Gets a list of all of the mail boxes in the currently logged in account.
pub async fn list(token: String, sessions: State<'_, Sessions>) -> Result<Vec<MailBox>> {
    let session = sessions.get(&token).await?;

    let mut session_lock = session.write().await;

    let list = session_lock
        .get_mailbox_list()
        .await
        .map(|box_list| box_list.get_vec())?;

    Ok(list.to_vec())
}

#[tauri::command(async)]
/// Gets a mailbox by its box id.
pub async fn get(token: String, box_id: String, sessions: State<'_, Sessions>) -> Result<MailBox> {
    let session = sessions.get(&token).await?;

    let mut session_lock = session.write().await;

    let mailbox = session_lock
        .get_mailbox(&box_id)
        .await
        .map(|mailbox| mailbox.clone())?;

    Ok(mailbox)
}

#[tauri::command(async)]
/// Gets a list of 'previews' from a mailbox. This preview contains some basic data about a message such as the subject and the sender.
pub async fn messages(
    token: String,
    box_id: String,
    start: usize,
    end: usize,
    sessions: State<'_, Sessions>,
) -> Result<Vec<Preview>> {
    let session = sessions.get(&token).await?;

    let mut session_lock = session.write().await;

    let message_list = session_lock.get_messages(box_id, start, end).await?;

    Ok(message_list)
}

#[tauri::command(async)]
/// Gets the full message data from a given mailbox and a given message id.
pub async fn get_message(
    token: String,
    box_id: String,
    message_id: String,
    sessions: State<'_, Sessions>,
) -> Result<Message> {
    let session = sessions.get(&token).await?;

    let mut session_lock = session.write().await;

    let message = session_lock.get_message(&box_id, &message_id).await?;

    Ok(message)
}

#[tauri::command(async)]
/// Log out of the currently logged in account.
pub async fn logout(token: String, sessions: State<'_, Sessions>) -> Result<()> {
    {
        let session = sessions.get(&token).await?;

        let mut session_lock = session.write().await;

        session_lock.logout().await?;
    }

    sessions.remove(token);

    Ok(())
}
