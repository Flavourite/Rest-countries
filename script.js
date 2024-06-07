"use strict";
window.addEventListener("DOMContentLoaded", async () => {
  const body = document.querySelector("body");
  const cardsContainer = document.querySelector(".cards-container");
  const searchContainer = document.querySelector(".search-container");
  const detailsContent = document.querySelector(".details-content");
  const header = document.querySelector("header");
  const modeText = document.querySelector(".mode-text");
  const regionFilter = document.querySelector(".region-filter");
  const search = document.querySelector(".search");
  const switchMode = document.querySelector(".mode");
  const dark = document.querySelector(".dark");
  const bright = document.querySelector(".bright");

  const generateCountryHTML = (country) => `
    <div class="card" data-country="${country.cca3}">
      <div class="flag">
        <img src="${country.flags.png}" alt="${country.flags.alt}" />
      </div>
      <div class="part-info">
        <h2>${country.name.common}</h2>
        <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
        <p><strong>Region:</strong> ${country.region}</p>
        <p><strong>Capital:</strong> ${
          country.capital ? country.capital[0] : "N/A"
        }</p>
      </div>
    </div>
  `;

  const getNativeName = (nativeName) => {
    return nativeName ? Object.values(nativeName)[0].common : "N/A";
  };

  const getCountryCurrencies = (currencies) => {
    return currencies
      ? Object.values(currencies)
          .map((curr) => curr.name)
          .join(", ")
      : "N/A";
  };

  const getCountryLanguages = (language) => {
    return Object.values(language).join(", ");
  };

  const generateCountryDetailsHTML = (country) => `
    <button class="btn-back">← Back</button>
    <div class="country-details">
      <div class="country-flag">
        <img src="${country.flags.png}" alt="${country.flags.alt}" />
      </div>
      <div class="country-info">
        <h2 class="country-name">${country.name.official}</h2>
        <div class="details">
          <p><strong>Native Name:</strong> ${getNativeName(
            country.name.nativeName
          )}</p>
          <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
          <p><strong>Region:</strong> ${country.region}</p>
          <p><strong>Sub Region:</strong> ${country.subregion}</p>
          <p><strong>Capital:</strong> ${
            country.capital ? country.capital[0] : "N/A"
          }</p>
          <p><strong>Top Level Domain:</strong> ${
            country.tld ? country.tld[0] : "N/A"
          }</p>
          <p><strong>Currencies:</strong> ${getCountryCurrencies(
            country.currencies
          )}</p>
          <p><strong>Languages:</strong> ${getCountryLanguages(
            country.languages
          )}</p>
        </div>
        <div class="border-countries">
          <p><strong>Border Countries:</strong> ${
            country.borders ? country.borders.join(", ") : "N/A"
          }</p>
        </div>
      </div>
    </div>
  `;

  const fetchCountries = async () => {
    const url = `https://restcountries.com/v3.1/all`;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.status);
      const data = await response.json();
      data.sort((a, b) => a.name.common.localeCompare(b.name.common));
      displayCountries(data);

      // Add event listeners for filtering and searching
      regionFilter.addEventListener("change", () =>
        filterCountriesByRegion(data)
      );
      search.addEventListener("input", () => filterCountriesByName(data));

      // Add click event listeners to each card
      cardsContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".card");
        if (card) {
          const countryCode = card.getAttribute("data-country");
          const country = data.find((c) => c.cca3 === countryCode);
          displayCountryDetails(country);
          searchContainer.style.display = "none";
        }
      });

      // Add event listener for the back button
      detailsContent.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-back")) {
          detailsContent.innerHTML = "";
          displayCountries(data);
          searchContainer.style.display = "flex";
        }
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const displayCountries = (countries) => {
    const htmlStrings = countries.map(generateCountryHTML).join("\n");
    cardsContainer.innerHTML = htmlStrings;
  };

  const displayCountryDetails = (country) => {
    const htmlString = generateCountryDetailsHTML(country);
    detailsContent.innerHTML = htmlString;
    cardsContainer.innerHTML = "";
  };

  const filterCountriesByRegion = (data) => {
    const region = regionFilter.value;
    if (!region) return displayCountries(data);
    const filteredCountries = data.filter(
      (country) => country.region === region
    );
    displayCountries(filteredCountries);
  };

  const filterCountriesByName = (data) => {
    const countryName = search.value.toLowerCase();
    if (!countryName) return displayCountries(data);
    const filteredCountries = data.filter((country) =>
      country.name.common.toLowerCase().includes(countryName)
    );
    regionFilter.value = "filter";
    displayCountries(filteredCountries);
  };

  const updateCardMode = () => {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
      if (body.classList.contains("light-mode")) {
        card.classList.add("light-mode");
      } else {
        card.classList.remove("light-mode");
      }
    });
  };

  await fetchCountries();

  switchMode.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    search.classList.toggle("for-input");
    regionFilter.classList.toggle("for-input");
    header.classList.toggle("light-mode");
    modeText.classList.toggle("light-mode");
    updateCardMode(); // Ensure cards are updated when mode is toggled
    dark.classList.toggle("hidden");
    bright.classList.toggle("hidden");
  });
});
