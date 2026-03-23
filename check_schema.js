import { supabase } from "./src/supabaseClient.js";

async function check() {
  const { data, error } = await supabase
    .from("court_blockouts")
    .select("*")
    .limit(1);
  console.log(JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
check();
