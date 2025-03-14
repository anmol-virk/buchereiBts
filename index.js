require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/db.connect");
const { Books } = require("./models/books.model"); 
const { Category } = require("./models/category.model");
const { Address } = require("./models/address.model");
const { default: mongoose } = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

initializeDatabase();

//to create a new category
app.post("/categories", async (req, res) => {
    const { name, description } = req.body;
    try {
        const newCategory = new Category({ name, description });
        await newCategory.save();
        res.status(201).json({ data: { category: newCategory } });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


//Category Routes
app.get("/", (req, res) => {
    res.send("Hello Express, yo")
})

// to get all categories
app.get("/categories", async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ data: { categories } });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

//to get a category by ID
app.get("/categories/:categoryId", async (req, res) => {
    const { categoryId } = req.params;
    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ error: "Category not found." });
        }
        res.json({ data: { category } });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

//book Routes

//to add a new book
app.post("/books", async (req, res) => {
    try {
        const {title, price, rating, category, imgUrl} = req.body
        const newBook = new Books({title, price, rating, imgUrl, category: new mongoose.Types.ObjectId(category),})
        const savedBook = await newBook.save()
        res.status(201).json({message: "Book added successfully", data: {book: savedBook}})
    } catch(error){
        console.error("Error fetching books:", error);
        res.status(500).json({error: "Internal server error"})
    }
})

// to get all books
app.get("/books", async (req, res) => {
    try {
        const books = await Books.find().populate('category', 'name');
        res.json({ data: { books } });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//to get a book by ID
app.get("/books/:bookId", async (req, res) => {
    const { bookId } = req.params;
    try {
        const book = await Books.findById(bookId).populate('category', 'name'); 
        if (!book) {
            return res.status(404).json({ error: "Book not found." });
        }
        res.json({ data: { book } });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

//to get books by category ID
app.get("/books/category/:categoryId", async (req, res) => {
    const { categoryId } = req.params;
    try {
        const products = await Books.find({ category: categoryId }).populate('category', 'name');
        if (products.length === 0) {
            return res.status(404).json({ error: "No products found for this category." });
        }
        res.json({ data: { products } });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});

//to update a book by ID
app.put("/books/:bookId", async (req, res) => {
    const { bookId } = req.params;
    const updatedData = req.body;

    try {
        const updatedBook = await Books.findByIdAndUpdate(bookId, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!updatedBook) {
            return res.status(404).json({ error: "Book not found." });
        }

        res.json({ data: { book: updatedBook } });
    } catch (error) {
        console.error("Error updating book:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
//address management routes
//get all addresses
app.get("/addresses", async (req, res) => {
    try {
        const addresses = await Address.find();
        res.json({ data: { addresses } });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch addresses." });
    }
});
//add address
app.post("/addresses", async (req, res) => {
    const { address, city, state, zipCode } = req.body;
    try {
        const newAddress = new Address({
            address,
            city,
            state,
            zipCode,
        });
        await newAddress.save();
        res.status(201).json({ data: { address: newAddress } });
    } catch (error) {
        res.status(500).json({ error: "Failed to add address." });
    }
});
//update
app.put("/addresses/:id", async (req, res) => {
    const { id } = req.params;
    const { address, city, state, zipCode } = req.body;

    try {
        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            { address, city, state, zipCode },
            { new: true, runValidators: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ error: "Address not found." });
        }

        res.json({ data: { address: updatedAddress } });
    } catch (error) {
        res.status(500).json({ error: "Failed to update address." });
    }
});
//delete
app.delete("/addresses/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedAddress = await Address.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ error: "Address not found." });
        }

        res.json({ data: { message: "Address deleted successfully." } });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete address." });
    }
});



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
