const express = require("express");
const multer = require("multer");
const ftp = require("basic-ftp");
const path = require("path");
const cors = require("cors");
const configCors = require("./config/configCors");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(cors(configCors));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

const upload = multer({ dest: "uploads/" });

// FTP configuration
const ftpConfig = {
  host: "127.0.0.1",
  user: "WindowsServer",
  password: "Contra123",
  secure: true, // Use secure FTP (FTPS) if needed
  secureOptions: { rejectUnauthorized: false },
};

// Endpoint to get all uploaded images
app.get("/images", (req, res) => {
  const directoryPath = path.join(__dirname, "uploads");

  // Read the "uploads" directory and send the file names
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send("Unable to scan directory: " + err);
    }
    // Send an array of filenames
    res.send(files);
  });
});

// Handle file upload
app.post("/upload", upload.single("imagen"), async (req, res) => {
  const client = new ftp.Client();
  console.log("Request body:", req.body);
  try {
    await client.access(ftpConfig);
    await client.uploadFrom(req.file.path, req.file.originalname);
    res.send("File uploaded successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading file.");
  } finally {
    client.close();
  }
});

// Handle file download
app.post("/download", async (req, res) => {
  const client = new ftp.Client();
  const filename = req.body.filename;

  // Log the received filename for debugging
  console.log("Received filename:", filename);

  // Check if filename is undefined or empty
  if (!filename) {
    return res.status(400).send("Filename is required.");
  }

  try {
    await client.access(ftpConfig);
    const tempLocalFilePath = path.join(__dirname, "downloads", filename);

    // Make sure the downloads directory exists
    if (!fs.existsSync(path.join(__dirname, "downloads"))) {
      fs.mkdirSync(path.join(__dirname, "downloads"));
    }

    await client.downloadTo(tempLocalFilePath, filename);

    // Send the file to the client
    res.download(tempLocalFilePath, filename, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error downloading file.");
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error downloading file.");
  } finally {
    client.close();
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
