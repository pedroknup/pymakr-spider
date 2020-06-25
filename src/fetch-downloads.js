const chalk = require('chalk');

const puppeteer = require('puppeteer');
const lineReader = require('line-reader');
const moment = require('moment');

const getPymakrAtomDownloads = async () => {
  const BASE_URL = 'https://atom.io/packages/pymakr';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL);

  try {
    await page.waitForSelector('.stat.tooltipped.tooltipped-n');
  } catch (e) {
    if (e instanceof puppeteer.errors.TimeoutError) {
      // Do something if this is a timeout.
    }
  }
  let downloads;
  try {
    downloads = await page.$$eval(
      '.stat.tooltipped.tooltipped-n',
      (divs) => divs[1].querySelector('.value').innerHTML,
    );
  } catch {
    downloads = await page.$eval(
      '.stat.tooltipped.tooltipped-n',
      (divs) => divs.querySelector('.value').innerHTML,
    );
  }
  // await browser.close();

  return parseFloat(downloads.replace(/,/g, ''));
};

const getPymakrVSCDownloads = async () => {
  const BASE_URL = 'https://marketplace.visualstudio.com/items?itemName=pycom.Pymakr';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto(BASE_URL);

  try {
    await page.waitForSelector('span.installs-text');
  } catch (e) {
    if (e instanceof puppeteer.errors.TimeoutError) {
      // Do something if this is a timeout.
      console.log('time out');
    }
  }
  const downloads = await page.$eval(
    'span.installs-text',
    (divs) => divs.innerHTML,
  );
  // await browser.close();

  return parseFloat(downloads.replace(' installs', '').replace(/,/g, ''));
};

const fetchDownloads = async () => {
  const records = [];
  const readLinesAsync = async () => new Promise((resolve, reject) => {
    lineReader.eachLine('history.txt', (line, last) => {
      const linesArray = line.split(';');
      records.push({ obj: linesArray });
      if (last) resolve();
    });
  });
  await readLinesAsync();
  const groups = records.reduce((groups, game) => {
    if (game != '') {
      const date = game.obj[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      const lastRecord = groups[date];
      if (
        game.obj[1] > lastRecord.atom
        || game.obj[2] > lastRecord.vsc
        || groups[date].length == 0
      ) {
        groups[date].push({
          atom: game.obj[1], vsc: game.obj[2],
        });
      }

      return groups;
    }
  }, {});
  const promises = [];
  let downloadsVSC;
  let downloadsAtom;
  promises.push(
    (downloadsAtom = await getPymakrAtomDownloads()),
    (downloadsVSC = await getPymakrVSCDownloads()),
  );
  await Promise.all(promises);
  let today = new Date();
  let yesterday = today.setDate(today.getDate() - 1);
  let yesterdayStr = moment(yesterday).format('DD/MM/YYYY');
  let yesterdayData;
  try {
    yesterdayData = groups[yesterdayStr][0];
  } catch {
    let i = 2;
    while (!yesterdayData && i <= 100) {
      today = new Date();
      yesterday = today.setDate(today.getDate() - i);
      i += 1;
      yesterdayStr = moment(yesterday).format('DD/MM/YYYY');
      try {
        // eslint-disable-next-line prefer-destructuring
        yesterdayData = groups[yesterdayStr][0];
      // eslint-disable-next-line no-empty
      } catch {
      }
    }
    if (i === 31) {
      console.log('Not found');
      await process.exit(0);
    }
  }
  const vscDiff = downloadsVSC - yesterdayData.vsc;
  const atomDiff = downloadsAtom - yesterdayData.atom;
  let atomLogStr;
  if (atomDiff > 0) atomLogStr = chalk.greenBright(`(+${atomDiff})`);
  else if (atomDiff < 0) atomLogStr = chalk.redBright(`(${atomDiff})`);
  else atomLogStr = '';
  let vscLogStr;
  if (vscDiff > 0) vscLogStr = chalk.greenBright(`(+${vscDiff})`);
  else if (vscDiff < 0) vscLogStr = chalk.redBright(`(${vscDiff})`);
  else vscLogStr = '';
  console.log(`Comparing to ${yesterdayStr}`);

  console.log('Pymakr Atom: ', downloadsAtom, atomLogStr);
  console.log('Pymakr VSC: ', downloadsVSC, vscLogStr);

  const fs = require('fs');

  today = new Date();
  const record = `${moment(today).format(
    'DD/MM/YYYY',
  )};${downloadsAtom};${downloadsVSC};\r\n`;

  // write to a new file named 2pac.txt
  const writeFile = async (line) => new Promise((resolve, reject) => {
    fs.appendFile('history.txt', line, (err) => {
      // throws an error, you could also catch it here
      if (err) {
        console.log('error on saving file');
      }
      resolve();
    });
  });
  await writeFile(record);

  await process.exit(0);
};

module.exports = fetchDownloads;
