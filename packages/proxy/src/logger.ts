import * as winston from "winston";

export const Logger = (function () {
  let instance: winston.Logger;

  return {
    getLogger: function () {
      if (!instance) {
        instance = winston.createLogger({
          format: winston.format.json(),
          transports: [
            // TODO: Consider file transport for logging network activity
            new winston.transports.Console({ format: winston.format.cli() }),
          ],
        });
      }

      return instance;
    },
  };
})();
