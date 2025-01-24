const { getData, RequestType } = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const { format } = require("date-fns");

function formatTimestamp(timestamp) {
    if (!timestamp) return "N/A";
    try {
        const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
        return format(date, "yyyy-MM-dd HH:mm:ss"); // Customize the format as needed
    } catch (error) {
        console.error(`Failed to format timestamp: ${error}`);
        return "Invalid date";
    }
}

class Tournament {
    constructor() {
        this.name = 'Tournament';
        this.triggers = ['tourney', 'tourney', 'turnering', 'turrnering', 'turre', 'bracket', 'turneringar'];
        this.settings = new Settings();
        this.game = "Counter-Strike";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let slug = argument ? argument.trim() : null;
            console.log(`Received slug argument: ${slug}`);

            const { data: tournamentList, errorMessage: listError } = await getData(RequestType.ESPLAY_TOURNAMENTLIST);
            if (listError || !tournamentList) {
                console.error(`Error fetching tournament list: ${listError}`);
                return `Couldn't fetch the tournament list. Please try again later.`;
            }

            tournamentList.reverse(); // Get the most recent tournaments first

            const now = Date.now() / 1000; // Current time in seconds

            // Filter tournaments by slug
            const matchingTournaments = tournamentList.filter(t =>
                t.slug.toLowerCase().includes(slug.toLowerCase())
            );

            if (matchingTournaments.length === 0) {
                console.log("No close match found for the slug:", slug);
                return `No close match found for the slug: ${slug}. Please try again with a valid slug.`;
            }

            // Step 1: Check for tournaments with full players
            const tournamentsWithFullPlayers = matchingTournaments.filter(t =>
                t.participant_count === t.participant_limit
            );

            if (tournamentsWithFullPlayers.length > 0) {
                // Sort by proximity to the current time
                tournamentsWithFullPlayers.sort((a, b) => Math.abs(a.starts_at - now) - Math.abs(b.starts_at - now));
                const selectedTournament = tournamentsWithFullPlayers[0];
                return await this.fetchAndBuildResponse(selectedTournament, isBotModerator);
            }

            // Step 2: If no full tournaments, sort remaining by closest date
            matchingTournaments.sort((a, b) => Math.abs(a.starts_at - now) - Math.abs(b.starts_at - now));
            const closestTournament = matchingTournaments[0];

            return await this.fetchAndBuildResponse(closestTournament, isBotModerator);
        } catch (error) {
            console.error(`An error occurred in the Tournament command:`, error);
            return `An unexpected error occurred while executing the Tournament command.`;
        }
    }

    async fetchAndBuildResponse(tournament, isBotModerator) {
        try {
            const hasSpace = tournament.space_id;
            let tournamentDetails;

            if (hasSpace) {
                const { data: tournamentData, errorMessage } = await getData(
                    RequestType.ESPLAY_TOURNAMENTDETAILS_WITH_SPACE,
                    tournament.slug,
                    tournament.space_id
                );
                if (errorMessage || !tournamentData) {
                    console.error(`Error fetching tournament details: ${errorMessage}`);
                    return `Couldn't fetch tournament details for slug: ${tournament.slug}.`;
                }
                tournamentDetails = tournamentData;
            } else {
                const { data: tournamentData, errorMessage } = await getData(
                    RequestType.ESPLAY_TOURNAMENTDETAILS,
                    tournament.slug
                );
                if (errorMessage || !tournamentData) {
                    console.error(`Error fetching tournament details: ${errorMessage}`);
                    return `Couldn't fetch tournament details for slug: ${tournament.slug}.`;
                }
                tournamentDetails = tournamentData;
            }

            console.log(`Fetched tournament details:`, tournamentDetails);

            const { data: matches, errorMessage: matchesError } = await getData(
                RequestType.ESPLAY_TOURNAMENTMATCHES,
                tournamentDetails.id
            );
            if (matchesError || !matches) {
                console.error(`Error fetching matches: ${matchesError}`);
                return `Couldn't fetch matches for tournament: ${tournament.slug}.`;
            }

            const { name, starts_at, participant_count, participant_limit, space } = tournamentDetails;
            const startDate = formatTimestamp(starts_at);
            let response = `${name}`;
            if (space) response += ` by ${space.name}`;

            if (participant_count === participant_limit) {
                response += `, Tournament is Live!`;
            } else {
                const matchStartTime = new Date(startDate).toLocaleTimeString('sv-SE', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                response += `, Starting: ${matchStartTime}`;
                response += `, ${participant_count}/${participant_limit} players`;
            }

            matches.reverse();
            const { data: teamsData, errorMessage: teamsError } = await getData(RequestType.ESPLAY_TOURNAMENTTEAMS, tournamentDetails.id);
            if (teamsError || !teamsData) {
                console.error(`Error fetching teams: ${teamsError}`);
                return `Couldn't fetch team details for tournament: ${selectedTournament.slug}.`;
            }
            const teams = teamsData.teams;

// Helper function to get team name by ID
            function getTeamName(teamId) {
                const team = teams.find(t => t.id === teamId);
                return team ? team.name : 'Unknown Team';
            }

// Group matches by `bracket_id`
            const matchesByBracket = matches.reduce((acc, match) => {
                if (!acc[match.bracket_id]) acc[match.bracket_id] = [];
                acc[match.bracket_id].push(match);
                return acc;
            }, {});

// Validate match progression and fix inconsistencies
            for (const bracketId in matchesByBracket) {
                const bracketMatches = matchesByBracket[bracketId];

                // Sort matches by `map_id`
                bracketMatches.sort((a, b) => a.map_id - b.map_id);

                // Check for skipped or incomplete matches
                for (let i = 0; i < bracketMatches.length; i++) {
                    const currentMatch = bracketMatches[i];

                    // If a match is incomplete but there are completed matches with higher `map_id`
                    if (!currentMatch.completed) {
                        const hasCompletedHigherMap = bracketMatches.some(
                            match => match.map_id > currentMatch.map_id && match.completed
                        );

                        if (hasCompletedHigherMap) {
                            console.warn(
                                `Inconsistency detected in bracket ${bracketId}: Match with map_id ${currentMatch.map_id} is incomplete, but higher map_id matches are completed.`
                            );

                            // Fix: Optionally mark the match as completed or log the issue
                            currentMatch.completed = true; // Simulate marking the match as completed
                            currentMatch.score_1 = currentMatch.score_1 ?? 0; // Set default score if missing
                            currentMatch.score_2 = currentMatch.score_2 ?? 0; // Set default score if missing
                        }
                    }
                }
            }

// Flatten the fixed matches back into a single array
            const validatedMatches = Object.values(matchesByBracket).flat();

// Filter incomplete matches
            const incompleteMatches = validatedMatches.filter(match => !match.completed);

// Step 1: Filter incomplete matches by `map_pool` and sort by lowest `map_id` in the pool
            const mapPool = tournamentDetails.map_pool;
            const matchesByMapPool = incompleteMatches
                .filter(match => mapPool.includes(match.map_id)) // Only include matches in the map pool
                .sort((a, b) => mapPool.indexOf(a.map_id) - mapPool.indexOf(b.map_id)); // Sort by order in the map pool

// Step 2: Identify active and upcoming matches
            const activeMatches = incompleteMatches.filter(match =>
                match.score_1 !== null && match.score_2 !== null
            );

            if (activeMatches.length > 0) {
                const limitedActiveMatches = activeMatches.slice(0, 3);
                const activeMatchResponses = await Promise.all(limitedActiveMatches.map(async match => {
                    const { data: globals, errorMessage: globalsError } = await getData(RequestType.ESPLAY_GLOBALS);
                    if (globalsError) {
                        return `Couldn't retrieve map data. ${globalsError}`;
                    }

                    const { maps } = globals;
                    const map = maps.find(map => map.id === match.map_id);
                    const mapName = map ? map.name : "Unknown Map";
                    const team1 = getTeamName(match.entity1_id);
                    const team2 = getTeamName(match.entity2_id);
                    //return `${team1} vs ${team2} (${match.score_1} - ${match.score_2}) on Map ${mapName}`;
                    return `${team1} vs ${team2} on Map ${mapName}`;
                }));

                response += ` - Active Matches: ${activeMatchResponses.join(', ')}`;
            } else {
                // Show up to 3 upcoming matches if no active matches exist
                const upcomingMatches = matchesByMapPool.slice(0, 3);

                if (upcomingMatches.length > 0) {
                    response += ` - Upcoming Matches: `;
                    const upcomingMatchResponses = await Promise.all(upcomingMatches.map(async match => {
                        const { data: globals, errorMessage: globalsError } = await getData(RequestType.ESPLAY_GLOBALS);
                        if (globalsError) {
                            return `Couldn't retrieve map data. ${globalsError}`;
                        }

                        const { maps } = globals;
                        const map = maps.find(map => map.id === match.map_id);
                        const mapName = map ? map.name : "Unknown Map";

                        const team1 = getTeamName(match.entity1_id);
                        const team2 = getTeamName(match.entity2_id);
                        return `${team1} vs ${team2} on Map ${mapName}`;
                    }));

                    response += upcomingMatchResponses.join(', ');
                } else {
                    response += ` - No upcoming matches.`;
                }
            }

// Add tournament link for moderators
            if (isBotModerator) {
                const tournamentLink = hasSpace
                    ? `https://esplay.com/s/${tournament.space_id}/tournament/${tournament.slug}`
                    : `https://esplay.com/tournament/${tournament.slug}`;
                response += ` ${tournamentLink}`;
            }
            return response;
        } catch (error) {
            console.error(`An error occurred while building the tournament response:`, error);
            return `Couldn't build a proper response for the tournament.`;
        }
    }
}

module.exports = Tournament;
