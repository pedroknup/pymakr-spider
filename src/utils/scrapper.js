const DELAY_BASIC_RAW = 1200;
const DELAY_SLOW_RAW = 2200;
const DELAY_FACTOR = 0.1;
const BASE_URL = "https://www.bet365.com/";
const URL_FRAGMENT = "#/IP/";
const DELAY_BASIC = DELAY_BASIC_RAW * DELAY_FACTOR;
const DELAY_SLOW = DELAY_SLOW_RAW * DELAY_FACTOR;
const DELAY_TYPING = 157;

const getURL = async page =>
  page.evaluate(async () => {
    const url = window.location.href;
    return url;
  });

export const loginWithPage = async (page, username, password) => {
  const pageUrl = await getURL(page);
  if (pageUrl != `${BASE_URL}${URL_FRAGMENT}`) {
    await page.goto(`${BASE_URL}${URL_FRAGMENT}`);
    await page.waitForSelector(".ipo-Fixture");
  }
  const loginButton = await page.$(".hm-LoggedOutButtons_Login");
  if (!loginButton) return true;

  const response = await page.evaluate(
    async (DELAY_TYPING, DELAY_SLOW, DELAY_BASIC, username, password) => {
      function sleep(ms) {
        return new Promise(resolve => {
          setTimeout(resolve, ms);
        });
      }

      const getRandomDelay = (slow, typing) => {
        if (typing) {
          let msVariant = Math.floor(Math.random() * 50);

          const positiveOrNot = Math.floor(Math.random() * 1);

          if (positiveOrNot === 0) {
            msVariant *= -1;
          }

          return DELAY_TYPING + msVariant;
        } else {
          let msVariant = Math.floor(Math.random() * 100);

          const positiveOrNot = Math.floor(Math.random() * 1);

          if (positiveOrNot === 0) {
            msVariant *= -1;
          }

          if (slow && !typing) return DELAY_SLOW + msVariant;

          return DELAY_BASIC + msVariant;
        }
      };

      const typeInput = async (input, word) => {
        for (let i = 0; i < word.length; i++) {
          input.value = `${input.value}${word[i]}`;
          await sleep(getRandomDelay(true, true));
        }

        // return true;
      };

      const loginButton = document.querySelector(".hm-LoggedOutButtons_Login");
      if (!loginButton) {
        return "";
      }
      await sleep(getRandomDelay());
      loginButton.click();

      let found = false;
      for (let attempts = 0; attempts < 12; attempts++) {
        if (!document.querySelector(".lm-StandardLogin_Username")) {
          await sleep(1000);
        } else {
          found = true;
          attempts = 12;
        }
      }
      if (!found) {
        return "[BUG] input not found";
      }
      const emailInput = document.querySelector(".lm-StandardLogin_Username");
      const passwordInput = document.querySelector(
        ".lm-StandardLogin_Password"
      );

      await sleep(getRandomDelay(true));

      emailInput.value = "";
      emailInput.focus();
      await typeInput(emailInput, username);
      await sleep(getRandomDelay());

      await sleep(getRandomDelay(true));
      await typeInput(passwordInput, password);
      await sleep(getRandomDelay(true));
      const okButton = document.querySelector(".lm-StandardLogin_LoginButton");
      okButton.click();
    },
    DELAY_TYPING,
    DELAY_SLOW,
    DELAY_BASIC,
    username,
    password
  );
  if (typeof response === string) {
    if (loginResponse.includes("[BUG]")) {
      console.log(chalk.red(response));
      return false;
    }
  }
  return true;
};

export const getBetsCountFromPage = async page => {
  await page.waitForSelector(".hm-LoggedInButtons_MyBetsLabel");

  const count = await page.evaluate(async () => {
    function sleep(ms) {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }

    for (let attempts = 0; attempts < 5; attempts++) {
      const label = document.querySelector(".hm-LoggedInButtons_MyBetsCount");
      if (label) {
        const count = label.innerHTML;
        return count;
      } else {
        console.log("attempt " + attempts);
        await sleep(1000);
      }
    }
    return 0;
  });
  let countInt = parseInt(count);

  return countInt;
};

