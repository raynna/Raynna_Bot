const axios = require('axios');
const cheerio = require('cheerio');

const {info} = require('../log/Logger');

const Headers = {
    TWITCH_HEADER: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${process.env.TWITCH_OAUTH_TOKEN}`
    }
}

const RequestType = {
    StreamStatus: {
        name: 'Twitch Status Data',
        requiredHeader: Headers.TWITCH_HEADER,
        errors: {
            notFound: 'Twitch channel does not exist',
            badRequest: 'Twitch channel is offline'
        },
        link: 'https://api.twitch.tv/helix/streams?user_login={channel}',
        values: ['{channel}']
    },
    TwitchUser: {
        name: 'Twitch User',
        requiredHeader: Headers.TWITCH_HEADER,
        errors: {
            notFound: 'Twitch channel does not exist'
        },
        link: 'https://api.twitch.tv/helix/users?login={channel}',
        values: ['{channel}']
    },
    StreamData: {
        name: 'Stream Data',
        requiredHeader: Headers.TWITCH_HEADER,
        errors: {
            notFound: 'Twitch channel does not exist'
        },
        link: 'https://api.twitch.tv/helix/channels?broadcaster_id={broadcast_id}',
        values: ['{broadcast_id}']
    },
    TwitchById: {
        name: 'Twitch User By Id Data',
        requiredHeader: Headers.TWITCH_HEADER,
        errors: {
            notFound: 'Twitch channel does not exist'
        },
        link: 'https://api.twitch.tv/helix/users?id={id}',
        values: ['{id}']
    },
    Profile: {
        name: 'Skills',
        errors: {
            badRequest: 'Bad Request',
            notFound: `Couldn't find player with name {username}`,
        },
        link: 'https://api.runepixels.com/players/{username}?checkupdate=true',
        values: ['{username}']
    },
    XPGains: {
        name: 'Recent Experience Gains',
        errors: {
            badRequest: 'Bad Request',
        },
        link: 'https://api.runepixels.com/players/{userId}/xp?timeperiod={period}',
        values: ['{userId}', '{period}']
    },
    DropLog: {
        name: 'DropLog',
        errors: {
            badRequest: 'Bad Request',
        },
        link: 'https://api.runepixels.com/players/{userId}/drops',
        values: ['{userId}']
    },
    QuestLog: {
        name: 'QuestLog',
        errors: {
            badRequest: 'Bad Request',
        },
        link: 'https://api.runepixels.com/players/{userId}/quests',
        values: ['{userId}']
    },
    ExperienceRecords: {
        name: 'ExperienceRecords',
        errors: {
            badRequest: 'Bad Request',
        },
        link: 'https://api.runepixels.com/players/{userId}/records',
        values: ['{userId}']
    },
    ItemLookup: {
        name: 'ItemLookup',
        errors: {
            badRequest: 'Bad Request',
        },
        link: 'https://secure.runescape.com/m=itemdb_rs/api/catalogue/detail.json?item={itemId}',
        values: ['{itemId}']
    },
    Activities: {
        name: 'Activities',
        errors: {
            badRequest: 'Bad Request',
        },
        link: 'https://apps.runescape.com/runemetrics/profile/profile?user={username}&activities=20',
        values: ['{username}']
    },
    ItemDB: {
        name: 'ItemDB',
        errors: {
            badRequest: 'Bad Request',
        },
        link: `https://chisel.weirdgloop.org/gazproj/mrid/get/{itemName}`,
        values: ['{itemName}']
    },
    JagexProfile: {
        name: 'JagexProfile',
        errors: {
            badRequest: 'Bad Request',
        },
        link: `https://apps.runescape.com/runemetrics/profile/profile?user={username}&activities=20`,
        values: ['{username}']
    },
    News: {
        name: 'News',
        errors: {
            badRequest: 'Bad Request',
        },
        link: `https://api.weirdgloop.org/runescape/social/last`,
    },
    //https://esplay.com/api/profile/matches/list?id=3006037612&limit=3
    CS2Stats: {
            name: 'CS2Stats',
            errors: {
                notFound: "This player does not exist on ESPlay",
                badRequest: 'Bad Request',
            },
            link: `https://esplay.com/api/profile/get?username={username}&teams=1&friends=1&header=1&followers=1&medals=1&game_stats=1&game_id=1&level_history=1&clips=1&twitch=1&steam=1&spaces=1&username_history=1&item_drops=1`,
            values: ['{username}']
        },
    ESPlayBanList: {
        name: 'ESPlayBanList',
        errors: {
            badRequest: 'Bad Request',
        },
        link: `https://esplay.com/api/ban/list`
    },
	ESPLAY_CURRENT_LIVE_MATCH: {
		name: 'ESPLAY_CURRENT_LIVE_MATCH',
		errors: {
		},
		link: `https://esplay.com/api/profile/playstate/current?id={id}`,
		values: ['{id}']
		
	},
    ESPLAY_CURRENT_MATCH: {
        name: 'ESPLAY_CURRENT_MATCH',
        errors: {
            notFound: "This player does not exist on ESPlay",
            badRequest: 'Bad Request',
        },
        link: `https://esplay.com/api/match/get?id={id}`,
        values: ['{id}']
    },
    ESPLAY_MATCHLIST: {
        name: 'ESPLAY_MATCHLIST',
        errors: {
            notFound: "This player does not exist on ESPlay",
            badRequest: 'Bad Request',
        },
        link: `https://esplay.com/api/profile/matches/list?id={id}&limit=3`,
        values: ['{id}']
    },
    ESPLAY_MOST_KILLED: {
        name: 'ESPLAY_MOST_KILLED',
        errors: {
            notFound: "This player does not exist on ESPlay",
            badRequest: 'Bad Request',
        },
        link: `https://esplay.com/api/stats/user/most_killed?id={id}`,
        values: ['{id}']
    },
    ESPLAY_MOST_KILLED_BY: {
        name: 'ESPLAY_MOST_KILLED_BY',
        errors: {
            notFound: "This player does not exist on ESPlay",
            badRequest: 'Bad Request',
        },
        link: `https://esplay.com/api/stats/user/most_killed_by?id={id}`,
        values: ['{id}']
    },
    ESPLAY_GLOBALS: {
        name: 'ESPLAY_GLOBALS',
        link: 'https://esplay.com/api/globals/get?ts=_0',
    },
	ESPLAY_GATHER: {
		name: 'ESPLAY_GATHER',
        link: 'https://esplay.com/api/gather/get?id={id}',
		values: ['{id}']
	},
    ESPLAY_GATHERS: {
        name: 'ESPLAY_GATHERS',
        link: 'https://esplay.com/api/gather/list?game_id=1'
    },
    ESPLAY_TOURNAMENTLIST: {
        name: 'ESPLAY_TOURNAMENTLIST',
        link: 'https://esplay.com/api/tournament/list?game_id=1&country_id=0'
    },
    ESPLAY_TOURNAMENTDETAILS: {
        name: 'ESPLAY_TOURNAMENTDETAILS',
        link: `https://esplay.com/api/tournament/get?slug={slug}`,
        values: ['{slug}']
    },
    ESPLAY_TOURNAMENTDETAILS_WITH_SPACE: {
        name: 'ESPLAY_TOURNAMENTDETAILS',
        link: `https://esplay.com/api/tournament/get?slug={slug}&space_id={spaceId}`,
        values: ['{slug}', '{spaceId}']
    },
    ESPLAY_TOURNAMENTBRACKETS: {
        name: 'ESPLAY_TOURNAMENTBRACKETS',
        link: `https://esplay.com/api/tournament/brackets?id={id}`,
        values: ['{id}']
    },
    ESPLAY_TOURNAMENTMATCHES: {
        name: 'ESPLAY_TOURNAMENTMATCHES',
        link: `https://esplay.com/api/tournament/matches?id={id}`,
        values: ['{id}']
    },
    ESPLAY_TOURNAMENTTEAMS: {
        name: 'ESPLAY_TOURNAMENTTEAMS',
        link: `https://esplay.com/api/tournament/participants?id={id}`,
        values: ['{id}']
    },
    ESPLAY_TEAM: {
        name: 'ESPLAY_TEAM',
        link: `https://esplay.com/api/team/get?name=force%20majeure&game_id=1`,
    },
    VoiceOfSeren: {
            name: 'Voice of Seren',
            link: 'https://runescape.wiki/w/Voice_of_Seren',
    },
    WildernessEvent: {
            name: 'Wilderness Events',
            link: 'https://runescape.wiki/w/Wilderness_Flash_Events' + `?timestamp=${Date.now()}`,
    },

    //https://esplay.com/api/profile/get?username={username}&teams=1&friends=1&header=1&followers=1&medals=1&game_stats=1&game_id=1&level_history=1&clips=1&twitch=1&steam=1&spaces=1&username_history=1&item_drops=1
};//https://api.weirdgloop.org/runescape/social/last

