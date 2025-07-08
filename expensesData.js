import 'dotenv/config';

const ALL_TEAMS_NAME = "Advocacy, Support, Dev Success";

const teams = (ALL_TEAMS_NAME || '').split(',').map((name) => name.trim().toLowerCase().split(' ').join('-'));

const sampleNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley'];

const getRandomAmount = () => Math.floor(Math.random() * 2000) + 300;

const sampleItems = [
  'Product Launch Campaign',
  'Internet',
  'Conference Travel',
  'Team Lunch',
  'Event Booth',
  'Promotional Material',
  'Payroll Processing',
  'Team Offsite',
  'Compliance Training',
];

const generateDummyExpenses = (count = 4) => {
  const expenses = [];
  for (let i = 0; i < count; i++) {
    const name = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const item = sampleItems[Math.floor(Math.random() * sampleItems.length)];
    expenses.push({
      name,
      item,
      amount: getRandomAmount(),
    });
  }
  return expenses;
};

export const expensesByTeam = teams.reduce((acc, team) => {
  acc[team] = generateDummyExpenses();
  return acc;
}, {});