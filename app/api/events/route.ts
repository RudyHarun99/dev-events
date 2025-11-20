import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";

/**
 * Creates a new Event from multipart form data, uploads the provided image to Cloudinary, and stores the event in the database.
 *
 * Expects form-data fields representing the event properties and an `image` file. On success returns the created event.
 *
 * @param req - Request whose body is multipart/form-data containing event fields and an `image` file
 * @returns JSON responses:
 *  - 201: `{ message: 'Event created Successfully', event }` with the created event
 *  - 400: `{ message: 'Invalid JSON Data Format' }` when form fields cannot be parsed
 *  - 400: `{ message: 'Image file is required' }` when `image` is missing
 *  - 500: `{ message: 'Event Creation Failed', error }` on unexpected errors
 */
export async function POST(req: NextRequest ) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    let event;

    try {
      event = Object.fromEntries(formData.entries());
    } catch (error) {
      return NextResponse.json({
        message: 'Invalid JSON Data Format',
      }, {
        status: 400,
      });
    };

    const file = formData.get('image') as File;
    if (!file) {
      return NextResponse.json({
        message: 'Image file is required',
      }, {
        status: 400,
      });
    };

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'image',
        folder: 'DevEvent',
      }, (error, results) => {
        if (error) reject(error);
        resolve(results);
      }).end(buffer);
    });

    event.image = (uploadResult as { secure_url: string }).secure_url;

    const createdEvent = await Event.create(event);
    return NextResponse.json({
      message: 'Event created Successfully',
      event: createdEvent,
    }, {
      status: 201,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: 'Event Creation Failed',
      error: e instanceof Error ? e.message : 'Unknown',
    }, {
      status: 500,
    });
  };
};

/**
 * Fetches all Event documents from the database sorted by creation time (newest first) and returns them as JSON.
 *
 * @returns A JSON HTTP response:
 * - On success (status 200): `{ message: 'Event Fetched Successfully', events: Event[] }`.
 * - On failure (status 500): `{ message: 'Event Fetching Failed', error: string }`.
 */
export async function GET() {
  try {
    await connectToDatabase();
    const events = await Event.find().sort({ createdAt: -1 });
    return NextResponse.json({
      message: 'Event Fetched Successfully',
      events,
    }, {
      status: 200,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      message: 'Event Fetching Failed',
      error: e instanceof Error ? e.message : 'Unknown',
    }, {
      status: 500,
    });
  };
};