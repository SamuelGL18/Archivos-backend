const origenesPermitidos = require("./origenesPermitidos");

const configCors = {
  origin: (origin, callback) => {
    if (origenesPermitidos.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(
        new Error(
          "El origen que ha hecho la solicitud no se encuentra dentro de los permitidos"
        )
      );
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = configCors;
