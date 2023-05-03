const REPO_URL: &str = "https://github.com/Dust-Mail/desktop";
const DONATE_URL: &str = "https://ko-fi.com/Guusvanmeerveld";

pub struct Info {
    repo_url: String,
    donate_url: String,
    issue_url: String,
    license_url: String,
}

impl Info {
    pub fn repo_url(&self) -> &str {
        &self.repo_url
    }

    pub fn donate_url(&self) -> &str {
        &self.donate_url
    }

    pub fn issue_url(&self) -> &str {
        &self.issue_url
    }

    pub fn license_url(&self) -> &str {
        &self.license_url
    }
}

impl Default for Info {
    fn default() -> Self {
        Self {
            repo_url: REPO_URL.to_string(),
            donate_url: DONATE_URL.to_string(),
            issue_url: format!("{}/issues", REPO_URL),
            license_url: format!("{}/blob/main/LICENSE", REPO_URL),
        }
    }
}
