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

  // Filter out cancelled recurring classes for this date
  const cancelledIds = oneTimeData
    .filter((b) => b.reason && b.reason.startsWith("CANCELLED_CLASS_"))
    .map((b) => b.reason.replace("CANCELLED_CLASS_", ""));

  const validRecurring = recurringNormalized.filter((block) => {
    // Check if there's a cancelled marker for this block ID on this date
    const blockTime = new Date(block.start_time).getTime();
    
    const isCancelledForToday = oneTimeData.some((single) => {
      if (single.reason !== `CANCELLED_CLASS_${block.id}`) return false;
      const singleTime = new Date(single.start_time).getTime();
      // Allow up to 1 minute of difference to handle millisecond mismatches
      return Math.abs(singleTime - blockTime) < 60000;
    });
    
    return !isCancelledForToday;
  });

  // Remove the cancellation markers from the final returned data
  const validOneTime = oneTimeData.filter(
    (b) => !b.reason || !b.reason.startsWith("CANCELLED_CLASS_"),
  );

  return [...validRecurring, ...validOneTime];
};

export const createBlockout = async (payload) => {
  const { data, error } = await supabase
    .from("court_blockouts")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updateBlockout = async (id, payload) => {
  const { data, error } = await supabase
    .from("court_blockouts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteBlockout = async (id) => {
  const { error } = await supabase
    .from("court_blockouts")
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const createBlockoutException = async (
  classId,
  courtId,
  startTime,
  endTime,
) => {
  const payload = {
    court_id: courtId,
    start_time: startTime,
    end_time: endTime,
    reason: `CANCELLED_CLASS_${classId}`,
    is_recurring: false,
    day_of_week: new Date(startTime).getDay(),
  };

  const { data, error } = await supabase
    .from("court_blockouts")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
};
