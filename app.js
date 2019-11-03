require('dotenv').config();
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const { displayCandidateInfo } = require('./helper');
const content = require('./content');
const _ = require('lodash');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(Telegraf.log());

/* ---- Telegraf Action ---- */
bot.start(({ reply }) => {
  reply(content.welcomeMessage);
});

bot.help(({ reply }) => {
  reply(content.welcomeMessage);
});

bot.command('catalog', ({ reply }) => {
  const { catalog } = content;
  reply(catalog.text, Extra.markup((m) => {
    const partiesBtn = _.map(catalog.parties, (party) => {
      return m.callbackButton(party, `catalog-${party}`);
    });

    return m.inlineKeyboard(_.chunk(partiesBtn, 3));
  }));
});

bot.command('feedback', ({ reply }) => {
  const { feedback } = content;
  reply(feedback.text, Extra.markup((m) =>
    m.inlineKeyboard([
      m.urlButton(feedback.buttonLabel, feedback.link),
    ])))
});

bot.command('about', ({ reply }) => {
  reply(content.about);
});

bot.action(/catalog-(.+)/, (ctx) => {
  const { catalog } = content;
  displayCandidateInfo(ctx, ctx.match[1]);
  return ctx.answerCbQuery(catalog.loadingText.replace('#parties#', ctx.match[1]));
});

bot.on('message', (ctx) => {
  displayCandidateInfo(ctx, ctx.message.text)
});

bot.launch();

