import { storePOISearch } from '@/app/utils/database';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { destination, searchRadius, searchType, pois } = body;

        console.log('Received POI data:', {
            destination,
            searchType,
            poisCount: pois.length,
            firstPoi: pois[0]
        });

        const searchId = await storePOISearch(destination, searchRadius, searchType, pois);
        
        return NextResponse.json({ 
            success: true, 
            searchId,
            message: `Successfully stored ${pois.length} POIs`
        });
    } catch (error) {
        console.error('Error in POI API route:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
