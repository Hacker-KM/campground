const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campground')
const axios = require("axios");

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log(' MONGO DONE')
}

const sample = (array) => array[Math.floor(Math.random() * array.length)]


async function seedImg() {
  try {
    const resp = await axios.get("https://api.unsplash.com/photos/random", {
      params: {
        client_id: "y9UF1TZ41rNfh0JuVd--0Kzyp6_khhQ8oj1LlZzCaFI",
        collections: 1114848,
      },
    });
    return resp.data.urls.small;
  } catch (err) {
    console.error(err);
  }
}


const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '64296acdc78f2fa0779c03fd',
      location: `${cities[random1000].city},${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description: '    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Natus quibusdam ratione ipsum laudantium, culpa voluptas dolor fuga quaerat id rerum est eius, voluptate adipisci magni deleniti consequuntur cupiditate tempora provident!',
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].longitude, cities[random1000].latitude]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/dthmj4l7m/image/upload/v1680603618/YelpCamp/eqaxmhb4znf3taeyarfc.jpg',
          filename: 'YelpCamp/eqaxmhb4znf3taeyarfc',
          
        },
        {
          url: 'https://res.cloudinary.com/dthmj4l7m/image/upload/v1680603632/YelpCamp/vtnnxoah0pu2wyeelcvs.png',
          filename: 'YelpCamp/vtnnxoah0pu2wyeelcvs',
        }
      ],



    })
    await camp.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})