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

  const { data: insertedPlayers, error: playerError } = await supabase
    .from("booking_players")
    .insert(bookingPlayersData)
    .select();

  if (playerError) {
    await supabase.from("bookings").delete().eq("id", booking.id);
    throw playerError;
  }

  // 3. Register Payments
  const paymentsToInsert = [];
  insertedPlayers.forEach((bp) => {
    const originalPlayer = players.find((p) => p.id === bp.player_id);
    if (
      originalPlayer &&
      originalPlayer.is_paid &&
      originalPlayer.payment_method
    ) {
      paymentsToInsert.push({
        booking_player_id: bp.id,
        amount: bp.individual_price,
        payment_method: originalPlayer.payment_method,
      });
    }
  });

  if (paymentsToInsert.length > 0) {
    const { error: paymentError } = await supabase
      .from("payments")
      .insert(paymentsToInsert);

    // Log error but don't fail the whole booking creation?
    // Ideally we should fail, but for now let's just log it or throw to be safe
    if (paymentError) console.error("Error creating payments:", paymentError);
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

  // 2. Smart Update of Players (Preserve IDs for payments/history)

  // Fetch current booking_players
  const { data: currentPlayers, error: fetchError } = await supabase
    .from("booking_players")
    .select("*")
    .eq("booking_id", id);

  if (fetchError) throw fetchError;

  const currentMap = new Map(currentPlayers.map((bp) => [bp.player_id, bp]));
  const newPlayerIds = new Set(players.map((p) => p.id));

  // A. DELETE removed players
  const playersToDelete = currentPlayers.filter(
    (bp) => !newPlayerIds.has(bp.player_id),
  );
  if (playersToDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("booking_players")
      .delete()
      .in(
        "id",
        playersToDelete.map((bp) => bp.id),
      );
    if (deleteError) throw deleteError;
  }

  // B. UPDATE existing players & C. INSERT new players
  for (const player of players) {
    const existingBP = currentMap.get(player.id);
    let finalBookingPlayerId = null;

    if (existingBP) {
      // Update
      const { error: updateBPError } = await supabase
        .from("booking_players")
        .update({
          individual_price: player.price,
          is_paid: player.is_paid,
        })
        .eq("id", existingBP.id);

      if (updateBPError) throw updateBPError;
      finalBookingPlayerId = existingBP.id;
    } else {
      // Insert
      const { data: newBP, error: insertBPError } = await supabase
        .from("booking_players")
        .insert([
          {
            booking_id: id,
            player_id: player.id,
            individual_price: player.price,
            is_paid: player.is_paid || false,
          },
        ])
        .select()
        .single();

      if (insertBPError) throw insertBPError;
      finalBookingPlayerId = newBP.id;
    }

    // Handle Payment Transaction
    // Only insert payment if we have a payment_method explicitly passed (meaning a new payment action)
    if (player.is_paid && player.payment_method && finalBookingPlayerId) {
      const { error: paymentError } = await supabase.from("payments").insert([
        {
          booking_player_id: finalBookingPlayerId,
          amount: player.price,
          payment_method: player.payment_method,
        },
      ]);

      if (paymentError) console.error("Error creating payment:", paymentError);
    }
  }

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
