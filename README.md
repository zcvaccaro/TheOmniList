# OmniList: Your Ultimate Watchlist

OmniList is a web application designed to help you keep track of movies, TV shows, and books you want to watch or read. It provides personalized recommendations based on your lists and allows you to explore popular and upcoming content.

This project was built with React and utilizes the Chakra UI component library. It fetches data from The Movie Database (TMDB), The New York Times, and Google Books APIs.

## Features

- **Unified Search**: Search for movies, TV shows, and books all in one place.
- **Watchlists**: Maintain separate lists for movies, TV shows, and books.
- **Personalized Recommendations**: Get "For You" suggestions based on the items in your lists.
- **Discover**: Browse bestsellers from The New York Times and see popular and upcoming releases.

## Setup and Installation

To run this project locally, follow these steps:

1.  **Clone the repository:**
    `git clone https://github.com/your-username/OmniList.git`
2.  **Navigate to the project directory:**
    `cd OmniList`
3.  **Install dependencies:**
    `npm install`
4.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add your API keys. You can use the `.env.example` file as a template:
    ```
    REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
    REACT_APP_NYT_API_KEY=your_new_york_times_api_key_here
    REACT_APP_GOOGLE_BOOKS_API_KEY=your_google_books_api_key_here
    ```
5.  **Start the development server:**
    `npm start`

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
