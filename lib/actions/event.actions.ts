'use server';

import { Event, IEvent } from "@/database";
import connectToDatabase from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug });
    return await Event.find({
      _id: {
        $ne: event._id,
      },
      tags: {
        $in: event.tags,
      },
    }).lean<IEvent[]>();
  } catch {
    return [];
  };
};