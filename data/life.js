// Content for the "Off the clock" section: travel map and garden log.
//
// Anything left empty ("" or []) shows on the page as a dashed placeholder.
// Lines marked TODO still need your real details. scripts/deploy.sh refuses to
// upload while this file contains "TODO", so the drafts can't go live by accident.
//
// Photos: put the files in assets/travel/ or assets/garden/ and list them as
//   { src: 'assets/travel/ladakh-1.jpg', alt: 'Pangong lake at dawn' }
// Keep each photo under about 300 KB (1600px wide JPEG at ~75% quality is plenty).
window.LIFE = {
    // Shown on the map as a reference point
    home: { name: 'Bengaluru', lat: 12.97, lon: 77.59 },

    places: [
        {
            id: 'ladakh',
            name: 'Ladakh',
            region: 'North',
            lat: 34.15, lon: 77.58,
            month: '',                             // TODO e.g. 'June 2023'
            postcard: 'Thin air, huge sky.',       // TODO draft, rewrite in your words
            memory: '',                            // TODO one line on what stood out
            tags: ['trek'],                        // TODO draft
            photos: []                             // TODO 2–3 photos
        },
        {
            id: 'meghalaya',
            name: 'Meghalaya',
            region: 'Northeast',
            lat: 25.57, lon: 91.88,
            month: '',                             // TODO
            postcard: 'Living root bridges and non-stop rain.', // TODO draft
            memory: '',                            // TODO
            tags: ['caves'],                       // TODO draft
            photos: []                             // TODO
        },
        {
            id: 'mangalore',
            name: 'Mangalore',
            region: 'Southwest coast',
            lat: 12.91, lon: 74.86,
            label: 'above',                        // keeps clear of the Home marker
            month: '',                             // TODO
            postcard: '',                          // TODO
            memory: '',                            // TODO
            tags: ['beaches'],                     // TODO draft
            photos: []                             // TODO
        },
        {
            id: 'andaman',
            name: 'Andaman',
            region: 'Islands, Bay of Bengal',
            lat: 11.62, lon: 92.73,
            label: 'below',
            month: '',                             // TODO
            postcard: '',                          // TODO
            memory: '',                            // TODO
            tags: ['diving'],                      // TODO draft
            photos: []                             // TODO
        }
    ],

    garden: {
        intro: '',                                 // TODO one line: what you grow and where
        before: { src: '', alt: '', caption: '' }, // TODO a photo from early on
        after: { src: '', alt: '', caption: '' },  // TODO the same spot later
        // Newest first. outcome is a short word: 'thriving', 'harvested', 'lost', 'trying again'…
        entries: [
            { date: '', plant: '', note: '', outcome: '' }, // TODO
            { date: '', plant: '', note: '', outcome: '' }, // TODO
            { date: '', plant: '', note: '', outcome: '' }  // TODO
        ]
    }
};
