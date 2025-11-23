import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";

if (!process.env.CLOUDINARY_URL && (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY
  )) {
  throw new Error('Missing Cloudinary configuration. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.');
}
cloudinary.config();

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

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        message: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.',
      }, {
        status: 400,
      });
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({
        message: 'File size exceeds 5MB limit.',
      }, {
        status: 400,
      });
    };

    const tags = JSON.parse(formData.get('tags') as string);
    const agenda = JSON.parse(formData.get('agenda') as string);

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

    if (!event.image || typeof event.image !== 'string') {
      return NextResponse.json({
        message: 'Image upload failed: invalid response from Cloudinary',
      }, {
        status: 500,
      });
    }

    const createdEvent = await Event.create({
      ...event,
      tags,
      agenda,
    });

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