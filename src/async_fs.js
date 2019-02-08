/*jslint esversion: 6, maxparams: 4, maxdepth: 4, maxstatements: 20, maxcomplexity: 8, esversion: 8 */

const fs = require('fs');

const readFile = (path, opts = 'utf8') =>
  new Promise(
    (resolve, reject) => {

        fs
            .readFile(
                path,
                opts,
                (err, data) => {

                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }
            )
        ;
  }
);

const writeFile = (path, data, opts = 'utf8') =>
    new Promise(
        (resolve, reject) => {
            fs
                .writeFile(
                    path,
                    data,
                    opts,
                    (err) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                    }
                )
            ;
        }
    )
;

module.exports = {
    readFile,
    writeFile,
};
