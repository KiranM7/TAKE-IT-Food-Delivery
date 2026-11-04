# TAKE IT Frontend — UI Improvements

## What changed
- Redesigned responsive navbar with improved branding, active hover states, mobile menu, location editor, working Cart route, and Login route.
- Redesigned footer with navigation links, account links, social links, contact details, and back-to-top action.
- Added an auto-rotating featured-food carousel with previous/next buttons and slide indicators.
- Improved restaurant search matching to include restaurant name, cuisine fields, description, category, and address/location.
- Expanded category chips so they match the categories shown in the category section.
- Made restaurant cards tolerant of common backend field names (`cuisineType`/`cuisine`, `imageUrl`/`image`, `rating`/`averageRating`, etc.).
- Improved focus visibility and the warm page background.

## Run locally
1. Extract this ZIP.
2. Open a terminal in the `takeit-frontend` folder.
3. Run `npm install`.
4. Run `npm run dev`.
5. Ensure the Spring Boot backend is running at `http://localhost:8080` (the API base URL is configured in `src/services/api.js`).

## Important notes
- Search and category filters operate on the restaurant list returned by `GET /api/restaurants`. They cannot display restaurants that the backend does not return.
- A full Vite production build could not be verified in the Linux inspection environment because the uploaded `node_modules` contains platform-specific native dependencies. All 24 JS/JSX files passed a syntax parse. Run `npm install` on your own Windows machine before testing/building.
- The carousel uses remote Unsplash images, so images need an internet connection.
