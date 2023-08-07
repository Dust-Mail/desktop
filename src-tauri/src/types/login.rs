use dust_mail::{EmailClient, IncomingEmailProtocol, OutgoingEmailProtocol};

use serde::{Deserialize, Serialize};

use crate::types::Result;

#[derive(Deserialize, Serialize)]
pub struct LoginConfig {
    incoming: IncomingEmailProtocol,
    outgoing: OutgoingEmailProtocol,
}

impl LoginConfig {
    pub fn incoming(&self) -> &IncomingEmailProtocol {
        &self.incoming
    }

    pub fn outgoing(&self) -> &OutgoingEmailProtocol {
        &self.outgoing
    }

    pub async fn create_client(self) -> Result<EmailClient> {
        let client = dust_mail::create(self.incoming, self.outgoing).await?;

        Ok(client)
    }
}
