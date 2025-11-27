import AsyncStorage from '@react-native-async-storage/async-storage';
import { Player, Tournament, Sponsor } from '@/types/tournament';

const STORAGE_KEYS = {
  PLAYERS: 'horseshoe_players',
  TOURNAMENTS: 'horseshoe_tournaments',
  MATCHES: 'horseshoe_matches',
  SPONSORS: 'horseshoe_sponsors',
};

export const seedInitialData = async () => {
  try {
    console.log('🌱 Starting seed process...');
    const existingPlayers = await AsyncStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (existingPlayers && JSON.parse(existingPlayers).length > 0) {
      console.log('Data already exists, skipping seed');
      return;
    }
    console.log('📝 Seeding data...');

    const adminPlayers: Player[] = [
      {
        id: '1',
        name: 'Heath Russell',
        email: 'hrussell007@gmail.com',
        phone: '',
        hasPaidMembership: true,
        playerClass: 'A',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Christy Russell',
        email: '',
        phone: '',
        hasPaidMembership: true,
        playerClass: 'A',
        createdAt: new Date().toISOString(),
      },
    ];

    const samplePlayers: Player[] = [
      {
        id: '3',
        name: 'Alex Johnson',
        email: 'alex.j@example.com',
        phone: '555-0101',
        hasPaidMembership: true,
        playerClass: 'A',
        createdAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Blake Smith',
        email: 'blake.s@example.com',
        phone: '555-0102',
        hasPaidMembership: true,
        playerClass: 'B',
        createdAt: new Date().toISOString(),
      },
      {
        id: '5',
        name: 'Casey Davis',
        email: 'casey.d@example.com',
        phone: '555-0103',
        hasPaidMembership: true,
        playerClass: 'A',
        createdAt: new Date().toISOString(),
      },
      {
        id: '6',
        name: 'Drew Wilson',
        email: 'drew.w@example.com',
        phone: '555-0104',
        hasPaidMembership: true,
        playerClass: 'B',
        createdAt: new Date().toISOString(),
      },
      {
        id: '7',
        name: 'Evan Martinez',
        email: 'evan.m@example.com',
        phone: '555-0105',
        hasPaidMembership: true,
        playerClass: 'A',
        createdAt: new Date().toISOString(),
      },
      {
        id: '8',
        name: 'Finley Brown',
        email: 'finley.b@example.com',
        phone: '555-0106',
        hasPaidMembership: true,
        playerClass: 'B',
        createdAt: new Date().toISOString(),
      },
    ];

    const allPlayers = [...adminPlayers, ...samplePlayers];

    const sampleTournaments: Tournament[] = [
      {
        id: '1',
        name: 'Spring Classic 2025',
        date: '2025-03-15',
        time: '10:00 AM',
        location: '123 Main St, Springfield',
        entryFee: 25,
        teams: [],
        status: 'setup',
        payoutStructure: {
          firstPlace: 100,
          secondPlace: 50,
          thirdPlace: 25,
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Summer Championship',
        date: '2025-06-20',
        time: '2:00 PM',
        location: '456 Oak Ave, Springfield',
        entryFee: 30,
        teams: [],
        status: 'setup',
        payoutStructure: {
          firstPlace: 150,
          secondPlace: 75,
          thirdPlace: 30,
        },
        createdAt: new Date().toISOString(),
      },
    ];

    const sampleSponsors: Sponsor[] = [
      {
        id: '1',
        name: 'Local Hardware Store',
        websiteUrl: 'https://example.com',
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Springfield Sports',
        websiteUrl: 'https://example.com',
        createdAt: new Date().toISOString(),
      },
    ];

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(allPlayers)),
      AsyncStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(sampleTournaments)),
      AsyncStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify([])),
      AsyncStorage.setItem(STORAGE_KEYS.SPONSORS, JSON.stringify(sampleSponsors)),
    ]);

    console.log('✅ Initial data seeded successfully!');
    console.log('- Players:', allPlayers.length);
    console.log('- Tournaments:', sampleTournaments.length);
    console.log('- Sponsors:', sampleSponsors.length);
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};
