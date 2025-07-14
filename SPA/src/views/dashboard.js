// views/dashboard.js
import { auth } from "../js/auth";
import { router } from "../router";
import { api } from "../main"; 



export async function showDashboard(){
    const user = auth.getUser();
    if (!user) { // Route protection
        history.pushState(null, null, "/login");
        router();
        return;
    }

    document.getElementById('app').innerHTML = `
        <h1>Welcome, ${user.name} (${user.role})</h1>
        <button id="logout-btn">Logout</button>
        <nav>
            <a href="/events" data-link>View events</a>
            ${user.role === 'admin' ? `<a href="/events/create" data-link>Create event</a>` : ''}
        </nav>`;

    document.getElementById('logout-btn').onclick = () => {
        auth.logout();
        history.pushState(null, null, "/login"); // Redirect to login after logout
        router();
    };

}



export async function showEvents() {
    const user = auth.getUser();
    if (!user) { // Route protection
        history.pushState(null, null, "/login");
        router();
        return;
    }
   
    const events = await api.get('/events');


    document.getElementById('app').innerHTML = `
        <h2>Available Events</h2>
        <ul>${events.map(e => `
            <li>${e.title || 'No title'} (${e.capacity || 0} slots) — Showman: ${e.showman || 'N/A'}
                ${user.role === 'admin' ? `<button onclick="navigateTo('/events/edit/${e.id}')">Edit</button>` : ''}
                ${user.role === 'student' ? `<button class="enroll-btn" data-id="${e.id}">Enroll</button>` : ''}
            </li>`).join('')}</ul>`;

    // Reuse the variable 'user' instead of 'u' for consistency
    if (user.role === 'student') {
        document.querySelectorAll('.enroll-btn').forEach(btn => {
            btn.onclick = async () => {
                const eventId = btn.dataset.id;

                // Make sure 'api' is imported or available globally
                const event = await api.get('/events/' + eventId);

                if (!event.enrolled) event.enrolled = [];

                if (event.enrolled.includes(user.email)) { // Use 'user'
                    alert('You are already enrolled in this event.');
                    return;
                }

                let capacity = event.capacity - 1;

                if (event.enrolled.length >= event.capacity) {
                    alert('This event is full.');
                    return;
                }

                event.enrolled.push(user.email); // Use'user'
                event.capacity = capacity;

                await api.put('/events/' + eventId, event); // Make sure 'api' is imported or available globally
                alert('Enrollment successful!');
                showEvents(); // reload the list
            };
        });
    }
}


export function showCreateEvent() {
    const user = auth.getUser();
    if (!user || user.role !== 'admin') { // Route protection for admins only
        history.pushState(null, null, "/dashboard");
        router();
        return;
    }

    document.getElementById('app').innerHTML = `
        <h2>Create Event</h2>
        <form id="create-event-form"> <input placeholder="Title" id="title" name="title">
            <input placeholder="Showman" id="showman" name="showman">
            <input type="number" placeholder="Capacity" id="capacity" name="capacity">
            <button type="submit">Save</button>
        </form>`;

    // Attach the event to the form with the correct ID
    const formCreateEvent = document.getElementById('create-event-form');
    if (formCreateEvent) {
        formCreateEvent.onsubmit = async e => {
            e.preventDefault();
            const data = {
                title: e.target.title.value,
                showman: e.target.showman.value,
                capacity: parseInt(e.target.capacity.value)
            };
            await api.post('/events', data); // Make sure 'api' is imported or available globally
            history.pushState(null, null, '/events'); // Redirect to /events
            router();
        };
    }
}



export async function showEditEvent() {
    const user = auth.getUser();
    if (!user || user.role !== 'admin') {
        history.pushState(null, null, "/dashboard");
        router();
        return;
    }

    // Get the event ID from the URL (pathname)
    const eventId = window.location.pathname.split('/').pop();

    const event = await api.get('/events/' + eventId); // Make sure 'api' is imported or available globally

    if (!event) {
        history.pushState(null, null, "/events"); // Redirect if the event does not exist
        router();
        return;
    }

    document.getElementById('app').innerHTML = `
        <h2>Edit Event</h2>
        <form id="edit-event-form"> <input id="title" name="title" placeholder="Title" value="${event.title}">
            <input id="showman" name="showman" placeholder="Showman" value="${event.showman}">
            <input type="number" id="capacity" name="capacity" placeholder="Capacity" value="${event.capacity}">
            <button type="submit">Save</button>
            <button type="button" id="delete-event-btn" style="background-color: red;">Delete Event</button>
        </form>`;

    // Attach events
    const formEditEvent = document.getElementById('edit-event-form');
    if (formEditEvent) {
        formEditEvent.onsubmit = async e => {
            e.preventDefault();
            const updated = {
                title: e.target.title.value,
                showman: e.target.showman.value,
                capacity: parseInt(e.target.capacity.value)
            };
            await api.put('/events/' + eventId, updated); // Make sure 'api' is imported or available globally
            history.pushState(null, null, '/events');
            router();
        };

        const deleteButton = document.getElementById('delete-event-btn');
        if (deleteButton) {
            deleteButton.onclick = async () => {
                if (confirm('Are you sure you want to delete this event?')) {
                    try {
                        await api.delete('/events/' + eventId); // Make sure 'api' is imported or available globally
                        alert('Event deleted successfully!');
                        history.pushState(null, null, '/events');
                        router();
                    } catch (error) {
                        alert('Error deleting event: ' + error.message);
                    }
                }
            };
        }
    }
}


