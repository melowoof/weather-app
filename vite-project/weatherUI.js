import * as weatherAPI from "./weatherAPI.js";

let currentTempUnit = "C";

export function currentWeather(data) {
  const temperature = document.querySelectorAll(
    "#current-weather-container .current-weather-temperature"
  );
  const weatherStatus = document.querySelectorAll(
    "#current-weather-container .current-weather-status"
  );
  const temperatureHighDiv = document.querySelector("#high-temp");
  const temperatureLowDiv = document.querySelector("#low-temp");

  const location = document.querySelector("#location");

  temperature.forEach((temp) => {
    // console.log(data);
    temp.textContent = `${convertTemp(data.current.temp_c)}`;
  });
  weatherStatus.forEach((status) => {
    status.textContent = data.current.condition.text;
  });
  location.textContent = data.location.name;
  temperatureHighDiv.innerHTML = `H:${Math.floor(
    convertTemp(data.forecast.forecastday[0].day.maxtemp_c)
  )}`;
  temperatureLowDiv.innerHTML = `L:${Math.floor(
    convertTemp(data.forecast.forecastday[0].day.mintemp_c)
  )}`;
}

export function hourlyForecast(data) {
  const hourlyForecast = document.querySelector("#hourly-forecast");
  const hourlyWeatherStatus = document.querySelector("#hourly-weather-status");

  hourlyForecast.innerHTML = "";
  hourlyWeatherStatus.innerHTML = data.current.condition.text;

  const forecastHourNow = document.createElement("div");
  forecastHourNow.className = "forecast-hour";
  forecastHourNow.innerHTML = `<div class="forecast-hour-hour">Now</div>
            <div><div class="forecast-hour-weather-status-icon"><img width="32" height="32" src="${
              data.current.condition.icon
            }"/></div>
            <div class="chance-of-rain"></div></div>
            <div class="forecast-hour-temperature">${convertTemp(
              data.current.temp_c
            )}&deg;</div>`;
  hourlyForecast.appendChild(forecastHourNow);

  const timeNow = getFormattedLocalDate();
  const nextForecastHour = getNextForecastHour(
    //   getTimeFromDateTime(data.location.localtime)
    getTimeFromDateTime(timeNow)
  );

  let nextForecastHourInt = Number(nextForecastHour.split(":")[0]);

  if (nextForecastHourInt === 0) {
    nextForecastHourInt = 24;
  }
  let totalElements = 1; // Max 28

  for (let i = 0; i <= 1; i++) {
    let forecastTime;
    for (let j = nextForecastHourInt; j < 24; j++) {
      const forecastHour = document.createElement("div");
      forecastHour.className = "forecast-hour";
      forecastTime = getTimeFromDateTime(
        data.forecast.forecastday[i].hour[j].time
      );

      forecastHour.innerHTML = `<div class="forecast-hour-hour">${convertTo12HourHourOnly(
        getTimeFromDateTime(data.forecast.forecastday[i].hour[j].time)
      )}</div>
                      <div><div class="forecast-hour-weather-status-icon"><img width="32" height="32" src="${
                        data.current.condition.icon
                      }"/></div>
                      <div class="chance-of-rain">${chanceOfRain(
                        data.forecast.forecastday[i].hour[j].chance_of_rain
                      )}</div></div>
                      <div class="forecast-hour-temperature">${convertTemp(
                        data.forecast.forecastday[i].hour[j].temp_c
                      )}&deg;</div>`;

      hourlyForecast.appendChild(forecastHour);
      totalElements++;
      forecastTime++;
      if (totalElements >= 25) {
        break;
      }
    }
    forecastTime = 0;
    nextForecastHourInt = 0;
  }
}

function getFormattedLocalDate() {
  const now = new Date(); // Create a Date object

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function chanceOfRain(data) {
  if (data !== 0) {
    return `${data} %`;
  } else {
    return "";
  }
}

function convertTo12HourHourOnly(time) {
  let hours = Number(time.split(":")[0]);
  const modifier = hours >= 12 ? "PM" : "AM";

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }
  return `${hours}<small>${modifier}</small>`;
}

function convertTo12Hour(time) {
  let [hours, minutes] = time.split(":").map(Number);
  const modifier = hours >= 12 ? "PM" : "AM";

  if (hours > 12) {
    hours -= 12;
  } else if (hours === 0) {
    hours = 12;
  }
  return `${hours}:${minutes}<small>${modifier}</small>`;
}

