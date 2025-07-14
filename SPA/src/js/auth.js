import { api } from "../main"
// Authentication module to handle user login, registration, and session management
export const auth = {
    // Function to log in a user
    login: async (email, password) => {
        const users = await api.get(`/users?email=${email}`)
        if (users.length === 0 || users[0].password !== password){
            throw new Error('Invalid email or password')
        }
        const user = users[0]
        localStorage.setItem('user', JSON.stringify(user))
    },
    // Function to register a new user
    register: async(name,email, password) => {
        const existingUser = await api.get(`/users?email=${email}`)
        if (existingUser.length > 0) {
            throw new Error('Email Already in use')
        }
        const newUser = {name, email, password: password, role: "user"}
        await api.post('/users', newUser)
    
    },
    // Function to log out the user
    logout: () => {
        localStorage.removeItem('user')
    },
    // Function to check if a user is authenticated
    isAuthenticated: () => {
        return !!localStorage.getItem('user')
    },
    // Function to get the currently logged-in user
    getUser: () => {
        const user = localStorage.getItem('user')
        return user ? JSON.parse(user) : null
    }
}