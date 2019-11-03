require('dotenv').config();
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const { displayCandidateInfo } = require('./helper');
const content = require('./content');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(Telegraf.log());

/* ---- Telegraf Action ---- */
bot.start(({ reply }) => {
  reply(content.welcomeMessage);
});

bot.help(({ reply }) => {
  reply(content.welcomeMessage);
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

bot.on('message', (ctx) => {
  displayCandidateInfo(ctx, ctx.message.text)
});

bot.launch();

