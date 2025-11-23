'use server';

import { Booking } from "@/database";
import connectToDatabase from "@/lib/mongodb";

export const createBooking = async ({
  eventId,
  slug,
  email,
}: {
  eventId: string;
  slug: string;
  email: string;
}) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return { success: false, error: 'Invalid email address' };
    }

    await connectToDatabase();
    await Booking.create({
      eventId,
      slug,
      email,
    });

    return { success: true };
  } catch (error) {
    console.error('create booking failed', error);
    return { success: false };
  }
};