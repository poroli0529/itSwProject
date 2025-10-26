// firebase.js has been retired in this project.
// The frontend now talks to the backend (Spring Boot + MySQL) via REST APIs.
// If any remaining files import `auth`/`db`, they will receive a helpful error.

const error = () => {
  throw new Error(
    "Firebase was removed. Use the REST API clients in ./api (auth/products/posts) instead."
  );
};

export const auth = { error };
export const db = { error };

const api = { auth, db };
export default api;
