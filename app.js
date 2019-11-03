require('dotenv').config();
const Telegraf = require('telegraf');
const _ = require('lodash');
const { Contents } = require('./models');
const SERVER_ERROR = '抱歉, 伺服器出現錯誤, 請稍候再試';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Display Welcome Message
bot.start((ctx) => {
  Contents.find({})
    .then((contents) => {
      const content = _.head(contents);
      ctx.reply(content.welcomeMessage);
    })
    .catch(() => {
      ctx.reply(SERVER_ERROR);
    });
});


bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();

