
const express = require('express');
const cors = require('cors');
const { BlobServiceClient } = require('@azure/storage-blob');
const uploadRoute = require('./routes/upload'); // Import upload route

const app = express();
app.use(cors());
app.use(express.json()); // Needed to parse JSON if used

// Azure Storage connection string
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_CONTAINER_NAME;

// Use the upload route
app.use('/upload', uploadRoute); // This means the upload route is /upload/upload

// Endpoint to list files in Azure Blob Storage
app.get('/files', async (req, res) => {
  try {
    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    let files = [];
    for await (const blob of containerClient.listBlobsFlat()) {
      const blobUrl = `https://${blobServiceClient.accountName}.blob.core.windows.net/${containerName}/${blob.name}`;
      files.push({ name: blob.name, url: blobUrl });
    }

    res.json(files);
  } catch (error) {
    console.error('Error listing files from Azure:', error.message);
    res.status(500).json({ message: 'Error listing blobs', error: error.message });
  }
});

app.listen(5000, () => {
  console.log('✅ Server is running on https://personal-cloud-19.onrender.com/');
});
