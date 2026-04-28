import { supabase } from "../../supabaseClient";

export const getWorkers = async () => {
  const { data, error } = await supabase.rpc("get_workers");
  if (error) throw error;
  return data;
};

export const getShiftCoveragesByBooking = async (bookingId) => {
  const { data, error } = await supabase
    .from("shift_coverages")
    .select("*")
    .eq("booking_id", bookingId);
  if (error) throw error;
  return data;
};

export const saveShiftCoverages = async (bookingId, coverages) => {
  // First delete existing coverages for this booking
  const { error: deleteError } = await supabase
    .from("shift_coverages")
    .delete()
    .eq("booking_id", bookingId);
  
  if (deleteError) throw deleteError;

  if (coverages && coverages.length > 0) {
    // Insert new coverages
    const { error: insertError } = await supabase
      .from("shift_coverages")
      .insert(
        coverages.map((cov) => ({
          booking_id: bookingId,
          worker_id: cov.worker_id,
          duration_minutes: cov.duration_minutes,
        }))
      );
    
    if (insertError) throw insertError;
  }
};

export const getAccumulatedHours = async (date = new Date()) => {
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999);

  const { data, error } = await supabase
    .from("shift_coverages")
    .select(`
      id,
      duration_minutes,
      worker_id,
      bookings!inner (
        id,
        start_time,
        end_time,
        courts (name)
      )
    `)
    .gte("bookings.start_time", startOfMonth.toISOString())
    .lte("bookings.start_time", endOfMonth.toISOString());

  if (error) throw error;

  // We need the worker names. Since get_workers gives us id and email, we can fetch them.
  const workers = await getWorkers();
  const workerMap = {};
  workers.forEach(w => {
    // extract name from email or use email if no name
    workerMap[w.id] = {
      id: w.id,
      email: w.email,
      name: w.email.split('@')[0], 
      intervals: [],
      coverages: []
    };
  });

  data.forEach(coverage => {
    if (workerMap[coverage.worker_id]) {
      const w = workerMap[coverage.worker_id];
      
      let isComplete = false;
      let start = null;
      if (coverage.bookings && coverage.bookings.start_time && coverage.bookings.end_time) {
        start = new Date(coverage.bookings.start_time);
        const end = new Date(coverage.bookings.end_time);
        const bookingDuration = Math.round((end - start) / 60000);
        isComplete = coverage.duration_minutes >= bookingDuration;
      } else {
        isComplete = coverage.duration_minutes >= 90;
      }

      if (start) {
        w.intervals.push({
          start: start.getTime(),
          end: start.getTime() + coverage.duration_minutes * 60000
        });
      }

      w.coverages.push({
        id: coverage.id,
        duration: coverage.duration_minutes,
        isComplete,
        booking: coverage.bookings
      });
    }
  });

  return Object.values(workerMap).map(w => {
    let mergedMinutes = 0;
    if (w.intervals.length > 0) {
      w.intervals.sort((a, b) => a.start - b.start);
      let current = w.intervals[0];
      for (let i = 1; i < w.intervals.length; i++) {
        const next = w.intervals[i];
        if (next.start <= current.end) {
          current.end = Math.max(current.end, next.end);
        } else {
          mergedMinutes += (current.end - current.start) / 60000;
          current = { ...next };
        }
      }
      mergedMinutes += (current.end - current.start) / 60000;
    }

    return {
      id: w.id,
      email: w.email,
      name: w.name,
      totalMinutes: Math.round(mergedMinutes),
      totalHours: mergedMinutes / 60,
      coverages: w.coverages
    };
  });
};
