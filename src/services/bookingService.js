import { supabase } from "../../supabaseClient";

export const getBookingsByDate = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      courts (name),
      booking_players (
        id,
        individual_price,
        is_paid,
        players (
          id,
          full_name,
          is_student
        )
      )
    `,
    )
    .gte("start_time", startOfDay.toISOString())
    .lte("start_time", endOfDay.toISOString());

  if (error) throw error;
  return data;
};

export const createBooking = async (bookingData) => {
  const { court_id, start_time, end_time, players } = bookingData;

  // 0. Check for conflicts
  const { data: conflicts, error: conflictError } = await supabase
    .from("bookings")
    .select("id")
    .eq("court_id", court_id)
    .lt("start_time", end_time)
    .gt("end_time", start_time);

  if (conflictError) throw conflictError;

  if (conflicts && conflicts.length > 0) {
    throw new Error("La cancha ya está reservada en este horario");
  }

  // 1. Create booking
  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert([{ court_id, start_time, end_time }])
    .select()
    .single();

  if (bookingError) throw bookingError;

  // 2. Add players to booking
  const bookingPlayersData = players.map((p) => ({
    booking_id: booking.id,
    player_id: p.id,
    individual_price: p.price,
    is_paid: p.is_paid || false,
  }));

  const { error: playerError } = await supabase
    .from("booking_players")
    .insert(bookingPlayersData);

  if (playerError) {
    await supabase.from("bookings").delete().eq("id", booking.id);
    throw playerError;
  }

  return booking;
};

export const updateBooking = async (id, bookingData) => {
  const { court_id, start_time, end_time, players } = bookingData;

  // 0. Check for conflicts (excluding current booking)
  const { data: conflicts, error: conflictError } = await supabase
    .from("bookings")
    .select("id")
    .eq("court_id", court_id)
    .neq("id", id)
    .lt("start_time", end_time)
    .gt("end_time", start_time);

  if (conflictError) throw conflictError;

  if (conflicts && conflicts.length > 0) {
    throw new Error("La cancha ya está reservada en este horario");
  }

  // 1. Update booking details
  const { error: updateError } = await supabase
    .from("bookings")
    .update({ court_id, start_time, end_time })
    .eq("id", id);

  if (updateError) throw updateError;

  // 2. Update players (Delete all and re-insert is simplified approach)
  // First, delete existing
  const { error: deletePlayersError } = await supabase
    .from("booking_players")
    .delete()
    .eq("booking_id", id);

  if (deletePlayersError) throw deletePlayersError;

  // Then insert new list
  const bookingPlayersData = players.map((p) => ({
    booking_id: id,
    player_id: p.id,
    individual_price: p.price,
    is_paid: p.is_paid || false,
  }));

  const { error: insertPlayersError } = await supabase
    .from("booking_players")
    .insert(bookingPlayersData);

  if (insertPlayersError) throw insertPlayersError;

  return true;
};

export const deleteBooking = async (id) => {
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) throw error;
  return true;
};

export const getCourts = async () => {
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
};

export const getPriceConfig = async () => {
  const { data, error } = await supabase
    .from("price_configs")
    .select("*")
    .limit(1)
    .single();

  if (error) throw error;
  return data;
};
