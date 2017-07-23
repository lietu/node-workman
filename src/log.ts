import * as winston from 'winston';

export const log = new (winston.Logger)({
    level: "debug",
    transports: [
        new (winston.transports.Console)(),
    ]
});

export default log;
