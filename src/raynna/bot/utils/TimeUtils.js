function calculateUptime(startedAt) {
    const startTime = new Date(startedAt);
    const currentTime = new Date();
    const uptimeInSeconds = Math.floor((currentTime - startTime) / 1000);

    const hours = Math.floor(uptimeInSeconds / 3600);
    const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
    const seconds = uptimeInSeconds % 60;

    return `${hours}h ${minutes}m ${seconds}s`;
}