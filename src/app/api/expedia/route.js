import { NextResponse } from "next/server";
import { headers } from 'next/headers';

const EXPEDIA_API_KEY = process.env.EXPEDIA_API_KEY;
const EXPEDIA_API_SECRET = process.env.EXPEDIA_API_SECRET;
const EXPEDIA_API_BASE_URL = "https://test.ean.com/v3";

function getAuthorizationHeader() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = calculateSignature(
    EXPEDIA_API_KEY,
    EXPEDIA_API_SECRET,
    timestamp
  );
  return `EAN apikey=${EXPEDIA_API_KEY},signature=${signature},timestamp=${timestamp}`;
}

function calculateSignature(apiKey, secret, timestamp) {
  const crypto = require("crypto");
  const sigData = apiKey + secret + timestamp;
  return crypto.createHash("sha512").update(sigData).digest("hex");
}

function getBrowserIpAddress(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || request.ip || '127.0.0.1';
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get("endpoint");

  if (endpoint === "regions") {
    return handleRegionsRequest(request, searchParams);
  } else if (endpoint === "availability") {
    return handleAvailabilityRequest(request, searchParams);
  } else {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }
}

async function handleRegionsRequest(request, searchParams) {
  const baseParams = {
    language: searchParams.get('language') || 'en-US',
    name: searchParams.get('city'),
    type: 'city',
  };

  const headers = {
    'Authorization': getAuthorizationHeader(),
    'Customer-Ip': getBrowserIpAddress(request),
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip',
  };

  try {
    // First API call for details
    const detailsParams = new URLSearchParams({ ...baseParams, include: 'details' });
    const detailsUrl = `${EXPEDIA_API_BASE_URL}/regions?${detailsParams}`;
    console.log('Requesting Details URL:', detailsUrl);
    const detailsResponse = await fetch(detailsUrl, { headers });
    
    if (!detailsResponse.ok) {
      const errorText = await detailsResponse.text();
      console.error('Expedia API Error (Details):', errorText);
      return NextResponse.json({ error: `Expedia API Error: ${errorText}` }, { status: detailsResponse.status });
    }
    const detailsData = await detailsResponse.json();
    console.log('Details Data:', JSON.stringify(detailsData, null, 2));

    // Second API call for property_ids
    const propertyIdsParams = new URLSearchParams({ ...baseParams, include: 'property_ids' });
    const propertyIdsUrl = `${EXPEDIA_API_BASE_URL}/regions?${propertyIdsParams}`;
    console.log('Requesting Property IDs URL:', propertyIdsUrl);
    const propertyIdsResponse = await fetch(propertyIdsUrl, { headers });
    
    if (!propertyIdsResponse.ok) {
      const errorText = await propertyIdsResponse.text();
      console.error('Expedia API Error (Property IDs):', errorText);
      return NextResponse.json({ error: `Expedia API Error: ${errorText}` }, { status: propertyIdsResponse.status });
    }
    const propertyIdsData = await propertyIdsResponse.json();
    console.log('Property IDs Data:', JSON.stringify(propertyIdsData, null, 2));

    // Combine the results
    let combinedData = { ...detailsData };
    if (detailsData.entities && propertyIdsData.entities) {
      combinedData.entities = detailsData.entities.map((entity, index) => ({
        ...entity,
        propertyIds: propertyIdsData.entities[index]?.propertyIds || []
      }));
    } else {
      console.warn('Unexpected API response structure:', { detailsData, propertyIdsData });
      combinedData.entities = [];
    }

    console.log('Combined Expedia API Response:', JSON.stringify(combinedData, null, 2));
    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Error fetching data from Expedia API:', error);
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}

async function handleAvailabilityRequest(request, searchParams) {
  const params = {
    checkin: searchParams.get("checkin"),
    checkout: searchParams.get("checkout"),
    currency: searchParams.get("currency") || "USD",
    language: searchParams.get("language") || "en-US",
    country_code: searchParams.get("country_code") || "US",
    occupancy: searchParams.get("occupancy") || "2",
    property_id: searchParams.get("property_id"),
    rate_plan_count: searchParams.get("rate_plan_count") || "1",
    sales_channel: "website",
    sales_environment: "hotel_only",
  };

  if (!params.checkin || !params.checkout || !params.property_id) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${EXPEDIA_API_BASE_URL}/properties/availability?${queryString}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: getAuthorizationHeader(),
        "Customer-Ip": getBrowserIpAddress(request),
        Accept: "application/json",
        "Accept-Encoding": "gzip",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch data from Expedia API");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching data from Expedia API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}