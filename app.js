require('dotenv').config();
const express = require('express');
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const { displayCandidateInfo, getCandidateList, filterListWithTag, displayMultipleOptions } = require('./helper');
const {
  catalog,
  feedback,
  welcomeMessage,
  about,
  serverError,
  candidate,
  district,
  report
} = require('./content');
const _ = require('lodash');

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(Telegraf.log());


/* ---------------- Telegraf Action ---------------- */
bot.start(({ reply }) => {
  reply(welcomeMessage);
});

bot.help(({ reply }) => {
  reply(welcomeMessage);
});


/* ---- Bot Command ---- */
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
    ])));
});

bot.command('report', ({ reply }) => {
  reply(report.text, Extra.markup((m) =>
    m.inlineKeyboard([
      m.urlButton(report.buttonLabel, report.link),
    ])));
});

bot.command('about', ({ reply }) => {
  reply(about);
});


/* ---- Bot Action ---- */
bot.action(/catalog-(.+)/, (ctx) => {
  // Get candidate list with selected catalog
  getCandidateList(ctx.match[1])
    .then(({ data = [] }) => {

      // Skip candidate who dont participate in election
      const list = filterListWithTag(data, '正式參選');

      if (!_.isEmpty(list)) {

        const markup = Extra.markup((m) => {
          const btn = _.map(list, (item) => {
            const btnLabel = `${item.name}(${item.region.split('-')[1] || candidate.noData})`;
            return m.callbackButton(btnLabel, `candidate-${item.name}`);
          });

          // Show 2 buttons each row
          return m.inlineKeyboard(_.chunk(btn, 2));
        });
        displayMultipleOptions(ctx, list, catalog.candidateSelectText, markup);

      } else {
        ctx.reply(candidate.noResult);
      }
    })
    .catch(() => {
      ctx.reply(serverError);
    });

  return ctx.answerCbQuery(catalog.loadingText.replace('#parties#', ctx.match[1]));
});

bot.action(/district-(.+)/, (ctx) => {
  getCandidateList(ctx.match[1])
    .then(({ data = [] }) => {

      // Skip candidate who dont participate in election
      const list = filterListWithTag(data, '正式參選');

      if (!_.isEmpty(list)) {

        // Record region into list
        let regionList = [];
        _.forEach(list, (item) => {
          const region = item.region.split('-')[2];
          if (!_.includes(regionList, region)) {
            regionList.push(region);
          }
        });

        const markup = Extra.markup((m) => {
          const btn = _.map(regionList, (item) => {
            return m.callbackButton(item, `region-${item}`);
          });

          // Show 3 buttons each row
          return m.inlineKeyboard(_.chunk(btn, 3));
        });
        displayMultipleOptions(ctx, regionList, district.text, markup);

      } else {
        ctx.reply(candidate.noResult);
      }
    })
    .catch(() => {
      ctx.reply(serverError);
    });

  return ctx.answerCbQuery(district.loadingText.replace('#district#', ctx.match[1]));
});

bot.action(/region-(.+)/, (ctx) => {
  displayCandidateInfo(ctx, ctx.match[1]);
  return ctx.answerCbQuery(district.loadingText.replace('#district#', ctx.match[1]));
});

bot.action(/candidate-(.+)/, (ctx) => {
  displayCandidateInfo(ctx, ctx.match[1]);
  return ctx.answerCbQuery(catalog.loadingText.replace('#parties#', ctx.match[1]));
});

/* ---- Bot listener ---- */
bot.on('text', (ctx) => {
  ctx.webhookReply = false;
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