/**
 * Usage examples:
 * [Request.getData(RequestType.UserData, name);]
 * [Request.getData(RequestType.RecentMatchData, userId, page);]
 * @param requestType
 * @param args
 * @returns {Promise<{data: null, errorMessage}|{data: null, errorMessage: (string|*)}|*|{data: null, errorMessage: string}>}
 */

let REQUEST_COUNTER = {};
let PREVIOUS_REQUEST_COUNTER = {};

function addRequests(requestType) {
    const name = requestType.name;
    if (!REQUEST_COUNTER[name]) {
        REQUEST_COUNTER[name] = 1;
    } else {
        REQUEST_COUNTER[name]++;
    }
}

async function showRequests() {
    const result = Object.keys(REQUEST_COUNTER).map(name => {
        const count = REQUEST_COUNTER[name];
        const previousCount = PREVIOUS_REQUEST_COUNTER[name] || 0;
        const change = count - previousCount;

        return `${name}: ${count}${change !== 0 ? `(${change > 0 ? `+${change}` : change})` : ''}`;
    }).join(', ');
    PREVIOUS_REQUEST_COUNTER = {...REQUEST_COUNTER};
    await info("TOTAL REQUESTS", result);
}

function extractFaceitFinder(html) {
    const $ = cheerio.load(html);
    return $('.account-faceit-title-username').text();
}


