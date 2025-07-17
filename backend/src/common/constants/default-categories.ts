// Define parent categories and their sub-categories
export const defaultCategoryTree = {
  // Standalone Parent Categories
  Travel: null,
  "Car Payment": null,
  "Credit Card Payment": null,
  Shopping: null,
  Kratom: null,
  Restaurants: null,
  Groceries: null,
  "Personal Care": null,
  Hobbies: null,
  "Cell Phone": null,
  "Gas & Fuel": null,
  "Convenience Stores": null,
  "Food Delivery": null,
  Internet: null,
  "Income Tax": null,
  "Adult Entertainment": null,
  Miscellaneous: null,
  "Home Improvement": null,
  Pets: null,
  "Auto Maintenance": null,
  Interest: null,

  // Parent Categories with Children
  Mortgage: ["Property Taxes"],
  Utilities: ["Electricity", "Gas", "Water"],
  Insurance: ["Vehicle", "Home Owners", "Renters"],
  "Health & Wellness": [
    "Massage",
    "Doctor",
    "Therapy",
    "Eyecare",
    "Pharmacy",
    "Prescriptions",
  ],
  Auto: ["Repairs & Maintenance", "Parking"], // Grouping auto expenses
  Subscriptions: ["Apps", "Streaming Services"],
};
