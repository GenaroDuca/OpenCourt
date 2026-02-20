import { supabase } from "../../supabaseClient";

export const getBlockoutsByDate = async (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // JS getDay(): 0 = Sunday, 1 = Monday, ...
  const dayOfWeek = date.getDay();

  // 1. Fetch Recurring Blockouts for this day of week
  const { data: recurringData, error: recurringError } = await supabase
    .from("court_blockouts")
    .select("*")
    .eq("is_recurring", true)
    .eq("day_of_week", dayOfWeek);

  if (recurringError) throw recurringError;

  // 2. Fetch One-time Blockouts falling on this date
  const { data: oneTimeData, error: oneTimeError } = await supabase
    .from("court_blockouts")
    .select("*")
    .eq("is_recurring", false)
    .gte("start_time", startOfDay.toISOString())
    .lte("start_time", endOfDay.toISOString());

  if (oneTimeError) throw oneTimeError;

  // Combine and normalize dates for recurring events
  const recurringNormalized = recurringData.map((block) => {
    // Construct new start/end times keeping the same hours/minutes but on the selected 'date'
    const originalStart = new Date(block.start_time);
    const originalEnd = new Date(block.end_time);

    const newStart = new Date(date);
    newStart.setHours(
      originalStart.getHours(),
      originalStart.getMinutes(),
      originalStart.getSeconds(),
    );

    const newEnd = new Date(date);
    newEnd.setHours(
      originalEnd.getHours(),
      originalEnd.getMinutes(),
      originalEnd.getSeconds(),
    );

    return {
      ...block,
      start_time: newStart.toISOString(),
      end_time: newEnd.toISOString(),
    };
  });

  return [...recurringNormalized, ...oneTimeData];
};
