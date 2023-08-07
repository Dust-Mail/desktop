use dust_mail::{Credentials, IncomingEmailProtocol, OutgoingEmailProtocol, ServerCredentials};

use crate::{
    hash::sha256_hex,
    types::{LoginConfig, Result},
};

pub struct Identifier {
    id: String,
}

impl Default for Identifier {
    fn default() -> Self {
        Self { id: String::new() }
    }
}

impl Identifier {
    /// Hash the currently stored identifier
    pub fn hash(self) -> Result<String> {
        let result = sha256_hex(self.id.as_bytes())?;

        Ok(result)
    }

    fn add_remote_server(&mut self, username: &str, secret: &str, server: &str, port: u16) {
        self.id.push_str(username);
        self.id.push(':');
        self.id.push_str(secret);

        self.id.push('@');

        self.id.push_str(server);
        self.id.push_str(port.to_string().as_str());
    }

    fn add_separator(&mut self) {
        self.id.push('|')
    }
}

impl Into<String> for Identifier {
    fn into(self) -> String {
        self.id
    }
}

fn get_credentials(credentials: &Credentials) -> (&str, &str) {
    match credentials {
        Credentials::OAuth { username, token } => (&username, &token),
        Credentials::Password { username, password } => (&username, &password),
    }
}

impl From<&LoginConfig> for Identifier {
    fn from(login_options: &LoginConfig) -> Self {
        let mut identifier = Self::default();

        let incoming = login_options.incoming();
        let outgoing = login_options.outgoing();

        match incoming {
            IncomingEmailProtocol::Imap(proto) => {
                let (username, secret) = get_credentials(proto.credentials());

                identifier.add_remote_server(
                    username,
                    secret,
                    proto.server().domain(),
                    proto.server().port(),
                );
            }
            IncomingEmailProtocol::Pop(proto) => {
                let (username, secret) = get_credentials(proto.credentials());

                identifier.add_remote_server(
                    username,
                    secret,
                    proto.server().domain(),
                    proto.server().port(),
                );
            }
        };

        identifier.add_separator();

        match outgoing {
            OutgoingEmailProtocol::Smtp(proto) => {
                let (username, secret) = get_credentials(proto.credentials());

                identifier.add_remote_server(
                    username,
                    secret,
                    proto.server().domain(),
                    proto.server().port(),
                );
            }
        }

        identifier
    }
}
