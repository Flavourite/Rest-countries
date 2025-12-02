'use strict';
// Event listener to run the script after the DOM has fully loaded
window.addEventListener('DOMContentLoaded', async () => {
  // Select necessary elements from the DOM
  const body = document.querySelector('body');
  const cardsContainer = document.querySelector('.cards-container');
  const searchContainer = document.querySelector('.search-container');
  const detailsContent = document.querySelector('.details-content');
  const header = document.querySelector('header');
  const modeText = document.querySelector('.mode-text');
  const regionFilter = document.querySelector('.region-filter');
  const search = document.querySelector('.search');
  const switchMode = document.querySelector('.mode');
  const dark = document.querySelector('.dark');
  const bright = document.querySelector('.bright');
  const scrollToTopButton = document.querySelector('.scroll-to-top');
  const toast = document.querySelector('.toast');
  const loadingIndicator = document.querySelector('.loading-spinner');
  const logoImg = document.querySelector('.logo');

  // Store the original logo URL
  const originalLogoUrl =
    'https://restfulcountries.com/assets/images/logo/logo-white.png';

  // Configuration flags: If you want to disable the auto-detect flag behavior,
  // set enableAutoFlag to false.
  const config = {
    enableAutoFlag: true,
  };

  // Function to show error message
  const displayErrorMessage = message => {
    toast.innerHTML = message;
    toast.className = 'toast show';
    toast.style.background = 'red';
    setTimeout(() => {
      toast.className = toast.className.replace('show', '');
    }, 3000);
  };

  // Function to update the site logo to a country flag
  const updateSiteLogo = country => {
    if (country && country.flags && country.flags.png) {
      logoImg.src = country.flags.png;
      logoImg.alt = `${country.name} Flag`;
      // Update the browser tab favicon as well
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = country.flags.png;
      }
    } else {
      // Reset to original logo if no country is provided
      logoImg.src = originalLogoUrl;
      logoImg.alt = 'Logo';
      const favicon = document.querySelector('link[rel="icon"]');
      if (favicon) {
        favicon.href = originalLogoUrl;
      }
    }
  };

  // Function to generate HTML for each country card
  const generateCountryHTML = country => `
    <div class="card" data-country="${country.alpha3Code}">
      <div class="flag">
        <img src="${country.flags.png}" alt="${country.name}" />
      </div>
      <div class="part-info">
        <h2>${country.name}</h2>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Capital:</strong> ${country.capital || 'N/A'}</p>
      </div>
    </div>
  `;

  // Helper function to get native name
  const getNativeName = country => {
    return country.nativeName || 'N/A';
  };

  // Helper function to get country currencies
  const getCountryCurrencies = currencies => {
    return currencies ? currencies.map(curr => curr.name).join(', ') : 'N/A';
  };

  // Helper function to get country languages
  const getCountryLanguages = languages => {
    return languages ? languages.map(lang => lang.name).join(', ') : 'N/A';
  };

  // Helper function to get names of border countries
  const getBorderCountryNames = (borderCodes, data) => {
    if (!borderCodes) return 'N/A';
    const borderCountries = data.filter(country =>
      borderCodes.includes(country.alpha3Code)
    );
    return borderCountries.map(country => country.name).join(', ');
  };

  // Function to generate HTML for country details
  const generateCountryDetailsHTML = (country, data) => `
    <button class="btn-back">← Back</button>
    <div class="country-details">
      <div class="country-flag">
        <img src="${country.flags.png}" alt="${country.name}" />
      </div>
      <div class="country-info">
        <h2 class="country-name">${country.name}</h2>
        <div class="details">
          <p><strong>Native Name:</strong> ${getNativeName(country)}</p>
          <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
          <p><strong>Region:</strong> ${country.region}</p>
          <p><strong>Sub Region:</strong> ${country.subregion || 'N/A'}</p>
          <p><strong>Capital:</strong> ${country.capital || 'N/A'}</p>
          <p><strong>Top Level Domain:</strong> ${
            country.topLevelDomain ? country.topLevelDomain[0] : 'N/A'
          }</p>
          <p><strong>Currencies:</strong> ${getCountryCurrencies(
            country.currencies
          )}</p>
          <p><strong>Languages:</strong> ${getCountryLanguages(
            country.languages
          )}</p>
        </div>
        <div class="border-countries">
          <p><strong>Border Countries:</strong> ${getBorderCountryNames(
            country.borders,
            data
          )}</p>
        </div>
      </div>
    </div>
  `;

  // Function to fetch all countries data from the API
  const fetchCountries = async () => {
    const url = `data.json`;
    try {
      // Show loading indicator
      loadingIndicator.classList.remove('hidden');

      // Fetch data from API
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.status);

      // Parse response to JSON
      const data = await response.json();
      data.sort((a, b) => a.name.localeCompare(b.name));

      // Display country cards
      displayCountries(data);

      // Attempt to auto-detect user's country and update the site logo
      // Priority: IP geolocation -> navigator language -> default to US
      const detectUserCountry = async () => {
        try {
          // Try an IP-based geolocation service (no API key needed for small use)
          const geoRes = await fetch('https://ipapi.co/json/');
          if (geoRes && geoRes.ok) {
            const geo = await geoRes.json();
            // ipapi.co can return country codes in several fields; try common ones
            const countryCodeRaw =
              geo && (geo.country || geo.country_code || geo.countryCode);
            if (countryCodeRaw) {
              const code = countryCodeRaw.toUpperCase();
              // Find by alpha2Code
              const country = data.find(c => c.alpha2Code === code);
              if (country) {
                console.info(
                  'Auto-detected country via IP:',
                  code,
                  country.name
                );
                updateSiteLogo(country);
                return;
              }
            }
          }
        } catch (err) {
          // Ignore geolocation errors and fall through to next method
        }

        // Fallback to navigator.language (e.g. "en-US")
        try {
          const lang = navigator.language || navigator.userLanguage;
          if (lang && lang.includes('-')) {
            const code = lang.split('-')[1].toUpperCase();
            const country = data.find(c => c.alpha2Code === code);
            if (country) {
              console.info(
                'Using navigator.language to detect country:',
                code,
                country.name
              );
              updateSiteLogo(country);
              return;
            }
          }
        } catch (err) {}

        // Final fallback: United States (US) if available
        const usCountry = data.find(
          c => c.alpha3Code === 'USA' || c.alpha2Code === 'US'
        );
        if (usCountry) updateSiteLogo(usCountry);
      };
      // Run detection but don't block rendering (only if the behavior is enabled)
      if (config.enableAutoFlag) detectUserCountry();

      // Set up event listeners for region filter and search input
      regionFilter.addEventListener('change', () =>
        filterCountriesByRegion(data)
      );
      search.addEventListener(
        'input',
        debounce(() => filterCountriesByName(data), 300)
      );

      // Event listener for country card click to display details
      cardsContainer.addEventListener('click', e => {
        const card = e.target.closest('.card');
        if (card) {
          const countryCode = card.getAttribute('data-country');
          const country = data.find(c => c.alpha3Code === countryCode);
          displayCountryDetails(country, data);
          updateSiteLogo(country); // Update logo to current country flag
          searchContainer.style.display = 'none';
        }
      });

      // Event listener for back button in country details
      detailsContent.addEventListener('click', e => {
        if (e.target.classList.contains('btn-back')) {
          detailsContent.innerHTML = '';
          displayCountries(data);
          updateSiteLogo(null); // Reset logo to original
          searchContainer.style.display = 'flex';
          scrollToTopButton.style.opacity = '1';
        }
      });
    } catch (err) {
      displayErrorMessage(
        `<p>Error: ${err.message}<br />Check Network.<br />Please Reload.</p>`
      );
    } finally {
      // Hide loading indicator
      loadingIndicator.classList.add('hidden');
    }
  };

  // Function to display country cards
  const displayCountries = countries => {
    const htmlStrings = countries.map(generateCountryHTML).join('\n');
    cardsContainer.innerHTML = htmlStrings;
  };

  // Function to display country details
  const displayCountryDetails = (country, data) => {
    const htmlString = generateCountryDetailsHTML(country, data);
    detailsContent.innerHTML = htmlString;
    cardsContainer.innerHTML = '';
    scrollToTopButton.style.opacity = '0';
  };

  // Function to filter countries by region
  const filterCountriesByRegion = data => {
    const region = regionFilter.value;
    if (!region || region === 'filter') return displayCountries(data);
    const filteredCountries = data.filter(country => country.region === region);
    displayCountries(filteredCountries);
  };

  // Function to filter countries by name
  const filterCountriesByName = data => {
    const countryName = search.value.toLowerCase();
    if (!countryName) return displayCountries(data);
    const filteredCountries = data.filter(country =>
      country.name.toLowerCase().includes(countryName)
    );
    regionFilter.value = 'filter';
    displayCountries(filteredCountries);
  };

  // Debounce function to delay the execution of a function
  const debounce = (func, delay) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Intersection observer callback to show the scroll-to-top button
  const callback = entries => {
    const [entry] = entries;
    if (!entry.isIntersecting) return;
    scrollToTopButton.classList.remove('hidden');
  };

  // Initialize intersection observer
  const cardsObs = new IntersectionObserver(callback, {
    root: null,
    threshold: 0.1,
  });
  cardsObs.observe(cardsContainer);

  // Event listener for scroll-to-top button
  scrollToTopButton.addEventListener('click', () => {
    cardsContainer.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Function to update the mode of country cards
  const updateCardMode = () => {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      if (body.classList.contains('light-mode')) {
        card.classList.add('light-mode');
      } else {
        card.classList.remove('light-mode');
      }
    });
  };

  // Fetch and display countries when the script runs
  await fetchCountries();

  // Function to toggle light mode
  const lightMode = content => {
    content.classList.toggle('light-mode');
  };

  // Event listener for mode switch
  switchMode.addEventListener('click', () => {
    lightMode(body);
    lightMode(search);
    lightMode(regionFilter);
    lightMode(scrollToTopButton);
    lightMode(header);
    lightMode(scrollToTopButton);
    lightMode(modeText);
    updateCardMode();
    dark.classList.toggle('hidden');
    bright.classList.toggle('hidden');
  });
});
