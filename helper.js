const Extra = require('telegraf/extra');
const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');
const { candidate, serverError } = require('./content');

/* ---- Helper ---- */
const getCandidateList = (keyword) => {
  if (_.isEmpty(keyword)) {
    return;
  }

  const qs = querystring.stringify({ query: keyword });
  return axios.get(`${process.env.DATA_ENDPOINT}/persons/search?${qs}`);
};

const displayCandidateInfo = (ctx, keyword) => {
  getCandidateList(keyword)
    .then(({ data = [] }) => {

      if (!_.isEmpty(data)) {

        ctx.reply(candidate.numResult.replace('#num#', data.length).replace('#keyword#', keyword));
        setTimeout(() => {
          _.forEach(data, (item) => {
            let tags;
            if (!_.isEmpty(item.tags)) {
              tags = _.map(item.tags, tag => `#${tag}`).join(', ');
            }
            const text = candidate.text
              .replace('#name#', item.name || candidate.noData)
              .replace('#voteNumber#', item.voteNumber ? `(${item.voteNumber}號)` : '')
              .replace('#region#', item.region || candidate.noData)
              .replace('#politicalAffiliation#', item.politicalAffiliation || candidate.noData)
              .replace('#claim#', item.claim || candidate.noData)
              .replace('#background#', item.background || candidate.noData)
              .replace('#message#', item.message || candidate.noData)
              .replace('#tags#', tags || candidate.noData)
              .replace('#socialMedia#', item.socialMedia || candidate.noData)
              .replace(/(<([^>]+)>)/ig, '');

            if (!_.isEmpty(item.socialMedia) && !_.isEmpty(item.introLink)) {
              const socialMediaLink = item.socialMedia.includes(' ')
                ? candidate.facebookSearchLink.replace('#query#', item.name)
                : item.socialMedia;

              ctx.reply(text, Extra.markup((m) =>
                m.inlineKeyboard([
                  m.urlButton(candidate.introLinkLabel, item.introLink),
                  m.urlButton(candidate.socialMediaLabel, socialMediaLink)
                ])));
            } else {
              ctx.reply(text);
            }
          });
        }, 500);
      } else {
        ctx.reply(candidate.noResult);
      }
    })
    .catch(() => {
      ctx.reply(serverError);
    });
};

module.exports = {
  getCandidateList,
  displayCandidateInfo
};