export const makeBetFromPage = async (match, maxOdd, valueToBet) => {
  await page.goto(match.url);
  await page.waitForSelector(".ipe-EventViewMarketTabs");

  const result = await page.evaluate(
    async (match, maxOdd, valueToBet) => {
      let oddsValue = 0;
      function sleep(ms) {
        return new Promise(resolve => {
          setTimeout(resolve, ms);
        });
      }

      const enterValue = async value => {
        const valueStr = value.toString();
        for (let i = 0; i < valueStr.length; i++) {
          let index = 0;
          if (valueStr[i] == "0") index = 10;
          else if (valueStr[i] == "." || valueStr[i] == ",") index = 9;
          else index = parseInt(valueStr[i]) - 1;

          try {
            document.querySelector(".qb-Keypad").children[index].click();
          } catch {
            return "Keypad not found!";
          }
          await sleep(900);
        }
      };

      await sleep(1000);
      const tabChildren = document.querySelectorAll(
        ".ipe-EventViewTabLink + div:not(.Hidden)"
      );

      const array = Array.prototype.slice.call(tabChildren);

      const goalsTabTitle = "Goals";
      const goalsTabTitlePT = "Gols";
      if (array.length === 0) {
        return "goals tab not found. BUG!";
      }
      let goalsTab = null;
      for (let i = array.length - 1; i > 0; i -= 1) {
        console.log(array[i].innerHTML);
        if (
          array[i].innerHTML.includes(goalsTabTitle) ||
          array[i].innerHTML.includes(goalsTabTitlePT)
        ) {
          goalsTab = array[i];
          i = 0;
        }
      }
      if (goalsTab) {
        goalsTab.click();
        await sleep(1000);
        const items = document.querySelectorAll(".ipe-Market");
        const children = Array.prototype.slice.call(items);
        for (let k = 0; k < children.length; k += 1) {
          const groupTabTitle =
            children[k].firstElementChild.children[0].innerHTML;
          if (
            groupTabTitle.includes("Match Goals") ||
            (groupTabTitle.includes("Partida") &&
              groupTabTitle.includes("Gols"))
          ) {
            goalsTab = children[k];
            const goalsValues = goalsTab.querySelector(".ipe-MarketContainer");
            const countPossibilitiesChildren =
              goalsValues.lastElementChild.children;
            const countPossibilitiesArray = Array.prototype.slice.call(
              countPossibilitiesChildren
            );
            if (countPossibilitiesArray.length >= 3) {
              const betOdds = goalsValues.lastElementChild.lastElementChild.querySelector(
                ".ipe-Participant_OppOdds"
              ).innerHTML;
              if (oddsValue <= maxOdd) {
                if (!goalsValues.lastElementChild.lastElementChild) {
                  return "Not found odds field. BUG!";
                }
                goalsValues.lastElementChild.lastElementChild.click();
                await sleep(1200);
                if (!document.querySelector(".qb-DetailsContainer")) {
                  return "Bet button not found. BUG!";
                }
                document.querySelector(".qb-DetailsContainer").click();

                await sleep(1000);
                await enterValue(valueToBet);
                match.odds = betOdds;
                match.value = valueToBet;
                if (!document.querySelector(".qb-PlaceBetButton")) {
                  return "Finish bet button not found. BUG!";
                }
                // if (!window.confirm("Do you really want to bet?")) {
                //   return "";
                // }
                document.querySelector(".qb-PlaceBetButton").click();
                await sleep(1000);
                for (let attempts = 0; attempts < 14; attempts++) {
                  const finishLabel = document.querySelector(
                    ".qb-Header_Visible"
                  );
                  if (finishLabel) {
                    k = children.length;
                    finishLabel.lastChild.click();
                    await sleep(1000);
                    try {
                      finishLabel.lastChild.click();
                      await sleep(500);
                    } catch {}
                    await sleep(500);
                    // if (window.confirm("Do you want to freeze?")) {
                    //   await sleep(2000);
                    // }
                    return true;
                  } else {
                    await sleep(1000);
                  }
                }
                await sleep(1000);
                await true;
              } else {
                return `Match ${match.url} odds is now ${oddsValue} and the limit is ${maxOdd}`;
              }
            }
          }
        }
      } else {
        console.log("Goal panel not found");
      }
    },
    match,
    maxOdd,
    valueToBet
  );

  if (typeof result == string) {
    console.log(chalk.red(result));
    return false;
  }

  return true;
};
