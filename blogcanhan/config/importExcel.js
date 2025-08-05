const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Post = require('./models/Post'); 


mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));


const importExcel = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; 
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    
    const posts = data.map(row => ({
      title: row.Title,
      content: row.Content,
      author: row.Author
    }));

    
    await Post.insertMany(posts);
    console.log('Data imported successfully!');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error importing data:', error);
  }
};


importExcel('./data/posts.xlsx');
