const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;

// configuraciones iniciales
app.use(cors({ origin: "*" }));
app.use(express.urlencoded({ extended: false }));
app.use("/archivos", express.static(path.join(__dirname, "archivos-subidos")));
app.use(express.json());

// configuracion de multer
const configuracionMulter = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "archivos-subidos/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const subir = multer({ storage: configuracionMulter });

// subir archivos
app.post("/subir", subir.single("imagen"), (req, res) => {
  console.log("Archivo que se subio:", req.file);

  if (!req.file) {
    return res.status(400).send("No se pudo subir el archivo.");
  }

  res.send("El archivo se subio!");
});

// obtener los archivos subidos
app.get("/archivos", (req, res) => {
  const rutaArchivos = path.join(__dirname, "archivos-subidos");

  fs.readdir(rutaArchivos, (err, files) => {
    if (err) {
      return res
        .status(500)
        .send("No se pudo acceder a la ruta, error: " + err);
    }
    res.send(files);
  });
});

// descarga de archivos
app.get("/descargar", (req, res) => {
  const nombreArchivo = req.query.filename;

  if (!nombreArchivo) {
    return res.status(400).send("No se proporciono el nombre del archivo.");
  }

  const rutaArchivo = path.join(__dirname, "archivos-subidos", nombreArchivo);

  if (!fs.existsSync(rutaArchivo)) {
    return res.status(404).send("No se encontro el archivo");
  }

  res.download(rutaArchivo, nombreArchivo, (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error al descargar.");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server en http://localhost:${PORT}`);
});
