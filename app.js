require('dotenv').config();
const Telegraf = require('telegraf');
const { displayContent, displayFeedbackLink } = require('./helper');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(Telegraf.log());

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

bot.command('about', (ctx) => {
  displayContent(ctx, 'about');
});

bot.on('message', (ctx) => {
  ctx.reply('👍')
});

bot.launch();

