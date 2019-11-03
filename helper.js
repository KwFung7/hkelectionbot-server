const Extra = require('telegraf/extra');
const _ = require('lodash');
const { Contents } = require('./models');
const SERVER_ERROR = '抱歉, 伺服器出現錯誤, 請稍候再試';

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

module.exports = {
  displayContent,
  displayFeedbackLink
};