function convertTo24Hour(time) {
  const regex = /^(0?[1-9]|1[0-2]):([0-5][0-9]) ?([AP]M)$/i;
  const match = time.match(regex);

  if (!match) {
    throw new Error("Invalid time format. Please use 'hh:mm AM/PM'.");
  }
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = match[3].toUpperCase();

  if (period === "PM" && hours < 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}`;
}

function getNextForecastHour(time) {
  const hourPlus = Number(time.split(":")[0]) + 1;
  const hourPlusString = hourPlus.toString().padStart(2, "0");
  if (hourPlus > 23) {
    return "00:00";
  } else {
    return `${hourPlusString}:00`;
  }
}

function getTimeFromDateTime(dateTImeString) {
  const time = dateTImeString.match(/\d{2}:\d{2}$/)[0];
  return time;
}

export function currentWeatherScrollOpacity() {
  const element1 = document.querySelector("#temperature-weather-status-normal");
  const element2 = document.querySelector(
    "#temperature-weather-status-minimized"
  );
  const scrollThreshold = 100;

  window.addEventListener("scroll", () => {
    if (window.scrollY > scrollThreshold) {
      element1.style.opacity = "0";
      element2.style.opacity = "1";
    } else {
      element1.style.opacity = "1";
      element2.style.opacity = "0";
    }
  });
}

function convertTemp(temp) {
  // if (temp === C and currentTempUnit === C) {don't do anything} else if (temp === C and currentTempUnit === F) {convert temp to F}
  if (currentTempUnit === "C") {
    return Math.floor(temp);
  } else {
    return Math.floor((temp * 9) / 5 + 32);
  }
}

function toggleTempUnit() {
  if (currentTempUnit === "C") {
    currentTempUnit = "F";
  } else {
    currentTempUnit = "C";
  }
}

export function tenDaysForecast(data) {
  const tenDayForecast = document.querySelector("#ten-day-forecast");
  tenDayForecast.innerHTML = "";
  const currentTemp = data.current.temp_c;
  const tempPointLeft = getPercentage(
    data.forecast.forecastday[0].day.mintemp_c,
    data.forecast.forecastday[0].day.maxtemp_c,
    currentTemp
  );

  const lowTempArray = [];
  const highTempArray = [];
  for (let i = 1; i < 3; i++) {
    // lowTempArray.push(data.forecast.forecastday[i].day.mintemp_c);
    // highTempArray.push(data.forecast.forecastday[i].day.maxtemp_c);
    lowTempArray.push(data.forecast.forecastday[i].day.mintemp_c);
    highTempArray.push(data.forecast.forecastday[i].day.maxtemp_c);
  }
  const lowestTemp = Math.min(...lowTempArray);
  const highestTemp = Math.max(...highTempArray);
  // console.log(lowestTemp, highestTemp);

  for (let i = 0; i < 3; i++) {
    const forecastDayDiv = document.createElement("div");
    const dateString =
      i === 0 ? "Today" : getWeekday(data.forecast.forecastday[i].date);
    const meterPoint =
      i === 0
        ? `<div class="temperature-meter-point" id="temperature-meter-point"></div>`
        : "";

    forecastDayDiv.innerHTML = `<div class="forecast-day">
              <div class="forecast-day-date">${dateString}</div>
              <div class="forecast-day-weather-status"><img src="${
                data.forecast.forecastday[i].day.condition.icon
              }"
                  width="32" height="32" alt="" class="forecast-day-icon">
                <div class="forecast-day-chance-of-rain">${chanceOfRain(
                  data.forecast.forecastday[i].day.daily_chance_of_rain
                )}</div>
              </div>
              <div class="forecast-day-high-low-temp">
                <div class="forecast-day-low-temp">${convertTemp(
                  data.forecast.forecastday[i].day.mintemp_c
                )}&deg;</div>
                <div class="forecast-day-temperature-meter">
                  <div class="forecast-day-temperature-meter-filled" id="forecast-day-temperature-meter-filled-${i}">${meterPoint}
                  </div>
                </div>
                <div class="forecast-day-high-temp">${convertTemp(
                  data.forecast.forecastday[i].day.maxtemp_c
                )}&deg;</div>
              </div>
            </div>`;

    tenDayForecast.appendChild(forecastDayDiv);
    const filledDiv = document.getElementById(
      `forecast-day-temperature-meter-filled-${i}`
    );
    const meterPointDiv = document.getElementById("temperature-meter-point");
    const meterPercentage = getPercentage(
      lowestTemp,
      highestTemp,
      data.current.temp_c
    );
    meterPointDiv.style.left = `${meterPercentage}%`;
    // console.log(meterPercentage, lowestTemp, highestTemp);

    const leftPercentage = getPercentage(
      lowestTemp,
      highestTemp,
      data.forecast.forecastday[i].day.mintemp_c
    );
    filledDiv.style.left = `${leftPercentage}%`;
    filledDiv.style.width = `${
      Math.min(
        getPercentage(
          lowestTemp,
          highestTemp,
          data.forecast.forecastday[i].day.maxtemp_c
        ),
        100
      ) - leftPercentage
    }%`;
  }
}

function getWeekday(dateString) {
  const date = new Date(dateString);
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const dayIndex = date.getDay();
  return weekdays[dayIndex];
}

function getPercentage(min, max, value) {
  let percentage = ((value - min) / (max - min)) * 100;
  return percentage;
}

export function uvIndex(data) {
  const uvIndex = document.querySelector("#uv-index");
  uvIndex.innerHTML = "";
  const uvIndexValue = data.current.uv;
  let uvIndexLevel;
  const uvLeft = getPercentage(0, 11, uvIndexValue);
  // console.log(uvLeft);

  if (uvIndexValue >= 0 && uvIndexValue <= 2) {
    uvIndexLevel = "Low";
  } else if (uvIndexValue >= 3 && uvIndexValue <= 5) {
    uvIndexLevel = "Moderate";
  } else if (uvIndexValue >= 6 && uvIndexValue <= 7) {
    uvIndexLevel = "High";
  } else if (uvIndexValue >= 8 && uvIndexValue <= 10) {
    uvIndexLevel = "Very High";
  } else if (uvIndexValue >= 11) {
    uvIndexLevel = "Extreme";
  }

  const uvIndexDiv = document.createElement("div");
  uvIndexDiv.innerHTML = `<div class="uv-index-status">
              <div class="uv-index-value">${uvIndexValue}</div>
              <div class="uv-index-level">${uvIndexLevel}</div>
            </div>
            <div class="uv-index-meter-container">
              <div class="uv-index-meter">
                <div class="uv-index-meter-point"></div>
              </div>
            </div>
