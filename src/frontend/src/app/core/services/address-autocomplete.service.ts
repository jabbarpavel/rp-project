import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, map } from 'rxjs/operators';

export interface AddressSuggestion {
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  displayText: string; // For showing in dropdown: "Langstrasse 4, 8004 Zürich"
}

interface OpenPLZLocality {
  name: string;
  postalCode: string;
}

interface OpenPLZStreet {
  name: string;
  locality?: OpenPLZLocality; // Make optional as API might return different structure
  postalCode?: string; // Some API versions have this at top level
  city?: string; // Some API versions have this at top level
}

@Injectable({
  providedIn: 'root'
})
export class AddressAutocompleteService {
  private readonly BASE_URL = 'https://openplzapi.org';
  
  constructor(private http: HttpClient) {}

  /**
   * Search for addresses in Switzerland
   * @param query - User input like "Langstr 4" or "Bahnhofstrasse"
   * @returns Observable of address suggestions
   */
  searchAddresses(query: string): Observable<AddressSuggestion[]> {
    if (!query || query.trim().length < 3) {
      return of([]);
    }

    const trimmedQuery = query.trim();
    
    // Try to extract house number from query (e.g., "Langstr 4" or "Bahnhofstrasse 12")
    const houseNumberMatch = trimmedQuery.match(/\s+(\d+[a-zA-Z]?)$/);
    const hasHouseNumber = !!houseNumberMatch;
    const houseNumber = hasHouseNumber ? houseNumberMatch[1] : '';
    const streetQuery = hasHouseNumber ? trimmedQuery.replace(/\s+\d+[a-zA-Z]?$/, '').trim() : trimmedQuery;

    // Search streets in Switzerland (ch)
    return this.http.get<OpenPLZStreet[]>(
      `${this.BASE_URL}/ch/Streets?name=${encodeURIComponent(streetQuery)}`
    ).pipe(
      map(streets => {
        // Log first result to debug
        if (streets.length > 0) {
          console.log('First API result:', JSON.stringify(streets[0], null, 2));
        }
        
        // Transform to address suggestions
        const suggestions: AddressSuggestion[] = [];
        const uniqueEntries = new Set<string>();

        for (const street of streets.slice(0, 10)) { // Limit to 10 results
          // Handle different API response structures
          const postalCode = street.locality?.postalCode || street.postalCode || '';
          const city = street.locality?.name || street.city || '';
          const streetName = street.name || '';
          
          console.log(`Processing: street="${streetName}", postalCode="${postalCode}", city="${city}"`);
          
          // Skip only if street name is completely missing
          if (!streetName) {
            console.warn('Missing street name:', street);
            continue;
          }
          
          // Create unique key to avoid duplicates
          const uniqueKey = `${streetName}-${postalCode}-${city}`;
          
          if (!uniqueEntries.has(uniqueKey)) {
            uniqueEntries.add(uniqueKey);
            
            // Build display text only with available data
            let displayText = streetName;
            if (houseNumber) {
              displayText += ` ${houseNumber}`;
            }
            if (postalCode || city) {
              displayText += ', ';
              if (postalCode) displayText += postalCode;
              if (postalCode && city) displayText += ' ';
              if (city) displayText += city;
            }
            
            const suggestion: AddressSuggestion = {
              street: streetName,
              houseNumber: houseNumber || '',
              postalCode: postalCode,
              city: city,
              displayText: displayText
            };
            
            suggestions.push(suggestion);
          }
        }

        return suggestions;
      }),
      catchError(error => {
        console.error('Address autocomplete error:', error);
        return of([]);
      })
    );
  }

  /**
   * Search for postal codes and cities
   * @param query - Postal code or city name
   * @returns Observable of localities
   */
  searchPostalCodes(query: string): Observable<OpenPLZLocality[]> {
    if (!query || query.trim().length < 2) {
      return of([]);
    }

    const trimmedQuery = query.trim();
    const isNumeric = /^\d+$/.test(trimmedQuery);

    if (isNumeric) {
      // Search by postal code
      return this.http.get<OpenPLZLocality[]>(
        `${this.BASE_URL}/ch/Localities?postalCode=${encodeURIComponent(trimmedQuery)}`
      ).pipe(
        catchError(() => of([]))
      );
    } else {
      // Search by city name
      return this.http.get<OpenPLZLocality[]>(
        `${this.BASE_URL}/ch/Localities?name=${encodeURIComponent(trimmedQuery)}`
      ).pipe(
        catchError(() => of([]))
      );
    }
  }
}
