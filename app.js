require('dotenv').config();
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const { displayCandidateInfo, getCandidateList } = require('./helper');
const { catalog, feedback, welcomeMessage, about, serverError, candidate } = require('./content');
const _ = require('lodash');

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

        answerCbQuery(catalog.loadingText.replace('#parties#', match[1]));
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
});

bot.action(/candidate-(.+)/, (ctx) => {
  displayCandidateInfo(ctx, ctx.match[1]);
  return ctx.answerCbQuery(catalog.loadingText.replace('#parties#', ctx.match[1]));
});

bot.on('message', (ctx) => {
  displayCandidateInfo(ctx, ctx.message.text)
});

bot.launch();

