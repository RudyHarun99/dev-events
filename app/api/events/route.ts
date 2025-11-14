import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

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