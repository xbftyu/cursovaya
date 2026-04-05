const mongoose = require("mongoose");
const Category = require("../models/Category");

const defaultCategories = [
  "Movies",
  "Beauty",
  "Sports",
  "Tennis",
  "Programming"
];

const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log("No categories found. Seeding default categories...");
      const categoriesData = defaultCategories.map(name => ({ name }));
      await Category.insertMany(categoriesData);
      console.log("Categories seeded successfully.");
    } else {
      console.log(`Initial check: ${count} categories exist. Skipping seed.`);
    }
  } catch (error) {
    console.error("Error seeding categories:", error);
  }
};

module.exports = seedCategories;
