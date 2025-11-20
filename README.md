# Iluli Blind Date - Archived Repository

## 📦 Repository Status

This repository has been archived. All project files have been moved to the `archive` folder.

## 🔐 Security Updates

All hardcoded sensitive values have been removed from configuration and documentation files:

- **Google OAuth Client ID**: Replaced with `YOUR_GOOGLE_CLIENT_ID` placeholder
- **Database ID**: Replaced with `YOUR_DATABASE_ID` placeholder

### Files Updated (Security)

The following files were cleaned of hardcoded credentials:
- `archive/worker/wrangler.toml`
- `archive/frontend/.env.production`
- `archive/frontend/.env.example`
- `archive/docs/SETUP.md`
- `archive/docs/PROJECT_STATUS.md`
- `archive/docs/GITHUB_ACTIONS_SETUP.md`
- `archive/docs/README.md`
- `archive/docs/DEPLOYMENT_STATUS.md`
- `archive/docs/PRODUCTION_DEPLOY.md`

## 📁 Repository Structure

```
.
├── LICENSE                 # MIT License (kept in root)
├── .gitignore             # Git ignore rules
├── .github/               # GitHub Actions workflows
├── README.md              # This file
└── archive/               # All archived project files
    ├── worker/            # Backend worker code
    ├── frontend/          # Frontend React app
    ├── docs/              # Documentation
    └── ...                # Other project files
```

## ⚠️ Important Notes

1. **License**: The MIT License file remains in the root directory as required.
2. **Sensitive Data**: All hardcoded API keys, client IDs, and database IDs have been removed for security.
3. **Configuration Required**: To use this project, you must configure your own credentials in the appropriate configuration files within the archive folder.

## 🔧 To Restore and Use This Project

1. Extract files from the `archive` folder
2. Set up your own Google OAuth credentials
3. Create a Cloudflare D1 database and update the database ID
4. Configure environment variables in:
   - `worker/wrangler.toml`
   - `frontend/.env`
   - `frontend/.env.production`

For detailed setup instructions, see `archive/docs/SETUP.md`

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
