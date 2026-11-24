// Content for the "Off the clock" section: travel map and garden log.
//
// Anything left empty ("" or []) shows on the page as a dashed placeholder.
// Lines marked TODO still need your real details. scripts/deploy.sh refuses to
// upload while this file contains "TODO", so the drafts can't go live by accident.
//
// Photos: put the files in assets/travel/ or assets/garden/ and list them as
//   { src: 'assets/travel/ladakh/ladakh-1.jpg', alt: 'Pangong lake at dawn' }
// Frames are 4:5 portrait. Add focus: '50% 30%' (CSS object-position) to choose
// which part of the photo stays in frame when it gets cropped.
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
            month: 'August 2026',
            postcard: 'Thin air, huge sky.',
            memory: 'Zero humidity, crisp mountain silence, and seeing the entire valley glow after dark.',
            tags: ['trek'],                        // TODO draft
            photos: [
                { src: 'assets/travel/ladakh/ladakh-1.jpg', alt: 'Standing on a stone path below Leh Palace under a bright blue sky', focus: '50% 30%' },
                { src: 'assets/travel/ladakh/ladakh-2.jpg', alt: 'Leh lit up at night beneath moonlit clouds and dark mountains', focus: '50% 60%' }
            ]
        },
        {
            id: 'meghalaya',
            name: 'Meghalaya',
            region: 'Northeast',
            lat: 25.57, lon: 91.88,
            month: 'July 2024',
            postcard: 'Living root bridges and non-stop rain.',
            memory: 'Clouds spilling over the cliffs, waterfalls everywhere, and crossing a bridge grown from living roots.',
            tags: ['caves'],                       // TODO draft
            photos: [
                { src: 'assets/travel/meghalaya/meghalaya-1.jpg', alt: 'Cloud drifting below green cliffs streaked with waterfalls, bamboo in the foreground', focus: '62% 50%' },
                { src: 'assets/travel/meghalaya/meghalaya-2.jpg', alt: 'Crossing a living root bridge above a forest stream', focus: '50% 35%' }
            ]
        },
        {
            id: 'mangalore',
            name: 'Mangalore',
            region: 'Southwest coast',
            lat: 12.91, lon: 74.86,
            label: 'left',                         // keeps clear of Home and Hampi
            month: '',                             // TODO
            postcard: '',                          // TODO
            memory: '',                            // TODO
            tags: ['beaches'],                     // TODO draft
            photos: []                             // TODO
        },
        {
            id: 'hampi',
            name: 'Hampi',
            region: 'Deccan plateau',
            lat: 15.34, lon: 76.46,
            month: 'October 2023',
            postcard: 'Granite boulders, golden hour.',
            memory: 'Intricate Vijayanagara stonework at Vittala Temple and sunset views over the Virupaksha gopuram.',
            tags: ['ruins'],                       // TODO draft
            photos: [
                { src: 'assets/travel/hampi/hampi-1.jpg', alt: 'The stone chariot at Vittala Temple, with boulder hills behind' },
                { src: 'assets/travel/hampi/hampi-2.jpg', alt: 'Virupaksha Temple tower and ruins at sunset, seen from Hemakuta Hill' }
            ]
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
