// Fake data generator for properties
export interface FakeUser {
  name: string;
  avatar: string;
  initials: string;
  personality?: string;
  interests?: string[];
}

// 65% Male names (65 names)
const maleNames = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn',
  'Sage', 'River', 'Phoenix', 'Blake', 'Cameron', 'Drew', 'Emery', 'Finley',
  'Hayden', 'Jamie', 'Kendall', 'Logan', 'Parker', 'Reese', 'Sawyer', 'Skyler',
  'Kai', 'Atlas', 'Orion', 'Eli', 'Noah', 'Liam', 'Ethan', 'Mason', 'Lucas', 'Jackson',
  'Aiden', 'Oliver', 'Sebastian', 'Caleb', 'Ryan', 'Luke', 'Nathan', 'Isaac', 'Owen',
  'Wyatt', 'Henry', 'Leo', 'Aaron', 'Charles', 'Thomas', 'Connor', 'Jeremy', 'Hunter',
  'Eli', 'Christian', 'Landon', 'Jonathan', 'Nolan', 'Easton', 'Tyler', 'Miles', 'Colton',
  'Jaxon', 'Bryce', 'Adam', 'Adrian', 'Cooper', 'Ian', 'Carson', 'Parker', 'Xavier',
  'Bentley', 'Dominic', 'Jason', 'Jose', 'Zachary', 'Chase', 'Blake', 'Gavin', 'Cole'
];

// 35% Female names (35 names)
const femaleNames = [
  'Zoe', 'Nova', 'Echo', 'Luna', 'Vega', 'Aria', 'Jade', 'Maya', 'Emma', 'Olivia',
  'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Mia', 'Harper', 'Evelyn', 'Abigail',
  'Emily', 'Elizabeth', 'Sofia', 'Avery', 'Ella', 'Madison', 'Scarlett', 'Victoria',
  'Grace', 'Chloe', 'Lily', 'Aubrey', 'Zoey', 'Hannah', 'Lillian', 'Addison', 'Eleanor',
  'Natalie', 'Luna', 'Savannah', 'Brooklyn', 'Leah', 'Zoe', 'Stella', 'Hazel', 'Ellie',
  'Paisley', 'Audrey', 'Skylar', 'Violet', 'Claire', 'Bella', 'Aurora', 'Lucy', 'Anna'
];

// Combined array with 65% male, 35% female distribution
const firstNames = [...maleNames, ...femaleNames];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
  'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell',
  'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker',
  'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris', 'Morales', 'Murphy',
  'Cook', 'Rogers', 'Gutierrez', 'Ortiz', 'Morgan', 'Cooper', 'Peterson', 'Bailey',
  'Reed', 'Kelly', 'Howard', 'Ramos', 'Kim', 'Cox', 'Ward', 'Richardson', 'Watson',
  'Brooks', 'Chavez', 'Wood', 'James', 'Bennett', 'Gray', 'Mendoza', 'Ruiz', 'Hughes',
  'Price', 'Alvarez', 'Castillo', 'Sanders', 'Patel', 'Myers', 'Long', 'Ross', 'Foster',
  'Jimenez', 'Powell', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Bell', 'Murphy', 'Butler',
  'Simmons', 'Foster', 'Gonzales', 'Bryant', 'Alexander', 'Russell', 'Griffin', 'Diaz'
];

const avatarColors = [
  'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
  'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
  'bg-emerald-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-lime-500',
  'bg-sky-500', 'bg-fuchsia-500', 'bg-slate-500', 'bg-stone-500', 'bg-zinc-500',
  'bg-neutral-500', 'bg-gray-500', 'bg-slate-600', 'bg-gray-600', 'bg-zinc-600'
];

const personalities = [
  'Friendly', 'Outgoing', 'Creative', 'Analytical', 'Adventurous', 'Calm', 'Energetic',
  'Thoughtful', 'Spontaneous', 'Organized', 'Artistic', 'Tech-savvy', 'Social', 'Independent',
  'Collaborative', 'Optimistic', 'Practical', 'Dreamy', 'Focused', 'Flexible'
];

const interests = [
  'Music', 'Art', 'Sports', 'Cooking', 'Reading', 'Gaming', 'Photography', 'Travel',
  'Fitness', 'Dancing', 'Movies', 'Technology', 'Nature', 'Fashion', 'Writing', 'Learning',
  'Volunteering', 'Gardening', 'Crafting', 'Meditation', 'Yoga', 'Hiking', 'Swimming',
  'Cycling', 'Running', 'Painting', 'Drawing', 'Singing', 'Playing instruments'
];

// Track used name combinations to ensure uniqueness
const usedNames = new Set<string>();

export const generateFakeUser = (seed?: string): FakeUser => {
  // Use seed for consistent generation
  const random = seed ? 
    (() => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash);
    })() : 
    Math.random();

  // Create multiple random values from the seed for different selections
  const random1 = (random * 1.618) % 1;
  const random2 = (random * 2.718) % 1;
  const random3 = (random * 3.141) % 1;
  const random4 = (random * 1.414) % 1;
  const random5 = (random * 2.236) % 1;

  // 65% chance for male name, 35% chance for female name
  const isMale = random5 < 0.65;
  const firstName = isMale ? 
    maleNames[Math.floor(random1 * maleNames.length) % maleNames.length] :
    femaleNames[Math.floor(random1 * femaleNames.length) % femaleNames.length];
  
  const lastName = lastNames[Math.floor(random2 * lastNames.length) % lastNames.length];
  const color = avatarColors[Math.floor(random3 * avatarColors.length) % avatarColors.length];
  const personality = personalities[Math.floor(random4 * personalities.length) % personalities.length];
  
  // Generate 2-4 random interests
  const numInterests = Math.floor((random * 3) % 3) + 2; // 2-4 interests
  const selectedInterests: string[] = [];
  let tempInterests = [...interests];
  
  for (let i = 0; i < numInterests && tempInterests.length > 0; i++) {
    const randomIndex = Math.floor((random * (i + 1) * 1.732) % tempInterests.length);
    selectedInterests.push(tempInterests[randomIndex]);
    tempInterests.splice(randomIndex, 1); // Remove to avoid duplicates
  }
  
  const name = `${firstName} ${lastName}`;
  const initials = `${firstName[0]}${lastName[0]}`;
  
  // Track used names to ensure uniqueness
  usedNames.add(name);
  
  return {
    name,
    avatar: color,
    initials,
    personality,
    interests: selectedInterests
  };
};

export const generateFakeUsers = (count: number): FakeUser[] => {
  return Array.from({ length: count }, (_, i) => generateFakeUser(`user-${i}`));
};

// Pre-generate some fake users for consistent use
export const fakeUsers = generateFakeUsers(50);
