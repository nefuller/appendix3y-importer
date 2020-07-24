import * as Hapi from '@hapi/hapi';
import * as Jimp from 'jimp';
import { initLogging, logger } from '../shared/Logger';
import { json2csv } from 'json-2-csv';
import fs from 'fs';
import Appendix3YImporter from '../shared/Appendix3YImporter';

const path = require('path');
const tesseract = require('node-tesseract-ocr');
const rimraf = require('rimraf');

// Quick and dirty limit on number of files allowed per request.
const MAX_FILES_PER_REQUEST = 50;

// The Appendix3Y example form used in this project is 96 DPI. Scaling the image by the following value simulates
// an image at 300 DPI, which is the recommended DPI for Tesseract.
const IMAGE_SCALE_FACTOR = 3.125;

initLogging('appendix3y-importer.log');

const init = async () => {
  const server = Hapi.server({
    port: process.env.SERVER_PORT,
    host: process.env.SERVER_HOST,
    routes: {
      cors: true
    }
  });

  await server.register([require('@hapi/inert')])

  server.route({
    method: 'POST',
    path: '/upload',
    options: {
      payload: {
        output: 'stream',
        parse: true,
        allow: 'multipart/form-data',
        multipart: { output: 'stream' }
      }
    },
    handler: async (request, h) => {
      const payload = request.payload as any;

      const promises = [];
      for (let i = 0; i < MAX_FILES_PER_REQUEST; i++) {
        if (payload[`file${i}`]) {
          const file = payload[`file${i}`];

          // To prepare the user image for Tesseract, we apply our mask image, then resize and convert the resultant image to
          // greyscale. Before passing it to Tesseract we also save it as a .jpg to remove the alpha channel.

          let info: any = {};
          info.filename = file.hapi.filename;

          promises.push(new Promise((resolve, reject) => {
            Jimp.read('mask.png').then((mask) => {
              Jimp.read(file._data).then((image) => {
                image.composite(mask, 0, 0, { mode: Jimp.BLEND_SOURCE_OVER, opacitySource: 1, opacityDest: 1 }).scale(IMAGE_SCALE_FACTOR, Jimp.RESIZE_BICUBIC).quality(100).grayscale().write(`./temp/file${i}.jpg`, async (image) => {
                    try {
                      const temp = new Appendix3YImporter().getAppendix3YInfo(await tesseract.recognize(path.join(__dirname, `../../temp/file${i}.jpg`), {
                        load_system_dawg: 0,
                        lang: 'eng',
                        oem: 1,
                        psm: 4
                      }));

                      info = {
                        ...info,
                        ...temp
                      }

                      resolve(info);
                    } catch (err) {
                      logger.error(err);

                      info.error = 'Tesseract was unable to extract meaningful data from user file';
                      resolve(info);
                    }
                  });
                }).catch(err => {
                  logger.error(err);           
               
                  info.error = 'Unable to read user file';
                  resolve(info);
                });     
            }).catch(err => {
              logger.error(err);

              info.error = 'An unexpected error occured on the server';
              resolve(info);
            });
          }))
        } else {
          break;
        }
      }

      return Promise.all(promises);   
    }
  });

  server.route({
    method: 'POST',
    path: '/csv',
    handler: async (request, h) => {
      const payload = request.payload as any;

      // Generate a .csv file from the request payload, save it in a temporary location, then send it back to the client.
      try {
        await new Promise((resolve, reject) => {
          json2csv(JSON.parse(payload), (err, csv) => {
            if (err) {
              reject(err);
            } else {
              fs.writeFile(path.join(__dirname, '../../temp/download.csv'), csv, function(err) {
                if(err) {
                  reject(err);
                } else {
                  resolve();
                }
              });   
            }
          });
        });

        return h.file('./temp/download.csv');
      } catch (err) {
        logger.error(err);

        return 'An unexpected error occured on the server.'
      }
    }
  });

  // Nuke the temp folder to avoid cluttering up disk space.
  rimraf.sync(path.join(__dirname, '../../temp'));

  await server.start();
  logger.info(`Server running on ${server.info.uri}`);
}

process.on('unhandledRejection', (err) => {
  logger.error('There was an unhandled rejection: ', err);

  process.exit(1);
});

init();
