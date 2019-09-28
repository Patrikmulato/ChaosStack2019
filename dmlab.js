const cheerio = require("cheerio");
const axios = require("axios");
const mongoose = require("mongoose");
const apartmentSchema = require("./schema.js");
mongoose.set("useUnifiedTopology", true);
mongoose.connect(
  "mongodb+srv://Patrikmulato:admin123@cluster0-be8hv.mongodb.net/test?retryWrites=true&w=majority",
  { useNewUrlParser: true },
  function(err, db) {
    if (err) {
      console.log(
        "Unable to connect to the server. Please start the server. Error:",
        err
      );
    } else {
      console.log("Connected to Server successfully!");
    }
  }
);

const apartments = [];

async function getUser() {
  try {
    let response;
    for (let i = 1; i <= 10; i++) {
      response = await axios.get(
        `http://ccnet1.tmit.bme.hu:900/home?page=${i}`
      );
      const $ = cheerio.load(response.data);
      const bodys = $(
        "body > div > div > div > div.col-lg-9 > div.row > div.col-lg-4.col-md-6.mb-4 "
      );
      bodys.map(async (i, body) => {
        const search = cheerio.load(body);
        let title = search("h4.card-title div").text();
        let area = search("h5").text();
        let property = search("p:nth-child(3)")
          .text()
          .split(":")[1]
          .trim();
        let balcony = search("p:nth-child(4)")
          .text()
          .split(":")[1]
          .trim();
        let room = search("p:nth-child(5)")
          .text()
          .split(":")[1]
          .trim();
        let smallRoom = search("p:nth-child(6)")
          .text()
          .split(":")[1]
          .trim();
        let condition = search("p:nth-child(7)")
          .text()
          .split(":")[1]
          .trim();
        let floor = search("p:nth-child(8)")
          .text()
          .split(":")[1]
          .trim();
        let views = search("div > small:nth-child(1)").text();
        let date = search("div > small:nth-child(3)").text();
        apartments.push({
          title,
          area,
          property,
          balcony,
          room,
          smallRoom,
          condition,
          floor,
          views,
          date
        });
      });
    }
    dbPush(apartments);
  } catch (error) {
    console.error(error);
  }
}

getUser();

const dbPush = apartments => {
  console.log(apartments.length);
  var Apartment = mongoose.model("Apartment", apartmentSchema);

  apartments.map((app, i) => {
    console.log(i);
    var apartment = new Apartment({
      title: apartments[i].title,
      area: apartments[i].area,
      property: apartments[i].property,
      balcony: apartments[i].balcony,
      room: apartments[i].room,
      smallRoom: apartments[i].smallRoom,
      condition: apartments[i].condition,
      floor: apartments[i].floor,
      views: apartments[i].views,
      date: apartments[i].date
    });

    apartment.save(function(error, document) {});
  });

  // console.log(apartments);
  process.exit(0);
};
