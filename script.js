// NOTE: We have some limitations on this API key.
let key = "6c956b6363324454bec54151251403"; // Declare the API key variable

// Define an asynchronous function to get the city weather data when form is submitted
async function getCityName(event) {
  event.preventDefault(); // Prevent the default form submission (page reload)
  let city = document.forms.form.city.value.trim(); // Get and trim the city value from the form input
  if (!city) return; // If no city is provided, exit the function

  // Fetch current weather and a single day (24-hour) forecast for hourly data
  await getCurrentWeatherAndHourly(city); // Call the function to get current weather and hourly forecast

  // Fetch the 7-day forecast for the city
  await get7DayForecast(city); // Call the function to get 7-day forecast
}

// Define an asynchronous function to fetch and display the current weather and 24-hour hourly forecast
async function getCurrentWeatherAndHourly(city) {
  try { // Start a try block to catch errors
    // Current weather
    let currentAPI = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${city}&aqi=no`; // Build the API URL for current weather data
    let currentRes = await fetch(currentAPI); // Fetch the current weather data from the API
    let currentData = await currentRes.json(); // Parse the response as JSON

    // Display current weather
    let details = `
      <h1>${currentData.location.name}</h1>
      <h6>${currentData.location.country}</h6>
      <h1>${currentData.current.temp_c} <sup>°C</sup></h1>
    `; // Create HTML content for current weather details using template literals
    let icon = `
      <img src="${currentData.current.condition.icon}" class="icon" alt="icon">
    `; // Create HTML content for current weather icon using template literals
    document.getElementById("detailsId").innerHTML = details; // Insert the weather details into the element with id "detailsId"
    document.getElementById("iconId").innerHTML = icon; // Insert the weather icon into the element with id "iconId"

    // Hourly forecast for the current day
    let forecastAPI = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${city}&aqi=no`; // Build the API URL for forecast data
    let forecastRes = await fetch(forecastAPI); // Fetch the forecast data from the API
    let forecastData = await forecastRes.json(); // Parse the forecast response as JSON

    let hours = forecastData.forecast.forecastday[0].hour; // Extract the hourly forecast data for the current day
    let forecastEle = document.getElementById("forecast"); // Get the DOM element where the hourly forecast will be displayed
    let cols = hours.reduce((acc, obj, ind) => { // Use reduce to build HTML content for selected hourly forecast entries
      let time; // Initialize a variable to store formatted time
      // Only show certain hours (3, 6, 9, 12, 15, 18, 21)
      if (ind === 3 || ind === 6 || ind === 9 || ind === 12 || ind === 15 || ind === 18 || ind === 21) {
        if (ind < 12) { // For hours before noon
          time = `${ind}:00 AM`; // Format the time as AM
        } else if (ind === 12) { // For noon
          time = `12:00 PM`; // Format as 12:00 PM
        } else { // For hours after noon
          time = `${ind - 12}:00 PM`; // Convert to 12-hour format and append PM
        }

        let colItem = `
          <div class="col d-flex flex-column align-items-center my-3">
            <h6>${time}</h6>
            <img src="${obj.condition.icon}" alt="hour-icon">
            <h5>${obj.temp_c}<sup>°C</sup></h5>
          </div>
        `; // Build the HTML snippet for the current hour's forecast data
        acc += colItem; // Append the HTML snippet to the accumulator
      }
      return acc; // Return the accumulator for the next iteration
    }, ""); // Initialize the accumulator as an empty string

    forecastEle.innerHTML = cols; // Insert the built hourly forecast HTML into the DOM element
  } catch (err) { // Catch any errors that occur during fetching or processing
    console.log("Error fetching current weather or hourly forecast:", err); // Log the error message and details to the console
  }
}

// Define an asynchronous function to fetch and display the 7-day forecast data
async function get7DayForecast(city) {
  try { // Start a try block to catch errors
    // 'days=7' to get 7 days forecast
    let api7Day = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${city}&days=7&aqi=no`; // Build the API URL for a 7-day forecast
    let res7Day = await fetch(api7Day); // Fetch the 7-day forecast data from the API
    let data7Day = await res7Day.json(); // Parse the response as JSON

    let weekForecastEle = document.getElementById("weekForecast"); // Get the DOM element for the 7-day forecast display
    let forecastArr = data7Day.forecast.forecastday; // Extract the array of forecast data for 7 days

    // Build HTML for each of the 7 days using map to transform each day's data into HTML
    let forecastHTML = forecastArr
      .map((dayObj) => {
        // Get day name (e.g. "Monday") from the date
        let date = new Date(dayObj.date); // Convert the date string into a Date object
        let options = { weekday: "long" }; // Options for formatting the date to show the full weekday name
        let dayName = date.toLocaleDateString("en-US", options); // Format the date to get the day name

        // Get the condition icon and text for the day's weather
        let icon = dayObj.day.condition.icon; // Extract the URL of the weather condition icon
        let text = dayObj.day.condition.text; // Extract the descriptive text of the weather condition

        // Get maximum and minimum temperatures for the day
        let maxTemp = dayObj.day.maxtemp_c; // Maximum temperature in Celsius
        let minTemp = dayObj.day.mintemp_c; // Minimum temperature in Celsius

        // Build a card or list item for the day with its forecast details
        return `
          <div class="card my-2 bg-transparent border-0 text-white">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <h5 class="card-title mb-1">${dayName}</h5>
                <p class="card-text mb-1 text-capitalize">${text}</p>
              </div>
              <img src="${icon}" alt="weather-icon" style="width: 40px; height: 40px;" />
              <div>
                <p class="mb-0"><strong>${maxTemp}°</strong> / ${minTemp}°</p>
              </div>
            </div>
          </div>
        `; // Return the HTML snippet for this day's forecast
      })
      .join(""); // Join all the individual day HTML snippets into one continuous string

    // Insert the final HTML into the weekForecast element with a header
    weekForecastEle.innerHTML = `
      <h4 class="mb-3 text-center">3-Day Forecast</h4>
      ${forecastHTML}
    `; // Set the innerHTML of the weekForecast element to include the header and the 7-day forecast cards

     // Display the container now that data is available
     weekForecastEle.style.display = "block";

  } catch (err) { // Catch any errors that occur during the fetch or processing of the 7-day forecast
    console.log("Error fetching 7-day forecast:", err); // Log the error message and details to the console
  }
}
