import { Injectable } from '@angular/core';

export interface SwissLocation {
  postalCode: string;
  locality: string;
  canton: string;
}

@Injectable({
  providedIn: 'root'
})
export class SwissAddressService {
  // Sample Swiss postal codes - in a real app, this would be a complete database or API
  private locations: SwissLocation[] = [
    // Zürich
    { postalCode: '8000', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8001', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8002', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8003', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8004', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8005', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8006', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8008', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8032', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8037', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8044', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8045', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8046', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8047', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8048', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8049', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8050', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8051', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8052', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8053', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8055', locality: 'Zürich', canton: 'ZH' },
    { postalCode: '8057', locality: 'Zürich', canton: 'ZH' },
    
    // Basel
    { postalCode: '4000', locality: 'Basel', canton: 'BS' },
    { postalCode: '4001', locality: 'Basel', canton: 'BS' },
    { postalCode: '4002', locality: 'Basel', canton: 'BS' },
    { postalCode: '4051', locality: 'Basel', canton: 'BS' },
    { postalCode: '4052', locality: 'Basel', canton: 'BS' },
    { postalCode: '4053', locality: 'Basel', canton: 'BS' },
    { postalCode: '4054', locality: 'Basel', canton: 'BS' },
    { postalCode: '4055', locality: 'Basel', canton: 'BS' },
    { postalCode: '4056', locality: 'Basel', canton: 'BS' },
    { postalCode: '4057', locality: 'Basel', canton: 'BS' },
    { postalCode: '4058', locality: 'Basel', canton: 'BS' },
    
    // Bern
    { postalCode: '3000', locality: 'Bern', canton: 'BE' },
    { postalCode: '3001', locality: 'Bern', canton: 'BE' },
    { postalCode: '3003', locality: 'Bern', canton: 'BE' },
    { postalCode: '3004', locality: 'Bern', canton: 'BE' },
    { postalCode: '3005', locality: 'Bern', canton: 'BE' },
    { postalCode: '3006', locality: 'Bern', canton: 'BE' },
    { postalCode: '3007', locality: 'Bern', canton: 'BE' },
    { postalCode: '3008', locality: 'Bern', canton: 'BE' },
    { postalCode: '3010', locality: 'Bern', canton: 'BE' },
    { postalCode: '3011', locality: 'Bern', canton: 'BE' },
    { postalCode: '3012', locality: 'Bern', canton: 'BE' },
    { postalCode: '3013', locality: 'Bern', canton: 'BE' },
    { postalCode: '3014', locality: 'Bern', canton: 'BE' },
    
    // Luzern
    { postalCode: '6000', locality: 'Luzern', canton: 'LU' },
    { postalCode: '6003', locality: 'Luzern', canton: 'LU' },
    { postalCode: '6004', locality: 'Luzern', canton: 'LU' },
    { postalCode: '6005', locality: 'Luzern', canton: 'LU' },
    { postalCode: '6006', locality: 'Luzern', canton: 'LU' },
    
    // St. Gallen
    { postalCode: '9000', locality: 'St. Gallen', canton: 'SG' },
    { postalCode: '9001', locality: 'St. Gallen', canton: 'SG' },
    { postalCode: '9004', locality: 'St. Gallen', canton: 'SG' },
    { postalCode: '9006', locality: 'St. Gallen', canton: 'SG' },
    { postalCode: '9008', locality: 'St. Gallen', canton: 'SG' },
    
    // Genève
    { postalCode: '1200', locality: 'Genève', canton: 'GE' },
    { postalCode: '1201', locality: 'Genève', canton: 'GE' },
    { postalCode: '1202', locality: 'Genève', canton: 'GE' },
    { postalCode: '1203', locality: 'Genève', canton: 'GE' },
    { postalCode: '1204', locality: 'Genève', canton: 'GE' },
    { postalCode: '1205', locality: 'Genève', canton: 'GE' },
    { postalCode: '1206', locality: 'Genève', canton: 'GE' },
    { postalCode: '1207', locality: 'Genève', canton: 'GE' },
    { postalCode: '1208', locality: 'Genève', canton: 'GE' },
    
    // Lausanne
    { postalCode: '1000', locality: 'Lausanne', canton: 'VD' },
    { postalCode: '1002', locality: 'Lausanne', canton: 'VD' },
    { postalCode: '1003', locality: 'Lausanne', canton: 'VD' },
    { postalCode: '1004', locality: 'Lausanne', canton: 'VD' },
    { postalCode: '1005', locality: 'Lausanne', canton: 'VD' },
    { postalCode: '1006', locality: 'Lausanne', canton: 'VD' },
    { postalCode: '1007', locality: 'Lausanne', canton: 'VD' },
    
    // Winterthur
    { postalCode: '8400', locality: 'Winterthur', canton: 'ZH' },
    { postalCode: '8404', locality: 'Winterthur', canton: 'ZH' },
    { postalCode: '8405', locality: 'Winterthur', canton: 'ZH' },
    { postalCode: '8406', locality: 'Winterthur', canton: 'ZH' },
    
    // Lugano
    { postalCode: '6900', locality: 'Lugano', canton: 'TI' },
    { postalCode: '6901', locality: 'Lugano', canton: 'TI' },
    { postalCode: '6902', locality: 'Lugano', canton: 'TI' },
    { postalCode: '6903', locality: 'Lugano', canton: 'TI' },
    
    // Other cities
    { postalCode: '4103', locality: 'Bottmingen', canton: 'BL' },
    { postalCode: '4104', locality: 'Oberwil', canton: 'BL' },
    { postalCode: '4105', locality: 'Biel-Benken', canton: 'BL' },
    { postalCode: '5000', locality: 'Aarau', canton: 'AG' },
    { postalCode: '7000', locality: 'Chur', canton: 'GR' },
  ];

