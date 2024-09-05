
  

## Before you begin

You need to install *Yarn* - Dependency package manager

  

## How to start? (Available Scripts)

In the project directory, you can run:

if there is no node_modules

### `yarn install`

### `yarn start`

  

Runs the app in the development mode.\

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

  

The page will reload if you make edits.\

You will also see any lint errors in the console.

  

### `npm run build`

  

Builds the app for production to the `build` folder.\

It correctly bundles React in production mode and optimizes the build for the best performance.

  

The build is minified and the filenames include the hashes.\

Your app is ready to be deployed!

  

## Mock Api

Using https://dummyjson.com/users

you can login by using credential from that api response

eg. { username: 'atuny0', password: '9uQFF1Lh`

  

### Project structure

  
store.js (create redux store by using redux saga)
appActions.js
appReducers.js
appRoutes.js
- modules

	- module-name(eg.Dashboard)

		- container(view container for component)

		- component(presentation layer)

		- store(redux saga)

			- action(dispatcher)

			- reducer

			- watcher