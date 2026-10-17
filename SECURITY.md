# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |

## Scope

CareCompass is a **client-side only** application. It sends **no data** off the
device. There is no backend, no database, no user accounts, and no network
requests at runtime.

Because the app never transmits data, the primary security considerations are:

1. **PHI masking correctness** -- the app attempts to mask identifying
   information before processing; however it is NOT a HIPAA tool and should
   NEVER be used with real patient data.
2. **Dependency vulnerabilities** -- third-party npm packages may have CVEs.
3. **localStorage data** -- checklist state is stored locally; it is not
   encrypted and is visible to other JS on the same origin.

## Reporting a Vulnerability

To report a security problem privately, please use GitHub's private
vulnerability reporting feature:

https://github.com/DhruvPatil-stack/Care_Compass/security/advisories/new

Please do NOT open a public issue for security vulnerabilities.

Include in your report:
- A description of the vulnerability
- Steps to reproduce it
- The potential impact
- Any suggested fix (optional)

You will receive an acknowledgement within 5 business days.

## Out of Scope

- Issues that require physical access to a user's device
- Social engineering attacks
- Attacks requiring the user to install malicious software

## Note on Data Privacy

This tool is intended for **educational and demonstration purposes only**
using **synthetic data**. Do not use it with real patient information.
