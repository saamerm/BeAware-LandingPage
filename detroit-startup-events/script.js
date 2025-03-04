document.addEventListener("DOMContentLoaded", function () {
  const API_URL = "https://api.deafassistant.com/retrieve/GetJson?guid=24c8b245-018b-4ca7-8455-612c9339d636";
  // const API_URL = "https://script.google.com/macros/s/AKfycbzQIl7H91UC-3E8ma56iL4egPgX3kxmLf9rBJSlB4ltaMMvA-4dIruyBGjHUVezVe35Pw/exec"; // Replace with your API URL
  const eventsContainer = document.getElementById("events-container");
  const loader = document.getElementById("loader");

  // Show loader before fetching data
  loader.style.display = "block";

  fetch(API_URL, {
    method: "GET",
    headers: {
        "Content-Type": " application/json"
    },
    mode: "cors"
})
    .then((response) => { 
      console.log(response);      
      console.log("response");      
      console.log(response.json);      
      return response.json();      
    })
    .then((events) => {
      loader.style.display = "none"; // Hide loader
      eventsContainer.innerHTML = ""; // Clear container

      if (events.length === 0) {
        eventsContainer.innerHTML = "<p>No upcoming events found.</p>";
        return;
      }

      events.forEach((event) => {
        const eventCard = document.createElement("div");
        eventCard.classList.add("event-card");

        eventCard.innerHTML = `
                <div style="background-color: blue; padding:1px;">
                    <img src="${
                      event.Image
                    }" alt="Event Image" onerror="this.onerror=null;this.src='https://michigansbdc.org/wp-content/uploads/2021/06/Michigan_SBDC-LogoWhite.svg'; ">
                </div>
                    <div class="event-details">
                        <div class="event-title">${event.Title}</div>
                        <div class="event-info"><strong>Date:</strong> ${
                          event.Date
                        }</div>
                        <div class="event-info"><strong>Time:</strong> ${convertTime(
                          event.Time
                        )}</div>
                        <div class="event-info"><strong>Location:</strong> ${
                          event.Location
                        }</div>
                        <a href="${
                          event.URL
                        }" class="event-link" target="_blank">View Event</a>
                    </div>
                `;

        eventsContainer.appendChild(eventCard);
      });
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      loader.style.display = "none";
      eventsContainer.innerHTML = "<p>Error loading events.</p>";
    });
});

// Convert 24-hour time to 12-hour AM/PM format
function convertTime(time) {
  if (time.toLowerCase().includes("am") || time.toLowerCase().includes("pm")) {
    return time;
  }
  let [start, end] = time.split(" - ");
  let [hours, minutes] = start.split(":");
  hours = parseInt(hours);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 24h to 12h format
  return `${hours}:${minutes} ${ampm}`;
}