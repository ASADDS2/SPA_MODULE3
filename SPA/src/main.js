import { auth } from "./js/auth"
import { router } from "./router"

// Allows browser navigation (back/forward) to work with SPA routing
window.addEventListener("popstate", router) 

// Renders dynamic content on initial page load
window.addEventListener("load", router)

router()

document.addEventListener("click", e => {
    if (e.target.matches("[data-link]")){
        e.preventDefault()
        history.pushState(null, null, e.target.href)
        router()
    }
})

// Make navigateTo globally accessible for onclicks
window.navigateTo = (path) => {
    // Prevents full page reload
    window.history.pushState({}, path, path)
    router(); // Calls your routing function
};

export const api = {
  endpoint: 'http://localhost:3000', // Change the URL if necessary
  // Implements the GET function
  get: async param => {
    // Performs a GET request to the API and returns the data
    try {
      const response = await fetch(`${api.endpoint}${param}`);
      if (!response.ok) {
        throw new Error('Error fetching data');
      }
      return await response.json();
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  },
  // Implements the POST function
  post: async (param, data) => {
    // Performs a POST request to the API with the data
    try {
      const response = await fetch(`${api.endpoint}${param}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Error creating data');
      }
      return await response.json();
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  },
  // Implements the PUT function
  put: async (p, data) => {
    // Performs a PUT request to the API with the data
    try {
      const response = await fetch(`${api.endpoint}${p}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error('Error updating data');
      }
      return await response.json();
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  },
  // Implements the DELETE function
  delete: async p => {
    // Performs a DELETE request to the API
    try {
      const response = await fetch(`${api.endpoint}${p}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Error deleting data');
      }
      return await response.json();
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  }
};

export function renderNotFound(){
  document.getElementById('app').innerHTML = `<h1>404 Error, Page not found</h1>`
}
