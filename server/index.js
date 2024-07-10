const { client } = require("./db");
const express = require("express");
const app = express();
app.use(express.json());
const { createTables } = require("./db");
const { createCustomer } = require("./db");
const { createRestaurant } = require("./db");
const { fetchCustomers } = require("./db");
const { fetchRestaurants } = require("./db");
const { createReservation } = require("./db");
const { fetchReservations } = require("./db");
const { destroyReservation } = require("./db");

app.get("/api/customers", async (req, res, next) => {
  try {
    res.send(await fetchCustomers());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/restaurants", async (req, res, next) => {
  try {
    res.send(await fetchRestaurants());
  } catch (ex) {
    next(ex);
  }
});

app.get("/api/reservations", async (req, res, next) => {
  try {
    res.send(await fetchReservations());
  } catch (ex) {
    next(ex);
  }
});

app.delete("/api/customers/:customer_id/reservations/:id", async (req, res, next) => {
  try {
    await destroyReservation({ customer_id: req.params.customer_id, id: req.params.id });
    res.sendStatus(204);
  } catch (ex) {
    next(ex);
  }
});

app.post("/api/customers/:customer_id/reservations", async (req, res, next) => {
    try {
      const { customer_id } = req.params;
      const { restaurant_id, reservation_date } = req.body;
      
      const reservation = await createReservation({
        customer_id,
        restaurant_id,
        reservation_date,
      });
      
      res.status(201).send(reservation);
    } catch (ex) {
      next(ex);
    }
  });

app.use((err, req, res, next)=> {
    res.status(err.status || 500).send({ error: err.message || err});
});

const init = async () => {
  console.log("connecting to database");
  await client.connect();
  console.log("connected to database");
  await createTables();
  console.log("created tables");
  const [moe, lucy, larry, bob, italian, mexican, asian] = await Promise.all([
    createCustomer({ name: "moe" }),
    createCustomer({ name: "lucy" }),
    createCustomer({ name: "larry" }),
    createCustomer({ name: "bob" }),
    createRestaurant({ name: "italian" }),
    createRestaurant({ name: "mexican" }),
    createRestaurant({ name: "asian" }),
  ]);
  console.log(await fetchCustomers());
  console.log(await fetchRestaurants());

  const [reservation, reservation2] = await Promise.all([
    createReservation({
      customer_id: moe.id,
      restaurant_id: asian.id,
      reservation_date: "02/14/2024",
    }),
    createReservation({
      customer_id: bob.id,
      restaurant_id: mexican.id,
      reservation_date: "02/28/2024",
    }),
  ]);
  // console.log(await fetchReservations());
  await destroyReservation({ id: reservation.id, customer_id: reservation.customer_id });
  console.log(await fetchReservations());

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    //     console.log('some curl commands to test');
    //     console.log(`curl localhost:${port}/api/customers`);
    //     console.log(`curl localhost:${port}/api/restaurants`);
    //    console.log(`curl localhost:${port}/api/reservations`);
  });
};
init();
