import Categorie from "../models/categorie.models.js";

// Add Category
export const addCategorie = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }
    const categorie = await Categorie.create({ name });
    res.status(201).json(categorie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get All Categories
export const getAllCategorie = async (req, res) => {
  try {
    const categories = await Categorie.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Get Category by ID
export const getCategorieById = async (req, res) => {
  try {
    const { id } = req.params;
    const categorie = await Categorie.findById(id);
    if (!categorie) {
      return res.status(400).json({ message: "This category does not exist" });
    }
    res.status(200).json(categorie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Delete Category
export const deleteCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const categorie = await Categorie.findByIdAndDelete(id);
    if (!categorie) {
      return res.status(400).json({ message: "This category does not exist" });
    }
    res.status(200).json({ message: "Category deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

// Update Category
export const updateCategorie = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Category name is required for update" });
    }

    const categorie = await Categorie.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!categorie) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(categorie);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}
