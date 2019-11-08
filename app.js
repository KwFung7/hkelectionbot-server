require('dotenv').config();
const express = require('express');
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const { displayCandidateInfo, displayCatalogInfo, displayDistrictInfo, displayCandidateEvents } = require('./helper');
const {
  welcomeMessage,
  catalog,
  district,
  events,
  report,
  feedback,
  about
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
      return m.callbackButton(item.split('-')[1], `district-${item}`);
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
  displayCatalogInfo(ctx);
});

bot.action(/candidate-(.+)/, (ctx) => {
  displayCandidateInfo(ctx, ctx.match[1], false);
  return ctx.answerCbQuery(catalog.loadingText.replace('#parties#', ctx.match[1]));
});

bot.action(/district-(.+)/, (ctx) => {
  displayDistrictInfo(ctx);
});

bot.action(/region-(.+)/, (ctx) => {
  displayCandidateInfo(ctx, ctx.match[1], true);
  return ctx.answerCbQuery(district.loadingText.replace('#district#', ctx.match[1].split('-')[2]));
});

bot.action(/events-(.+)_(.+)/,(ctx) => {
  displayCandidateEvents(ctx);
  return ctx.answerCbQuery(events.loadingText.replace('#candidate#', ctx.match[1]));
});


/* ---- Bot listener ---- */
bot.on('text', (ctx) => {
  ctx.webhookReply = false;
  displayCandidateInfo(ctx, ctx.message.text, false);
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

// bot.launch();

