import { supabase } from "../../supabaseClient";

// Obtener todos los jugadores
export const getPlayers = async () => {
  const { data: players, error } = await supabase
    .from("players")
    .select(
      "*, booking_players(individual_price, is_paid, bookings(start_time))",
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener jugadores:", error);
    throw error;
  }

  return players;
};

// Crear un nuevo jugador
export const createPlayer = async (playerData) => {
  const { data, error } = await supabase
    .from("players")
    .insert([playerData])
    .select();

  if (error) {
    console.error("Error al crear jugador:", error);
    throw error;
  }

  return data[0];
};

// Actualizar un jugador existente
export const updatePlayer = async (id, updatedData) => {
  const { data, error } = await supabase
    .from("players")
    .update(updatedData)
    .eq("id", id)
    .select();

  if (error) {
    console.error("Error al actualizar jugador:", error);
    throw error;
  }

  return data[0];
};

// Eliminar un jugador
export const deletePlayer = async (id) => {
  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) {
    console.error("Error al eliminar jugador:", error);
    throw error;
  }

  return true;
};
