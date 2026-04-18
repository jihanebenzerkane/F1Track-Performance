export const teams = [
  { id: 'mercedes', name: 'Mercedes', color: '#00D2BE', secondaryColor: '#000000' },
  { id: 'redbull', name: 'Red Bull', color: '#3671C6', secondaryColor: '#CC1E4A' },
  { id: 'ferrari', name: 'Ferrari', color: '#E8002D', secondaryColor: '#FFCC00' },
  { id: 'mclaren', name: 'McLaren', color: '#FF8000', secondaryColor: '#000000' },
  { id: 'alpine', name: 'Alpine', color: '#FF87BC', secondaryColor: '#0093CC' },
  { id: 'aston', name: 'Aston Martin', color: '#358C75', secondaryColor: '#000000' },
];

export const teamCarFiles = {
  mercedes: '/models/mercedes.glb',
  redbull: '/models/redbull.glb',
  ferrari: '/models/ferrari.glb',
  mclaren: '/models/mclaren.glb',
  alpine: '/models/alpine.glb',
  aston: '/models/aston.glb',
};

export const carParts = {
  engine: {
    label: 'Power Unit',
    meshKeywords: ['engine', 'power', 'pu', 'motor'],
    content: {
      title: 'Power Unit — 2026 Regs',
      subtitle: '1.6L V6 + 350kW ERS',
      specs: [
        { label: 'Total Output', value: '~1,000 HP' },
        { label: 'ICE Output', value: '~540 HP (400 kW)' },
        { label: 'ERS Output', value: '~470 HP (350 kW)' },
        { label: 'Power Split', value: '50/50 ICE / Electric' },
        { label: 'Rev Limit', value: '15,000 RPM' },
        { label: 'Fuel Type', value: '100% Sustainable Fuel' },
        { label: 'Car Weight', value: '768 kg min (−22 kg)' },
        { label: 'MGU-H', value: 'Removed (2026)' },
      ],
      explanation: 'The 2026 Power Unit is the most significant regulation change in a decade. The complex MGU-H is removed entirely, while electrical output is tripled to 350 kW. For the first time, the ICE runs on 100% advanced sustainable fuels — delivering the same 1,000 HP total with zero net carbon emissions. New manufacturers: Honda (back), Audi, GM (Cadillac).',
      funFact: 'The 350 kW electrical output of the 2026 ERS is equivalent to adding a full Porsche Taycan\'s electric motor onto an existing F1 car, deploying purely to help overtake.',
      changeIn2026: 'MGU-H abolished. ERS triples from 120kW to 350kW. ICE drops to ~400kW. Both outputs equal — a true 50/50 hybrid. Audi and GM (Cadillac) join as new PU suppliers alongside Mercedes, Ferrari, Renault (Alpine), Honda.',
    }
  },

  tires: {
    label: 'Tires',
    meshKeywords: ['tire', 'tyre', 'wheel', 'rim', 'rubber'],
    content: {
      title: 'Pirelli Tires',
      subtitle: 'The Only Contact With The Road',
      specs: [
        { label: 'Contact Patch', value: 'Size of a postcard' },
        { label: 'Width (front)', value: '305mm' },
        { label: 'Width (rear)', value: '405mm' },
        { label: 'Diameter', value: '18 inches (since 2022)' },
        { label: 'Compounds', value: 'C1 (hard) → C5 (soft)' },
        { label: 'Working Temp', value: '90°C – 110°C' },
        { label: 'Blanket Temp', value: '70°C front / 80°C rear' },
        { label: 'Set Cost', value: '~$3,000 per set' },
      ],
      explanation: 'F1 tires only work within a very specific temperature window. Too cold and they have no grip. Too hot and they degrade rapidly — called graining or blistering. Teams spend enormous effort keeping tires in their operating window throughout a stint.',
      funFact: 'Each tire weighs ~9.5kg and is used for maybe 30 laps. A full race weekend uses up to 13 sets per driver — over $39,000 in rubber alone.',
      changeIn2026: 'Pirelli staying as sole supplier through 2027. Compounds being rebalanced for the lighter 2026 cars which will be ~30kg lighter than current generation.',
    }
  },

  frontWing: {
    label: 'Front Wing',
    meshKeywords: ['front_wing', 'frontwing', 'front wing', 'nose', 'wing_front'],
    content: {
      title: 'Front Wing — 2026 Regs',
      subtitle: 'Active Aerodynamics',
      specs: [
        { label: 'Design', value: 'Active flap system' },
        { label: 'Aero Mode — X', value: 'Low drag (straights)' },
        { label: 'Aero Mode — Z', value: 'High downforce (corners)' },
        { label: 'Car Width', value: '1,900mm (−100mm vs 2024)' },
        { label: 'Material', value: 'Carbon fibre composite' },
        { label: 'Downforce', value: 'Variable (active)' },
        { label: 'DRS', value: 'Replaced by active aero' },
        { label: 'Regulation', value: 'FIA 2026 Tech Regs' },
      ],
      explanation: 'In 2026 the front wing is part of a fully integrated Active Aerodynamics system. In "X-Mode" (straights) the flaps flatten automatically to cut drag. In "Z-Mode" (cornering) they angle up for maximum downforce. The car is also 10cm narrower and 20cm shorter than the 2024 car, designed for closer wheel-to-wheel racing.',
      funFact: 'The 2026 car shape-shifts twice per lap — front and rear wings physically move to optimise for speed vs grip. It is the biggest aerodynamic regulation change since ground-effect was banned in 1982.',
      changeIn2026: 'Entirely new active front wing concept mandated. Narrower car (-100mm width). Shorter car (-200mm length). DRS abolished — replaced by this systemic active aero.',
    }
  },

  rearWing: {
    label: 'Rear Wing + DRS',
    meshKeywords: ['rear_wing', 'rearwing', 'rear wing', 'drs', 'wing_rear'],
    content: {
      title: 'Rear Wing — 2026 Regs',
      subtitle: 'Active Aero + Override Mode',
      specs: [
        { label: 'System', value: 'Full Active Aerodynamics' },
        { label: 'Mode — X', value: 'Flat (min drag) straights' },
        { label: 'Mode — Z', value: 'Angled (max grip) corners' },
        { label: 'Override Mode', value: 'Replaces DRS' },
        { label: 'Drag reduction', value: '~30% (vs 10% DRS)' },
        { label: 'Activation', value: 'Automatic (no zones)' },
        { label: 'DRS', value: 'Abolished from 2026' },
        { label: 'ERS Boost', value: '350 kW deployment' },
      ],
      explanation: 'DRS is gone. The 2026 rear wing is fully active — it moves automatically between X-Mode (drag reduction on straights) and Z-Mode (downforce in corners). To replace DRS\'s overtaking aid, the FIA introduced "Manual Override Mode" (MOM): the chasing car gets a short burst of extra ERS deployment (350 kW) to help pass, removing the artificial 1-second gap restriction.',
      funFact: 'The 2026 active rear wing can reduce drag by ~30% vs the current DRS open state of ~10%, making the cars dramatically faster on straights — without the sudden snap drivers experience with today\'s DRS.',
      changeIn2026: 'DRS permanently abolished. Active rear wing (X/Z modes) introduced. "Manual Override Mode" (ERS boost) replaces DRS as overtaking aid. No activation zones — works anywhere on track.',
    }
  },

  halo: {
    label: 'Halo',
    meshKeywords: ['halo', 'cockpit_protection', 'head_protection'],
    content: {
      title: 'Halo',
      subtitle: 'Titanium Head Protection',
      specs: [
        { label: 'Material', value: 'Grade 5 Titanium' },
        { label: 'Weight', value: '9 kg' },
        { label: 'Load Rating', value: '125 kN — 12.5 tonnes' },
        { label: 'Test Equivalent', value: 'A double-decker bus' },
        { label: 'Introduced', value: '2018 — mandatory FIA' },
        { label: 'Bar Thickness', value: '~25mm titanium' },
        { label: 'Visibility Block', value: '~3% forward view' },
        { label: 'Manufacturer', value: 'Each team builds own' },
      ],
      explanation: 'The Halo was deeply unpopular aesthetically when introduced in 2018. Drivers and fans hated it. It has since saved multiple lives — Grosjean\'s fireball in Bahrain 2020, Zhou\'s barrel roll at Silverstone 2022, and Leclerc at Spa 2018.',
      funFact: 'Romain Grosjean\'s car split in half and caught fire in 2020. He walked away. The Halo deflected the barrier that would have decapitated him. He now has a Halo tattoo.',
      changeIn2026: 'Halo remains mandatory. Likely to be more aerodynamically integrated into the new chassis designs as teams optimize the new regulations.',
    }
  },

  floor: {
    label: 'Floor & Diffuser',
    meshKeywords: ['floor', 'diffuser', 'underfloor', 'ground'],
    content: {
      title: 'Floor & Diffuser',
      subtitle: 'Ground Effect — The Hidden Force',
      specs: [
        { label: 'Downforce Share', value: '~40% of total' },
        { label: 'Mechanism', value: 'Venturi tunnels' },
        { label: 'Ground Clearance', value: '~30mm at speed' },
        { label: 'Reintroduced', value: '2022 after 40yr ban' },
        { label: 'Diffuser Height', value: '~175mm' },
        { label: 'Material', value: 'Carbon fibre' },
        { label: 'Sensitivity', value: '1mm change = 0.1s' },
        { label: 'Porpoising risk', value: 'High if setup wrong' },
      ],
      explanation: 'The floor channels air under the car through shaped Venturi tunnels creating a low-pressure zone that literally sucks the car to the track. Ground effect was banned in the 1980s after driver deaths, reintroduced in 2022 with strict safety regulations.',
      funFact: 'At full speed the suction is so extreme that theoretically, if you could drive upside down on a ceiling at 200km/h, the car would stick. The downforce exceeds the car\'s own weight.',
      changeIn2026: 'Floor geometry changing significantly to work with the active aerodynamics system. Less reliance on floor downforce at high speed — the active wings will compensate.',
    }
  },

  steeringWheel: {
    label: 'Steering Wheel',
    meshKeywords: ['steering', 'wheel_steering', 'cockpit', 'dashboard'],
    content: {
      title: 'Steering Wheel',
      subtitle: '$50,000 Carbon Gamepad',
      specs: [
        { label: 'Cost', value: '~$50,000' },
        { label: 'Controls', value: '25+ buttons & dials' },
        { label: 'Weight', value: '~1.3 kg' },
        { label: 'Shift Paddles', value: 'Carbon, magnetic sensors' },
        { label: 'Display', value: 'Full colour LCD' },
        { label: 'Shift Speed', value: '50 milliseconds' },
        { label: 'Customisation', value: 'Unique per driver' },
        { label: 'Removal', value: 'Detaches for entry/exit' },
      ],
      explanation: 'An F1 steering wheel controls gear shifts, brake bias, engine modes, ERS deployment, DRS, radio, pit limiter, differential settings, and dozens more. Drivers adjust settings mid-corner at 300km/h entirely from memory — trained over thousands of simulator hours.',
      funFact: 'Lewis Hamilton uses approximately 20 different controls per lap during a race. Teams spend months training drivers on new wheel layouts before each season.',
      changeIn2026: 'New engine modes required for the 50/50 hybrid split. Active aerodynamic controls added — even more complex than current generation wheels.',
    }
  },

  sidepod: {
    label: 'Sidepods',
    meshKeywords: ['sidepod', 'side_pod', 'bodywork', 'radiator'],
    content: {
      title: 'Sidepods',
      subtitle: 'Cooling + Aerodynamic Shaping',
      specs: [
        { label: 'Primary Role', value: 'Radiator housing' },
        { label: 'Systems cooled', value: 'Water, oil, intercooler' },
        { label: 'Aero role', value: 'Direct air to floor/rear' },
        { label: 'Temp managed', value: '900°C exhaust nearby' },
        { label: 'Material', value: 'Carbon fibre panels' },
        { label: 'Update frequency', value: 'Most updated part' },
        { label: 'Design variance', value: 'Biggest team differentiator' },
        { label: 'Mercedes 2022', value: 'Near-zero sidepod concept' },
      ],
      explanation: 'Sidepods are where teams most visibly differentiate their cars. The shape determines how efficiently air reaches the rear. Mercedes ran near-zero sidepods in 2022. Red Bull runs deeply undercut sidepods. Both approaches have different thermal and aerodynamic tradeoffs.',
      funFact: 'In 2022, Mercedes\'s radical zeropod design confused every engineer in F1. It took Mercedes themselves half a season to understand why it underperformed — the concept was ahead of their own understanding.',
      changeIn2026: 'New sidepod regulations to accommodate standardised cooling for increased electrical systems. The 50/50 hybrid split generates significantly more heat from electrical components.',
    }
  },
};