`;
  uvIndex.appendChild(uvIndexDiv);
  const uvIndexMeterPoint = document.querySelector(".uv-index-meter-point");
  uvIndexMeterPoint.style.left = `${uvLeft}%`;
  console.log(uvIndexValue);
}

export function twilight(data) {
  let sunrise = data.forecast.forecastday[0].astro.sunrise;
  let sunset = data.forecast.forecastday[0].astro.sunset;
  const currentTime = getTimeFromDateTime(data.location.localtime);
  // const currentTime = "14:30";

  const currentDate = new Date();
  const currentTimeObj = new Date(
    currentDate.toDateString() + " " + currentTime
  );
  const sunriseTimeObj = new Date(currentDate.toDateString() + " " + sunrise);
  const sunsetTimeObj = new Date(currentDate.toDateString() + " " + sunset);

  let nextTwilight = "SUNRISE";

  if (currentTimeObj >= sunriseTimeObj && currentTimeObj <= sunsetTimeObj) {
    sunrise = data.forecast.forecastday[1].astro.sunrise;
    nextTwilight = "SUNSET";
  } else if (currentTime >= sunsetTimeObj) {
    sunrise = data.forecast.forecastday[1].astro.sunrise;
    sunset = data.forecast.forecastday[1].astro.sunset;
    nextTwilight = "SUNRISE";
  }

  const twilightDiv = document.querySelector("#twilight");
  const twilightDivName = document.querySelector(".grid-item-name.twilight");

  twilightDivName.innerHTML = nextTwilight;

  const twilightBigTime = document.querySelector("#twilight-big-time");
  const twilightSmallTime = document.querySelector("#twilight-small-time");

  twilightBigTime.innerHTML =
    nextTwilight === "SUNRISE"
      ? convertTo12Hour(convertTo24Hour(sunrise))
      : convertTo12Hour(convertTo24Hour(sunset));
  twilightSmallTime.innerHTML =
    nextTwilight === "SUNRISE"
      ? `Sunset: ${convertTo12Hour(convertTo24Hour(sunset))}`
      : `Sunrise: ${convertTo12Hour(convertTo24Hour(sunrise))}`;
}

export function windSpeed(data) {
  const windSpeedDiv = document.querySelector("#wind-speed");
  const windDirectionDiv = document.querySelector("#wind-direction");
  let windDirection = data.current.wind_dir;

  if (windDirection === "N") {
    windDirection = "North";
  } else if (windDirection === "S") {
    windDirection = "South";
  } else if (windDirection === "W") {
    windDirection = "West";
  } else if (windDirection === "E") {
    windDirection = "East";
  } else if (windDirection === "NW") {
    windDirection = "North West";
  } else if (windDirection === "NE") {
    windDirection = "North East";
  } else if (windDirection === "SW") {
    windDirection = "South West";
  } else if (windDirection === "SE") {
    windDirection = "South East";
  }

  windSpeedDiv.innerHTML = `${Math.floor(
    data.current.wind_kph
  )} <small>km/h</small>`;
  windDirectionDiv.innerHTML = `${windDirection}`;
}

export function precipitation(data) {
  const precipitationDiv = document.querySelector("#precipitation-level");
  precipitationDiv.innerHTML = `${Math.floor(
    data.forecast.forecastday[0].day.totalprecip_mm
  )} mm`;
}

export function feelsLike(data) {
  const feelsLikeDiv = document.querySelector("#feels-like");
  feelsLikeDiv.innerHTML = `${Math.floor(
    convertTemp(data.current.feelslike_c)
  )}&deg;`;
}

export function moonPhase(data) {
  const moonPhaseValueDiv = document.querySelector("#moon-phase-value");
  const nextMoonRise = document.querySelector("#next-moon-rise");

  let moonPhase = data.forecast.forecastday[0].astro.moon_phase;
  let moonrise = data.forecast.forecastday[0].astro.moonrise;

  moonPhaseValueDiv.innerHTML = moonPhase;
  nextMoonRise.innerHTML = `Today's moonrise: ${convertTo12Hour(
    convertTo24Hour(moonrise)
  )}`;
}

export function visibility(data) {
  const visibilityRangeDiv = document.querySelector("#visibility-range");
  const visibilityDescDiv = document.querySelector("#visibility-desc");
  const visibilityValue = data.current.vis_km;
  let visibilityLevel;

  if (visibilityValue > 10) {
    visibilityLevel = "Clear visibility.";
  } else if (visibilityValue >= 6 && visibilityValue <= 10) {
    visibilityLevel = "Good visibility.";
  } else if (visibilityValue >= 3 && visibilityValue < 6) {
    visibilityLevel = "Moderate visibility.";
  } else if (visibilityValue >= 1 && visibilityValue < 3) {
    visibilityLevel = "Poor visibility.";
  } else if (visibilityValue < 1) {
    visibilityLevel = "Very Poor visibility.";
  } else {
    visibilityLevel = "Invalid visibility Value.";
  }

  visibilityRangeDiv.innerHTML = `${visibilityValue} km`;
  visibilityDescDiv.innerHTML = visibilityLevel;
}

export function humidity(data) {
  const humidityDiv = document.querySelector("#humidity-level");
  const dewPointDiv = document.querySelector("#dew-point");

  humidityDiv.innerHTML = `${data.current.humidity} %`;
  dewPointDiv.innerHTML = `The dew point is ${convertTemp(
    data.current.dewpoint_c
  )}&deg; right now.`;
}

export function pressure(data) {
  const pressureDiv = document.querySelector("#pressure");
  pressureDiv.innerHTML = `${data.current.pressure_mb} hPa`;
}

export function averages(data) {
  const averagesValueDiv = document.querySelector("#averages-value");
  const todayAverageDiv = document.querySelector("#today-average");
  const averageAverageDiv = document.querySelector("#average-average");

  const highTemp = data.forecast.forecastday[0].day.maxtemp_c;
  const lowTempArray = [];
  const highTempArray = [];
  for (let i = 1; i < 3; i++) {
    lowTempArray.push(data.forecast.forecastday[i].day.mintemp_c);
    highTempArray.push(data.forecast.forecastday[i].day.maxtemp_c);
  }
  const lowestTemp = Math.min(...lowTempArray);
  const highestTemp = Math.max(...highTempArray);
  const averageTemp = (highestTemp + lowestTemp) / 2;
  const averagesValue = averageTemp - highTemp;

  averagesValueDiv.innerHTML = `${Math.floor(averagesValue)}&deg;`;
  todayAverageDiv.innerHTML = `H:${Math.floor(convertTemp(highTemp))}&deg;`;
  averageAverageDiv.innerHTML = `H:${Math.floor(
    convertTemp(averageTemp)
  )}&deg;`;
}

export function setBackgroundGradient(data) {
  let gradient;
  let rgbaColor;
  const isDay = data.current.is_day;

  // Normalize the weather condition to lowercase
  const condition = data.current.condition.text.toLowerCase();

  // Map weather conditions to gradients
  if (isDay) {
    switch (true) {
      case condition.includes("clear"):
        gradient = "var(--clear-gradient)";
        rgbaColor = "var(--clear-rgba)";
        break;
      case condition.includes("partly cloudy"):
        gradient = "var(--partly-cloudy-gradient)";
        rgbaColor = "var(--partly-cloudy-rgba)";
        break;
      case condition.includes("cloudy"):
        gradient = "var(--cloudy-gradient)";
        rgbaColor = "var(--cloudy-rgba)";
        break;
      case condition.includes("rain"):
        gradient = "var(--rain-gradient)";
        rgbaColor = "var(--rain-rgba)";
        break;
      case condition.includes("snow"):
        gradient = "var(--snow-gradient)";
        rgbaColor = "var(--snow-rgba)";
        break;
      case condition.includes("thunderstorms"):
        gradient = "var(--thunderstorms-gradient)";
        rgbaColor = "var(--thunderstorms-rgba)";
        break;
      case condition.includes("fog"):
        gradient = "var(--fog-gradient)";
        rgbaColor = "var(--fog-rgba)";
        break;
      case condition.includes("windy"):
        gradient = "var(--windy-gradient)";
        rgbaColor = "var(--windy-rgba)";
        break;
      case condition.includes("drizzle"):
        gradient = "var(--drizzle-gradient)";
        rgbaColor = "var(--drizzle-rgba)";
        break;
      case condition.includes("haze"):
        gradient = "var(--haze-gradient)";
        rgbaColor = "var(--haze-rgba)";
        break;
      case condition.includes("sleet"):
        gradient = "var(--sleet-gradient)";
        rgbaColor = "var(--sleet-rgba)";
        break;
      case condition.includes("tornado"):
        gradient = "var(--tornado-gradient)";
        rgbaColor = "var(--tornado-rgba)";
        break;
      default:
        gradient = "var(--clear-gradient)"; // Default to clear if no match
        rgbaColor = "var(--clear-rgba)";
    }
  } else {
    switch (true) {
      case condition.includes("clear"):
        gradient = "var(--clear-night-gradient)";
        rgbaColor = "var(--clear-night-rgba)";
        break;
      case condition.includes("partly cloudy"):
        gradient = "var(--partly-cloudy-night-gradient)";
        rgbaColor = "var(--partly-cloudy-night-rgba)";
        break;
      case condition.includes("cloudy"):
        gradient = "var(--cloudy-night-gradient)";
        rgbaColor = "var(--cloudy-night-rgba)";
        break;
      case condition.includes("rain"):
        gradient = "var(--rain-night-gradient)";
        rgbaColor = "var(--rain-night-rgba)";
        break;
      case condition.includes("snow"):
        gradient = "var(--snow-night-gradient)";
        rgbaColor = "var(--snow-night-rgba)";
        break;
      case condition.includes("thunderstorms"):
        gradient = "var(--thunderstorms-night-gradient)";
        rgbaColor = "var(--thunderstorms-night-rgba)";
        break;
      case condition.includes("fog"):
        gradient = "var(--fog-night-gradient)";
        rgbaColor = "var(--fog-night-rgba)";
        break;
      case condition.includes("windy"):
        gradient = "var(--windy-night-gradient)";
        rgbaColor = "var(--windy-night-rgba)";
        break;
      case condition.includes("drizzle"):
        gradient = "var(--drizzle-night-gradient)";
        rgbaColor = "var(--drizzle-night-rgba)";
        break;
      case condition.includes("haze"):
        gradient = "var(--haze-night-gradient)";
        rgbaColor = "var(--haze-night-rgba)";
        break;
      case condition.includes("sleet"):
        gradient = "var(--sleet-night-gradient)";
        rgbaColor = "var(--sleet-night-rgba)";
        break;
      case condition.includes("tornado"):
        gradient = "var(--tornado-night-gradient)";
        rgbaColor = "var(--tornado-night-rgba)";
        break;
      default:
        gradient = "var(--clear-night-gradient)"; // Default to clear night if no match
        rgbaColor = "var(--clear-night-rgba)";
    }
  }
  // Set the body's background to the selected gradient
  document.body.style.background = gradient;
  document.body.style.backgroundAttachment = "fixed";

  const gridItems = document.querySelectorAll(".grid-item");
  const searchBox = document.querySelector("#search-box");
  gridItems.forEach((item) => {
    item.style.backgroundColor = rgbaColor;
  });
  searchBox.style.backgroundColor = rgbaColor;
}
