import * as wasm from "roman-clock";

function getLocation() {
  return new Promise((resolve, reject) => {
    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    function success(pos) {
      const crd = pos.coords;

      console.log("Your current position is:");
      console.log(`Latitude : ${crd.latitude}`);
      console.log(`Longitude: ${crd.longitude}`);
      console.log(`Elevation: ${crd.altitude}`);
      console.log(`More or less ${crd.accuracy} meters.`);
      resolve({
        lat: crd.latitude,
        lon: crd.longitude,
        alt: crd.altitude || 0,
      });
    }

    function error(err) {
      reject(`ERROR(${err.code}): ${err.message}`);
    }

    navigator.geolocation.getCurrentPosition(success, error, options);
  });
}

function updateCurrentRomanSunTime(locationDetails) {
  const romanSunTime = wasm.roman_sun_time(
    BigInt(Date.now()),
    locationDetails.lat,
    locationDetails.lon,
    locationDetails.alt
  );

  const clockDetails = document.getElementById("clockDetails");

  const dayOrNightElement = document.createElement("div");
  dayOrNightElement.classList.add("RomanClock__DayOrNight");
  dayOrNightElement.classList.add(
    `RomanClock__DayOrNight--${romanSunTime.is_day ? "day" : "night"}`
  );

  const nowTimeElement = document.createElement("div");
  nowTimeElement.classList.add("RomanClock__Time");
  nowTimeElement.appendChild(
    document.createTextNode(
      `${Math.floor(romanSunTime.total_minutes / 60)
        .toString()
        .padStart(2, "0")}:${(romanSunTime.total_minutes % 60)
        .toString()
        .padStart(2, "0")}`
    )
  );

  const minuteLengthElement = document.createElement("div");
  minuteLengthElement.classList.add("RomanClock__MinuteLength");
  minuteLengthElement.appendChild(
    document.createTextNode(
      `${new Intl.NumberFormat("en", { maximumFractionDigits: 2 }).format(
        romanSunTime.minute_length
      )} seconds`
    )
  );
  minuteLengthElement.appendChild(document.createElement("br"));
  minuteLengthElement.appendChild(document.createTextNode("in a minute"));

  const lastSunChange = romanSunTime.last_sun_change.toString();
  const nextSunChange = romanSunTime.next_sun_change.toString();
  console.log(lastSunChange, new Date(Number(lastSunChange)));
  console.log(nextSunChange, new Date(Number(nextSunChange)));
  console.log(romanSunTime.hours, romanSunTime.minutes);

  let firstChild = null;
  while ((firstChild = clockDetails.firstChild) !== null) {
    clockDetails.removeChild(firstChild);
  }
  clockDetails.appendChild(dayOrNightElement);
  clockDetails.appendChild(nowTimeElement);
  clockDetails.appendChild(minuteLengthElement);

  return romanSunTime.minute_length;
}

getLocation().then((locationDetails) => {
  const intervalLength = updateCurrentRomanSunTime(locationDetails);
  setInterval(
    () => updateCurrentRomanSunTime(locationDetails),
    intervalLength * 1000 || 1000
  );
}).catch((e) => {
  const notification = document.querySelector("#clockDetails .RomanClock__Notification");
  notification.innerHTML = "Cannot get your location. This clock cannot work without this information. Please allow it and refresh the page.";

  console.log(e);
});
