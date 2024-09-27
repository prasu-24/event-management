const apiUrl = 'http://localhost:3000'; // Change to your API endpoint if needed

// Function to load events and display them
async function loadEvents() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${apiUrl}/events`, {
      headers: { Authorization: token ? `Bearer ${token}` : '' } // Include 'Bearer' prefix
    });
    const eventsList = document.getElementById('event-list'); // Ensure this matches your HTML
    eventsList.innerHTML = ''; // Clear the existing list

    // Check if there are events to display
    if (response.data.length === 0) {
      eventsList.innerHTML = '<li>No events available</li>'; // Show a message if no events are found
    } else {
      response.data.forEach(event => {
        const eventItem = document.createElement('li'); // Change to 'li' for list items
        eventItem.classList.add('event-item');
        eventItem.innerHTML = `
          <h3>${event.title}</h3>
          <p>${event.description}</p>
          <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
          <p>Location: ${event.location}</p>
          <p>Capacity: ${event.capacity} | Tickets Sold: ${event.ticketsSold || 0}</p> <!-- Handle ticketsSold safely -->
        `;
        eventsList.appendChild(eventItem);
      });
    }
  } catch (error) {
    console.error('Error loading events:', error);
    alert('Error loading events: ' + (error.response ? error.response.data.message : error.message));
  }
}

// Create event form submission
const createEventForm = document.getElementById('create-event-form');
createEventForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const title = document.getElementById('title').value; // Adjusted to match HTML ID
  const description = document.getElementById('description').value; // Adjusted to match HTML ID
  const date = document.getElementById('date').value; // Adjusted to match HTML ID
  const location = document.getElementById('location').value; // Adjusted to match HTML ID
  const capacity = document.getElementById('capacity').value; // Adjusted to match HTML ID

  try {
    const response = await axios.post(`${apiUrl}/events`, {
      title,
      description,
      date,
      location,
      capacity
    }, {
      headers: { Authorization: token ? `Bearer ${token}` : '' } // Include 'Bearer' prefix
    });
    alert('Event created successfully!');
    loadEvents(); // Reload events
    createEventForm.reset(); // Reset form fields
  } catch (error) {
    console.error('Error creating event:', error);
    alert('Error creating event: ' + (error.response ? error.response.data.message : error.message));
  }
});

// Register form submission
const registerForm = document.getElementById('register-form');
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    await axios.post(`${apiUrl}/register`, { name, email, password });
    alert('Registration successful! Please log in.');
    registerForm.reset();
  } catch (error) {
    console.error('Error registering:', error);
    alert('Error registering: ' + (error.response ? error.response.data.message : error.message));
  }
});

// Login form submission
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await axios.post(`${apiUrl}/login`, { email, password });
    localStorage.setItem('token', response.data.token); // Store token in local storage
    alert('Login successful!');
    loadEvents(); // Reload events after login
    loginForm.reset();
  } catch (error) {
    console.error('Error logging in:', error);
    alert('Error logging in: ' + (error.response ? error.response.data.message : error.message));
  }
});

// Initial load of events when the page is loaded
window.onload = () => {
  loadEvents();
};
