import fs from "fs";
import path from "path";

// Read .env file to get supabase url and key
const envPath = path.resolve("c:\\Proyectos Desarrollo Web\\OpenCourt\\.env");
const envContent = fs.readFileSync(envPath, "utf8");

const urlMatch = envContent.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
  const url = urlMatch[1].trim();
  const key = keyMatch[1].trim();

  fetch(`${url}/rest/v1/?apikey=${key}`)
    .then((res) => res.json())
    .then((data) => {
      console.log("TABLES:", Object.keys(data.definitions));
      console.log(
        "court_blockouts:",
        data.definitions.court_blockouts.properties,
      );
      console.log("bookings:", data.definitions.bookings.properties);
    })
    .catch(console.error);
} else {
  console.log("Could not find supabase credentials");
}
