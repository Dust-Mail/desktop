use dashmap::DashMap;
use dust_mail::{EmailClient, ThreadableEmailClient};
use serde_json::from_str;
use tauri::async_runtime::RwLock;

use std::sync::Arc;

use crate::{
    keyring,
    types::{LoginConfig, Result},
};

pub struct Sessions {
    clients: DashMap<String, ThreadableEmailClient>,
}

impl Sessions {
    pub fn new() -> Self {
        Self {
            clients: DashMap::new(),
        }
    }

    pub fn insert<S: Into<String>>(&self, identifier: S, client: EmailClient) {
        let identifier = identifier.into();

        let client: ThreadableEmailClient = client.into();

        self.clients.insert(identifier, client);
    }

    pub fn remove<S: AsRef<str>>(&self, identifier: S) {
        self.clients.remove(identifier.as_ref());
    }

    pub async fn get<S: Into<String>>(&self, identifier: S) -> Result<Arc<RwLock<EmailClient>>> {
        let identifier: String = identifier.into();

        match self.clients.get(&identifier) {
            Some(client) => Ok(Arc::clone(client.as_ref())),
            None => {
                // If we don't have a session stored, we try to get it from the credentials stored in the keyring.
                let credentials_json = keyring::get(&identifier)?;

                let login: LoginConfig = from_str(&credentials_json)?;

                let mail_client = login.create_client().await?;

                self.insert(&identifier, mail_client);

                match self.clients.get(&identifier) {
                    Some(client) => Ok(Arc::clone(client.as_ref())),
                    None => unreachable!(),
                }
            }
        }
    }
}