  /**
   * Search for Swiss postal code/locality combinations
   * @param query Search term (can be PLZ, locality, or combination)
   * @returns Matching locations
   */
  searchLocations(query: string): SwissLocation[] {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchTerm = query.trim().toLowerCase();
    
    return this.locations.filter(loc => {
      const plzMatch = loc.postalCode.startsWith(searchTerm);
      const localityMatch = loc.locality.toLowerCase().includes(searchTerm);
      return plzMatch || localityMatch;
    }).slice(0, 10); // Limit to 10 results
  }

  /**
   * Find locations by postal code prefix
   * @param plzPrefix Postal code prefix (e.g., "8", "80", "800")
   * @returns Matching locations
   */
  searchByPLZ(plzPrefix: string): SwissLocation[] {
    if (!plzPrefix || plzPrefix.trim().length === 0) {
      return [];
    }

    return this.locations.filter(loc => 
      loc.postalCode.startsWith(plzPrefix.trim())
    ).slice(0, 10);
  }

  /**
   * Find locations by locality name
   * @param localityQuery Locality search term
   * @returns Matching locations
   */
  searchByLocality(localityQuery: string): SwissLocation[] {
    if (!localityQuery || localityQuery.trim().length === 0) {
      return [];
    }

    const search = localityQuery.trim().toLowerCase();
    return this.locations.filter(loc => 
      loc.locality.toLowerCase().includes(search)
    ).slice(0, 10);
  }

  /**
   * Get unique localities for a given postal code prefix
   * @param plzPrefix Postal code prefix
   * @returns Array of unique locality names
   */
  getLocalitiesForPLZ(plzPrefix: string): string[] {
    const locations = this.searchByPLZ(plzPrefix);
    const uniqueLocalities = new Set(locations.map(l => l.locality));
    return Array.from(uniqueLocalities);
  }

  /**
   * Get postal codes for a given locality
   * @param locality Locality name
   * @returns Array of postal codes
   */
  getPLZForLocality(locality: string): string[] {
    const locations = this.searchByLocality(locality);
    return locations.map(l => l.postalCode);
  }
}
