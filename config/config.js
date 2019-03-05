const configDefaults = require('./configDefaults.json');

const env = {
    port: process.env.PORT || '3000',
    timeoutValue: parseInt(process.env.TIMEOUT_VALUE || configDefaults.timeoutValue),
    author: process.env.AUTHOR || configDefaults.author,
    authorURL: process.env.AUTHOR_URL || configDefaults.authorURL,
    authorEmail: process.env.AUTHOR_EMAIL || configDefaults.authorEmail,
    podcastTitle: process.env.PODCAST_NAME || configDefaults.podcastTitle,
    podcastDescription: process.env.PODCAST_DESCRIPTION || configDefaults.podcastDescription,
    category: process.env.CATEGORY || configDefaults.category,
    parentCategory: process.env.PARENT_CATEGORY || configDefaults.parentCategory,
    language: process.env.LANGUAGE || configDefaults.language,
    explicit: process.env.EXPLICIT || configDefaults.explicit,
    archiveCollection: process.env.COLLECTION || configDefaults.archiveCollection,
    image: process.env.AUTHOR_LOGO_1400_URL || configDefaults.image,
    numberOfRows: process.env.NUMBER_OF_ROWS || configDefaults.numberOfRows
}

module.exports = { env };