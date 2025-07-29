# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Initial changelog implementation

## [1.1.1] - 2024-02-20
### Fixed
- Removed redundant redirects in authentication flow
- Resolved premature navigation in `SetAppPasswordPage`
- Streamlined protected route logic for Google-authenticated users

## [1.1.0] - 2024-02-20
### Added
- Hybrid authentication system (Google + Email/Password)
- Protected routes for special auth pages (`/set-app-password`, `/link-accounts`)
- 404 Not Found page component

### Changed
- Restructured route protection logic in `ProtectedRoute.tsx`
- Added automatic redirection for unverified Google accounts
- Improved auth state management in `App.tsx`

## [1.0.0] - 2024-02-19
### Initial Release
- Base application with email/password authentication