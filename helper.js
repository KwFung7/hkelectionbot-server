const Extra = require('telegraf/extra');
const _ = require('lodash');
const axios = require('axios');
const querystring = require('querystring');
const { candidate, catalog, district, serverError } = require('./content');

/* ---- Constants ---- */
const MAX_SHOW_CANDIDATE = 3;
const DISPLAY_TIMEOUT = 500;
const PARTCIPANT_TAG = '正式參選';

/* ---- Helper ---- */
const getCandidateList = (keyword, isRegion) => {
  if (_.isEmpty(keyword)) {
    return;
  }

  if (isRegion) {
    const qs = querystring.stringify({ region: keyword });
    return axios.get(`${process.env.DATA_ENDPOINT}/persons?${qs}`);

  } else {
    const qs = querystring.stringify({ query: keyword });
    return axios.get(`${process.env.DATA_ENDPOINT}/persons/search?${qs}`);
  }
};

const getPoliticalFaction = (faction) => {
  if (faction === 'PANDEMO' || faction === 'PROESTAB') {
    return candidate.politicalFaction[faction];
  } else {
    return candidate.politicalFaction['OTHER'];
  }
};

const getTagText = (tags) => {
  if (!_.isEmpty(tags)) {
    return _.map(tags, tag => `#${tag}`).join(', ');
  } else {
    return candidate.noData;
  }
};

const getCandidateText = (originalText, data) => {
  return originalText
    .replace('#name#', data.name || candidate.noData)
    .replace('#voteNumber#', data.voteNumber ? `(${data.voteNumber}號)` : '')
    .replace('#region#', data.region || candidate.noData)
    .replace('#politicalAffiliation#', data.politicalAffiliation || candidate.noData)
    .replace('#politicalFaction#', getPoliticalFaction(data.politicalFaction))
    .replace('#background#', data.background || candidate.noData)
    .replace('#message#', data.message || candidate.noData)
    .replace('#tags#', getTagText(data.tags))
    .replace('#socialMedia#', data.socialMedia || candidate.noData)
    .replace(/(<([^>]+)>)/ig, '');
};

const filterListWithTag = (list, tag) => {
  return _.filter(list, (item) => {
    return _.includes(item.tags, tag);
  });
};

const displayMultipleOptions = ({ reply }, list, text, markup, keyword) => {
  reply(candidate.numResult
    .replace('#num#', list.length)
    .replace('#keyword#', keyword));

  setTimeout(() => {
    reply(text, markup);
  }, DISPLAY_TIMEOUT);
};

const displayCandidateInfo = (ctx, keyword, isRegion) => {
  getCandidateList(keyword, isRegion)
    .then(({ data = [] }) => {

      // Skip candidate who dont participate in election
      const list = filterListWithTag(data, PARTCIPANT_TAG);

      if (!_.isEmpty(list)) {

        const text = ctx.match ? isRegion ? ctx.match[1].split('-')[2] : ctx.match[1] : keyword;
        if (list.length > MAX_SHOW_CANDIDATE) {
          // Display candidate name only when there is too many result
          const markup = Extra.markup((m) => {
            const btn = _.map(list, (item) => {
              const btnLabel = `${item.name}(${item.region.split('-')[1] || candidate.noData})`;
              return m.callbackButton(btnLabel, `candidate-${item.name}`);
            });

            // Show 2 buttons each row
            return m.inlineKeyboard(_.chunk(btn, 2));
          });
          displayMultipleOptions(ctx, list, candidate.candidateSelectText, markup, text);

        } else {
          ctx.reply(candidate.numResult.replace('#num#', list.length).replace('#keyword#', text));
          setTimeout(() => {
            _.forEach(list, (item) => {
              const text = getCandidateText(candidate.text, item);

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
          }, DISPLAY_TIMEOUT);
        }
      } else {
        ctx.reply(candidate.noResult);
      }
    })
    .catch(() => {
      ctx.reply(serverError);
    });
};

const displayCatalogInfo = (ctx) => {
  getCandidateList(ctx.match[1], false)
    .then(({ data = [] }) => {

      // Skip candidate who dont participate in election
      const list = filterListWithTag(data, PARTCIPANT_TAG);

      if (!_.isEmpty(list)) {

        const markup = Extra.markup((m) => {
          const btn = _.map(list, (item) => {
            const btnLabel = `${item.name}(${item.region.split('-')[1] || candidate.noData})`;
            return m.callbackButton(btnLabel, `candidate-${item.name}`);
          });

          // Show 2 buttons each row
          return m.inlineKeyboard(_.chunk(btn, 2));
        });
        displayMultipleOptions(ctx, list, catalog.candidateSelectText, markup, ctx.match[1]);

      } else {
        ctx.reply(candidate.noResult);
      }
    })
    .catch(() => {
      ctx.reply(serverError);
    });

  return ctx.answerCbQuery(catalog.loadingText.replace('#parties#', ctx.match[1]));
};

const displayDistrictInfo = (ctx) => {
  getCandidateList(ctx.match[1], true)
    .then(({ data = [] }) => {

      // Skip candidate who dont participate in election
      const list = filterListWithTag(data, PARTCIPANT_TAG);

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
            return m.callbackButton(item, `region-${ctx.match[1]}-${item}`);
          });

          // Show 3 buttons each row
          return m.inlineKeyboard(_.chunk(btn, 3));
        });
        displayMultipleOptions(ctx, regionList, district.text, markup, ctx.match[1].split('-')[1]);

      } else {
        ctx.reply(candidate.noResult);
      }
    })
    .catch(() => {
      ctx.reply(serverError);
    });

  return ctx.answerCbQuery(district.loadingText.replace('#district#', ctx.match[1]));
};

module.exports = {
  displayCandidateInfo,
  displayCatalogInfo,
  displayDistrictInfo
};
