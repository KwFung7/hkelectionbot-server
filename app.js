require('dotenv').config();
const express = require('express');
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const { displayCandidateInfo, getCandidateList } = require('./helper');
const {
  catalog,
  feedback,
  welcomeMessage,
  about,
  serverError,
  candidate,
  district
} = require('./content');
const _ = require('lodash');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(Telegraf.log());

/* ---- Telegraf Action ---- */
bot.start(({ reply }) => {
  reply(welcomeMessage);
});

bot.help(({ reply }) => {
  reply(welcomeMessage);
});

bot.command('catalog', ({ reply }) => {
  reply(catalog.text, Extra.markup((m) => {
    // Create parties buttons
    const partiesBtn = _.map(catalog.parties, (party) => {
      return m.callbackButton(party, `catalog-${party}`);
    });

    // Show 3 buttons each row
    return m.inlineKeyboard(_.chunk(partiesBtn, 3));
  }));
});

bot.command('district', ({ reply }) => {
  reply(district.text, Extra.markup((m) => {
    // Create district buttons
    const districtBtn = _.map(district.list, (item) => {
      return m.callbackButton(item, `district-${item}`);
    });

    // Show 3 buttons each row
    return m.inlineKeyboard(_.chunk(districtBtn, 3));
  }));
});

bot.command('feedback', ({ reply }) => {
  reply(feedback.text, Extra.markup((m) =>
    m.inlineKeyboard([
      m.urlButton(feedback.buttonLabel, feedback.link),
    ])))
});

bot.command('about', ({ reply }) => {
  reply(about);
});

bot.action(/catalog-(.+)/, ({ reply, match, answerCbQuery }) => {
  // Get candidate list with selected catalog
  getCandidateList(match[1])
    .then(({ data = [] }) => {

      if (!_.isEmpty(data)) {

        reply(candidate.numResult.replace('#num#', data.length).replace('#keyword#', match[1]));

        setTimeout(() => {
          reply(catalog.candidateSelectText, Extra.markup((m) => {
            // Create candidate buttons
            const candidateBtn = _.map(data, (item) => {
              const btnLabel = `${item.name}(${item.region.split('-')[1] || candidate.noData})`;
              return m.callbackButton(btnLabel, `candidate-${item.name}`);
            });

            // Show 2 buttons each row
            return m.inlineKeyboard(_.chunk(candidateBtn, 2));
          }));
        }, 1000);
      } else {
        reply(candidate.noResult);
      }
    })
    .catch(() => {
      reply(serverError);
    });

  return answerCbQuery(catalog.loadingText.replace('#parties#', match[1]));
});

bot.action(/district-(.+)/, ({ reply, match, answerCbQuery }) => {
  getCandidateList(match[1])
    .then(({ data = [] }) => {

      if (!_.isEmpty(data)) {

        // Record region into list
        let regionList = [];
        _.forEach(data, (item) => {
          const region = item.region.split('-')[2];
          if (!_.includes(regionList, region)) {
            regionList.push(region);
          }
        });

        reply(candidate.numResult.replace('#num#', regionList.length).replace('#keyword#', match[1]));

        setTimeout(() => {
          reply(district.text, Extra.markup((m) => {
            // Create region buttons
            const districtBtn = _.map(regionList, (item) => {
              return m.callbackButton(item, `region-${item}`);
            });

            // Show 3 buttons each row
            return m.inlineKeyboard(_.chunk(districtBtn, 3));
          }));
        }, 1000);

      } else {
        reply(candidate.noResult);
      }
    })
    .catch(() => {
      reply(serverError);
    });

  return answerCbQuery(district.loadingText.replace('#district#', match[1]));
});

bot.action(/region-(.+)/, (ctx) => {
  displayCandidateInfo(ctx, ctx.match[1]);
  return ctx.answerCbQuery(district.loadingText.replace('#district#', ctx.match[1]));
});

bot.action(/candidate-(.+)/, (ctx) => {
  displayCandidateInfo(ctx, ctx.match[1]);
  return ctx.answerCbQuery(catalog.loadingText.replace('#parties#', ctx.match[1]));
});

bot.on('text', (ctx) => {
  ctx.webhookReply = true;
  displayCandidateInfo(ctx, ctx.message.text);
});

bot.catch((err, ctx) => {
  console.log(`Ooops, ecountered an error for ${ctx.updateType}`, err)
});

/* ---- Setup Webhook ---- */
app.use(bot.webhookCallback('/'));
bot.telegram.setWebhook(process.env.WEBHOOK_URL);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

