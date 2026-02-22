import { supabase } from "../../supabaseClient";

export const getPaymentHistory = async (date = new Date()) => {
  const startOfMonth = new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  ).toISOString();
  const endOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  ).toISOString();

  // We want to filter payments where the associated BOOKING is within the selected month
  // This is better for "Month Earnings" logic in this context
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      id,
      amount,
      payment_method,
      created_at,
      booking_players!inner (
        players (
          id,
          full_name
        ),
        bookings!inner (
          id,
          start_time
        )
      )
    `,
    )
    .gte("booking_players.bookings.start_time", startOfMonth)
    .lte("booking_players.bookings.start_time", endOfMonth)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getIncomeMetrics = async (date = new Date()) => {
  const startOfMonth = new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
  ).toISOString();
  const endOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  ).toISOString();

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).toISOString();
  const endOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  ).toISOString();

  const { data, error } = await supabase
    .from("payments")
    .select(
      `
      amount, 
      payment_method,
      booking_players!inner (
        bookings!inner (
          start_time
        )
      )
    `,
    )
    .gte("booking_players.bookings.start_time", startOfMonth)
    .lte("booking_players.bookings.start_time", endOfMonth);

  if (error) throw error;

  let totalMonth = 0;
  let totalToday = 0;
  let totalCash = 0;
  let totalTransfer = 0;

  data.forEach((p) => {
    const amount = Number(p.amount) || 0;
    const bookingStartTime = p.booking_players?.bookings?.start_time;

    totalMonth += amount;

    // "Today" should probably refer to bookings happening today
    if (
      bookingStartTime &&
      bookingStartTime >= startOfToday &&
      bookingStartTime <= endOfToday
    ) {
      totalToday += amount;
    }

    if (p.payment_method === "Efectivo") {
      totalCash += amount;
    } else if (p.payment_method === "Transferencia") {
      totalTransfer += amount;
    }
  });

  return {
    totalMonth,
    totalToday,
    totalCash,
    totalTransfer,
  };
};
