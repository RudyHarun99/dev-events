import { NextRequest, NextResponse } from "next/server";

import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";

// Type for route context with params
interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    // Await params to access slug
    const { slug } = await context.params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        {
          message: 'Slug parameter is required and must be a valid string',
        },
        {
          status: 400,
        }
      );
    }

    // Validate slug format (alphanumeric with hyphens only)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return NextResponse.json(
        {
          message: 'Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens.',
        },
        {
          status: 400,
        }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query event by slug
    const event = await Event.findOne({ slug }).lean();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        {
          message: `Event with slug '${slug}' not found`,
        },
        {
          status: 404,
        }
      );
    }

    // Return successful response
    return NextResponse.json(
      {
        message: 'Event fetched successfully',
        event,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching event by slug:', error);

    // Handle different error types
    if (error instanceof Error) {
      // Handle MongoDB validation or connection errors
      if (error.name === 'MongooseError' || error.name === 'MongoError') {
        return NextResponse.json(
          {
            message: 'Database error occurred while fetching event',
            error: error.message,
          },
          {
            status: 503,
          }
        );
      }

      // Generic error with message
      return NextResponse.json(
        {
          message: 'Failed to fetch event',
          error: error.message,
        },
        {
          status: 500,
        }
      );
    }

    // Unknown error type
    return NextResponse.json(
      {
        message: 'An unexpected error occurred',
        error: 'Unknown error',
      },
      {
        status: 500,
      }
    );
  }
}
