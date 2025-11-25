import dotenv from 'dotenv';
import app from './src/service/api';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3001;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
