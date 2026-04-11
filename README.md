# 🇨🇭 Swiss Public Transport Card

A minimalistic, SBB-style departure board for [Home Assistant](https://github.com/home-assistant/core), specifically designed for the [Swiss Public Transport](https://www.home-assistant.io/integrations/swiss_public_transport) integration.

![Preview](https://raw.githubusercontent.com/a-p-z/swiss-public-transport-card/main/images/preview.png)

## Features

- 🕒 **Real-time Departures**: Live countdowns and delay information (+2m).
- 🚆 **SBB Look & Feel**: Minimalist design matching the Swiss rail experience.
- 🛠️ **Visual Editor**: Full support for the Home Assistant card editor.
- 🌐 **Multilingual**: Supports English, German, French, and Italian.
- 🔄 **Manual Refresh**: Built-in button to trigger entity updates.

## Installation

### HACS (Recommended)

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)

1. Open **HACS** in your Home Assistant.
2. Go to **Frontend** and click the "+" button.
3. Search for `Swiss Public Transport Card`.
4. Install and reload your dashboard.

### Manual Installation

1. Download the [swiss-public-transport-card.js](https://github.com/a-p-z/swiss-public-transport-card/releases/latest) from the latest release.
2. Upload it to your `www` folder.
3. Add the resource to your dashboard:

```yaml
resources:
  - url: /local/swiss-public-transport-card.js
    type: module
```

## Configuration

The card features a built-in visual editor. Simply add the card to your dashboard and use the UI to configure:

- **Title**: Header text for your board.
- **Language**: Choose between EN, DE, FR, IT using a sleek toggle group.
- **Devices**: A list of `device_id`.

### YAML Example

If you prefer manual configuration:

```yaml
type: custom:swiss-public-transport-card
title: 'Zürich HB'
language: 'de'
devices:
  - f8823c9172087654a9b1c9e3d8f
  - a1b2c3d4e5f6g7h8i9j0k1l2m3n
```

> **Note**: To find your `device_id`, go to **Settings > Devices & Services > Swiss Public Transport** and check the URL of the device page or use the Developer Tools.

## Credits

Created by a-p-z. Based on the official SBB branding.
