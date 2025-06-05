# Asura Scans Premium Ad Remover

A simple yet robust userscript to remove the "ASURA+" premium subscription advertisements from Asura Scans websites.

## Features

  - **Removes the top banner ad** for the "ASURA+" premium subscription.
  - **Removes the modal pop-up ad** that promotes the premium membership.
  - Dynamically watches for and removes ads that are loaded after the initial page content.
  - Lightweight and designed to work without slowing down your Browse experience.

## Installation

To use this script, you first need a userscript manager browser extension.

1.  **Install a Userscript Manager**

      - [**Tampermonkey**](https://www.tampermonkey.net/) (Recommended for Chrome, Firefox, Edge, Safari)
      - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (for Firefox)

2.  **Install the Script**

      - Navigate to the `.user.js` script file in this repository.
      - Click the **Raw** button at the top of the file viewer.
      - Your userscript manager will automatically detect the script and prompt you to install it.
      - Confirm the installation.

## Usage

Once installed, the script runs automatically whenever you visit an Asura Scans page. The premium ad elements should be removed seamlessly without any action required from you.

## How It Works

The script identifies ad elements by looking for a combination of specific text content (e.g., "ASURA+", "Premium Offer", "$19.99") and common HTML structures used for web banners and modals. It uses a `MutationObserver` to monitor the page in real-time, ensuring that even ads loaded dynamically after the page has finished loading are found and removed.

## Reporting Issues

If you encounter any bugs or find that the ads are not being removed correctly, please [open an issue](https://www.google.com/search?q=https://github.com/your-username/your-repo-name/issues) on this repository.

## License

This project is licensed under the MIT License.