# REST Countries API Project

This project fetches data from the [REST Countries API](https://restcountries.com) and displays it in a responsive web layout. It includes functionalities such as searching for a country, filtering by region, and toggling dark mode.

## Table of Contents

- [Demo](#demo)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Demo

Check out the live demo [here](https://your-username.github.io/rest-countries/).

## Features

- Fetches data from the REST Countries API.
- Displays country information in a card layout.
- Search functionality to find countries by name.
- Filter functionality to filter countries by region.
- Dark mode toggle.

## Installation

1. Clone the repository:

git clone https://github.com/Flavourite/Rest-countries.git

2. Open the project in Visual Studio Code (VS Code) or your preferred code editor.

## Usage

1. Open the `index.html` file in your browser to view the application.

2. Use the search bar to find countries by name.

3. Use the region filter dropdown to filter countries by region.

4. Click the "Dark Mode" button to toggle between light and dark themes.

### Initial Logo (Flag) Behavior

- On initial page load the site attempts to detect your country and set the header logo (and favicon) to your country's flag.
- Detection priority: IP-based geolocation via https://ipapi.co/json → `navigator.language` (e.g. "en-US") → fallback to the United States (US).
- You can change or disable this behavior in `script.js` by editing the `detectUserCountry` function and the geolocation endpoint.
- You can disable auto-detection by setting `config.enableAutoFlag = false` in `script.js`.

## Project Structure

rest-countries/
├── index.html
├── styles.css
├── script.js
└── README.md