async function getData(requestType, ...args) {
    let url = requestType.link;
    if (url.includes('_=0')) {
        const currentDate = Date.now();
        url.replace('_=0', currentDate);
    }
    for (const [index, value] of args.entries()) {
        url = url.replace(requestType.values[index], typeof value === 'string' ? value : value);
    }
    //console.log(url);
    const headers = requestType.requiredHeader || {};
    const config = {
        headers: headers,
    };
    try {
        await addRequests(requestType);
        //if (requestType === RequestType.MatchList)
            //console.log(url);
        return await handleRequest(async () => {	
            const response = await axios.get(url, config);
            return {data: response.data, errorMessage: null};
        }, requestType.errors || {});
    } catch (error) {
        return {data: null, errorMessage: error.message};
    }
}

/**
 * #handleRequest
 *
 * @param requestFunction
 * @param additionalParams
 * @param maxRetries
 *
 * @returns {Promise<{data: null, errorMessage: (string|*)}|{data: null, errorMessage: (string|*)}|*|{data: null, errorMessage: string}>}
 */
async function handleRequest(requestFunction, additionalParams = {}, maxRetries = 5) {
    const delay = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            //await delay(1000 * attempt);
            return await requestFunction(additionalParams);
        } catch (error) {
            if (error.response && error.response.status === 429) {
                const retryAfter = error.response.headers['x-rate-limit-duration'] || 2;
                console.log("error status: 429, waiting: " + retryAfter * 1000);
                await delay(retryAfter * 1000);
            } else if (error.code === 'ECONNABORTED') {
                return {data: null, errorMessage: `Request Timeout: ${error.message}`};
            } /*else {
                await delay(2 ** attempt * 1000);
            }*/
            if (attempt === maxRetries) {
                if (error.response) {
                    switch (error.response.status) {
                        case 400:
                            if (additionalParams && additionalParams.badRequest) {
                                //console.log(additionalParams.badRequest);
                                return {data: null, errorMessage: additionalParams.badRequest};
                            }
                            return {data: null, errorMessage: `Bad request: ${error.response.status}`};
                        case 401:
                            return {data: null, errorMessage: `Unauthorized: ${error.response.status}`};
                        case 403:
                            disabled = true;
                            return {data: null, errorMessage: `Forbidden: ${error.response.status}`};
                        case 404:
                            if (additionalParams && additionalParams.notFound) {
                                console.log(additionalParams.notFound);
                                return {data: null, errorMessage: additionalParams.notFound};
                            }
                            return {data: null, errorMessage: `Not found: ${error.response.status}`};
                        case 408:
                            return {data: null, errorMessage: `Request Timeout: ${error.response.status}`};
                        case 429:
                            return {
                                data: null,
                                errorMessage: `Requested information to frequently, try again later.`
                            };
                        case 500:
                            return {data: null, errorMessage: ""};
                        case 502:
                            if (additionalParams && additionalParams.webisteDown) {
                                console.log(additionalParams.webisteDown);
                                return {data: null, errorMessage: additionalParams.webisteDown};
                            }
                            return {data: null, errorMessage: `Error Code: ${error.response.status}, Runepixels or RuneMetrics seems to be offline.`};
                        case 503:
                            return {data: null, errorMessage: `Service Unavailable: ${error.response.status}`};
                        case 504:
                            if (additionalParams && additionalParams.webisteDown) {
                                console.log(additionalParams.webisteDown);
                                return {data: null, errorMessage: additionalParams.webisteDown};
                            }
                            return {data: null, errorMessage: `Gateway Timeout: ${error.response.status}`};
                        case 522:
                            if (additionalParams && additionalParams.webisteDown) {
                                console.log(additionalParams.webisteDown);
                                return {data: null, errorMessage: additionalParams.webisteDown};
                            }
                            return {
                                data: null,
                                errorMessage: `Runescape api website seems to be offline at the moment.`
                            };
                        default:
                            return {
                                data: null,
                                errorMessage: `Unhandled error: ${error.response.status} - ${error.response.statusText}`
                            };
                    }
                }
                return {data: null, errorMessage: `Unknown error, contact ${process.env.CREATOR_CHANNEL}`};
            }
        }
    }
}

module.exports = {RequestType, getData, showRequests};