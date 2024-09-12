<h1 align="center">
  <br>
  <a href="https://natours-5bpr.onrender.com"><img src="https://github.com/khaledGadelhaQ/Natours/blob/main/public/img/logo-green-round.png" alt="Natours" width="200"></a>
  <br>
  <a href="https://natours-5bpr.onrender.com">Natours</a>
  <br>
</h1>

<h4 align="center">An awesome tour booking site built on top of <a href="https://nodejs.org/en/" target="_blank">NodeJS</a>.</h4>

<p align="left">
  <a href="#key-features-"> • Key Features</a> <br>
  <a href="#build-with-"> • Build With</a> <br>
  <a href="#demonstration-"> • Demonstration</a> <br>
  <a href="#deployed-version-"> • Live</a> <br>
  <a href="#how-to-use-"> • How To Use</a> <br>
  <a href="#api-usage"> • API Usage</a> <br>
  <a href="#installation-"> • Installation</a> <br> 
  <a href="#contributing-"> • Contributing</a> <br> 
  <a href="#future-updates-"> • Future Updates</a> <br> 
  <a href="#acknowledgement"> • Acknowledgement</a>
</p>

---

## Key Features 📝

- Authentication and Authorization
  - Sign up, Log in, Logout, Update, and reset password.
  - A user can be either a regular user or an admin or a lead guide or a guide.
- User profile
  - Update username, photo, email, password, and other information
  - When a user signs up, that user by default regular user.
- Tour
  - Manage booking, check tour map, check users' reviews and rating
  - Tours can be seen by every user.
  - Admins and tour guides can create, update, and delete tours
- Bookings
  - Only regular users can book tours (make a payment).
  - Regular users can not book the same tour twice.
  - Regular users have an overview of all the tours that they have booked.
  - Admins and tour guides can create, update, and delete any booking
- Reviews
  - Only regular users can write reviews for tours that they have booked.
  - All users can see the reviews of each tour.
  - An admin can delete any review.
- Credit card Payment

## Build With 🏗️

- [Node.js](https://nodejs.org/en/) - JavaScript runtime for building the backend and handling server-side logic.
- [Express](http://expressjs.com/) - Minimalist web framework for Node.js.
- [Mongoose](https://mongoosejs.com/) - ODM library for MongoDB to manage application data.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - Managed cloud database service for MongoDB.
- [Pug](https://pugjs.org/api/getting-started.html) - High-performance template engine for dynamic content rendering.
- [JWT](https://jwt.io/) - Secure token-based authentication and authorization.
- [ESBuild](https://esbuild.github.io/) - Fast bundler for optimizing project assets.
- [Stripe](https://stripe.com/) - API for secure online payments.
- [Postman](https://www.getpostman.com/) - API testing tool.
- [Mailtrap](https://mailtrap.io/) & [Brevo](https://www.brevo.com/) - Services for email testing and production delivery.
- [Render](https://render.com/) - Cloud platform for deployment.
- [Leaflet](https://leafletjs.com/) - Library for interactive maps.

---

## Demonstration 🖥️

#### Home Page :

![HomePage](https://github.com/khaledGadelhaQ/Natours/blob/main/public/Demo/homePage.gif)

#### Tour Details :

![TourPage](https://github.com/khaledGadelhaQ/Natours/blob/main/public/Demo/tourOverview.gif)

#### Payment Process :

![Payment](https://github.com/khaledGadelhaQ/Natours/blob/main/public/Demo/payment.gif)

#### Booked Tours :

![BookedTours](https://github.com/khaledGadelhaQ/Natours/blob/main/public/Demo/bookedTours.gif)

#### User Profile :

![UserProfile](https://github.com/khaledGadelhaQ/Natours/blob/main/public/Demo/userProfile.gif)

#### Admin Profile :

![AdminProfile](https://github.com/khaledGadelhaQ/Natours/blob/main/public/Demo/adminProfile.gif)

---

## Deployed Version 🚀

  Live demo (Feel free to visit) 👉🏻 : https://natours-5bpr.onrender.com/
  
---

## How To Use 🤔

### Book a tour

- Sign up/Login to the site
- Search for tours that you want to book
- Book a tour
- Proceed to the payment checkout page
- Enter the card details (Test Mood):
  ```
  - Card No. : 4242 4242 4242 4242
  - Expiry date: 02 / 22
  - CVV: 222
  ```
- Finished!

### Manage your booking

- Check the tour you have booked on the "Manage Booking" page in your user settings. You'll be automatically redirected to this
  page after you have completed the booking.

### Update your profile

- You can update your own username, profile photo, email, and password.

---

## API Usage

Before using the API, you need to set the URL variable in Postman depending on your environment (development or production). 
Simply add:
```
- {{URL}} with your hostname as value (Eg. http://127.0.0.1:3000 or http://www.example.com)
```

Check [Natours API Documentation]() for more info.

---

## Installation 🛠️

You can fork the app or you can git-clone the app into your local machine. Once done, please install all the
dependencies by running

```
$ npm i
Set your env variables
$ npm run watch
$ npm run build
$ npm run dev (for development)
$ npm run start:prod (for production)
Setting up ESLint and Prettier in VS Code 👇🏻
$ npm i eslint prettier eslint-config-prettier eslint-plugin-prettier eslint-config-airbnb eslint-plugin-node
eslint-plugin-import eslint-plugin-jsx-a11y  eslint-plugin-react --save-dev
```


---


## Contributing 💡

Pull requests are welcome but please open an issue and discuss what you will do before 😊


---


## Future Updates 🪴

- Advanced Authentication features
   - Two-factor authentication
   - Confirm email
   - Keeping users logged in by using refresh tokens
- Improve overall UX/UI and fix bugs
- Featured Tours
- Recently Viewed Tours
- And More! There's always room for improvement!


---

## License 📄

This project is open-sourced under the [MIT license](https://opensource.org/licenses/MIT).

---


## Acknowledgement 🙏🏻

- This project is part of the online course I've taken at Udemy. Thanks to Jonas Schmedtmann for creating this awesome course! Link to the course: [Node.js, Express, MongoDB & More: The Complete Bootcamp 2019](https://www.udemy.com/course/nodejs-express-mongodb-bootcamp/)