export const teamSpecificInfo = {
  mercedes: {
    fullName: 'Mercedes-AMG Petronas F1 Team',
    car: 'W15',
    chassis: 'Carbon fibre/honeycomb composite',
    powerUnit: 'Mercedes-AMG F1 M15 E Performance',
    tyres: 'Pirelli P Zero',
    drivers: ['Lewis Hamilton', 'George Russell'],
    highlights: [
      '8 consecutive Constructors\' Championships (2014-2021)',
      'Zero-pod concept introduced 2022',
      'Hamilton\'s 103 race wins — all-time record',
      'Dominant turbo-hybrid era pioneers',
    ],
    color: '#00D2BE',
    engineSupplier: 'Mercedes-AMG HPP',
  },
  redbull: {
    fullName: 'Oracle Red Bull Racing',
    car: 'RB20',
    chassis: 'Carbon fibre/honeycomb composite',
    powerUnit: 'Honda RBPTH002',
    tyres: 'Pirelli P Zero',
    drivers: ['Max Verstappen', 'Sergio Perez'],
    highlights: [
      '4 consecutive Constructors\' Championships (2010-2013, 2022-2023)',
      'Verstappen — 3 consecutive world titles 2021-2023',
      'Adrian Newey — most successful F1 designer ever',
      '21 wins from 22 races in 2023 — near perfect season',
    ],
    color: '#3671C6',
    engineSupplier: 'Honda (as Red Bull Powertrains)',
  },
  ferrari: {
    fullName: 'Scuderia Ferrari',
    car: 'SF-24',
    chassis: 'Carbon fibre/honeycomb composite',
    powerUnit: 'Ferrari 066/11',
    tyres: 'Pirelli P Zero',
    drivers: ['Charles Leclerc', 'Carlos Sainz'],
    highlights: [
      'Most successful F1 team ever — 16 Constructors\' titles',
      'Only team to compete in every F1 season since 1950',
      'Iconic Scuderia Ferrari history — Schumacher era dominance',
      'Maranello factory — beating heart of Italian motorsport',
    ],
    color: '#E8002D',
    engineSupplier: 'Ferrari',
  },
  mclaren: {
    fullName: 'McLaren Formula 1 Team',
    car: 'MCL38',
    chassis: 'Carbon fibre/aluminium honeycomb composite',
    powerUnit: 'Mercedes-AMG F1 M15 E Performance',
    tyres: 'Pirelli P Zero',
    drivers: ['Lando Norris', 'Oscar Piastri'],
    highlights: [
      '8 Constructors\' Championships',
      'Senna and Prost — greatest ever driver lineup 1988-1989',
      'Famous papaya orange livery — iconic since 1968',
      '2024 resurgence — Norris challenging for title',
    ],
    color: '#FF8000',
    engineSupplier: 'Mercedes-AMG HPP',
  },
  alpine: {
    fullName: 'BWT Alpine F1 Team',
    car: 'A524',
    chassis: 'Carbon fibre/honeycomb composite',
    powerUnit: 'Renault E-Tech RE24',
    tyres: 'Pirelli P Zero',
    drivers: ['Pierre Gasly', 'Esteban Ocon'],
    highlights: [
      'Successor to Renault F1 — rebranded 2021',
      'Alonso\'s return — won 2021 Hungarian GP for team',
      'French manufacturer — only French team on grid',
      'BWT pink livery — most distinctive on the grid',
    ],
    color: '#FF87BC',
    engineSupplier: 'Renault',
  },
  aston: {
    fullName: 'Aston Martin Aramco F1 Team',
    car: 'AMR24',
    chassis: 'Carbon fibre/honeycomb composite',
    powerUnit: 'Mercedes-AMG F1 M15 E Performance',
    tyres: 'Pirelli P Zero',
    drivers: ['Fernando Alonso', 'Lance Stroll'],
    highlights: [
      'British luxury brand returns to F1 after 60 years',
      'Alonso — 2x World Champion, still competing at 42',
      'Lawrence Stroll\'s $200M transformation of Force India',
      'British Racing Green — most legendary racing color',
    ],
    color: '#358C75',
    engineSupplier: 'Mercedes-AMG HPP',
  },
};