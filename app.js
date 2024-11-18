// if(process.env.NODE_ENV != "production") {
//   require('dotenv').config();
// }

// const express = require("express");
// const app = express();
// const mongoose = require("mongoose");
// const path = require("path");
// const methodOverride = require("method-override");
// const ejsMate = require("ejs-mate");
// const ExpressError = require("./utils/ExpressError.js");
// const listingRouter = require("./routes/listing.js");
// const reviewRouter = require("./routes/review.js");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const flash = require("connect-flash");
// const passport = require("passport");
// const localStratergy = require("passport-local");
// const User = require("./models/User.js");
// const userRouter = require("./routes/user.js")

// // Connection Created
// // const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
// const dburl = process.env.ATLASDB_URL;

// main()
//   .then(() => {
//     console.log("connected to DB");
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// async function main() {
//   await mongoose.connect(dburl);
// }

// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));
// app.engine('ejs', ejsMate);
// app.use(express.static(path.join(__dirname, "/public")));

// const store = MongoStore.create({
//   mongoUrl: dburl,
//   crypto: {
//     secret: process.env.SECRET,
//   },
//   touchAfter: 24 * 3600,
// });

// store.on("error", (err) => {
//   console.log("ERROR in MONGO SSESSION STORE", err);
// })

// const sessionOptions = {
//   store,
//   secret: process.env.SECRET,
//   resave: false,
//   saveUninitialized: true,
//   cookie : {
//     expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//     maxAge : 7 * 24 * 60 * 60 * 1000,
//     httpOnly: true,
//   },
// };




// app.use(session(sessionOptions));
// app.use(flash());

// app.use(passport.initialize());
// app.use(passport.session());
// passport.use(new localStratergy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use((req, res, next) => {
//   res.locals.success = req.flash("success");
//   res.locals.error = req.flash("error");
//   res.locals.currUser = req.user;
//   next();
// })


// app.use("/listings", listingRouter);
// app.use("/listings/:id/reviews", reviewRouter);
// app.use("/", userRouter);


// app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page Not Found!"));
// })

// app.use((err,req, res, next) => {
//   let {statusCode=500, message="something went wrong"} = err;
//   res.render("error.ejs", {message});
// })

// app.listen(8080, () => {
//   console.log("server is listening to port 8080");
// });


if (process.env.NODE_ENV !== "production") {
  require('dotenv').config(); // Load environment variables in non-production
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStratergy = require("passport-local");
const User = require("./models/User.js");
const userRouter = require("./routes/user.js");

// Connection to MongoDB
const dburl = process.env.ATLASDB_URL;  // MongoDB connection URL from environment variable

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log("Error connecting to DB:", err);
  });

async function main() {
  await mongoose.connect(dburl, { useNewUrlParser: true, useUnifiedTopology: true });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session Store Configuration
const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET, // Ensure SECRET is set in your environment variables
  },
  touchAfter: 24 * 3600,  // Minimum time before a session is updated
});

store.on("error", (err) => {
  console.error("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,  // Secret for session encryption, ensure it is set
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // Cookie expiry (7 days)
    maxAge: 7 * 24 * 60 * 60 * 1000,  // Max age for cookie (7 days)
    httpOnly: true,  // Cookie can only be accessed by the server
  },
};

app.use(session(sessionOptions));
app.use(flash());

// Passport Authentication Setup
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware to pass data to views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// 404 Error handler for unmatched routes
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Global error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong" } = err;
  res.render("error", { message });
});

// Start the server
app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});



