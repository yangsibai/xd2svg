/**
 * @license
 * Copyright Andrey Chalkin <L2jLiga>. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/L2jLiga/xd2svg/LICENSE
 */

import { convert }      from 'convert-svg-to-png';
import * as extractZip  from 'extract-zip';
import { readFileSync } from 'fs';
import { dirSync }      from 'tmp';
import { promisify }    from 'util';
import xd2svg           from '../src/xd2svg';

const BlinkDiff = require('blink-diff');

describe('Complex test for xd2svg', () => {
  let maxListeners;

  before(() => {
    maxListeners = process.getMaxListeners();

    process.setMaxListeners(0);
  });

  after(() => {
    process.setMaxListeners(maxListeners);
  });

  it('should throw an error when file does not exist', (done) => {
    xd2svg('test/path/to/not/existed/file.xd', {})
      .then(() => done('Something went wrong'))
      .catch(() => done());
  });

  it('should throw an error when file is invalid', (done) => {
    xd2svg('test/invalid-mockup.xd', {})
      .then(() => done('Something went wrong'))
      .catch(() => done());
  });

  it('should throw an error when invalid buffer provided', (done) => {
    xd2svg(Buffer.from([1, 2, 3]), {})
      .then(() => done('Something went wrong'))
      .catch(() => done());
  });

  it('should correctly convert when buffer provided', (done) => {
    const inputBuffer: Buffer = Buffer.from(readFileSync('test/single.xd'));

    xd2svg(inputBuffer, {single: true})
      .then((svgImage: string) => convert(svgImage, {puppeteer: {args: ['--no-sandbox']}}) as Promise<Buffer>)
      .then((actual) => {
        const diff = new BlinkDiff({
          delta: 50,
          hideShift: true,
          imageAPath: 'test/expected/single.png',
          imageB: actual,

          threshold: .1,
          thresholdType: BlinkDiff.THRESHOLD_PERCENT,
        });

        diff.run((error, result) => {
          if (error) {
            return done(error);
          }

          if (!diff.hasPassed(result.code)) {
            return done('Too much difference!');
          }

          return done();
        });
      })
      .catch(done);
  });

  it('should correctly convert when provided path to file', (done) => {
    xd2svg('test/single.xd', {single: true})
      .then((svgImage: string) => convert(svgImage, {puppeteer: {args: ['--no-sandbox']}}) as Promise<Buffer>)
      .then((actual) => {
        const diff = new BlinkDiff({
          delta: 50,
          hideShift: true,
          imageAPath: 'test/expected/single.png',
          imageB: actual,

          threshold: .1,
          thresholdType: BlinkDiff.THRESHOLD_PERCENT,
        });

        diff.run((error, result) => {
          if (error) {
            return done(error);
          }

          if (!diff.hasPassed(result.code)) {
            return done('Too much difference!');
          }

          return done();
        });
      })
      .catch(done);
  });

  it('should correctly convert when provided directory with extracted mockup', (done) => {
    const tmpDir = dirSync({
      postfix: 'test-directory',
      unsafeCleanup: true,
    });

    let keys: string[];

    promisify(extractZip)('test/multi.xd', {dir: tmpDir.name})
      .then(() => xd2svg(tmpDir.name, {single: false}))
      .then((SVGs) => {
        keys = Object.keys(SVGs);
        return Promise.all(Object.values(SVGs).map((SVG) => convert(SVG, {
          puppeteer: {
            args: ['--no-sandbox'],
            timeout: 180000,
          },
        })));
      })
      .then((images) => {
        const diffs = keys.map((key: string, index: number) => {
          const diff = new BlinkDiff({
            delta: 50,
            hideShift: true,
            imageAPath: `test/expected/${key}`,
            imageB: images[index],

            threshold: .1,
            thresholdType: BlinkDiff.THRESHOLD_PERCENT,
          });

          return new Promise((resolve, reject) => {
            diff.run((error, result) => {
              if (error) {
                return reject(error);
              }

              if (!diff.hasPassed(result.code)) {
                return reject('Too much difference!');
              }

              return resolve();
            });
          });
        });

        return Promise.all(diffs);
      })
      .then(() => done())
      .catch(done);
  });
});
