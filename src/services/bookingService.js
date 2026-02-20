import { supabase } from "../../supabaseClient";

export const getBookingsByDate = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Fetch Regular Bookings
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      *,
      courts (name),
      booking_players (
        id,
        individual_price,
        is_paid,
        payments (
          payment_method
        ),
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

  return bookings;
};

export const createBooking = async (bookingData) => {
  const { court_id, start_time, end_time, players, is_fixed, details } =
    bookingData;

  // Helper function to create a single booking
  const createSingleBooking = async (
    cId,
    sTime,
    eTime,
    bookingPlayers,
    fixed,
    notes,
  ) => {
    // 0. Check for conflicts
    const { data: conflicts, error: conflictError } = await supabase
      .from("bookings")
      .select("id")
      .eq("court_id", cId)
      .lt("start_time", eTime)
      .gt("end_time", sTime);

    if (conflictError) throw conflictError;

    if (conflicts && conflicts.length > 0) {
      throw new Error(
        `La cancha ya está reservada en el horario: ${new Date(sTime).toLocaleString()}`,
      );
    }

    // 1. Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          court_id: cId,
          start_time: sTime,
          end_time: eTime,
          is_fixed: fixed,
          details: notes,
        },
      ])
      .select()
      .single();

    if (bookingError) throw bookingError;

    // 2. Add players to booking
    const bookingPlayersData = bookingPlayers.map((p) => ({
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
      const originalPlayer = bookingPlayers.find((p) => p.id === bp.player_id);
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

      if (paymentError) {
        console.error("Error creating payments:", paymentError);
        // Rollback: Set is_paid to false for players who were supposed to be paid
        const idsToUpdate = paymentsToInsert.map((p) => p.booking_player_id);
        if (idsToUpdate.length > 0) {
          await supabase
            .from("booking_players")
            .update({ is_paid: false })
            .in("id", idsToUpdate);
        }
        throw new Error(
          "Error al registrar los pagos. La reserva se creó pero figura como NO PAGADA.",
        );
      }
    }

    return booking;
  };

  if (is_fixed) {
    const WEEKS_AHEAD = 12;
    const bookings = [];
    const errors = [];

    for (let i = 0; i <= WEEKS_AHEAD; i++) {
      const currentStart = new Date(start_time);
      currentStart.setDate(currentStart.getDate() + i * 7);

      const currentEnd = new Date(end_time);
      currentEnd.setDate(currentEnd.getDate() + i * 7);

      try {
        // Only mark payment for the first one if it's paid?
        // Or all of them? Logic: usually recurring bookings are paid per session.
        // If the user marks as "Paid" in the modal, they likely mean the FIRST one.
        // But for simplicity, let's keep the payment status for all for now,
        // or clear it for subsequent weeks?
        // Let's clear payment for subsequent weeks to be creating unpaid reservations.
        const weekPlayers =
          i === 0
            ? players
            : players.map((p) => ({
                ...p,
                is_paid: false,
                payment_method: null,
              }));

        const booking = await createSingleBooking(
          court_id,
          currentStart.toISOString(),
          currentEnd.toISOString(),
          weekPlayers,
          true,
          details,
        );
        bookings.push(booking);
      } catch (err) {
        console.error(`Error replicating booking for week ${i}:`, err);
        errors.push(err.message);
        // Continue loop? Or stop?
        // Usually better to stop if we want atomic-like behavior, but here we can't easily rollback via REST.
        // We will continue and report errors.
      }
    }

    if (errors.length > 0 && bookings.length === 0) {
      throw new Error(`Fallaron todas las reservas: ${errors.join(", ")}`);
    }

    // Return the first one as representative
    return bookings[0];
  } else {
    // Normal single booking
    return createSingleBooking(
      court_id,
      start_time,
      end_time,
      players,
      false,
      details,
    );
  }
};

export const updateBooking = async (id, bookingData) => {
  const { court_id, start_time, end_time, players, is_fixed, details } =
    bookingData;

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
    .update({ court_id, start_time, end_time, is_fixed, details })
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
    if (finalBookingPlayerId) {
      // 1. Always remove ALL existing payments for this player/booking to prevent duplicates/stale data
      const { error: deleteError } = await supabase
        .from("payments")
        .delete()
        .eq("booking_player_id", finalBookingPlayerId);

      if (deleteError) {
        console.error("Error clearing existing payments:", deleteError);
        throw deleteError;
      }

      // 2. If the player is marked as PAID, insert the new payment record
      if (player.is_paid && player.payment_method) {
        const { error: paymentError } = await supabase.from("payments").insert([
          {
            booking_player_id: finalBookingPlayerId,
            amount: player.price,
            payment_method: player.payment_method,
          },
        ]);

        if (paymentError) {
          console.error("Error creating payment:", paymentError);
          // Rollback: Set is_paid to false for this specific player
          await supabase
            .from("booking_players")
            .update({ is_paid: false })
            .eq("id", finalBookingPlayerId);

          throw new Error(
            `Error al registrar pago para el jugador. Se marcó como NO PAGADO. Detalle: ${paymentError.message}`,
          );
        }
      }
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

export const getMonthlyRevenue = async (date = new Date()) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  // Fetch bookings in the month with their players and payments
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      `
      id,
      start_time,
      booking_players (
        individual_price,
        is_paid,
        payments (
          amount,
          payment_method
        )
      )
    `,
    )
    .gte("start_time", startOfMonth.toISOString())
    .lte("start_time", endOfMonth.toISOString());

  if (error) throw error;

  let total = 0;
  let efectivo = 0;
  let transferencia = 0;

  bookings.forEach((booking) => {
    booking.booking_players.forEach((bp) => {
      const payment =
        bp.payments && bp.payments.length > 0 ? bp.payments[0] : null;

      if (payment) {
        const amount = Number(payment.amount) || 0;
        total += amount;

        const method = payment.payment_method || "Otros";
        if (method === "Efectivo") efectivo += amount;
        else if (method === "Transferencia") transferencia += amount;
      }
    });
  });

  return { total, efectivo, transferencia };
};
