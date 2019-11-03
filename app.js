require('dotenv').config();
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const _ = require('lodash');
const { Contents } = require('./models');
const SERVER_ERROR = '抱歉, 伺服器出現錯誤, 請稍候再試';

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(Telegraf.log());

/* ---- Helper ---- */
const displayContent = ({ reply }, key) => {
  Contents.find({})
    .then((contents) => {
      const content = _.head(contents);
      reply(content[key]);
    })
    .catch(() => {
      reply(SERVER_ERROR);
    });
};

const displayFeedbackLink = ({ reply }) => {
  Contents.find({})
    .then((contents) => {
      const feedback = _.head(contents).feedback;
      reply(feedback.text, Extra.markup((m) =>
        m.inlineKeyboard([
          m.urlButton(feedback.buttonLabel, feedback.link),
        ])))
    })
    .catch(() => {
      reply(SERVER_ERROR);
    });
};

/* ---- Telegraf Action ---- */
bot.start((ctx) => {
  displayContent(ctx, 'welcomeMessage');
});

bot.help((ctx) => {
  displayContent(ctx, 'welcomeMessage');
});

bot.command('feedback', (ctx) => {
  displayFeedbackLink(ctx);
});

bot.help((ctx) => {
  displayContent(ctx, 'about');
});

bot.on('message', (ctx) => ctx.reply('👍'));

bot.launch();

