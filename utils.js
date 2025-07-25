export const ALL_TEAMS_NAME = ["finance", "hr", "legal", "marketing", "dev advocacy"];

export const userTeamMap = {
  "akanksha.bhasin+14@okta.com": "admin",
  "akanksha.bhasin+devsupport@okta.com": "legal",
  "akanksha.bhasin+devadvocacy@okta.com": "dev advocacy",
  "akanksha.bhasin+devsuccess@okta.com": "finance",
  "akanksha.bhasin+mkt@okta.com": "marketing",
  "akanksha.bhasin+hr@okta.com": "hr",
};

export const dummyExpenseData = {
  finance: [
    {
      name: "Alice Johnson",
      item: "Product Launch Campaign",
      amount: 1200,
    },
    {
      name: "Bob Smith",
      item: "Promotional Material",
      amount: 450,
    },
    {
      name: "Carol Lee",
      item: "Team Lunch",
      amount: 180,
    },
    {
      name: "David Kim",
      item: "Event Booth",
      amount: 950,
    },
  ],
  hr: [
    {
      name: "Eve Martinez",
      item: "Internet",
      amount: 300,
    },
    {
      name: "Frank Wilson",
      item: "Compliance Training",
      amount: 600,
    },
    {
      name: "Grace Li",
      item: "Conference Travel",
      amount: 1500,
    },
    {
      name: "Henry Zhang",
      item: "Team Offsite",
      amount: 1000,
    },
  ],
  marketing: [
    {
      name: "Alice Johnson",
      item: "Payroll Processing",
      amount: 750,
    },
    {
      name: "Carol Lee",
      item: "Compliance Training",
      amount: 400,
    },
    {
      name: "Eve Martinez",
      item: "Team Lunch",
      amount: 200,
    },
    {
      name: "Frank Wilson",
      item: "Team Offsite",
      amount: 850,
    },
  ],
  legal: [
    {
      name: "Grace Li",
      item: "Event Booth",
      amount: 1100,
    },
    {
      name: "David Kim",
      item: "Product Launch Campaign",
      amount: 1300,
    },
    {
      name: "Bob Smith",
      item: "Conference Travel",
      amount: 1250,
    },
    {
      name: "Henry Zhang",
      item: "Team Lunch",
      amount: 170,
    },
  ],
  "dev-advocacy": [
    {
      name: "Eve Martinez",
      item: "Internet",
      amount: 280,
    },
    {
      name: "Frank Wilson",
      item: "Payroll Processing",
      amount: 720,
    },
    {
      name: "Grace Li",
      item: "Compliance Training",
      amount: 500,
    },
    {
      name: "Alice Johnson",
      item: "Team Offsite",
      amount: 950,
    },
  ],
};

export function getModifiedTeam(team) {
  if (!team?.trim()) return [];

  const toPascalCase = (str) =>
    str
      .trim()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

  const toKebabCase = (str) => str.trim().toLowerCase().split(' ').join('-');

  if (team === 'admin') {
    return ALL_TEAMS_NAME.map((element) => ({
      id: toKebabCase(element),
      label: toPascalCase(element),
    }));
  }

  return [
    {
      id: toKebabCase(team),
      label: toPascalCase(team),
    },
  ];
}