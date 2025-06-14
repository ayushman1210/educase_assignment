const pool = require("../config/db");
const geoip = require("geoip-lite");
const os = require("os");

function getUserLocation(ip) {
  const geo = geoip.lookup(ip);
  if (geo) {
    console.log(`Latitude: ${geo.ll[0]}, Longitude: ${geo.ll[1]}`);
    console.log(`Country: ${geo.country}, City: ${geo.city}`);
  } else {
    console.log("Location not found.");
  }
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let addr of interfaces[iface]) {
      if (addr.family === "IPv4" && !addr.internal) {
        console.log(`Local WiFi IP: ${addr.address}`);
      }
    }
  }
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


const addschool = async (req, res) => {
  try {
    const { name, address, latitude, longitude } = req.body;
    if (!name || !address || !latitude || !longitude) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const [result] = await pool.execute(
      "INSERT INTO School (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
      [name, address, parseFloat(latitude), parseFloat(longitude)]
    );

    res.json({ message: "School added successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
};


const schoollist = async (req, res) => {
  try {
    let { latitude, longitude } = req.query;
    if (!latitude || !longitude) {
      const userIP = req.ip === '::1' ? '8.8.8.8' : req.ip;
      const geo = geoip.lookup(userIP);
      if (geo) {
        latitude = geo.ll[0];
        longitude = geo.ll[1];
      } else {
        return res.status(400).json({ error: "Latitude and Longitude are required." });
      }
    }
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    const [schools] = await pool.execute("SELECT * FROM School");
    const schoolsWithDistance = schools.map((school) => ({
      ...school,
      distance: getDistance(userLat, userLon, school.latitude, school.longitude),
    }));
    schoolsWithDistance.sort((a, b) => a.distance - b.distance);
    getLocalIP();
    res.json(schoolsWithDistance);
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

module.exports = { addschool, schoollist };